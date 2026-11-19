"""
Casa Materia · vegetación tropical modelada (monstera, palmera areca, strelitzia, potus colgante)
Las hojas son mallas curvas con texturas generadas (color + recorte alfa): bordes,
nervaduras, cortes y perforaciones reales en la silueta, sin formas geométricas evidentes.
"""
import math
import os
import random

import numpy as np
from PIL import Image, ImageFilter

import bpy  # noqa: I001
import bmesh
from mathutils import Matrix, Vector

from cm_lib import OUT, col

rng = np.random.default_rng(11)


def _noise(h, w, scale, seed):
    """Ruido suave (valor) para variar el color de la lámina."""
    r = np.random.default_rng(seed)
    small = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    im = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255.0


def _save(rgb, alpha, name):
    os.makedirs(f"{OUT}/hojas", exist_ok=True)
    a = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    im = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
    im.putalpha(a)
    p = f"{OUT}/hojas/{name}.png"
    im.save(p)
    return p


# ------------------------------------------------------------------ texturas
def tex_monstera(name, seed=1, size=1024):
    """Hoja de monstera: base acorazonada, cortes entre nervaduras y perforaciones cerca del nervio central."""
    H = W = size
    v, u = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1 - v / H                      # 0 = base (pecíolo), 1 = punta
    x = (u / W - 0.5) * 2              # -1..1
    width = np.where(v < 0.18, 0.55 + v * 2.2, np.maximum(np.sin(np.pi * np.clip((v - 0.02) / 0.98, 0, 1)), 0) ** 0.75 * 0.96)
    inside = np.abs(x) < width
    inside &= ~((v < 0.16) & (np.abs(x) < (0.16 - v) * 2.4))          # escote de la base
    inside &= v > 0.02
    r = np.random.default_rng(seed)
    alpha = inside.astype(np.float32)
    ax = np.abs(x)
    veins = np.zeros_like(x)
    n = 7
    for i in range(n):
        v0 = 0.15 + i * 0.105
        ang = math.radians(50 + i * 3)
        ca, sa = math.cos(ang), math.sin(ang)
        # nervadura primaria: sale del nervio central hacia arriba y afuera
        d = (v - v0) * ca - ax * sa * 0.5
        veins = np.maximum(veins, np.clip(1 - np.abs(d) / 0.007, 0, 1) * (v > v0 - 0.01))
        # corte entre esta nervadura y la siguiente, desde el borde (más ancho afuera)
        dc = (v - (v0 + 0.052)) * ca - ax * sa * 0.5
        rel = ax / np.maximum(width, 1e-3)
        cut_len = r.uniform(0.35, 0.6) if 0 < i < n - 1 else r.uniform(0.15, 0.3)
        slit = (np.abs(dc) < 0.004 + 0.016 * rel ** 2) & (rel > 1 - cut_len) & (v > 0.17) & (v < 0.92)
        alpha[slit] = 0
        # perforación alargada, orientada como la nervadura
        if 0 < i < n - 1 and r.random() < 0.8:
            cy, cx = v0 + 0.052, 0.17 + r.uniform(-0.02, 0.04)
            px, py = ax - cx, v - (cy + cx * sa * 0.5 / ca)
            along = px * sa + py * ca
            across = -px * ca + py * sa
            hole = (along / 0.06) ** 2 + (across / 0.014) ** 2 < 1
            alpha[hole] = 0
    nz = _noise(H, W, 24, seed) * 0.5 + _noise(H, W, 6, seed + 1) * 0.5
    base = np.stack([0.07 + 0.05 * nz, 0.24 + 0.1 * nz + 0.06 * v, 0.09 + 0.04 * nz], -1)
    mid = np.clip(1 - ax / 0.012, 0, 1)
    lit = np.clip(veins * 0.6 + mid, 0, 1)[..., None]
    rgb = base * (1 - lit * 0.6) + np.array([0.32, 0.45, 0.16]) * lit * 0.6
    rgb *= (0.85 + 0.15 * (1 - ax))[..., None]
    return _save(rgb, alpha, name)


