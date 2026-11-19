"""
Casa Materia · luz precalculada (lightmaps) para la web
------------------------------------------------------
Toma casa-materia.blend, une la arquitectura en pocos objetos, les arma un segundo
mapeo (UV "lightmap") y calcula con Cycles la luz que llega a cada superficie
(directa + rebotes, con sombras de muebles y plantas) para tres horarios.

Uso: CM_BLEND=... CM_ASSETS=... CM_OUT=... CM_RES=2048 CM_SAMPLES=128 CM_TIMES=11,18,20 python3 bake_light.py

Salidas en CM_OUT:
  casa-materia-baked.glb      modelo para la web (arquitectura unida con UV de luz)
  lm_<grupo>_<hora>.webp      mapas de luz (8 bits, codificados: v = (E / max) ** (1/2.2))
  lightmaps.json              grupo → archivos y máximo por horario (la web decodifica)
La web dibuja la arquitectura como albedo × luz precalculada (sin luces en tiempo real).
"""
import json
import math
import os

import numpy as np
from PIL import Image

import bpy  # noqa: I001
from mathutils import Vector

BLEND = os.environ["CM_BLEND"]
A = os.environ.get("CM_ASSETS", "./assets")
OUT = os.environ.get("CM_OUT", ".")
RES = int(os.environ.get("CM_RES", "2048"))
SAMPLES = int(os.environ.get("CM_SAMPLES", "128"))
TIMES = os.environ.get("CM_TIMES", "11,18,20").split(",")

bpy.ops.wm.open_mainfile(filepath=BLEND)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.max_bounces = 6
sc.cycles.diffuse_bounces = 4
sc.cycles.use_denoising = False
rooms = json.loads(sc.get("cm_rooms", "{}"))

# ---------------------------------------------------------------- 1. agrupar la arquitectura
GLASS = ("vidrio", "espejo", "lamparita", "spot_techo", "vidrio_opal")


def is_static_arch(o):
    if o.type != "MESH" or o.name.startswith(("door_", "lamp_", "bulb_")):
        return False
    if "arquitectura" not in [c.name for c in o.users_collection] or o.name.startswith("arch_cobogo"):
        return False  # el cobogó (miles de caras caladas) se ilumina en tiempo real
    return not any(m and any(g in m.name for g in GLASS) for m in o.data.materials)


groups = {"suelos": [], "muros": [], "roof_techos": [], "terreno": []}
for o in list(bpy.data.objects):
    if not is_static_arch(o):
        continue
    n = o.name
    if n.startswith("arch_terreno"):
        groups["terreno"].append(o)
    elif n.startswith("roof_"):
        groups["roof_techos"].append(o)
    elif n.startswith("arch_base_casa"):
        continue  # queda debajo de los pisos: no vale la pena hornearla
    elif any(k in n for k in ("piso", "cantero", "escalon", "umbral")):
        groups["suelos"].append(o)
    else:
        groups["muros"].append(o)


def join(objs, name):
    """Une objetos (aplicando copias enlazadas) en uno solo."""
    for o in objs:
        if o.data.users > 1:
            o.data = o.data.copy()
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, object=objs[0]):
        bpy.ops.object.join()
    o = objs[0]
    o.name = name
    o.data.name = name
    return o


baked = {}
for g, objs in groups.items():
    if objs:
        baked[g] = join(objs, f"bake_{g}" if not g.startswith("roof") else g)
        print("grupo", g, len(objs), "objetos →", baked[g].name, len(baked[g].data.polygons), "caras")


def split_tops(o):
    """Separa los topes de los muros que quedan bajo los techos: solo se ven en la vista de maqueta,
    así que se hornean aparte con los techos ocultos (si no, salen negros)."""
    import bmesh as _bm
    cp = o.copy()
    cp.data = o.data.copy()
    cp.name = cp.data.name = "bake_topes"
    o.users_collection[0].objects.link(cp)

    def is_top(f):
        c = f.calc_center_median()
        return f.normal.z > 0.9 and 3.3 < c.z < 3.43

    for ob, keep_tops in ((o, False), (cp, True)):
        bm = _bm.new()
        bm.from_mesh(ob.data)
        kill = [f for f in bm.faces if is_top(f) != keep_tops]
        _bm.ops.delete(bm, geom=kill, context="FACES")
        bm.to_mesh(ob.data)
        bm.free()
    return cp


baked["topes"] = split_tops(baked["muros"])

# ---------------------------------------------------------------- 2. UV de luz (segundo mapeo, desplegado propio)
import bmesh  # noqa: E402


