"""
Casa Materia · prueba (patio tropical + sala de experiencias)
------------------------------------------------------------
Arma la escena en Blender por script y la exporta a GLB para la web.

Uso (Blender como módulo de Python, sin pantalla):
    python3 download_assets.py <ASSETS> ...        # baja texturas, modelos y cielos (CC0)
    CM_ASSETS=<ASSETS> CM_OUT=<carpeta> python3 build_pilot.py

Salidas en CM_OUT:
    casa-materia-pilot.blend   archivo editable
    casa-materia-pilot.glb     modelo para la web (antes de optimizar)

Convenciones de nombres (las usa la web):
    arch_*      arquitectura fija          roof_*     techos (se ocultan en la vista aérea)
    seat_<sala>_<n>   lugar en una mesa (anclaje para la ocupación)
    lamp_<id>   luminaria (la web le pone luz según el horario)
    bulb_*      lamparitas de la guirnalda  cam_<id>   vistas de cámara (empties)
    plant_*     vegetación                 glass_*    vidrios
Unidades: metros. Z hacia arriba (el exportador lo convierte a Y-up).
"""
import math
import os
import random

import bpy  # noqa: I001 (bpy antes que bmesh)
import bmesh
from mathutils import Matrix, Vector

A = os.environ.get("CM_ASSETS", "./assets")
OUT = os.environ.get("CM_OUT", ".")
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"

COL = {}


def col(name):
    if name not in COL:
        c = bpy.data.collections.new(name)
        scene.collection.children.link(c)
        COL[name] = c
    return COL[name]


# ---------------------------------------------------------------- materiales
def tex_node(nt, path, non_color=False):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    if non_color:
        n.image.colorspace_settings.name = "Non-Color"
    return n