def tex_palm(name, seed=2, w=512, h=1024):
    """Fronda de areca: raquis central y folíolos finos en espiga."""
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - v / h
    x = (u / w - 0.5) * 2
    alpha = np.zeros_like(x)
    r = np.random.default_rng(seed)
    n = 34
    for i in range(n):
        t0 = 0.06 + i * (0.9 / n)
        L = (0.95 - t0 * 0.6) * r.uniform(0.85, 1.05)
        for s in (-1, 1):
            ang = math.radians(r.uniform(30, 40))
            # coordenada a lo largo del folíolo
            dx = x * s
            dv = v - t0
            along = dx * math.cos(ang) + dv * math.sin(ang) * 2.0
            perp = -dx * math.sin(ang) + dv * math.cos(ang) * 2.0
            wid = 0.022 * np.maximum(np.sin(np.pi * np.clip(along / L, 0, 1)), 0) ** 0.6
            alpha = np.maximum(alpha, ((np.abs(perp) < wid) & (along > 0) & (along < L) & (dx > 0)).astype(np.float32))
    rach = np.abs(x) < 0.012 * (1.2 - v)
    alpha = np.maximum(alpha, (rach & (v < 0.98)).astype(np.float32))
    nz = _noise(h, w, 16, seed)
    rgb = np.stack([0.18 + 0.08 * nz + 0.08 * (1 - v), 0.36 + 0.1 * nz, 0.1 + 0.03 * nz], -1)
    rgb[rach] = [0.45, 0.5, 0.22]
    return _save(rgb, alpha, name)


def tex_strelitzia(name, seed=3, w=320, h=1024):
    """Hoja de strelitzia: paleta alargada con rasgaduras desde el borde, perpendiculares al nervio."""
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - v / h
    x = (u / w - 0.5) * 2
    width = np.maximum(np.sin(np.pi * np.clip(v * 1.02, 0, 1)), 0) ** 0.55 * 0.95
    alpha = (np.abs(x) < width).astype(np.float32)
    r = np.random.default_rng(seed)
    for _ in range(r.integers(4, 10)):
        vy = r.uniform(0.2, 0.9)
        s = r.choice([-1, 1])
        depth = r.uniform(0.4, 0.95)
        tear = (np.abs(v - vy - x * 0.08) < 0.0035) & (x * s > (1 - depth) * width)
        alpha[tear] = 0
    nz = _noise(h, w, 18, seed)
    stripes = 0.5 + 0.5 * np.sin(v * 260 + x * 30)
    rgb = np.stack([0.1 + 0.04 * nz, 0.27 + 0.07 * nz - stripes * 0.025, 0.14 + 0.05 * nz], -1)
    mid = np.abs(x) < 0.035
    rgb[mid] = [0.42, 0.48, 0.25]
    return _save(rgb, alpha, name)


def tex_pothos(name, seed=4, s=256):
    v, u = np.mgrid[0:s, 0:s].astype(np.float32)
    v = 1 - v / s
    x = (u / s - 0.5) * 2
    width = np.maximum(np.sin(np.pi * np.clip(v, 0, 1)), 0) ** 0.7 * 0.85 + np.where(v < 0.3, 0.15, 0)
    alpha = ((np.abs(x) < width) & (v > 0.03) & ~((v < 0.12) & (np.abs(x) < 0.12))).astype(np.float32)
    nz = _noise(s, s, 8, seed)
    var = _noise(s, s, 3, seed + 5)
    rgb = np.stack([0.15 + 0.1 * var, 0.36 + 0.12 * nz, 0.1 + 0.06 * var], -1)
    rgb[np.abs(x) < 0.03] = [0.4, 0.5, 0.2]
    return _save(rgb, alpha, name)


