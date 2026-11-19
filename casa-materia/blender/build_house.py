"""
Casa Materia · casa completa según el plano aprobado
---------------------------------------------------
Escala del plano: 0.022 m por píxel (casa de ~27 × 21 m, patio central).
Uso:  CM_ASSETS=<assets> CM_OUT=<salida> python3 build_house.py
Salidas: casa-materia.blend (editable) y casa-materia.glb (para la web).

Ambientes (interiores, metros; X → este, Y → norte, Z arriba; piso interior = 0):
  Horno         X 0.45–7.45   Y 14.0–20.4      Experiencias  X 7.9–18.25  Y 13.65–20.9
  Servicio      X 18.5–20.2   Y 17.2–20.7      Atelier       X 18.5–26.5  Y 13.65–20.7
  Workshops     X 0.45–6.9    Y 0.4–13.55      Boutique      X 16.0–26.5  Y 0.4–5.6
  Baños         X 23.45–26.5  Y 6.85–12.65     Patio         el resto (abierto al cielo)
  Entrada       portón doble X 9.6–14.0 sobre Y = 0, escalones hacia Y < 0
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402,I001
import bmesh  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import cm_lib as L  # noqa: E402
import cm_plants as P  # noqa: E402
from cm_lib import A, M, OUT, box, col, cyl, empty, parts_obj, pbr  # noqa: E402

random.seed(21)
PH = f"{A}/tex"
phf = {"color": "Diffuse.jpg", "normal": "nor_gl.jpg", "rough": "Rough.jpg"}
WALL_H, T = 3.4, 0.25


# ================================================================ materiales nuevos
def tile_texture(name, tile=0.8, n=3, px=2048, grout=(150, 136, 118)):
    """Travertino en losas de 'tile' m con junta: cada losa es un recorte distinto de la textura base."""
    from PIL import Image, ImageDraw
    base = Image.open(f"{PH}/travertine/Travertine009_1K-JPG_Color.jpg").convert("RGB")
    nrm = Image.open(f"{PH}/travertine/Travertine009_1K-JPG_NormalGL.jpg").convert("RGB")
    out_c = Image.new("RGB", (px, px))
    out_n = Image.new("RGB", (px, px))
    s = px // n
    r = random.Random(3)
    for i in range(n):
        for j in range(n):
            cx, cy = r.randint(0, 1024 - 512), r.randint(0, 1024 - 512)
            rot = r.choice([0, 180])
            crop = base.crop((cx, cy, cx + 512, cy + 512)).rotate(rot).resize((s, s))
            k = 0.94 + r.random() * 0.1
            crop = crop.point(lambda v, k=k: min(255, int(v * k)))
            out_c.paste(crop, (i * s, j * s))
            out_n.paste(nrm.crop((cx, cy, cx + 512, cy + 512)).rotate(rot).resize((s, s)), (i * s, j * s))
    d = ImageDraw.Draw(out_c)
    g = max(2, px // 700)
    for i in range(n + 1):
        d.rectangle((i * s - g, 0, i * s + g, px), fill=grout)
        d.rectangle((0, i * s - g, px, i * s + g), fill=grout)
    folder = f"{OUT}/tex_ajustadas/{name}"
    os.makedirs(folder, exist_ok=True)
    out_c.save(f"{folder}/Diffuse.jpg", quality=90)
    out_n.save(f"{folder}/nor_gl.jpg", quality=90)
    src_r = f"{PH}/travertine/Travertine009_1K-JPG_Roughness.jpg"
    if not os.path.exists(f"{folder}/Rough.jpg"):
        os.symlink(src_r, f"{folder}/Rough.jpg")
    return folder, tile * n


acg = lambda n: {"color": f"{n}_1K-JPG_Color.jpg", "normal": f"{n}_1K-JPG_NormalGL.jpg", "rough": f"{n}_1K-JPG_Roughness.jpg"}  # noqa: E731
tf, TILE_REP = tile_texture("travertino_losas")
M.update({
    "floor_tile": pbr("piso_travertino", tf, phf),
    "paving": pbr("piedra_patio", L.adjusted(f"{PH}/stone_pathway", (178, 162, 140), "piedra_patio"), phf),
    "mulch": pbr("tierra_cantero", f"{PH}/yellow_flower_mulch", phf),
    "wall": pbr("revoque_calido", L.adjusted(f"{PH}/beige_wall_001", (232, 220, 202), "revoque_calido"), phf),
    "linen": pbr("lino_crudo", L.adjusted(f"{PH}/rough_linen", (214, 200, 178), "lino"), phf),
    "rattan": pbr("ratan", f"{PH}/Wicker009A", acg("Wicker009A"), rough=0.7),
    "terracotta": pbr("cobogo_terracota", L.adjusted(f"{PH}/beige_wall_001", (176, 98, 62), "terracota"), phf),
    "steel_brushed": pbr("acero_cepillado", color=(0.72, 0.72, 0.7), rough=0.35, metal=1.0),
    "ceramic_white": pbr("loza_blanca", color=(0.92, 0.91, 0.88), rough=0.12),
    "opal": pbr("vidrio_opal", color=(1, 0.95, 0.86), rough=0.4, emit=(1.0, 0.78, 0.5), emit_strength=3.0),
    "mirror": pbr("espejo", color=(0.95, 0.95, 0.95), rough=0.02, metal=1.0),
    "fridge": pbr("heladera", color=(0.86, 0.84, 0.78), rough=0.25),
    "clay_raw": pbr("arcilla", color=(0.55, 0.38, 0.27), rough=0.95),
    "greenware": pbr("pieza_cruda", color=(0.72, 0.66, 0.58), rough=0.95),
})
GLAZES = [
    pbr("esmalte_crema", color=(0.86, 0.8, 0.68), rough=0.35),
    pbr("esmalte_blanco", color=(0.9, 0.89, 0.85), rough=0.15),
    M["glaze_sage"], M["glaze_rust"],
    pbr("esmalte_carbon", color=(0.08, 0.08, 0.08), rough=0.3),
    pbr("terracota_cruda", color=(0.62, 0.34, 0.2), rough=0.9),
    M["bisque"],
]


# ================================================================ helpers de construcción
def wall(name, x0, y0, x1, y1, openings=(), h=WALL_H, t=T, mat=None):
    """Muro con eje (x0,y0)→(x1,y1) horizontal o vertical. openings: (desde, hasta, z0, z1, tipo) medidos a lo largo del muro.
    tipo: 'door' (vano con marco), 'glass' (paño vidriado con parantes), 'gate' (vano libre)."""
    mat = mat or M["wall"]
    horiz = abs(y1 - y0) < 1e-6
    a0, a1 = (x0, x1) if horiz else (y0, y1)
    c = y0 if horiz else x0

    def piece(tag, s0, s1, z0, z1, m=mat, th=t, bev=0.006):
        if s1 - s0 < 0.01 or z1 - z0 < 0.01:
            return
        if horiz:
            box(f"{name}_{tag}", s0, c - th / 2, z0, s1, c + th / 2, z1, m, bevel=bev, tile=2.5)
        else:
            box(f"{name}_{tag}", c - th / 2, s0, z0, c + th / 2, s1, z1, m, bevel=bev, tile=2.5)

    ops = sorted(openings)
    cur = a0
    for k, (s0, s1, z0, z1, kind) in enumerate(ops):
        piece(f"m{k}", cur, s0, 0, h)
        if z0 > 0:
            piece(f"antepecho{k}", s0, s1, 0, z0)
        piece(f"dintel{k}", s0, s1, z1, h)
        if kind == "glass":
            piece(f"vidrio{k}", s0, s1, z0, z1, M["glass"], th=0.02, bev=0)
            n = max(1, round((s1 - s0) / 1.2))
            for i in range(n + 1):
                s = s0 + i * (s1 - s0) / n
                piece(f"parante{k}_{i}", s - 0.025, s + 0.025, z0, z1, M["metal_black"], th=0.07, bev=0.003)
            piece(f"marco_inf{k}", s0, s1, z0, z0 + 0.04, M["metal_black"], th=0.07, bev=0.003)
            piece(f"marco_sup{k}", s0, s1, z1 - 0.04, z1, M["metal_black"], th=0.07, bev=0.003)
        elif kind == "door":
            for s in (s0, s1 - 0.05):
                piece(f"marco{k}_{s:.2f}", s, s + 0.05, 0, z1, M["oak"], th=t + 0.02, bev=0.004)
            piece(f"marco_sup{k}", s0, s1, z1 - 0.05, z1, M["oak"], th=t + 0.02, bev=0.004)
        cur = s1
    piece("mfin", cur, a1, 0, h)


def slab(name, x0, y0, x1, y1, z0, z1, mat, tile=2.0, bevel=0.0):
    return box(name, x0, y0, z0, x1, y1, z1, mat, bevel=bevel, tile=tile)


def poly_prism(name, pts, z0, z1, mat, tile=1.0, collection="arquitectura"):
    """Prisma a partir de un polígono 2D (lista de (x, y))."""
    bm = bmesh.new()
    bot = [bm.verts.new((x, y, z0)) for x, y in pts]
    top = [bm.verts.new((x, y, z1)) for x, y in pts]
    bm.faces.new(bot[::-1])
    bm.faces.new(top)
    n = len(pts)
    for i in range(n):
        bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]))
    return L.obj_from_bm(name, bm, mat, collection, tile)


def blob(cx, cy, rx, ry, n=28, wobble=0.12, seed=0):
    """Contorno orgánico (cantero): elipse deformada con ruido suave."""
    r = random.Random(seed)
    ph = [r.uniform(0, math.tau) for _ in range(3)]
    return [(cx + rx * math.cos(a) * (1 + wobble * math.sin(2 * a + ph[0]) + wobble * 0.5 * math.sin(3 * a + ph[1])),
             cy + ry * math.sin(a) * (1 + wobble * math.cos(2 * a + ph[2]))) for a in (i / n * math.tau for i in range(n))]


# ---------------------------------------------------------------- cerámica torneada (perfiles de revolución)
PROFILES = {
    "jarron": [(0, 0), (0.07, 0), (0.1, 0.03), (0.13, 0.12), (0.12, 0.22), (0.07, 0.3), (0.05, 0.36), (0.065, 0.4)],
    "botella": [(0, 0), (0.06, 0), (0.08, 0.04), (0.085, 0.16), (0.06, 0.22), (0.025, 0.28), (0.022, 0.36), (0.03, 0.38)],
    "cuenco": [(0, 0), (0.05, 0), (0.06, 0.01), (0.12, 0.06), (0.15, 0.11), (0.155, 0.12)],
    "taza": [(0, 0), (0.035, 0), (0.042, 0.01), (0.045, 0.08), (0.047, 0.095)],
    "plato": [(0, 0), (0.08, 0), (0.12, 0.015), (0.14, 0.025), (0.142, 0.028)],
    "florero": [(0, 0), (0.05, 0), (0.06, 0.02), (0.065, 0.2), (0.055, 0.28), (0.06, 0.3)],
    "tinaja": [(0, 0), (0.09, 0), (0.15, 0.06), (0.17, 0.18), (0.14, 0.3), (0.1, 0.34), (0.105, 0.37)],
}
_POT_CACHE = {}


def pot_mesh(kind, mat):
    key = (kind, mat.name)
    if key in _POT_CACHE:
        return _POT_CACHE[key]
    prof = PROFILES[kind]
    bm = bmesh.new()
    th = 0.008
    outer = [Vector((r, 0, z)) for r, z in prof]
    inner = [Vector((max(0.0, r - th), 0, z + (th if i == 0 else 0))) for i, (r, z) in enumerate(prof)][::-1]
    pts = outer + inner[:-1] + [Vector((0, 0, prof[0][1] + th))]
    vs = [bm.verts.new(p) for p in pts]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=28, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new(f"pieza_{kind}_{mat.name}")
    bm.normal_update()
    L.box_uv(bm, 0.3)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    _POT_CACHE[key] = me
    return me


def pot(name, x, y, z, kind="jarron", scale=1.0, mat=None, collection="ceramica"):
    mat = mat or random.choice(GLAZES)
    o = bpy.data.objects.new(name, pot_mesh(kind, mat))
    o.location = (x, y, z)
    o.scale = (scale, scale, scale * random.uniform(0.9, 1.15))
    o.rotation_euler = (0, 0, random.uniform(0, math.tau))
    col(collection).objects.link(o)
    return o


def fill_shelf(prefix, x0, x1, y, z, depth_axis="y", spacing=0.26, kinds=None, mats=None):
    """Llena un estante con piezas variadas (como en una boutique: ritmo y vacíos)."""
    kinds = kinds or ["jarron", "botella", "cuenco", "florero", "tinaja", "taza"]
    x = x0 + 0.12
    k = 0
    while x < x1 - 0.1:
        if random.random() < 0.82:
            kind = random.choice(kinds)
            sc = random.uniform(0.6, 1.0) if kind not in ("taza", "plato") else 1.2
            m = random.choice(mats or GLAZES)
            if depth_axis == "y":
                pot(f"{prefix}_{k}", x, y, z, kind, sc, m)
            else:
                pot(f"{prefix}_{k}", y, x, z, kind, sc, m)
            k += 1
        x += spacing * random.uniform(0.8, 1.25)


def shelf_unit(name, x0, y0, x1, y1, levels=(0.4, 0.85, 1.3, 1.75), h=2.1, mat=None, fill=True, axis="x"):
    """Estantería de roble contra un muro. axis 'x': corre a lo largo de X."""
    mat = mat or M["oak"]
    for i, z in enumerate(levels):
        box(f"{name}_tabla{i}", x0, y0, z, x1, y1, z + 0.035, mat, bevel=0.004, tile=1.0, collection="objetos")
        if fill:
            if axis == "x":
                fill_shelf(f"{name}_p{i}", x0, x1, (y0 + y1) / 2, z + 0.035)
            else:
                fill_shelf(f"{name}_p{i}", y0, y1, (x0 + x1) / 2, z + 0.035, depth_axis="x")
    if axis == "x":
        for x in (x0, x1 - 0.035):
            box(f"{name}_lat{x:.1f}", x, y0, 0, x + 0.035, y1, h, mat, bevel=0.004, tile=1.0, collection="objetos")
    else:
        for y in (y0, y1 - 0.035):
            box(f"{name}_lat{y:.1f}", x0, y, 0, x1, y + 0.035, h, mat, bevel=0.004, tile=1.0, collection="objetos")


# ---------------------------------------------------------------- muebles con ratán
def rattan_chair(name, loc, rot):
    """Silla de ratán: asiento redondo tejido, respaldo curvo y patas de roble (mira hacia +Y)."""
    bm = bmesh.new()
    parts = []
    # patas
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        parts.append(("cyl", (sx * 0.17, sy * 0.17, 0, 0.44, 0.014, 0.017), 0, 0))
    parts.append(("cyl", (0, 0, 0.42, 0.47, 0.24, 0.24), 1, 0.01))
    o = parts_obj(name, parts, [M["oak"], M["rattan"]], loc, rot)
    # respaldo: banda curva de ratán
    bm = bmesh.new()
    seg, r, z0, z1, th = 18, 0.25, 0.5, 0.8, 0.025
    a0, a1 = math.radians(200), math.radians(340)
    ring = []
    for i in range(seg + 1):
        a = a0 + (a1 - a0) * i / seg
        for rr in (r, r - th):
            ring.append([bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, z)) for z in (z0, z1)])
    for i in range(seg):
        o0, i0, o1, i1 = ring[2 * i], ring[2 * i + 1], ring[2 * i + 2], ring[2 * i + 3]
        bm.faces.new((o0[0], o1[0], o1[1], o0[1]))
        bm.faces.new((i0[1], i1[1], i1[0], i0[0]))
        bm.faces.new((o0[1], o1[1], i1[1], i0[1]))
        bm.faces.new((i0[0], i1[0], o1[0], o0[0]))
    for f in bm.faces:
        f.smooth = True
    L.box_uv(bm, 0.25)
    me = bpy.data.meshes.new(name + "_respaldo")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M["rattan"])
    b = bpy.data.objects.new(name + "_respaldo", me)
    b.location = loc
    b.rotation_euler = (0, 0, rot)
    col("objetos").objects.link(b)
    for sx in (-1, 1):  # parantes del respaldo
        p = parts_obj(f"{name}_parante{sx}", [("cyl", (sx * 0.17, -0.2, 0.45, 0.8, 0.012, 0.012), 0, 0)], [M["oak"]], loc, rot)
    return o


def rattan_pendant(name, x, y, z_bottom, r=0.32):
    """Lámpara colgante: cúpula de ratán abierta abajo, con lámpara cálida adentro."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=r)
    for v in list(bm.verts):
        if v.co.z < -0.02:
            bm.verts.remove(v)
    for v in bm.verts:
        v.co.z *= 0.8
        v.co += Vector((x, y, z_bottom))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.012)
    for f in bm.faces:
        f.smooth = True
    o = L.obj_from_bm(f"lamp_ratan_{name}", bm, M["rattan"], "luces", 0.2)
    cyl(f"lamp_ratan_{name}_foco", x, y, z_bottom + 0.06, z_bottom + 0.14, 0.05, M["bulb"], seg=16, collection="luces")
    cyl(f"lamp_ratan_{name}_cable", x, y, z_bottom + r * 0.8, WALL_H - 0.02, 0.004, M["metal_black"], seg=6, collection="luces")
    return o