def lightmap_unwrap(me, res, group, margin_px=3, max_dev=0.85):
    """Islas = caras conectadas con normal parecida a la de la cara semilla (cada lado de una caja + medio bisel).
    Cada isla se proyecta a su plano, a escala real, y se empaqueta en filas. Antes borra caras que nunca se ven."""
    bm = bmesh.new()
    bm.from_mesh(me)
    hidden = [f for f in bm.faces if f.normal.z < -0.9 and f.calc_center_median().z < 0.05]
    bmesh.ops.delete(bm, geom=hidden, context="FACES")
    bm.faces.ensure_lookup_table()
    lm = bm.loops.layers.uv.get("lightmap") or bm.loops.layers.uv.new("lightmap")
    seen = set()
    islands = []
    for f in bm.faces:
        if f.index in seen:
            continue
        n0 = f.normal.copy()
        isl, stack = [], [f]
        seen.add(f.index)
        while stack:
            g = stack.pop()
            isl.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen and h.normal.dot(n0) > max_dev:
                        seen.add(h.index)
                        stack.append(h)
        # base alineada con la arista más larga: los rectángulos quedan derechos y ocupan menos lugar
        e_long = max((e for g in isl for e in g.edges), key=lambda e: e.calc_length())
        d = e_long.verts[1].co - e_long.verts[0].co
        d = d - n0 * d.dot(n0)
        u = d.normalized() if d.length > 1e-6 else n0.orthogonal().normalized()
        v = n0.cross(u).normalized()
        pts = {lo: (lo.vert.co.dot(u), lo.vert.co.dot(v)) for g in isl for lo in g.loops}
        xs = [p[0] for p in pts.values()]
        ys = [p[1] for p in pts.values()]
        c = isl[0].calc_center_median()
        minor = group == "suelos" and abs(n0.z) < 0.5
        k = 0.2 if minor else 1.0
        islands.append([isl, pts, min(xs), min(ys), (max(xs) - min(xs)) * k, (max(ys) - min(ys)) * k, k])
    area = sum(i[4] * i[5] for i in islands) + 1e-6

    def pack(density):
        m = margin_px / res
        x = y = row_h = 0.0
        place = []
        for isl in sorted(islands, key=lambda i: -i[5]):
            w, h = isl[4] * density + m, isl[5] * density + m
            if w > 1:
                return None
            if x + w > 1:
                x, y, row_h = 0.0, y + row_h, 0.0
            if y + h > 1:
                return None
            place.append((isl, x, y))
            x += w
            row_h = max(row_h, h)
        return place

    density = math.sqrt(0.85 / area)
    placed = pack(density)
    while placed is None:
        density *= 0.97
        placed = pack(density)
    half = margin_px / res / 2
    for (isl, pts, x0, y0, w, h, k), px, py in placed:
        for lo, (a, b2) in pts.items():
            lo[lm].uv = (px + half + (a - x0) * density * k, py + half + (b2 - y0) * density * k)
    bm.to_mesh(me)
    bm.free()
    return 1 / density  # metros por unidad de textura


for g, o in baked.items():
    me = o.data
    uv0 = me.uv_layers[0].name if me.uv_layers else None
    lm = me.uv_layers.new(name="lightmap")
    if g == "terreno":
        xs = [v.co.x for v in me.vertices]
        ys = [v.co.y for v in me.vertices]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        for poly in me.polygons:
            for li in poly.loop_indices:
                co = me.vertices[me.loops[li].vertex_index].co
                lm.data[li].uv = ((co.x - x0) / (x1 - x0), (co.y - y0) / (y1 - y0))
    else:
        r = RES // 2 if g in ("roof_techos", "topes") else RES
        mpu = lightmap_unwrap(me, r, g)
        print("uv de luz", g, f"{mpu / r * 100:.2f} cm por texel")
    if uv0:
        me.uv_layers[uv0].active_render = True
    me.uv_layers.active = me.uv_layers["lightmap"]


# ---------------------------------------------------------------- 3. luces por horario
world = sc.world
wnt = world.node_tree
env = next(n for n in wnt.nodes if n.type == "TEX_ENVIRONMENT")
bg = wnt.nodes["Background"]
HDRI = {"11": "kloofendal_48d_partly_cloudy_puresky_2k.hdr", "18": "venice_sunset_2k.hdr", "20": "dikhololo_night_2k.hdr"}
SUN = {"11": (4.0, (1.0, 0.95, 0.88), (0.75, 0.1, 2.6)), "18": (2.6, (1.0, 0.62, 0.36), (1.32, 0.0, 4.4)), "20": (0.0, (0.6, 0.7, 1.0), (0.6, 0.0, 1.0))}
SKY = {"11": 1.0, "18": 0.8, "20": 0.15}
LAMPS = {"11": 0.2, "18": 0.5, "20": 0.75}   # luces interiores y del patio

sun_d = bpy.data.lights.new("sol", "SUN")
sun_d.angle = 0.03
sun = bpy.data.objects.new("sol", sun_d)
sc.collection.objects.link(sun)

lamp_objs = []