def tex_bird_flower(name, s=256):
    """Flor de ave del paraíso: cresta naranja y lengua azul sobre una espata verde."""
    v, u = np.mgrid[0:s, 0:s].astype(np.float32)
    v = 1 - v / s
    x = u / s
    alpha = np.zeros((s, s), np.float32)
    rgb = np.zeros((s, s, 3), np.float32)
    spathe = (np.abs(v - 0.35 - (x - 0.5) * 0.15) < 0.05 * (1 - x) + 0.01) & (x > 0.05) & (x < 0.95)
    rgb[spathe] = [0.2, 0.32, 0.18]
    alpha[spathe] = 1
    for i in range(4):
        cx = 0.35 + i * 0.12
        petal = (((x - cx) / 0.035) ** 2 + ((v - 0.62 - i * 0.04) / 0.26) ** 2) < 1
        petal &= v > 0.36
        rgb[petal] = [1.0, 0.45 + i * 0.04, 0.05]
        alpha[petal] = 1
    tongue = (((x - 0.6) / 0.25) ** 2 + ((v - 0.42) / 0.03) ** 2) < 1
    rgb[tongue] = [0.15, 0.22, 0.6]
    alpha[tongue] = 1
    return _save(rgb, alpha, name)


# ------------------------------------------------------------------ materiales de hoja (recorte alfa exportable a glTF)
_MATS = {}


def leaf_mat(name, path, rough=0.5):
    if name in _MATS:
        return _MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(path)
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    gt = nt.nodes.new("ShaderNodeMath")
    gt.operation = "GREATER_THAN"
    gt.inputs[1].default_value = 0.5
    nt.links.new(t.outputs["Alpha"], gt.inputs[0])
    nt.links.new(gt.outputs[0], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = rough
    m.use_backface_culling = False
    _MATS[name] = m
    return m


def stem_mat(name="tallo", color=(0.2, 0.27, 0.11)):
    if name in _MATS:
        return _MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*color, 1)
    m.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
    _MATS[name] = m
    return m


# ------------------------------------------------------------------ geometría de hojas
def _leaf(bm, uv, base, d_up, d_out, L, W, cup=0.12, arch=0.25, nu=6, nv=10, mi=1, twist=0.0):
    """Lámina como grilla curva: 'base' punto de unión, 'd_up' dirección del eje, 'd_out' hacia el borde."""
    side = d_up.cross(d_out).normalized()
    if side.length < 1e-4:
        side = Vector((1, 0, 0))
    normal = side.cross(d_up).normalized()
    grid = []
    for iv in range(nv + 1):
        tv = iv / nv
        dirv = (d_up * (1 - arch * tv) + (-normal) * (arch * tv * 1.2)).normalized()
        c = base + dirv * (L * tv)
        c += -normal * (arch * L * tv * tv * 0.35)
        row = []
        for iu in range(nu + 1):
            tu = iu / nu - 0.5
            rot = Matrix.Rotation(twist * tv, 3, d_up)
            p = c + rot @ (side * (tu * W)) + normal * (-cup * W * (2 * tu) ** 2)
            row.append(bm.verts.new(p))
        grid.append(row)
    for iv in range(nv):
        for iu in range(nu):
            f = bm.faces.new((grid[iv][iu], grid[iv][iu + 1], grid[iv + 1][iu + 1], grid[iv + 1][iu]))
            f.material_index = mi
            f.smooth = True
            for lo, (a, b) in zip(f.loops, ((iu, iv), (iu + 1, iv), (iu + 1, iv + 1), (iu, iv + 1))):
                lo[uv].uv = (a / nu, b / nv)


def _stem(bm, pts, r0, r1, seg=6, mi=0):
    rings = []
    for k, p in enumerate(pts):
        t = k / max(1, len(pts) - 1)
        r = r0 + (r1 - r0) * t
        d = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
        a = d.orthogonal().normalized()
        b2 = d.cross(a)
        rings.append([bm.verts.new(p + (a * math.cos(q) + b2 * math.sin(q)) * r) for q in (i / seg * math.tau for i in range(seg))])
    for k in range(len(rings) - 1):
        for i in range(seg):
            f = bm.faces.new((rings[k][i], rings[k][(i + 1) % seg], rings[k + 1][(i + 1) % seg], rings[k + 1][i]))
            f.material_index = mi
            f.smooth = True