def sconce(name, x, y, z, face):
    """Aplique de pared: base de latón y difusor opal. face: dirección hacia donde mira (+x, -x, +y, -y)."""
    dx, dy = {"+x": (1, 0), "-x": (-1, 0), "+y": (0, 1), "-y": (0, -1)}[face]
    box(f"lamp_aplique_{name}_base", x - 0.06 * abs(dy) - 0.01 * abs(dx), y - 0.06 * abs(dx) - 0.01 * abs(dy), z - 0.12,
        x + 0.06 * abs(dy) + 0.01 * abs(dx), y + 0.06 * abs(dx) + 0.01 * abs(dy), z + 0.12, M["brass"], bevel=0.004, collection="luces")
    cx, cy = x + dx * 0.07, y + dy * 0.07
    cyl(f"lamp_aplique_{name}", cx, cy, z - 0.1, z + 0.1, 0.055, M["opal"], seg=20, collection="luces")


# ================================================================ ARQUITECTURA
# ---------------- terreno, escalones, piso del patio
box("arch_terreno", -30, -30, -0.6, 60, 55, -0.45, M.get("grava") or pbr("grava", L.adjusted(f"{PH}/concrete_floor_01", (150, 142, 128), "grava"), phf), bevel=0, tile=3)
slab("arch_base_casa", 0.07, 0.0, 26.88, 21.18, -0.45, -0.12, M["concrete"])
# patio: piedra irregular (toda la superficie abierta; las salas tienen su propio piso encima)
slab("arch_piso_patio", 7.15, 0.0, 15.75, 13.4, -0.12, 0.0, M["paving"], tile=2.2)
slab("arch_piso_patio_este", 15.75, 5.85, 23.2, 13.4, -0.12, 0.0, M["paving"], tile=2.2)
slab("arch_piso_jardin_este", 23.33, 5.6, 26.75, 6.72, -0.12, 0.0, M["paving"], tile=2.2)
for i in range(3):  # escalones de travertino
    y0 = -1.2 + i * 0.4
    box(f"arch_escalon_{i}", 8.2, y0, -0.45, 15.4, y0 + 0.42, -0.3 + i * 0.15, M["travertine"], bevel=0.01, tile=1.6)