def pbr(name, folder=None, files=None, color=None, rough=0.6, metal=0.0, tint=None, alpha=None, emit=None, emit_strength=1.0):
    """Material Principled; si hay texturas, usa color, normal y rugosidad (glTF: base/normal/metal-rough)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if color:
        b.inputs["Base Color"].default_value = (*color, 1)
    if folder:
        f = files
        d = tex_node(nt, f"{folder}/{f['color']}")
        if tint:
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            nt.links.new(d.outputs["Color"], mix.inputs[6])
            mix.inputs[7].default_value = (*tint, 1)
            nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        else:
            nt.links.new(d.outputs["Color"], b.inputs["Base Color"])
        if f.get("normal"):
            nn = tex_node(nt, f"{folder}/{f['normal']}", True)
            nm = nt.nodes.new("ShaderNodeNormalMap")
            nt.links.new(nn.outputs["Color"], nm.inputs["Color"])
            nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
        if f.get("rough"):
            r = tex_node(nt, f"{folder}/{f['rough']}", True)
            nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    if alpha is not None:
        b.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_strength
    return m


PH = f"{A}/tex"


def adjusted(folder, target, name):
    """Copia de una textura de color llevada a un tono medio (RGB 0-255): aclara revoques y hormigones."""
    from PIL import Image, ImageStat
    src = f"{folder}/Diffuse.jpg"
    dst_dir = f"{OUT}/tex_ajustadas/{name}"
    os.makedirs(dst_dir, exist_ok=True)
    im = Image.open(src).convert("RGB")
    mean = ImageStat.Stat(im).mean
    ch = [c.point(lambda v, k=target[i] / max(mean[i], 1): min(255, int(v * k))) for i, c in enumerate(im.split())]
    Image.merge("RGB", ch).save(f"{dst_dir}/Diffuse.jpg", quality=90)
    for extra in ("nor_gl.jpg", "Rough.jpg"):
        if os.path.exists(f"{folder}/{extra}") and not os.path.exists(f"{dst_dir}/{extra}"):
            os.symlink(f"{folder}/{extra}", f"{dst_dir}/{extra}")
    return dst_dir
phf = {"color": "Diffuse.jpg", "normal": "nor_gl.jpg", "rough": "Rough.jpg"}
TR = f"{PH}/travertine"
trf = {"color": "Travertine009_1K-JPG_Color.jpg", "normal": "Travertine009_1K-JPG_NormalGL.jpg", "rough": "Travertine009_1K-JPG_Roughness.jpg"}

M = {
    "travertine": pbr("travertino", TR, trf, tint=(1.0, 0.97, 0.92)),
    "plaster": pbr("revoque_arena", adjusted(f"{PH}/beige_wall_001", (222, 208, 188), "revoque_arena"), phf),
    "plaster_white": pbr("revoque_blanco", adjusted(f"{PH}/white_plaster_02", (234, 228, 218), "revoque_blanco"), phf),
    "concrete": pbr("hormigon_fino", adjusted(f"{PH}/concrete_floor_01", (196, 190, 180), "hormigon"), phf),
    "oak": pbr("roble", f"{PH}/oak_veneer_01", phf),
    "wood_floor": pbr("piso_madera", adjusted(f"{PH}/wood_floor", (168, 132, 96), "piso_madera"), phf),
    "terrazzo": pbr("terrazo", adjusted(f"{PH}/terrazzo_tiles", (214, 202, 186), "terrazo"), phf),
    "cobogo": pbr("cobogo", adjusted(f"{PH}/white_plaster_02", (226, 214, 196), "cobogo"), phf),
    "metal_black": pbr("metal_negro", color=(0.02, 0.02, 0.02), rough=0.45, metal=1.0),
    "steel": pbr("acero", color=(0.8, 0.8, 0.8), rough=0.22, metal=1.0),
    "brass": pbr("laton", color=(0.78, 0.6, 0.32), rough=0.3, metal=1.0),
    "glass": pbr("vidrio", color=(0.62, 0.7, 0.7), rough=0.04, alpha=0.16),
    "soil": pbr("tierra", color=(0.09, 0.06, 0.04), rough=1.0),
    "bulb": pbr("lamparita", color=(1, 0.85, 0.6), emit=(1.0, 0.72, 0.4), emit_strength=6.0),
    "downlight": pbr("spot_techo", color=(1, 1, 1), emit=(1.0, 0.82, 0.6), emit_strength=4.0),
    "bisque": pbr("bizcocho", color=(0.86, 0.8, 0.72), rough=0.85),
    "glaze_blue": pbr("esmalte_azul", color=(0.12, 0.25, 0.42), rough=0.25),
    "glaze_rust": pbr("esmalte_oxido", color=(0.5, 0.22, 0.1), rough=0.3),
    "glaze_sage": pbr("esmalte_salvia", color=(0.45, 0.52, 0.4), rough=0.3),
    "cushion": pbr("lino", color=(0.72, 0.64, 0.52), rough=0.95),
}


# ---------------------------------------------------------------- geometría
def box_uv(bm, tile):
    """Mapeo de caja en coordenadas de mundo: la textura queda a escala real (tile = metros por repetición)."""
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for lo in f.loops:
            c = lo.vert.co
            u, v = (c.y, c.z) if ax == 0 else (c.x, c.z) if ax == 1 else (c.x, c.y)
            lo[uv].uv = (u / tile, v / tile)


def obj_from_bm(name, bm, mat, collection="arquitectura", tile=1.0, smooth=False):
    bm.normal_update()
    box_uv(bm, tile)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    o.data.materials.append(mat)
    col(collection).objects.link(o)
    return o


def box(name, x0, y0, z0, x1, y1, z1, mat, bevel=0.006, tile=1.0, collection="arquitectura"):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = x0 + (v.co.x + 0.5) * (x1 - x0)
        v.co.y = y0 + (v.co.y + 0.5) * (y1 - y0)
        v.co.z = z0 + (v.co.z + 0.5) * (z1 - z0)
    if bevel:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect="EDGES", profile=0.5)
    return obj_from_bm(name, bm, mat, collection, tile)


def cyl(name, x, y, z0, z1, r, mat, seg=32, collection="objetos", bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=z1 - z0)
    for v in bm.verts:
        v.co += Vector((x, y, (z0 + z1) / 2))
    if bevel:
        bmesh.ops.bevel(bm, geom=[e for e in bm.edges if not e.is_manifold or abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6], offset=bevel, segments=2, affect="EDGES")
    o = obj_from_bm(name, bm, mat, collection, 0.5)
    for p in o.data.polygons:
        p.use_smooth = abs(p.normal.z) < 0.5
    return o


def empty(name, loc, target=None, collection="vistas"):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    col(collection).objects.link(e)
    if target is not None:
        e["target"] = list(target)
    return e


# ---------------------------------------------------------------- importación de modelos
def import_parts(model, names=None):
    """Importa un modelo de Poly Haven y devuelve sus objetos (opcionalmente solo los nombrados)."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f"{A}/models/{model}/{model}.gltf")
    new = [o for o in bpy.data.objects if o not in before]
    keep = [o for o in new if o.type == "MESH" and (names is None or any(o.name.startswith(n) for n in names))]
    for o in new:
        if o not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    for o in keep:
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    return keep


def place(objs, loc, rot=0.0, scale=1.0, center=True, collection="objetos", prefix=None):
    """Coloca un grupo de objetos: los centra en XY (base en z=0) y los mueve a loc."""
    if center:
        xs = [(o.matrix_world @ Vector(c)) for o in objs for c in o.bound_box]
        cx = (min(v.x for v in xs) + max(v.x for v in xs)) / 2
        cy = (min(v.y for v in xs) + max(v.y for v in xs)) / 2
        cz = min(v.z for v in xs)
    else:
        cx = cy = cz = 0.0
    T = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot, 4, "Z") @ Matrix.Scale(scale, 4) @ Matrix.Translation(Vector((-cx, -cy, -cz)))
    out = []
    for o in objs:
        o.matrix_world = T @ o.matrix_world
        for c in o.users_collection:
            c.objects.unlink(o)
        col(collection).objects.link(o)
        if prefix:
            o.name = f"{prefix}_{o.name}"
        out.append(o)
    return out


def dup(objs, loc, rot=0.0, scale=1.0, collection="objetos", prefix=None):
    """Copia (enlazada) de un grupo ya colocado en el origen."""
    cp = []
    for o in objs:
        n = o.copy()
        cp.append(n)
        col(collection).objects.link(n)
    return place(cp, loc, rot, scale, center=True, collection=collection, prefix=prefix)


def decimate(objs, ratio):
    for o in objs:
        if ratio < 1:
            mo = o.modifiers.new("dec", "DECIMATE")
            mo.ratio = ratio
            bpy.context.view_layer.objects.active = o
            with bpy.context.temp_override(object=o, active_object=o):
                bpy.ops.object.modifier_apply(modifier=mo.name)


