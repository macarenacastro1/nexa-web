"""
Casa Materia · biblioteca común (materiales, geometría, importación, muebles)
Se importa desde build_house.py. Basada en la prueba (build_pilot.py).
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



def cobogo_wall(x, y0, y1, z0, z1, unit=0.3, depth=0.12, name="arch_cobogo", mat=None):
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
    return obj_from_bm(name, bm, mat or M["cobogo"], tile=0.6)



# ---------------- canteros
def planter(name, x0, y0, x1, y1, h=0.45, mat=None):
    mat = mat or M["concrete"]
    t = 0.08
    box(f"{name}_a", x0, y0, 0, x1, y0 + t, h, mat, tile=1.2)
    box(f"{name}_b", x0, y1 - t, 0, x1, y1, h, mat, tile=1.2)
    box(f"{name}_c", x0, y0, 0, x0 + t, y1, h, mat, tile=1.2)
    box(f"{name}_d", x1 - t, y0, 0, x1, y1, h, mat, tile=1.2)
    box(f"{name}_tierra", x0 + t, y0 + t, 0, x1 - t, y1 - t, h - 0.06, M["soil"], bevel=0, tile=1)








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


