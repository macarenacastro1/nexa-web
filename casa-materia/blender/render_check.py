"""Render de control con Cycles desde las vistas cam_* del .blend (para comparar con la web).
Uso: CM_BLEND=... CM_OUT=... CM_VIEWS=cam_patio,cam_sala CM_SAMPLES=32 python3 render_check.py
"""
import os

import bpy  # noqa: I001
from mathutils import Vector

bpy.ops.wm.open_mainfile(filepath=os.environ["CM_BLEND"])
OUT = os.environ.get("CM_OUT", ".")
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = int(os.environ.get("CM_SAMPLES", "32"))
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = int(os.environ.get("CM_PCT", "60"))
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Base Contrast"

# sol que coincide con el cielo de día
sun_data = bpy.data.lights.new("sol", "SUN")
sun_data.energy = 4.0
sun_data.angle = 0.03
sun_data.color = (1.0, 0.95, 0.88)
sun = bpy.data.objects.new("sol", sun_data)
sc.collection.objects.link(sun)
sun.rotation_euler = (0.85, 0.15, 2.4)

# luces de las luminarias (en la web se controlan según el horario)
for o in list(bpy.data.objects):
    if o.name.startswith("lamp_colgante") and o.type == "MESH" and "shade" not in o.name.lower():
        pass
for i, o in enumerate([o for o in bpy.data.objects if o.name.startswith("lamp_colgante")]):
    if i % 99 == 0:
        bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        z = min(v.z for v in bb)
        cx = sum(v.x for v in bb) / 8
        cy = sum(v.y for v in bb) / 8
        ld = bpy.data.lights.new(f"luz_{o.name}", "POINT")
        ld.energy = float(os.environ.get("CM_LAMP_W", "60"))
        ld.color = (1.0, 0.8, 0.58)
        ld.shadow_soft_size = 0.08
        lo = bpy.data.objects.new(ld.name, ld)
        lo.location = (cx, cy, z + 0.05)
        sc.collection.objects.link(lo)
area = bpy.data.lights.new("cielorraso", "AREA")
area.energy = float(os.environ.get("CM_AREA_W", "220"))
area.size, area.shape = 6.0, "SQUARE"
area.color = (1.0, 0.92, 0.82)
ao = bpy.data.objects.new("cielorraso", area)
ao.location = (5.5, 12.3, 3.2)
sc.collection.objects.link(ao)

cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 24
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
for v in os.environ.get("CM_VIEWS", "cam_patio").split(","):
    e = bpy.data.objects[v]
    cam.location = e.location
    d = Vector(e["target"]) - e.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cam_data.lens = 35 if v == "cam_aerea" else 22
    sc.render.filepath = f"{OUT}/{v}.png"
    bpy.ops.render.render(write_still=True)
    print("render", v)