# ---------------------------------------------------------------- muebles propios
def parts_obj(name, parts, mats, loc=(0, 0, 0), rot=0.0, collection="objetos", tile=0.6):
    """Une varias piezas (cajas o cilindros) en un solo objeto con varios materiales."""
    bm = bmesh.new()
    for kind, dims, mi, bev in parts:
        tmp = bmesh.new()
        if kind == "box":
            x0, y0, z0, x1, y1, z1 = dims
            bmesh.ops.create_cube(tmp, size=1.0)
            for v in tmp.verts:
                v.co = Vector((x0 + (v.co.x + .5) * (x1 - x0), y0 + (v.co.y + .5) * (y1 - y0), z0 + (v.co.z + .5) * (z1 - z0)))
        else:
            x, y, z0, z1, r0, r1 = dims
            bmesh.ops.create_cone(tmp, cap_ends=True, segments=24, radius1=r0, radius2=r1, depth=z1 - z0)
            for v in tmp.verts:
                v.co += Vector((x, y, (z0 + z1) / 2))
        if bev:
            bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=bev, segments=2, affect="EDGES")
        for f in tmp.faces:
            f.material_index = mi
            f.smooth = kind != "box"
        me = bpy.data.meshes.new("t")
        tmp.to_mesh(me)
        tmp.free()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
    bm.normal_update()
    box_uv(bm, tile)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    o = bpy.data.objects.new(name, me)
    o.location = loc
    o.rotation_euler = (0, 0, rot)
    col(collection).objects.link(o)
    return o


_CHAIR = None


def chair_obj(name, loc, rot):
    """Silla de roble con asiento de lino (diseño propio, mira hacia +Y)."""
    s, h = 0.21, 0.45
    p = []
    for sx in (-1, 1):
        p.append(("cyl", (sx * (s - 0.02), s - 0.03, 0, h, 0.016, 0.019), 0, 0))       # delanteras
        p.append(("cyl", (sx * (s - 0.02), -(s - 0.03), 0, 0.84, 0.016, 0.02), 0, 0))  # traseras (suben al respaldo)
    p.append(("box", (-s, -s, h - 0.035, s, s, h), 0, 0.006))
    p.append(("box", (-s + 0.02, -s + 0.02, h, s - 0.02, s - 0.02, h + 0.045), 1, 0.018))
    p.append(("box", (-s, -s - 0.01, 0.66, s, -s + 0.025, 0.8), 0, 0.008))
    p.append(("box", (-s + 0.03, s - 0.04, 0.16, s - 0.03, s - 0.02, 0.19), 0, 0.004))
    return parts_obj(name, p, [M["oak"], M["cushion"]], loc, rot)


def stool_obj(name, loc):
    p = [("cyl", (0, 0, 0.72, 0.76, 0.18, 0.18), 0, 0.008)]
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        p.append(("cyl", (math.cos(a) * 0.14, math.sin(a) * 0.14, 0, 0.72, 0.012, 0.012), 1, 0))
    p.append(("cyl", (0, 0, 0.28, 0.3, 0.16, 0.16), 1, 0))
    return parts_obj(name, p, [M["oak"], M["metal_black"]], loc)


def patio_table(name, loc):
    p = [("cyl", (0, 0, 0.72, 0.76, 0.42, 0.42), 0, 0.006), ("cyl", (0, 0, 0.02, 0.72, 0.035, 0.035), 1, 0), ("cyl", (0, 0, 0, 0.025, 0.24, 0.26), 1, 0.004)]
    return parts_obj(name, p, [M["travertine"], M["metal_black"]], loc)


# =====================================================================
# PLANTA (metros)
#   Patio:        x 0..11, y 0..9   (abierto al cielo)
#   Galería bar:  x 8.0..11, y 1.0..7.6  (losa a 3.0 m)
#   Sala exp.:    x 0.6..10.4, y 9.0..15.6 (fachada vidriada hacia el patio)
#   Cobogó:       muro oeste x = 0, de y 0 a 9
# =====================================================================
H = 3.4  # altura de muros del patio

# ---------------- piso y suelos
box("arch_piso_patio", -0.2, -0.2, -0.12, 11.2, 9.0, 0.0, M["travertine"], bevel=0, tile=1.6)
box("arch_terreno", -14, -14, -0.4, 25, 28, -0.13, pbr("grava", adjusted(f"{PH}/concrete_floor_01", (186, 178, 164), "grava"), phf), bevel=0, tile=3)

# juntas del piso de travertino (losas de 0.8 × 0.8 m): líneas finas en bajo relieve
grout = pbr("junta", color=(0.55, 0.5, 0.44), rough=0.9)
for i in range(1, 14):
    box(f"arch_junta_x{i}", i * 0.8, -0.2, -0.004, i * 0.8 + 0.006, 9.0, 0.0015, grout, bevel=0)
for j in range(1, 12):
    box(f"arch_junta_y{j}", -0.2, j * 0.8, -0.004, 11.2, j * 0.8 + 0.006, 0.0015, grout, bevel=0)

