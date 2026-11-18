# Casa Materia · fuentes 3D

Concepto de portfolio de Nexa Experience. Este folder guarda **las fuentes editables** de la escena; la web solo usa el GLB optimizado que queda en `public/casa-materia/`.

## Flujo

1. **Recursos gratuitos (CC0)**: texturas, cielos y modelos de [Poly Haven](https://polyhaven.com) y [ambientCG](https://ambientcg.com).

   ```bash
   python3 blender/download_assets.py <ASSETS> "<modelos,separados,por,coma>" "<texturas>" "<cielos>"
   ```

2. **Escena en Blender por script** (Blender como módulo de Python, `pip install bpy==5.1.2`):

   ```bash
   CM_ASSETS=<ASSETS> CM_OUT=<salida> python3 blender/build_pilot.py
   ```

   Genera `casa-materia-pilot.blend` (editable) y `casa-materia-pilot.glb`.

3. **Render de control** (Cycles) para comparar con la web:

   ```bash
   CM_BLEND=<salida>/casa-materia-pilot.blend CM_OUT=<renders> CM_VIEWS=cam_patio,cam_sala python3 blender/render_check.py
   ```

4. **Optimización para la web** (texturas a 1024 px en WebP + geometría meshopt). No usar `optimize`: borra los marcadores `cam_*` y `seat_*`.

   ```bash
   npx gltf-transform resize casa-materia-pilot.glb a.glb --width 1024 --height 1024
   npx gltf-transform webp a.glb b.glb --quality 82
   npx gltf-transform meshopt b.glb casa-materia-prueba.glb
   ```

5. Copiar el resultado a `public/casa-materia/`. La escena web está en `components/casa-materia/`.

## Convención de nombres (la web la lee)

| Prefijo | Qué es |
|---|---|
| `arch_*` | arquitectura fija |
| `roof_*` | techos: se ocultan en la vista aérea |
| `cam_<vista>` | vista de cámara (empty con `target` en propiedades) |
| `lamp_colgante_*`, `lamp_spot_*` | luminarias: la web les agrega luz según el horario |
| `bulb_*` | lamparitas de la guirnalda |
| `seat_<sala>_<n>` | lugar en una mesa (anclaje para la ocupación; en el futuro, personas) |
| `plant_*` | vegetación |
| `glass_*` | vidrios |

## Estado

Prueba de realismo: patio tropical + barra + sala de experiencias. Falta: fachada y puerta, workshops, atelier, horno, boutique, baños, recorrido de cámara y reservas.