def _curve(p0, d0, length, bend, n=6):
    """Puntos de un tallo que arranca en p0 con dirección d0 y se arquea hacia afuera/abajo."""
    pts = [p0.copy()]
    p = p0.copy()
    d = d0.normalized()
    for i in range(n):
        d = (d + Vector((d.x, d.y, 0)).normalized() * bend / n + Vector((0, 0, -bend * 0.15 / n))).normalized() if Vector((d.x, d.y, 0)).length > 1e-3 else d
        p = p + d * (length / n)
        pts.append(p.copy())
    return pts, d


def _finish(name, bm, mats, collection="vegetacion"):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    o = bpy.data.objects.new(name, me)
    col(collection).objects.link(o)
    return o


# ------------------------------------------------------------------ plantas
_TEX = {}


def _tex(kind, i):
    key = f"{kind}{i}"
    if key not in _TEX:
        f = {"monstera": tex_monstera, "palm": tex_palm, "strel": tex_strelitzia, "pothos": tex_pothos}[kind]
        _TEX[key] = f(f"{kind}_{i}", seed=100 + i)
    return _TEX[key]


def monstera(name, loc, scale=1.0, leaves=11, seed=0):
    r = random.Random(seed)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    mats = [stem_mat("tallo_monstera", (0.18, 0.26, 0.1))] + [leaf_mat(f"hoja_monstera_{i}", _tex("monstera", i), 0.38) for i in range(3)]
    base = Vector(loc)
    for i in range(leaves):
        a = i / leaves * math.tau * 1.0 + r.uniform(-0.35, 0.35)
        out = Vector((math.cos(a), math.sin(a), 0))
        d0 = (out * r.uniform(0.2, 0.55) + Vector((0, 0, 1))).normalized()
        plen = r.uniform(0.55, 1.25) * scale
        pts, d = _curve(base + out * 0.04, d0, plen, r.uniform(0.2, 0.6))
        _stem(bm, pts, 0.014 * scale, 0.009 * scale)
        L = r.uniform(0.5, 0.82) * scale
        leaf_up = (out * 0.8 + Vector((0, 0, r.uniform(0.25, 0.7)))).normalized()
        _leaf(bm, uv, pts[-1], leaf_up, Vector((0, 0, 1)), L, L * 0.92, cup=0.1, arch=r.uniform(0.35, 0.6), nu=8, nv=10, mi=1 + i % 3, twist=r.uniform(-0.25, 0.25))
    return _finish(name, bm, mats)


def areca(name, loc, scale=1.0, canes=6, seed=0):
    r = random.Random(seed)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    mats = [stem_mat("cana_areca", (0.42, 0.45, 0.2))] + [leaf_mat(f"fronda_areca_{i}", _tex("palm", i), 0.5) for i in range(2)]
    base = Vector(loc)
    for c in range(canes):
        a = r.uniform(0, math.tau)
        off = Vector((math.cos(a), math.sin(a), 0)) * r.uniform(0.02, 0.12) * scale
        h = r.uniform(0.8, 1.8) * scale
        lean = Vector((math.cos(a), math.sin(a), 0)) * r.uniform(0.05, 0.2)
        top = base + off + (Vector((0, 0, 1)) + lean).normalized() * h
        _stem(bm, [base + off, base + off + (top - base - off) * 0.5, top], 0.025 * scale, 0.016 * scale)
        for f in range(r.randint(3, 5)):
            fa = r.uniform(0, math.tau)
            out = Vector((math.cos(fa), math.sin(fa), 0))
            d_up = (out * r.uniform(0.5, 1.0) + Vector((0, 0, r.uniform(0.6, 1.2)))).normalized()
            L = r.uniform(1.0, 1.6) * scale
            _leaf(bm, uv, top, d_up, out, L, L * 0.55, cup=-0.18, arch=0.9, nu=4, nv=12, mi=1 + f % 2, twist=r.uniform(-0.4, 0.4))
    return _finish(name, bm, mats)