box("arch_umbral_entrada", 8.2, -0.05, -0.12, 15.4, 0.3, 0.0, M["travertine"], bevel=0.006, tile=1.6)

# ---------------- pisos de las salas
slab("arch_piso_horno", 0.33, 13.88, 7.56, 20.43, -0.12, 0.0, M["concrete"])
slab("arch_piso_experiencias", 7.8, 13.6, 18.3, 20.93, -0.12, 0.0, M["floor_tile"], tile=TILE_REP)
slab("arch_piso_atelier", 18.38, 13.6, 26.63, 20.73, -0.12, 0.0, M["floor_tile"], tile=TILE_REP)
slab("arch_piso_workshops", 0.33, 0.25, 6.9, 13.63, -0.12, 0.0, M["floor_tile"], tile=TILE_REP)
slab("arch_piso_boutique", 15.98, 0.25, 26.63, 5.6, -0.12, 0.0, M["floor_tile"], tile=TILE_REP)
slab("arch_piso_banos", 23.45, 6.85, 26.63, 12.65, -0.12, 0.002, M["terrazzo"], tile=1.2)

# ---------------- muros exteriores
wall("arch_muro_norte_horno", 0.2, 20.55, 7.68, 20.55)
wall("arch_muro_norte_exp", 7.55, 21.05, 18.5, 21.05)
wall("arch_muro_norte_atelier", 18.25, 20.85, 26.88, 20.85)
wall("arch_muro_oeste", 0.2, 0.0, 0.2, 20.68, openings=[(15.1, 16.2, 0, 2.4, "door"), (6.6, 7.4, 1.2, 2.6, "glass")])
wall("arch_muro_este", 26.75, 0.0, 26.75, 20.98, openings=[(18.2, 20.3, 0.9, 2.6, "glass")])
wall("arch_fachada_oeste", 0.07, 0.12, 9.6, 0.12)
wall("arch_fachada_este", 14.0, 0.12, 26.88, 0.12, openings=[(17.0, 21.5, 0.5, 2.7, "glass")])

