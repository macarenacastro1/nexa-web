"""Renders de control con Cycles desde las vistas cam_* (o una vista 'plano' cenital).
Uso: CM_BLEND=... CM_OUT=... CM_VIEWS=plano,aerea,patio CM_SAMPLES=32 CM_PCT=60 python3 render_views.py
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
sc.render.resolution_x, sc.render.resolution_y = int(os.environ.get("CM_W", "1280")), int(os.environ.get("CM_H", "720"))
sc.render.resolution_percentage = int(os.environ.get("CM_PCT", "60"))
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Base Contrast"
sun_data = bpy.data.lights.new("sol", "SUN")
sun_data.energy, sun_data.angle, sun_data.color = 4.0, 0.03, (1.0, 0.95, 0.88)
sun = bpy.data.objects.new("sol", sun_data)
sc.collection.objects.link(sun)
sun.rotation_euler = (0.75, 0.1, 2.6)
cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
roofs = [o for o in bpy.data.objects if o.name.startswith("roof_")]
for v in os.environ.get("CM_VIEWS", "aerea").split(","):
    if v == "plano":
        loc, tgt, lens = Vector((13.4, -4.0, 33.0)), Vector((13.4, 9.6, 0.0)), 30
    else:
        e = bpy.data.objects[f"cam_{v}"]
        loc, tgt, lens = e.location.copy(), Vector(e["target"]), (32 if v == "aerea" else 20)
    for o in roofs:
        o.hide_render = v in ("plano", "aerea")
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam_data.lens = lens
    cam_data.clip_end = 300
    sc.render.filepath = f"{OUT}/{v}.png"
    bpy.ops.render.render(write_still=True)
    print("render", v)