def strelitzia(name, loc, height=2.4, leaves=12, seed=0, flowers=0):
    r = random.Random(seed)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    mats = [stem_mat("tallo_strelitzia", (0.24, 0.3, 0.14))] + [leaf_mat(f"hoja_strelitzia_{i}", _tex("strel", i), 0.5) for i in range(3)]
    if flowers:
        mats.append(leaf_mat("flor_ave_paraiso", tex_bird_flower("flor_ave_paraiso"), 0.4))
    base = Vector(loc)
    fan = r.uniform(0, math.tau)
    for i in range(leaves):
        a = fan + (i / leaves - 0.5) * math.pi * 1.4 + r.uniform(-0.15, 0.15)
        a += math.pi * (i % 2)
        out = Vector((math.cos(a), math.sin(a), 0))
        stem_h = height * r.uniform(0.4, 0.7)
        d0 = (out * r.uniform(0.1, 0.35) + Vector((0, 0, 1))).normalized()
        pts, d = _curve(base, d0, stem_h, r.uniform(0.05, 0.3), n=5)
        _stem(bm, pts, 0.02, 0.012)
        L = height * r.uniform(0.38, 0.55)
        _leaf(bm, uv, pts[-1], (d + out * 0.3).normalized(), out, L, L * 0.32, cup=0.06, arch=r.uniform(0.15, 0.5), nu=4, nv=10, mi=1 + i % 3, twist=r.uniform(-0.5, 0.5))
    for k in range(flowers):
        a = r.uniform(0, math.tau)
        out = Vector((math.cos(a), math.sin(a), 0))
        top = base + out * 0.1 + Vector((0, 0, height * r.uniform(0.45, 0.6)))
        _stem(bm, [base, (base + top) / 2, top], 0.01, 0.008)
        for rot in (0, math.pi / 2):
            side = Matrix.Rotation(rot, 3, "Z") @ out
            _leaf(bm, uv, top - side * 0.12, side, Vector((0, 0, 1)).cross(side), 0.25, 0.25, cup=0, arch=0, nu=1, nv=1, mi=4)
    return _finish(name, bm, mats)


def pothos(name, anchors, length=1.4, seed=0):
    """Potus colgante: guías que caen desde los puntos 'anchors' con hojas acorazonadas."""
    r = random.Random(seed)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    mats = [stem_mat("guia_potus", (0.25, 0.35, 0.12))] + [leaf_mat("hoja_potus", _tex("pothos", 0), 0.45)]
    for an in anchors:
        for g in range(r.randint(4, 7)):
            p = Vector(an) + Vector((r.uniform(-0.15, 0.15), r.uniform(-0.15, 0.15), 0))
            L = length * r.uniform(0.4, 1.0)
            pts = [p + Vector((math.sin(t * 3 + g) * 0.05, math.cos(t * 2 + g) * 0.05, -L * t)) for t in (i / 8 for i in range(9))]
            pts[1] += Vector((r.uniform(-0.15, 0.15), r.uniform(-0.15, 0.15), 0.08))
            _stem(bm, pts, 0.004, 0.003, seg=4)
            for k in range(1, 9):
                q = pts[k]
                a = r.uniform(0, math.tau)
                out = Vector((math.cos(a), math.sin(a), 0))
                s = r.uniform(0.07, 0.11)
                _leaf(bm, uv, q, (out + Vector((0, 0, -0.6))).normalized(), Vector((0, 0, 1)), s, s * 0.9, cup=0.05, arch=0.2, nu=2, nv=3, mi=1)
    return _finish(name, bm, mats)