# ---------------- muros interiores
wall("arch_muro_horno_workshops", 0.33, 13.75, 7.15, 13.75, openings=[(5.6, 6.6, 0, 2.4, "door")])
wall("arch_muro_workshops_patio", 7.025, 0.25, 7.025, 13.63, openings=[(1.6, 2.7, 0, 2.4, "door"), (3.6, 11.2, 0.75, 2.7, "glass"), (12.0, 13.1, 0, 2.4, "door")])
wall("arch_muro_horno_exp", 7.68, 13.88, 7.68, 20.68, openings=[(14.3, 15.3, 0, 2.4, "door")])
wall("arch_fachada_experiencias", 7.68, 13.525, 18.38, 13.525, openings=[(8.4, 9.6, 0, 2.6, "door"), (9.6, 16.0, 0.0, 2.9, "glass"), (16.0, 17.2, 0, 2.6, "door"), (17.2, 18.1, 0.0, 2.9, "glass")])
wall("arch_muro_exp_atelier", 18.38, 13.525, 18.38, 21.05, openings=[(18.4, 19.4, 0, 2.4, "door"), (14.0, 16.8, 0.0, 2.9, "glass")])
wall("arch_muro_servicio_s", 18.38, 17.075, 20.33, 17.075)
wall("arch_muro_servicio_e", 20.33, 17.075, 20.33, 20.85)
wall("arch_fachada_atelier", 18.38, 13.525, 26.88, 13.525, openings=[(19.0, 20.2, 0, 2.6, "door"), (20.4, 23.2, 0.0, 2.9, "glass")])
wall("arch_muro_banos_n", 23.325, 12.775, 26.88, 12.775)
wall("arch_muro_banos_o", 23.325, 6.725, 23.325, 12.9, openings=[(7.6, 8.6, 0, 2.3, "door"), (10.6, 11.6, 0, 2.3, "door")])
wall("arch_muro_banos_medio", 23.45, 9.725, 26.63, 9.725)
wall("arch_muro_banos_s", 23.325, 6.725, 26.88, 6.725)
wall("arch_muro_boutique_n", 15.875, 5.725, 26.88, 5.725, openings=[(16.6, 17.8, 0, 2.6, "door"), (18.0, 21.0, 0.6, 2.7, "glass")])
wall("arch_muro_boutique_o", 15.875, 0.0, 15.875, 5.85, openings=[(0.6, 1.8, 0.6, 2.7, "glass"), (2.3, 3.5, 0, 2.6, "door"), (3.8, 5.2, 0.6, 2.7, "glass")])

# coronamientos (remate de hormigón fino sobre todos los muros perimetrales del patio)
for nm, args in {"o": (6.9, 0.0, 7.15, 13.65), "n_exp": (7.55, 13.4, 26.9, 13.65), "s_bout": (15.75, 5.6, 26.9, 5.85), "o_bout": (15.75, 0.0, 16.0, 5.85), "o_ban": (23.2, 5.85, 23.45, 13.4)}.items():
    x0, y0, x1, y1 = args
    box(f"arch_coronamiento_{nm}", x0 - 0.03, y0, WALL_H, x1 + 0.03, y1, WALL_H + 0.06, M["concrete"], tile=1.5)

# ---------------- portón de entrada (dos hojas de roble con listones, abiertas hacia adentro)
def gate_leaf(name, hinge, width, open_angle, side):
    """Hoja con origen en la bisagra: la web la puede animar girando el objeto en Z."""
    parts = [("box", (0, -0.03, 0.02, side * width, 0.03, 2.95), 0, 0.006)]
    n = int(width / 0.09)
    for i in range(n):
        x = side * (0.04 + i * (width - 0.08) / n)
        parts.append(("box", (min(x, x + side * 0.06), -0.055, 0.08, max(x, x + side * 0.06), -0.03, 2.88), 0, 0.006))
    parts.append(("box", (side * (width - 0.16), 0.03, 1.0, side * (width - 0.13), 0.07, 1.4), 1, 0.004))
    o = parts_obj(name, parts, [M["oak"], M["brass"]], hinge, 0, collection="puertas")
    o.rotation_euler = (0, 0, side * open_angle)
    return o


gate_leaf("door_main_l", (9.6, 0.12, 0), 2.2, math.radians(78), 1)
gate_leaf("door_main_r", (14.0, 0.12, 0), 2.2, math.radians(78), -1)
box("arch_dintel_porton", 9.45, -0.02, 3.0, 14.15, 0.26, WALL_H, M["wall"], tile=2.5)

# ---------------- cobogó terracota en la fachada de los workshops
cb = L.cobogo_wall(0.0, 1.4, 7.4, 0.25, 2.65, unit=0.3, depth=0.1, name="arch_cobogo_fachada", mat=M["terracotta"])
cb.data.transform(Matrix.Translation((0, -0.12, 0)) @ Matrix.Rotation(-math.pi / 2, 4, "Z"))
# el cobogó corre en X frente a la fachada (y ≈ -0.07)
bb = [cb.matrix_world @ Vector(c) for c in cb.bound_box]
cb.location.y -= max(v.y for v in bb) - (-0.0)
cb.location.x += 1.4 - min(v.x for v in bb)

# ---------------- techos y cielorrasos (se ocultan en la vista de maqueta)
ROOFS = {
    "horno": (0.07, 13.62, 7.81, 20.68),
    "experiencias": (7.55, 13.4, 18.51, 21.18),
    "atelier": (18.25, 13.4, 26.88, 20.98),
    "workshops": (0.07, -0.01, 7.15, 13.88),
    "boutique": (15.75, -0.01, 26.88, 5.85),
    "banos": (23.2, 6.6, 26.88, 12.9),
}
for nm, (x0, y0, x1, y1) in ROOFS.items():
    slab(f"roof_{nm}", x0, y0, x1, y1, WALL_H, WALL_H + 0.28, M["concrete"], tile=2.5)
    slab(f"roof_{nm}_cielorraso", x0 + 0.13, y0 + 0.13, x1 - 0.13, y1 - 0.13, WALL_H - 0.02, WALL_H, M["plaster_white"], tile=2.5)

# ================================================================ PATIO
# ---------------- canteros orgánicos (tierra apenas elevada)
BEDS = {
    "oeste": blob(8.3, 7.6, 1.25, 5.9, wobble=0.08, seed=1),
    "oeste_entrada": blob(9.4, 3.6, 1.2, 1.5, seed=2),
    "noreste": blob(18.6, 11.4, 2.2, 1.9, seed=3),
    "lavamanos": blob(20.0, 8.0, 1.2, 1.0, seed=4),
    "sureste": blob(17.7, 6.75, 3.1, 0.75, wobble=0.15, seed=5),
    "camino_banos": blob(22.6, 7.2, 0.5, 0.45, seed=6),
    "bar_norte": blob(13.2, 12.9, 3.0, 0.45, wobble=0.05, seed=7),
}
for nm, pts in BEDS.items():
    poly_prism(f"arch_cantero_{nm}", pts, 0.0, 0.06, M["mulch"], tile=1.5)


def plant_bed(prefix, cx, cy, rx, ry, kinds, n, seed):
    """Distribuye plantas dentro de un cantero (elipse), evitando que se pisen demasiado."""
    r = random.Random(seed)
    placed = []
    for i in range(n * 4):
        if len(placed) >= n:
            break
        a, d = r.uniform(0, math.tau), math.sqrt(r.random()) * 0.85
        x, y = cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d
        if any((x - px) ** 2 + (y - py) ** 2 < 0.45 for px, py in placed):
            continue
        placed.append((x, y))
        k = kinds[len(placed) % len(kinds)]
        nm = f"plant_{prefix}_{len(placed)}"
        if k == "monstera":
            P.monstera(nm, (x, y, 0.05), scale=r.uniform(0.9, 1.25), seed=seed * 100 + i)
        elif k == "areca":
            P.areca(nm, (x, y, 0.05), scale=r.uniform(1.1, 1.5), seed=seed * 100 + i)
        elif k == "strel":
            P.strelitzia(nm, (x, y, 0.05), height=r.uniform(1.6, 2.8), seed=seed * 100 + i, flowers=r.choice([0, 2, 3]))
        elif k == "strel_alta":
            P.strelitzia(nm, (x, y, 0.05), height=r.uniform(3.0, 3.8), leaves=14, seed=seed * 100 + i)
    return placed