# ---------------- muros perimetrales del patio
box("arch_muro_sur", -0.2, -0.45, 0, 11.2, -0.2, H, M["plaster"], tile=2.5)
box("arch_muro_este", 11.0, -0.45, 0, 11.25, 9.0, H, M["plaster"], tile=2.5)
box("arch_coronamiento_sur", -0.25, -0.5, H, 11.3, -0.15, H + 0.06, M["concrete"], tile=1.5)
box("arch_coronamiento_este", 10.95, -0.5, H, 11.3, 9.0, H + 0.06, M["concrete"], tile=1.5)

# ---------------- muro de cobogó (oeste): bloques 0.3 × 0.3 con calado circular
def cobogo_wall(x, y0, y1, z0, z1, unit=0.3, depth=0.12):
    cu = bpy.data.curves.new("cobogo_unidad", "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = depth / 2
    cu.resolution_u = 6
    sq = cu.splines.new("POLY")
    s = unit / 2
    sq.points.add(3)
    for i, (a, b) in enumerate([(-s, -s), (s, -s), (s, s), (-s, s)]):
        sq.points[i].co = (a, b, 0, 1)
    sq.use_cyclic_u = True
    ci = cu.splines.new("BEZIER")
    ci.bezier_points.add(3)
    r = unit * 0.36
    for i in range(4):
        a = i * math.pi / 2
        p = ci.bezier_points[i]
        p.co = (r * math.cos(a), r * math.sin(a), 0)
        p.handle_left_type = p.handle_right_type = "AUTO"
    ci.use_cyclic_u = True
    tmp = bpy.data.objects.new("tmp_cobogo", cu)
    scene.collection.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    unit_me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    bm = bmesh.new()
    ny = int(round((y1 - y0) / unit))
    nz = int(round((z1 - z0) / unit))
    for iy in range(ny):
        for iz in range(nz):
            m = Matrix.Translation((x, y0 + unit * (iy + 0.5), z0 + unit * (iz + 0.5))) @ Matrix.Rotation(math.pi / 2, 4, "Z") @ Matrix.Rotation(math.pi / 2, 4, "X")
            tmpbm = bmesh.new()
            tmpbm.from_mesh(unit_me)
            bmesh.ops.transform(tmpbm, matrix=m, verts=tmpbm.verts)
            tme = bpy.data.meshes.new("t")
            tmpbm.to_mesh(tme)
            tmpbm.free()
            bm.from_mesh(tme)
            bpy.data.meshes.remove(tme)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    return obj_from_bm("arch_cobogo_oeste", bm, M["cobogo"], tile=0.6)


cobogo_wall(-0.08, 0.0, 9.0, 0.0, 3.3)
box("arch_coronamiento_oeste", -0.3, -0.5, 3.3, 0.14, 9.0, 3.38, M["concrete"], tile=1.5)
# vegetación detrás del cobogó (se ve a través de los calados)
box("arch_fondo_oeste", -2.6, -0.5, 0, -2.4, 9.0, 4.2, M["plaster"], tile=2.5)

# ---------------- canteros
def planter(name, x0, y0, x1, y1, h=0.45, mat=None):
    mat = mat or M["concrete"]
    t = 0.08
    box(f"{name}_a", x0, y0, 0, x1, y0 + t, h, mat, tile=1.2)
    box(f"{name}_b", x0, y1 - t, 0, x1, y1, h, mat, tile=1.2)
    box(f"{name}_c", x0, y0, 0, x0 + t, y1, h, mat, tile=1.2)
    box(f"{name}_d", x1 - t, y0, 0, x1, y1, h, mat, tile=1.2)
    box(f"{name}_tierra", x0 + t, y0 + t, 0, x1 - t, y1 - t, h - 0.06, M["soil"], bevel=0, tile=1)


planter("arch_cantero_oeste", 0.12, 0.3, 1.0, 8.7)
planter("arch_cantero_sur", 1.0, -0.15, 7.6, 0.6)
planter("arch_cantero_centro", 3.4, 3.6, 5.2, 5.4, h=0.5, mat=M["travertine"])

# ---------------- galería del bar (losa de hormigón sobre columnas finas)
box("roof_galeria", 7.7, 0.8, 3.0, 11.0, 7.9, 3.22, M["concrete"], tile=2)
for i, y in enumerate([1.0, 7.6]):
    cyl(f"arch_columna_{i}", 7.95, y, 0, 3.0, 0.09, M["metal_black"], collection="arquitectura")
for i, y in enumerate([2.2, 4.3, 6.4]):
    cyl(f"lamp_spot_galeria_{i}", 9.4, y, 2.97, 3.0, 0.07, M["downlight"])

# barra: frente de listones verticales de roble + tapa de travertino
BX0, BX1, BY0, BY1 = 8.55, 9.2, 1.7, 6.3
box("arch_barra_cuerpo", BX0 + 0.04, BY0, 0, BX1, BY1, 1.02, M["oak"], tile=1.0)
n = int((BY1 - BY0) / 0.06)
for i in range(n):
    y = BY0 + i * 0.06
    box(f"arch_barra_liston_{i}", BX0, y + 0.006, 0.06, BX0 + 0.045, y + 0.05, 1.0, M["oak"], bevel=0.008, tile=0.8)
box("arch_barra_zocalo", BX0 + 0.03, BY0, 0, BX1, BY1, 0.06, M["metal_black"], bevel=0.002)
box("arch_barra_tapa", BX0 - 0.06, BY0 - 0.06, 1.02, BX1 + 0.06, BY1 + 0.06, 1.08, M["travertine"], bevel=0.008, tile=1.2)
# mesada trasera + estantes en el muro este
box("arch_mesada_trasera", 10.4, 1.4, 0, 11.0, 6.6, 0.92, M["oak"], tile=1)
box("arch_mesada_trasera_tapa", 10.38, 1.38, 0.92, 11.0, 6.62, 0.96, M["travertine"], tile=1.2)
for k, z in enumerate([1.45, 1.9, 2.35]):
    box(f"arch_estante_{k}", 10.72, 1.6, z, 11.0, 6.4, z + 0.04, M["oak"], tile=1)
box("arch_revestimiento_bar", 10.98, 1.3, 0.96, 11.0, 6.7, 2.95, M["terrazzo"], bevel=0, tile=1.2)

# cafetera espresso (modelada): cuerpo de acero, grupos y portafiltros
box("obj_cafetera_cuerpo", 10.45, 3.2, 0.96, 10.95, 4.05, 1.38, M["steel"], bevel=0.02)
box("obj_cafetera_bandeja", 10.38, 3.25, 0.96, 10.5, 4.0, 1.0, M["steel"], bevel=0.004)
for i, y in enumerate([3.42, 3.83]):
    cyl(f"obj_cafetera_grupo_{i}", 10.42, y, 1.14, 1.22, 0.045, M["steel"])
    box(f"obj_cafetera_mango_{i}", 10.22, y - 0.012, 1.11, 10.4, y + 0.012, 1.13, M["metal_black"], bevel=0.008)
box("obj_cafetera_tope", 10.5, 3.25, 1.38, 10.93, 4.0, 1.4, M["metal_black"], bevel=0.004)
# molinillo
cyl("obj_molinillo_base", 10.7, 4.4, 0.96, 1.3, 0.09, M["metal_black"])
cyl("obj_molinillo_tolva", 10.7, 4.4, 1.3, 1.5, 0.07, M["glass"])

# ---------------- sala de experiencias (fachada vidriada al patio)
SX0, SX1, SY0, SY1, SH = 0.6, 10.4, 9.0, 15.6, 3.3
box("arch_sala_piso", SX0, SY0, -0.12, SX1, SY1, 0.0, M["wood_floor"], bevel=0, tile=2.0)
box("arch_sala_muro_n", SX0 - 0.25, SY1, 0, SX1 + 0.25, SY1 + 0.25, SH, M["plaster_white"], tile=2.5)
box("arch_sala_muro_o", SX0 - 0.25, SY0, 0, SX0, SY1, SH, M["plaster_white"], tile=2.5)
box("arch_sala_muro_e", SX1, SY0, 0, SX1 + 0.25, SY1, SH, M["plaster_white"], tile=2.5)
box("roof_sala", SX0 - 0.3, SY0 - 1.6, SH, SX1 + 0.3, SY1 + 0.3, SH + 0.3, M["concrete"], tile=2)  # alero de 1.6 m
box("roof_sala_cielorraso", SX0, SY0, SH - 0.02, SX1, SY1, SH, M["plaster_white"], bevel=0, tile=2)
# carpintería: parantes negros cada 1.4 m + vidrio
box("glass_fachada_sala", SX0, SY0 - 0.01, 0, SX1, SY0 + 0.01, SH, M["glass"], bevel=0)
nx = 7
for i in range(nx + 1):
    x = SX0 + i * (SX1 - SX0) / nx
    box(f"arch_parante_{i}", x - 0.025, SY0 - 0.04, 0, x + 0.025, SY0 + 0.04, SH, M["metal_black"], bevel=0.003)
box("arch_dintel_sala", SX0, SY0 - 0.04, SH - 0.06, SX1, SY0 + 0.04, SH, M["metal_black"], bevel=0.003)
box("arch_umbral_sala", SX0, SY0 - 0.05, 0, SX1, SY0 + 0.05, 0.03, M["metal_black"], bevel=0.003)
for i, x in enumerate([2.4, 5.5, 8.6]):
    cyl(f"lamp_spot_alero_{i}", x, SY0 - 0.8, SH - 0.03, SH, 0.06, M["downlight"])

# mesa larga de roble sobre caballetes de travertino
TX, TY = 5.5, 12.3
box("obj_mesa_tapa", TX - 2.2, TY - 0.6, 0.72, TX + 2.2, TY + 0.6, 0.77, M["oak"], bevel=0.01, tile=1.5)
for i, dx in enumerate([-1.5, 1.5]):
    box(f"obj_mesa_pata_{i}", TX + dx - 0.12, TY - 0.45, 0, TX + dx + 0.12, TY + 0.45, 0.72, M["travertine"], bevel=0.01, tile=1)

seats = []
k = 0
for side, ry in ((-1, 0.0), (1, math.pi)):
    for dx in (-1.5, -0.5, 0.5, 1.5):
        chair_obj(f"obj_silla_sala_{k}", (TX + dx, TY + side * 0.86, 0), ry)
        seats.append((f"seat_exp_{k}", (TX + dx, TY + side * 0.86, 0.45), (TX + dx, TY + side * 0.35, 0.78)))
        k += 1
for name, loc, _place in seats:
    e = empty(name, loc, collection="ocupacion")
    e["mesa"] = list(_place)

# sobre la mesa: piezas en bizcocho, pinceles, paletas, cerámica esmaltada
def brush_jar(name, x, y):
    cyl(f"{name}_frasco", x, y, 0.77, 0.89, 0.04, M["glaze_sage"])
    for i in range(7):
        a = i / 7 * math.tau + random.random() * 0.4
        r = 0.018
        bx, by = x + math.cos(a) * r, y + math.sin(a) * r
        h = 0.19 + random.random() * 0.06
        o = cyl(f"{name}_pincel_{i}", bx, by, 0.8, 0.8 + h, 0.0045, M["oak"], seg=8)
        tilt = Matrix.Translation((bx, by, 0.8)) @ Matrix.Rotation(0.12 * math.cos(a), 4, "Y") @ Matrix.Rotation(-0.12 * math.sin(a), 4, "X") @ Matrix.Translation((-bx, -by, -0.8))
        o.data.transform(tilt)
        cyl(f"{name}_virola_{i}", bx, by, 0.8 + h, 0.8 + h + 0.02, 0.005, M["brass"], seg=8).data.transform(tilt)


def palette(name, x, y):
    cyl(f"{name}_paleta", x, y, 0.77, 0.78, 0.09, M["bisque"], seg=40)
    cols = [M["glaze_blue"], M["glaze_rust"], M["glaze_sage"], pbr(f"{name}_ocre", color=(0.75, 0.55, 0.2), rough=0.3)]
    for i, m in enumerate(cols):
        a = i / 4 * math.tau
        cyl(f"{name}_pintura_{i}", x + math.cos(a) * 0.05, y + math.sin(a) * 0.05, 0.78, 0.786, 0.018, m, seg=16)


def bisque_cup(name, x, y, mat):
    cyl(f"{name}_taza", x, y, 0.77, 0.86, 0.04, mat, seg=32)


for i, dx in enumerate([-1.5, -0.5, 0.5, 1.5]):
    for side in (-1, 1):
        px, py = TX + dx, TY + side * 0.33
        bisque_cup(f"obj_pieza_{i}_{side}", px + 0.08, py, M["bisque"] if (i + side) % 2 else M["glaze_blue"])
        palette(f"obj_paleta_{i}_{side}", px - 0.13, py)
brush_jar("obj_pinceles_a", TX - 1.0, TY)
brush_jar("obj_pinceles_b", TX + 1.0, TY)
vases = []
for m, x in (("ceramic_vase_01", -0.1), ("ceramic_vase_03", 0.12)):
    vases += place(import_parts(m), (TX + x, TY + 0.02, 0.77), scale=0.8)
place(import_parts("wooden_bowl_01"), (TX + 0.0, TY - 0.12, 0.77), scale=0.9)

# lámparas colgantes sobre la mesa
lamp = import_parts("modern_ceiling_lamp_01")
lamp = place(lamp, (0, 0, 0))
for i, dx in enumerate([-1.4, 0, 1.4]):
    dup(lamp, (TX + dx, TY, SH - 0.95), prefix=f"lamp_colgante_{i}")
for o in lamp:
    bpy.data.objects.remove(o, do_unlink=True)

# estantería con piezas en el muro norte
shelf = import_parts("wooden_display_shelves_01")
shelf = place(shelf, (0, 0, 0))
for i, x in enumerate([1.6, 9.4]):
    s = dup(shelf, (x, SY1 - 0.25, 0), rot=math.pi / 2, scale=1.3)
for o in shelf:
    bpy.data.objects.remove(o, do_unlink=True)
for i, (m, x, z) in enumerate([("ceramic_vase_02", 1.3, 0.62), ("ceramic_pot", 1.9, 1.2), ("jug_01", 9.1, 0.62), ("ceramic_vase_01", 9.7, 1.2), ("ceramic_vase_03", 1.6, 1.75), ("ceramic_vase_02", 9.4, 1.75)]):
    place(import_parts(m), (x, SY1 - 0.33, z), scale=0.7)

# ---------------- mobiliario del patio
tables = [(2.0, 2.3), (6.3, 2.5), (6.0, 6.4)]
for ti, (tx, ty) in enumerate(tables):
    patio_table(f"obj_mesa_patio_{ti}", (tx, ty, 0))
    for ci in range(3):
        a = ci / 3 * math.tau + ti
        cx, cy = tx + math.cos(a) * 0.68, ty + math.sin(a) * 0.68
        chair_obj(f"obj_silla_patio_{ti}_{ci}", (cx, cy, 0), a + math.pi / 2)
        e = empty(f"seat_patio_{ti}_{ci}", (cx, cy, 0.45), collection="ocupacion")
        e["mesa"] = [tx + math.cos(a) * 0.3, ty + math.sin(a) * 0.3, 0.77]
for i, y in enumerate([2.2, 3.1, 4.0, 4.9, 5.8]):
    stool_obj(f"obj_banqueta_{i}", (8.05, y, 0))

# botellas y tazas en la barra y los estantes
bottles = place(import_parts("wine_bottles_01"), (0, 0, 0))
for k, z in enumerate([1.49, 1.94, 2.39]):
    for j in range(5):
        dup(bottles, (10.86, 1.9 + j * 0.95 + (k % 2) * 0.3, z), rot=math.pi / 2)
for o in bottles:
    bpy.data.objects.remove(o, do_unlink=True)
cups = import_parts("tea_set_01", ["tea_set_01_cup_small", "tea_set_01_saucer_circular"])
cups = place(cups, (0, 0, 0))
for j in range(3):
    dup(cups, (8.88, 2.3 + j * 1.6, 1.08), rot=j)
for o in cups:
    bpy.data.objects.remove(o, do_unlink=True)
place(import_parts("croissant"), (8.85, 4.0, 1.08), rot=0.4)

# ---------------- vegetación
plants = []
anth = import_parts("anthurium_botany_01")
cal = import_parts("calathea_orbifolia_01")
fern = import_parts("fern_02")
pach = import_parts("pachira_aquatica_01")
for o in anth + cal + fern + pach:
    o.name = "plant_" + o.name
decimate(anth + cal, 0.5)


def pick(group, prefix):
    return [o for o in group if o.name.startswith("plant_" + prefix)]


# cantero oeste: frondoso, alterna anturios, calateas y helechos
row = [("anthurium_botany_01_a", 1.5), ("fern_02_b", 1.2), ("calathea_orbifolia_01_a", 1.6), ("anthurium_botany_01_b", 1.6),
       ("fern_02_c", 1.3), ("anthurium_botany_01_a", 1.5), ("calathea_orbifolia_01_b", 1.6), ("fern_02_b", 1.3), ("anthurium_botany_01_c", 1.7)]
for i, (nm, s) in enumerate(row):
    src = pick(anth + cal + fern, nm)
    y = 0.8 + i * 0.95
    dup(src, (0.56 + random.uniform(-0.1, 0.1), y, 0.39), rot=random.random() * math.tau, scale=s, collection="vegetacion")
# cantero sur
for i, nm in enumerate(["calathea_orbifolia_01_a", "anthurium_botany_01_a", "fern_02_b", "anthurium_botany_01_b", "calathea_orbifolia_01_c", "fern_02_c", "anthurium_botany_01_a"]):
    src = pick(anth + cal + fern, nm)
    dup(src, (1.5 + i * 0.95, 0.22, 0.39), rot=random.random() * math.tau, scale=1.4, collection="vegetacion")
# cantero central: pachira grande + helechos
dup(pick(pach, "pachira_aquatica_01_bark_d") + pick(pach, "pachira_aquatica_01_leaves_d"), (4.3, 4.5, 0.44), scale=2.2, collection="vegetacion")
for i, (dx, dy) in enumerate([(-0.55, -0.5), (0.55, 0.5), (0.5, -0.55), (-0.5, 0.55)]):
    dup(pick(fern, "fern_02_a"), (4.3 + dx, 4.5 + dy, 0.44), rot=i * 1.7, scale=1.2, collection="vegetacion")
# detrás del cobogó: masa verde que se ve por los calados
for i in range(9):
    src = pick(anth, "anthurium_botany_01_a") if i % 2 else pick(pach, "pachira_aquatica_01_leaves_c") + pick(pach, "pachira_aquatica_01_bark_c")
    dup(src, (-1.3, 0.5 + i * 1.0, 0), rot=random.random() * math.tau, scale=1.9, collection="vegetacion")
# sala: macetas
pp1 = place(import_parts("potted_plant_01"), (0, 0, 0))
pp2 = place(import_parts("potted_plant_02"), (0, 0, 0))
decimate(pp1, 0.35)
dup(pp1, (1.2, 9.6, 0), scale=1.25, collection="vegetacion")
dup(pp2, (9.8, 9.6, 0), scale=1.2, collection="vegetacion")
dup(pp1, (10.5, 7.2, 0), scale=1.1, collection="vegetacion")
dup(pp2, (8.1, 0.95, 0), scale=1.0, collection="vegetacion")
for o in anth + cal + fern + pach + pp1 + pp2:
    bpy.data.objects.remove(o, do_unlink=True)

# ---------------- strelitzias (modeladas: hojas en paleta con textura generada)
def leaf_texture():
    w, h = 256, 1024
    img = bpy.data.images.new("hoja_strelitzia", w, h)
    px = [0.0] * (w * h * 4)
    for yy in range(h):
        t = yy / h
        for xx in range(w):
            u = abs(xx / w - 0.5) * 2
            vein = 0.06 * (0.5 + 0.5 * math.sin((t * 90 + u * 22)))
            mid = max(0.0, 1 - u * 14)
            g = 0.32 + 0.1 * (1 - u) - vein * 0.6 + mid * 0.2
            i = (yy * w + xx) * 4
            px[i:i + 4] = (0.13 * g * 1.4 + mid * 0.25, g, 0.08 + 0.06 * g + mid * 0.1, 1.0)
    img.pixels = px
    img.filepath_raw = f"{OUT}/hoja_strelitzia.png"
    img.file_format = "PNG"
    img.save()
    return img


leaf_img = leaf_texture()
leaf_mat = bpy.data.materials.new("hoja_strelitzia")
leaf_mat.use_nodes = True
nt = leaf_mat.node_tree
b = nt.nodes["Principled BSDF"]
t = nt.nodes.new("ShaderNodeTexImage")
t.image = leaf_img
nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
b.inputs["Roughness"].default_value = 0.55
leaf_mat.use_backface_culling = False
stem_mat = pbr("tallo_strelitzia", color=(0.22, 0.28, 0.12), rough=0.6)


def strelitzia(name, x, y, height=2.6, leaves=11):
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    for i in range(leaves):
        a = i / leaves * math.pi * 1.7 - 0.85 * math.pi + random.uniform(-0.2, 0.2)
        stem_h = height * random.uniform(0.45, 0.75)
        lean = random.uniform(0.15, 0.45)
        L = random.uniform(0.9, 1.5)
        W = random.uniform(0.28, 0.4)
        base = Vector((x, y, 0.0))
        d = Vector((math.cos(a) * lean, math.sin(a) * lean, 1)).normalized()
        top = base + d * stem_h
        # tallo
        r = 0.018
        ring0, ring1 = [], []
        for s in range(6):
            q = s / 6 * math.tau
            off = Vector((math.cos(q) * r, math.sin(q) * r, 0))
            ring0.append(bm.verts.new(base + off))
            ring1.append(bm.verts.new(top + off * 0.7))
        for s in range(6):
            bm.faces.new((ring0[s], ring0[(s + 1) % 6], ring1[(s + 1) % 6], ring1[s]))
        # lámina: grilla curvada, se abre hacia afuera
        side = Vector((-math.sin(a), math.cos(a), 0))
        nu, nv = 4, 10
        grid = []
        for iv in range(nv + 1):
            tv = iv / nv
            width = W * math.sin(math.pi * min(1, tv * 1.05)) ** 0.7 + 0.01
            bend = d.lerp(Vector((math.cos(a), math.sin(a), 0.2)).normalized(), tv * 0.6)
            center = top + bend * (L * tv)
            rowv = []
            for iu in range(nu + 1):
                tu = iu / nu - 0.5
                fold = abs(tu) * 0.08
                p = center + side * (tu * width) + Vector((0, 0, -fold))
                rowv.append(bm.verts.new(p))
            grid.append(rowv)
        for iv in range(nv):
            for iu in range(nu):
                f = bm.faces.new((grid[iv][iu], grid[iv][iu + 1], grid[iv + 1][iu + 1], grid[iv + 1][iu]))
                f.material_index = 1
                for lo, (uu, vv) in zip(f.loops, ((iu, iv), (iu + 1, iv), (iu + 1, iv + 1), (iu, iv + 1))):
                    lo[uv].uv = (uu / nu, vv / nv)
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    me.materials.append(stem_mat)
    me.materials.append(leaf_mat)
    col("vegetacion").objects.link(o)
    return o


for i, (x, y, hh) in enumerate([(0.5, 1.2, 3.0), (0.55, 4.6, 2.6), (0.5, 7.9, 3.2), (7.2, 0.2, 2.6), (10.6, 8.4, 2.8)]):
    strelitzia(f"plant_strelitzia_{i}", x, y, hh, leaves=12)

# ---------------- guirnalda de luces cruzando el patio
def garland(name, p0, p1, sag=0.45, n=16):
    pts = []
    for i in range(n + 1):
        t = i / n
        p = Vector(p0).lerp(Vector(p1), t)
        p.z -= sag * 4 * t * (1 - t)
        pts.append(p)
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.004
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (*p, 1)
    o = bpy.data.objects.new(name + "_cable", cu)
    col("luces").objects.link(o)
    o.data.materials.append(M["metal_black"])
    for i, p in enumerate(pts[1:-1]):
        b = cyl(f"bulb_{name}_{i}", p.x, p.y, p.z - 0.07, p.z - 0.02, 0.022, M["bulb"], seg=12, collection="luces")
        for poly in b.data.polygons:
            poly.use_smooth = True


garland("g1", (0.1, 1.5, 3.25), (7.8, 2.4, 2.95))
garland("g2", (0.1, 4.5, 3.25), (7.8, 4.6, 2.95))
garland("g3", (0.1, 7.5, 3.25), (7.8, 6.8, 2.95))

# ---------------- vistas de cámara (la web las lee por nombre)
empty("cam_patio", (1.5, 1.05, 1.62), target=(7.6, 6.8, 1.25))
empty("cam_barra", (5.2, 1.0, 1.6), target=(10.2, 4.2, 1.2))
empty("cam_sala", (9.6, 9.8, 1.6), target=(4.0, 13.0, 0.9))
empty("cam_aerea", (-5.5, -7.5, 17.5), target=(5.5, 7.5, 0.0))

# convertir curvas (cables) a malla para exportar
for o in list(col("luces").objects):
    if o.type == "CURVE":
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        n = bpy.data.objects.new(o.name, me)
        col("luces").objects.link(n)
        bpy.data.objects.remove(o)

# ---------------- render de control (Cycles) y exportación
world = bpy.data.worlds.new("cielo")
scene.world = world
world.use_nodes = True
env = world.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(f"{A}/hdri/kloofendal_48d_partly_cloudy_puresky_2k.hdr")
world.node_tree.links.new(env.outputs["Color"], world.node_tree.nodes["Background"].inputs["Color"])

bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/casa-materia-pilot.blend")
bpy.ops.export_scene.gltf(
    filepath=f"{OUT}/casa-materia-pilot.glb",
    export_format="GLB",
    export_image_format="JPEG",
    export_jpeg_quality=86,
    export_apply=True,
    export_extras=True,
    export_cameras=False,
    export_lights=False,
    use_visible=False,
)
print("OK", len(bpy.data.objects), "objetos")