def add_light(name, kind, loc, energy, color, size=0.1, rot=None):
    d = bpy.data.lights.new(name, kind)
    d.energy = energy
    d.color = color
    if kind == "AREA":
        d.shape = "RECTANGLE"
        d.size, d.size_y = size
    else:
        d.shadow_soft_size = size
    o = bpy.data.objects.new(name, d)
    o.location = loc
    if rot:
        o.rotation_euler = rot
    sc.collection.objects.link(o)
    lamp_objs.append((o, energy))
    return o


WARM = (1.0, 0.8, 0.58)
for nm, (x0, y0, x1, y1) in rooms.items():
    area = (x1 - x0) * (y1 - y0)
    add_light(f"luz_techo_{nm}", "AREA", ((x0 + x1) / 2, (y0 + y1) / 2, 3.3), 15 * area, (1.0, 0.86, 0.68), size=((x1 - x0) * 0.7, (y1 - y0) * 0.7))
for o in list(bpy.data.objects):
    if o.type != "MESH":
        continue
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    c = sum(bb, Vector()) / 8
    if o.name.startswith("lamp_aplique_") and not o.name.endswith("_base"):
        add_light(f"luz_{o.name}", "POINT", c, 35, WARM, 0.06)
    elif o.name.startswith("lamp_ratan_") and o.name.endswith("_foco"):
        add_light(f"luz_{o.name}", "POINT", c, 60, WARM, 0.05)
bulbs = [o for o in bpy.data.objects if o.name.startswith("bulb_")]
for i, o in enumerate(bulbs[::3]):
    c = sum((o.matrix_world @ Vector(v) for v in o.bound_box), Vector()) / 8
    add_light(f"luz_guirnalda_{i}", "POINT", c, 6, (1.0, 0.72, 0.42), 0.03)


def set_time(t):
    env.image = bpy.data.images.load(f"{A}/hdri/{HDRI[t]}", check_existing=True)
    bg.inputs["Strength"].default_value = SKY[t]
    e, colr, rot = SUN[t]
    sun_d.energy = e
    sun_d.color = colr
    sun.rotation_euler = rot
    sun.hide_render = e <= 0
    for o, en in lamp_objs:
        o.data.energy = en * LAMPS[t]


# ---------------------------------------------------------------- 4. horneado
def bake_group(g, o, t, res):
    img = bpy.data.images.new(f"lm_{g}_{t}", res, res, float_buffer=True)
    nodes = []
    for m in o.data.materials:
        if not m or not m.use_nodes:
            continue
        n = m.node_tree.nodes.new("ShaderNodeTexImage")
        n.image = img
        m.node_tree.nodes.active = n
        nodes.append((m, n))
    for ob in bpy.context.view_layer.objects:
        ob.select_set(ob == o)
    bpy.context.view_layer.objects.active = o
    sc.render.bake.margin = 6
    sc.render.bake.use_clear = True
    with bpy.context.temp_override(active_object=o, object=o, selected_objects=[o]):
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=6, use_clear=True)
    for m, n in nodes:
        m.node_tree.nodes.remove(n)
    px = np.empty(res * res * 4, np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(res, res, 4)[::-1, :, :3]   # Blender guarda de abajo hacia arriba


def encode(arr, path):
    """Suaviza el ruido del horneado y guarda en 8 bits con curva gamma (más precisión en sombras)."""
    import cv2
    a = arr.copy()
    a = cv2.bilateralFilter(a, 7, 0.08, 4)
    a = cv2.GaussianBlur(a, (0, 0), 0.8)
    mx = float(np.percentile(a, 99.7)) * 1.1 + 1e-6
    v = np.clip(a / mx, 0, 1) ** (1 / 2.2)
    Image.fromarray((v * 255 + 0.5).astype(np.uint8), "RGB").save(path, quality=90, method=6)
    return mx


manifest = {}
for t in TIMES:
    set_time(t)
    for g, o in baked.items():
        res = RES // 2 if g in ("terreno", "roof_techos", "topes") else RES
        roofs = baked.get("roof_techos")
        if roofs:
            roofs.hide_render = g == "topes"
        arr = bake_group(g, o, t, res)
        if roofs:
            roofs.hide_render = False
        fn = f"lm_{g}_{t}.webp"
        mx = encode(arr, f"{OUT}/{fn}")
        manifest.setdefault(o.name, {})[t] = {"file": fn, "max": round(mx * math.pi, 5)}  # irradiancia (la web divide por π)
        print("horneado", g, t, "max", mx)

with open(f"{OUT}/lightmaps.json", "w") as f:
    json.dump(manifest, f, indent=1)
for o in baked.values():
    o["cm_lightmap"] = True

# ---------------------------------------------------------------- 5. exportar el modelo para la web
for o, _ in lamp_objs:
    bpy.data.objects.remove(o)
bpy.data.objects.remove(sun)
bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/casa-materia-baked.blend")
bpy.ops.export_scene.gltf(filepath=f"{OUT}/casa-materia-baked.glb", export_format="GLB", export_image_format="WEBP",
                          export_apply=True, export_extras=True, export_cameras=False, export_lights=False, use_visible=False)
print("OK")