plant_bed("oeste", 8.3, 7.6, 1.05, 5.5, ["areca", "monstera", "strel", "monstera", "strel_alta", "monstera"], 14, 1)
plant_bed("entrada", 9.4, 3.6, 1.0, 1.25, ["monstera", "strel", "areca"], 4, 2)
plant_bed("noreste", 18.6, 11.4, 1.9, 1.6, ["areca", "monstera", "strel", "strel_alta", "monstera"], 8, 3)
plant_bed("lavamanos", 19.8, 7.7, 0.9, 0.7, ["monstera", "strel"], 3, 4)
plant_bed("sureste", 17.7, 6.75, 2.8, 0.55, ["strel", "monstera", "areca", "strel", "monstera"], 7, 5)
plant_bed("bar_norte", 13.2, 12.9, 2.7, 0.3, ["monstera", "areca", "monstera", "strel"], 5, 7)

# ---------------- barra en isla: mostrador curvo con listones + mueble trasero con estantes y plantas
def u_path(x0, x1, y_front, y_back, r, n=14):
    """Recorrido en U (frente redondeado) de izquierda-atrás a derecha-atrás."""
    pts = [(x0, y_back)]
    for i in range(n + 1):  # curva izquierda
        a = math.pi - (math.pi / 2) * i / n
        pts.append((x0 + r + r * math.cos(a), y_front + r - r * math.sin(a) * 1.0))
    for i in range(n + 1):  # curva derecha
        a = math.pi / 2 - (math.pi / 2) * i / n
        pts.append((x1 - r + r * math.cos(a), y_front + r - r * math.sin(a)))
    pts.append((x1, y_back))
    return pts


def offset_path(pts, d):
    out = []
    for i, p in enumerate(pts):
        a = Vector(pts[max(i - 1, 0)])
        b = Vector(pts[min(i + 1, len(pts) - 1)])
        t = (b - a).normalized()
        nrm = Vector((t.y, -t.x))
        out.append(tuple(Vector(p) + nrm * d))
    return out


BX0, BX1, BYF, BYB = 10.2, 16.2, 8.45, 10.95
path = u_path(BX0, BX1, BYF, BYB, 1.0)
outer, inner = offset_path(path, 0.0), offset_path(path, -0.62)
band = outer + inner[::-1]
poly_prism("arch_barra_cuerpo", band, 0.0, 1.02, M["oak"], tile=1.0)
top_o, top_i = offset_path(path, 0.06), offset_path(path, -0.66)
poly_prism("arch_barra_tapa", top_o + top_i[::-1], 1.02, 1.08, M["travertine"], tile=1.4)
# listones verticales siguiendo la curva
acc, k = 0.0, 0
for i in range(len(outer) - 1):
    a, b = Vector(outer[i]), Vector(outer[i + 1])
    seg = (b - a).length
    tdir = (b - a).normalized()
    nrm = Vector((tdir.y, -tdir.x))
    s = 0.0
    while s < seg:
        p = a + tdir * s + nrm * 0.022
        q = [p - tdir * 0.022, p + tdir * 0.022, p + tdir * 0.022 + nrm * 0.03, p - tdir * 0.022 + nrm * 0.03]
        poly_prism(f"arch_barra_liston_{k}", [tuple(v) for v in q], 0.07, 1.0, M["oak"], tile=0.8, collection="objetos")
        k += 1
        s += 0.07
box("arch_barra_zocalo_a", BX0 + 0.05, BYF + 0.05, 0, BX1 - 0.05, BYF + 0.12, 0.07, M["metal_black"], bevel=0.002)
# mueble trasero: estantes con botellas y cerámica, maceteros arriba con potus que cae
box("arch_barra_mueble", BX0 + 0.35, BYB, 0.0, BX1 - 0.35, BYB + 1.0, 2.25, M["oak"], bevel=0.01, tile=1.0)
box("arch_barra_mesada", BX0 + 0.35, BYB - 0.62, 0.0, BX1 - 0.35, BYB, 0.92, M["oak"], bevel=0.008, tile=1.0)
box("arch_barra_mesada_tapa", BX0 + 0.33, BYB - 0.64, 0.92, BX1 - 0.33, BYB + 0.02, 0.96, M["travertine"], bevel=0.006, tile=1.2)
for j, z in enumerate((1.25, 1.65)):
    box(f"arch_barra_estante_{j}", BX0 + 0.45, BYB - 0.22, z, BX1 - 0.45, BYB, z + 0.035, M["oak"], bevel=0.004, collection="objetos")
bottles = L.place(L.import_parts("wine_bottles_01"), (0, 0, 0))
for j in range(6):
    L.dup(bottles, (BX0 + 1.2 + j * 0.65, BYB - 0.11, 1.285), rot=0)
for o in bottles:
    bpy.data.objects.remove(o, do_unlink=True)
fill_shelf("ceramica_barra", BX0 + 0.5, BX1 - 0.5, BYB - 0.11, 1.685, kinds=["taza", "cuenco", "jarron", "botella"])
box("arch_barra_macetero", BX0 + 0.4, BYB + 0.1, 2.25, BX1 - 0.4, BYB + 0.9, 2.5, M["oak"], bevel=0.01)
P.pothos("plant_potus_barra", [(BX0 + 0.8 + i * 0.9, BYB + 0.12, 2.48) for i in range(6)], length=1.1, seed=9)
for i in range(4):
    P.monstera(f"plant_barra_arriba_{i}", (BX0 + 1.0 + i * 1.35, BYB + 0.5, 2.5), scale=0.55, leaves=8, seed=70 + i)
# cafetera, molinillo y tazas
box("obj_cafetera_cuerpo", 12.6, BYB - 0.5, 0.96, 13.45, BYB - 0.05, 1.38, M["steel"], bevel=0.02)
for i, x in enumerate((12.8, 13.25)):
    cyl(f"obj_cafetera_grupo_{i}", x, BYB - 0.55, 1.14, 1.22, 0.045, M["steel"])
box("obj_cafetera_tope", 12.62, BYB - 0.48, 1.38, 13.43, BYB - 0.07, 1.4, M["metal_black"], bevel=0.004)
cyl("obj_molinillo", 13.9, BYB - 0.3, 0.96, 1.32, 0.09, M["metal_black"])
cyl("obj_molinillo_tolva", 13.9, BYB - 0.3, 1.32, 1.52, 0.07, M["glass"])
cups = L.place(L.import_parts("tea_set_01", ["tea_set_01_cup_small", "tea_set_01_saucer_circular"]), (0, 0, 0))
for j, x in enumerate((11.2, 13.3, 15.1)):
    L.dup(cups, (x, BYF + 0.32, 1.08), rot=j)
for o in cups:
    bpy.data.objects.remove(o, do_unlink=True)
L.place(L.import_parts("croissant"), (14.3, BYF + 0.3, 1.08), rot=0.4)
for i, x in enumerate((12.2, 13.2, 14.2)):
    L.stool_obj(f"obj_banqueta_barra_{i}", (x, BYF - 0.42, 0))
# mesita de patio con dos sillas de ratán
L.patio_table("obj_mesita_patio", (10.0, 6.9, 0))
rattan_chair("obj_silla_patio_a", (9.35, 6.95, 0), -math.pi / 2)
rattan_chair("obj_silla_patio_b", (10.65, 6.95, 0), math.pi / 2)
for i, sp in enumerate([(9.35, 6.95), (10.65, 6.95)]):
    e = empty(f"seat_patio_{i}", (*sp, 0.45), collection="ocupacion")
    e["mesa"] = [10.0, 6.9, 0.77]
for i in range(3):
    e = empty(f"seat_barra_{i}", (12.2 + i, BYF - 0.42, 0.75), collection="ocupacion")
    e["mesa"] = [12.2 + i, BYF + 0.3, 1.08]

# ---------------- biombo curvo de listones + lavamanos exterior con espejos ovalados
screen = [(21.45, 7.3), (21.5, 8.4), (21.6, 9.6), (21.9, 10.8), (22.3, 11.9), (22.8, 12.7)]
for i in range(len(screen) - 1):
    a, b = Vector(screen[i]), Vector(screen[i + 1])
    n = int((b - a).length / 0.075)
    for j in range(n):
        p = a.lerp(b, j / n)
        box(f"arch_biombo_{i}_{j}", p.x - 0.022, p.y - 0.022, 0.0, p.x + 0.022, p.y + 0.022, 2.6, M["oak"], bevel=0.006, tile=0.8, collection="objetos")
box("arch_lavamanos", 20.5, 8.1, 0.0, 21.3, 10.0, 0.82, M["travertine"], bevel=0.015, tile=1.0)
for i, y in enumerate((8.6, 9.5)):
    pot(f"obj_bacha_{i}", 20.9, y, 0.82, "cuenco", 2.3, M["ceramic_white"], collection="objetos")
    cyl(f"obj_grifo_{i}_base", 21.2, y, 0.82, 1.05, 0.015, M["brass"], seg=12)
    box(f"obj_grifo_{i}_pico", 21.0, y - 0.01, 1.03, 21.2, y + 0.01, 1.05, M["brass"], bevel=0.005)
    # espejo ovalado con marco de latón, colgado del biombo
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=40, radius=0.3)
    for v in bm.verts:
        v.co = Vector((21.4, y + v.co.x * 0.75, 1.65 + v.co.y * 1.15))
    L.obj_from_bm(f"obj_espejo_{i}", bm, M["mirror"], "objetos", 1.0)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=40, radius=0.33)
    for v in bm.verts:
        v.co = Vector((21.43, y + v.co.x * 0.75, 1.65 + v.co.y * 1.13))
    L.obj_from_bm(f"obj_espejo_marco_{i}", bm, M["brass"], "objetos", 1.0)
    sconce(f"lavamanos_{i}", 21.38, y + 0.42, 1.9, "-x")

# ---------------- guirnaldas sobre el patio
L.garland("g1", (7.15, 12.6, 3.15), (11.0, 11.4, 2.6), sag=0.25, n=10)
L.garland("g2", (15.4, 11.4, 2.6), (21.0, 13.3, 3.15), sag=0.25, n=12)
L.garland("g3", (7.15, 4.6, 3.15), (15.85, 4.0, 3.15), sag=0.55, n=18)
L.garland("g4", (7.15, 9.0, 3.15), (12.0, 13.4, 3.15), sag=0.45, n=12)

# apliques en los muros del patio
for i, (x, y, f) in enumerate([(7.17, 1.0, "+x"), (7.17, 12.6, "+x"), (9.3, 0.25, "+y"), (14.3, 0.25, "+y"), (15.86, 4.3, "-x"),
                               (8.1, 13.39, "-y"), (17.6, 13.39, "-y"), (20.35, 13.39, "-y"), (23.31, 12.3, "-x"), (16.3, 5.86, "+y"),
                               (9.3, -0.02, "-y"), (14.3, -0.02, "-y")]):
    sconce(f"patio_{i}", x, y, 2.2, f)

# ================================================================ SALA DE EXPERIENCIAS
TX, TY = 13.3, 16.4
box("obj_mesa_larga_tapa", TX - 3.3, TY - 0.6, 0.72, TX + 3.3, TY + 0.6, 0.77, M["oak"], bevel=0.012, tile=1.5)
for i, dx in enumerate((-2.6, 0, 2.6)):
    box(f"obj_mesa_larga_pata_{i}", TX + dx - 0.1, TY - 0.42, 0, TX + dx + 0.1, TY + 0.42, 0.72, M["oak"], bevel=0.01, tile=1)
k = 0
for side, rot in ((-1, 0.0), (1, math.pi)):
    for j in range(6):
        x = TX - 2.75 + j * 1.1
        rattan_chair(f"obj_silla_exp_{k}", (x, TY + side * 0.88, 0), rot)
        e = empty(f"seat_exp_{k}", (x, TY + side * 0.88, 0.45), collection="ocupacion")
        e["mesa"] = [x, TY + side * 0.35, 0.78]
        k += 1
for side, rot in ((-1, -math.pi / 2), (1, math.pi / 2)):
    x = TX + side * 3.75
    rattan_chair(f"obj_silla_exp_{k}", (x, TY, 0), rot)
    e = empty(f"seat_exp_{k}", (x, TY, 0.45), collection="ocupacion")
    e["mesa"] = [TX + side * 3.1, TY, 0.78]
    k += 1
for i, x in enumerate((TX - 2.2, TX, TX + 2.2)):
    rattan_pendant(f"exp_{i}", x, TY, 1.95, r=0.34)
# mesa puesta: platos, tazas, ramo de ave del paraíso al centro
for j in range(6):
    for side in (-1, 1):
        x = TX - 2.75 + j * 1.1
        pot(f"obj_plato_exp_{j}_{side}", x, TY + side * 0.33, 0.77, "plato", 1.0, GLAZES[1], collection="objetos")
        pot(f"obj_taza_exp_{j}_{side}", x + 0.2, TY + side * 0.28, 0.77, "taza", 1.0, random.choice(GLAZES[:4]), collection="objetos")
pot("obj_florero_centro", TX, TY, 0.77, "tinaja", 1.0, GLAZES[0], collection="objetos")
P.strelitzia("plant_ramo_mesa", (TX, TY, 1.05), height=0.9, leaves=5, seed=33, flowers=4)
# mesada del fondo con bacha, estantes con cerámica, plantas colgantes
box("obj_mesada_exp", 9.3, 20.25, 0, 17.9, 20.92, 0.9, M["oak"], bevel=0.01, tile=1.0)
box("obj_mesada_exp_tapa", 9.28, 20.2, 0.9, 17.92, 20.92, 0.95, M["travertine"], bevel=0.006, tile=1.2)
box("obj_bacha_exp", 13.0, 20.35, 0.88, 13.7, 20.8, 0.951, M["steel_brushed"], bevel=0.01)
for j, z in enumerate((1.5, 1.95)):
    box(f"obj_estante_exp_{j}", 9.3, 20.62, z, 17.9, 20.92, z + 0.035, M["oak"], bevel=0.004, collection="objetos")
    fill_shelf(f"ceramica_exp_{j}", 9.3, 17.9, 20.77, z + 0.035)
P.pothos("plant_potus_exp", [(9.8 + i * 1.7, 20.8, 2.35) for i in range(5)], length=0.9, seed=12)
P.areca("plant_areca_exp", (8.4, 20.3, 0), scale=1.25, seed=13)
pot("obj_maceta_areca_exp", 8.4, 20.3, 0, "tinaja", 1.6, GLAZES[5], collection="objetos")

# ================================================================ HORNO
def kiln(name, x, y):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.55, radius2=0.55, depth=0.95)
    for v in bm.verts:
        v.co += Vector((x, y, 0.35 + 0.475))
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.015, segments=2, affect="EDGES")
    L.obj_from_bm(f"obj_{name}_cuerpo", bm, M["steel_brushed"], "objetos", 0.5)
    cyl(f"obj_{name}_tapa", x, y, 1.3, 1.36, 0.52, M["steel_brushed"], seg=8)
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        cyl(f"obj_{name}_pata_{i}", x + math.cos(a) * 0.42, y + math.sin(a) * 0.42, 0, 0.35, 0.025, M["metal_black"], seg=8)
    box(f"obj_{name}_control", x + 0.5, y - 0.15, 0.7, x + 0.62, y + 0.15, 1.05, M["metal_black"], bevel=0.008)
    box(f"obj_{name}_mirilla", x - 0.56, y - 0.04, 0.85, x - 0.53, y + 0.04, 0.93, M["opal"], bevel=0.003)


kiln("horno_ceramico", 2.0, 18.8)
for i, x in enumerate((4.6, 5.9)):  # carros de secado con piezas crudas
    for z in (0.15, 0.55, 0.95, 1.35, 1.75):
        box(f"obj_carro_{i}_{z:.2f}", x - 0.55, 18.8, z, x + 0.55, 20.15, z + 0.03, M["oak"], bevel=0.003, tile=1, collection="objetos")
        for c in range(4):
            if random.random() < 0.75:
                pot(f"obj_crudo_{i}_{z:.2f}_{c}", x - 0.4 + c * 0.27, 19.4 + random.uniform(-0.3, 0.3), z + 0.03, random.choice(["cuenco", "taza", "jarron"]), 0.7, M["greenware"])
    for cx in (x - 0.55, x + 0.52):
        for cy in (18.8, 20.12):
            box(f"obj_carro_{i}_poste_{cx:.1f}_{cy:.1f}", cx, cy, 0.05, cx + 0.03, cy + 0.03, 1.85, M["metal_black"], bevel=0)
box("obj_mesa_trabajo_horno_a", 0.5, 14.5, 0.0, 1.6, 15.8, 0.9, M["oak"], bevel=0.01)
box("obj_mesa_trabajo_horno_b", 0.5, 16.4, 0.0, 1.6, 17.7, 0.9, M["oak"], bevel=0.01)
box("obj_amasado", 3.4, 16.2, 0.0, 4.6, 17.0, 0.9, M["travertine"], bevel=0.012)
box("obj_pan_arcilla", 3.7, 16.4, 0.9, 4.1, 16.7, 1.02, M["clay_raw"], bevel=0.03)
shelf_unit("obj_estante_horno", 0.5, 18.2, 0.85, 19.9, levels=(0.4, 0.9, 1.4), axis="y")
P.monstera("plant_horno", (0.9, 20.0, 0), scale=0.9, seed=41)
pot("obj_maceta_horno", 0.9, 20.0, 0, "tinaja", 1.5, GLAZES[5])

# ================================================================ WORKSHOPS
for t, ty in enumerate((3.4, 7.1, 10.8)):
    box(f"obj_mesa_ws_{t}", 2.2, ty - 0.6, 0.72, 5.0, ty + 0.6, 0.77, M["oak"], bevel=0.01, tile=1.5)
    for dx in (0.25, 2.55):
        box(f"obj_mesa_ws_{t}_pata_{dx}", 2.2 + dx - 0.06, ty - 0.5, 0, 2.2 + dx + 0.06, ty + 0.5, 0.72, M["oak"], bevel=0.008)
    for j in range(3):
        x = 2.75 + j * 0.85
        L.stool_obj(f"obj_banco_ws_{t}_{j}", (x, ty - 0.95, 0))
        e = empty(f"seat_ws_{t}_{j}", (x, ty - 0.95, 0.45), collection="ocupacion")
        e["mesa"] = [x, ty - 0.35, 0.78]
    # sobre la mesa: azulejos, frascos con pinceles y piezas
    for j in range(5):
        x = 2.45 + j * 0.52
        box(f"obj_azulejo_{t}_{j}", x - 0.075, ty - 0.3, 0.77, x + 0.075, ty - 0.15, 0.78, GLAZES[1] if j % 2 else M["bisque"], bevel=0.003, collection="objetos")
    pot(f"obj_frasco_ws_{t}", 3.6, ty + 0.25, 0.77, "taza", 1.4, GLAZES[2], collection="objetos")
    for b in range(6):
        cyl(f"obj_pincel_ws_{t}_{b}", 3.6 + math.cos(b) * 0.02, ty + 0.25 + math.sin(b) * 0.02, 0.8, 1.02, 0.004, M["oak"], seg=6)
    pot(f"obj_pieza_ws_{t}", 4.5, ty + 0.1, 0.77, "jarron", 0.8, M["bisque"], collection="objetos")
shelf_unit("obj_estante_ws_a", 0.48, 1.0, 0.85, 6.4, axis="y")
shelf_unit("obj_estante_ws_b", 0.48, 7.6, 0.85, 12.8, axis="y")
P.monstera("plant_ws", (6.4, 13.0, 0), scale=0.95, seed=51)
pot("obj_maceta_ws", 6.4, 13.0, 0, "tinaja", 1.5, GLAZES[0])

# ================================================================ ATELIER (tornos)
def wheel(name, x, y):
    box(f"obj_{name}_base", x - 0.3, y - 0.25, 0, x + 0.3, y + 0.25, 0.42, M["ceramic_white"], bevel=0.03)
    pot(f"obj_{name}_batea", x, y, 0.42, "cuenco", 2.2, M["ceramic_white"], collection="objetos")
    cyl(f"obj_{name}_cabezal", x, y, 0.48, 0.52, 0.15, M["steel_brushed"], seg=28)
    box(f"obj_{name}_pedal", x - 0.12, y - 0.55, 0, x + 0.12, y - 0.35, 0.06, M["metal_black"], bevel=0.01)
    if random.random() < 0.7:
        pot(f"obj_{name}_pieza", x, y, 0.52, random.choice(["cuenco", "jarron"]), 0.9, M["clay_raw"])
    L.stool_obj(f"obj_{name}_banco", (x, y - 0.7, 0))
    box(f"obj_{name}_mesita", x + 0.45, y - 0.2, 0, x + 0.8, y + 0.2, 0.55, M["oak"], bevel=0.006)


for i, (x, y) in enumerate([(21.6, 18.3), (24.4, 18.3), (21.6, 15.3), (24.4, 15.3)]):
    wheel(f"torno_{i}", x, y)
    e = empty(f"seat_atelier_{i}", (x, y - 0.7, 0.75), collection="ocupacion")
    e["mesa"] = [x, y, 0.52]
shelf_unit("obj_estante_atelier_n", 20.6, 20.3, 26.4, 20.7, levels=(0.45, 0.95, 1.45, 1.95), axis="x")
shelf_unit("obj_estante_atelier_e", 26.15, 13.9, 26.6, 17.8, levels=(0.4, 0.9, 1.4, 1.9), axis="y")
# servicio: heladera, bacha y estante
box("obj_heladera", 18.6, 19.9, 0, 19.35, 20.65, 1.85, M["fridge"], bevel=0.02)
box("obj_servicio_mesada", 19.45, 19.95, 0, 20.2, 20.7, 0.9, M["oak"], bevel=0.008)
box("obj_servicio_tapa", 19.43, 19.93, 0.9, 20.2, 20.7, 0.94, M["travertine"], bevel=0.005)

# ================================================================ BOUTIQUE
shelf_unit("obj_estante_bout_n1", 19.2, 5.2, 21.6, 5.6, levels=(0.35, 0.8, 1.25, 1.7), axis="x")
shelf_unit("obj_estante_bout_n2", 22.0, 5.2, 24.4, 5.6, levels=(0.35, 0.8, 1.25, 1.7), axis="x")
shelf_unit("obj_estante_bout_e", 26.1, 0.6, 26.6, 4.9, levels=(0.35, 0.8, 1.25, 1.7), axis="y")
# isla oval de exhibición con listones y tapa de travertino
isla = blob(21.0, 2.0, 1.35, 0.5, n=40, wobble=0.0)
poly_prism("obj_isla_bout", isla, 0.0, 0.85, M["oak"], tile=0.8, collection="objetos")
poly_prism("obj_isla_bout_tapa", blob(21.0, 2.0, 1.4, 0.55, n=40, wobble=0.0), 0.85, 0.9, M["travertine"], tile=1.2, collection="objetos")
for j in range(9):
    pot(f"obj_isla_pieza_{j}", 20.0 + j * 0.25, 2.0 + random.uniform(-0.2, 0.2), 0.9, random.choice(["jarron", "botella", "cuenco", "florero"]), random.uniform(0.7, 1.0))
for i, y in enumerate((1.4, 3.4)):
    cyl(f"obj_pedestal_{i}", 24.7, y, 0, 0.95 - i * 0.15, 0.22, M["oak"], seg=32)
    pot(f"obj_pedestal_pieza_{i}", 24.7, y, 0.95 - i * 0.15, "tinaja", 1.0, GLAZES[i])
P.strelitzia("plant_bout_strel", (17.0, 4.6, 0.3), height=2.0, seed=61)
pot("obj_maceta_bout_a", 17.0, 4.6, 0, "tinaja", 1.7, GLAZES[0])
P.areca("plant_bout_areca", (25.5, 5.1, 0.3), scale=1.1, seed=62)
pot("obj_maceta_bout_b", 25.5, 5.1, 0, "tinaja", 1.6, GLAZES[1])
for i, (x, y, f) in enumerate([(19.0, 5.6, "-y"), (24.8, 5.6, "-y"), (26.5, 2.7, "-x")]):
    sconce(f"bout_{i}", x, y, 2.3, f)

# ================================================================ BAÑOS
def toilet(name, x, y, rot):
    me_o = parts_obj(name, [("box", (-0.19, 0.15, 0.35, 0.19, 0.33, 0.78), 0, 0.03), ("cyl", (0, -0.05, 0, 0.4, 0.17, 0.2), 0, 0.02), ("cyl", (0, -0.05, 0.4, 0.43, 0.2, 0.2), 0, 0.01)],
                     [M["ceramic_white"]], (x, y, 0), rot)
    return me_o


toilet("obj_inodoro_1", 26.25, 11.2, math.pi / 2)
toilet("obj_inodoro_2", 26.25, 8.2, math.pi / 2)
box("obj_barral_1", 25.4, 7.0, 0.75, 26.3, 7.04, 0.79, M["brass"], bevel=0.015)
box("obj_barral_2", 26.55, 7.6, 0.75, 26.59, 8.8, 0.79, M["brass"], bevel=0.015)
for i, y in enumerate((11.2, 8.2)):
    sconce(f"bano_{i}", 23.47, y + 0.8, 2.2, "+x")
    P.areca(f"plant_bano_{i}", (24.1, y + 1.0, 0.3), scale=0.6, seed=80 + i)
    pot(f"obj_maceta_bano_{i}", 24.1, y + 1.0, 0, "tinaja", 0.9, GLAZES[5])

# ================================================================ FRENTE: canteros con vegetación
for nm, (x0, x1) in {"oeste": (0.2, 7.95), "este": (15.65, 26.75)}.items():
    box(f"arch_cantero_frente_{nm}_borde", x0, -2.45, -0.45, x1, -2.3, 0.1, M["concrete"], tile=1.2)
    box(f"arch_cantero_frente_{nm}_tierra", x0, -2.3, -0.45, x1, -0.05, 0.04, M["mulch"], bevel=0, tile=1.5)
    n = int((x1 - x0) / 0.9)
    for i in range(n):
        x = x0 + 0.5 + i * (x1 - x0 - 1.0) / max(1, n - 1)
        kind = ["monstera", "strel", "areca", "monstera", "strel_alta"][i % 5]
        y = -1.2 + random.uniform(-0.5, 0.5)
        nmp = f"plant_frente_{nm}_{i}"
        if kind == "monstera":
            P.monstera(nmp, (x, y, 0.04), scale=1.15, seed=200 + i)
        elif kind == "areca":
            P.areca(nmp, (x, y, 0.04), scale=1.4, seed=200 + i)
        else:
            P.strelitzia(nmp, (x, y, 0.04), height=3.4 if kind == "strel_alta" else 2.2, seed=200 + i, flowers=0 if kind == "strel_alta" else 2)

# ================================================================ vistas de cámara
VIEWS = {
    "entrada": ((11.8, -9.5, 1.7), (11.8, 4.0, 1.9)),
    "patio": ((10.6, 1.2, 1.65), (15.5, 11.0, 1.3)),
    "barra": ((13.2, 5.3, 1.6), (13.2, 10.8, 1.25)),
    "experiencias": ((17.4, 14.2, 1.65), (10.2, 18.3, 0.9)),
    "workshops": ((6.3, 0.9, 1.7), (2.2, 9.5, 0.8)),
    "atelier": ((19.2, 14.1, 1.7), (24.5, 19.5, 0.8)),
    "horno": ((7.1, 14.4, 1.7), (2.0, 19.0, 0.9)),
    "boutique": ((16.6, 0.7, 1.7), (23.0, 4.0, 0.9)),
    "banos": ((18.6, 9.0, 1.6), (21.4, 9.1, 1.4)),
    "aerea": ((-8.0, -14.0, 25.0), (13.4, 10.5, 0.0)),
}
for k, (pos, tgt) in VIEWS.items():
    empty(f"cam_{k}", pos, target=tgt)

# ================================================================ cielo, guardado y exportación
for o in list(col("luces").objects):
    if o.type == "CURVE":
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        n = bpy.data.objects.new(o.name, me)
        col("luces").objects.link(n)
        bpy.data.objects.remove(o)

world = bpy.data.worlds.new("cielo")
bpy.context.scene.world = world
world.use_nodes = True
env = world.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(f"{A}/hdri/kloofendal_48d_partly_cloudy_puresky_2k.hdr")
world.node_tree.links.new(env.outputs["Color"], world.node_tree.nodes["Background"].inputs["Color"])

import json  # noqa: E402
bpy.context.scene["cm_rooms"] = json.dumps({
    "horno": [0.45, 14.0, 7.45, 20.4], "experiencias": [7.9, 13.65, 18.25, 20.9], "servicio": [18.5, 17.2, 20.2, 20.7],
    "atelier": [20.45, 13.65, 26.5, 20.7], "workshops": [0.45, 0.4, 6.9, 13.55], "boutique": [16.0, 0.4, 26.5, 5.6],
    "bano1": [23.45, 9.85, 26.5, 12.65], "bano2": [23.45, 6.85, 26.5, 9.6],
})
bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/casa-materia.blend")
if os.environ.get("CM_EXPORT", "1") == "1":
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/casa-materia.glb", export_format="GLB", export_image_format="WEBP",
                              export_apply=True, export_extras=True, export_cameras=False, export_lights=False, use_visible=False)
tris = sum(len(p.vertices) - 2 for o in bpy.data.objects if o.type == "MESH" for p in o.data.polygons)
print("OK", len(bpy.data.objects), "objetos", tris, "triángulos (sin contar copias enlazadas por separado)")
