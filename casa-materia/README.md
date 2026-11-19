# Casa Materia · fuentes 3D

Concepto de portfolio de Nexa Experience. Este folder guarda **las fuentes editables** de la escena; la web solo usa el GLB optimizado que queda en `public/casa-materia/`.

## Flujo

Todo se genera por script (Blender como módulo de Python, sin pantalla):

| Script | Qué hace |
|---|---|
| `blender/download_assets.py` | baja texturas, modelos y cielos CC0 de Poly Haven / ambientCG |
| `blender/cm_lib.py` | materiales, geometría, importación, muebles base, cobogó, guirnaldas |
| `blender/cm_plants.py` | monstera, palmera areca, strelitzia (con flor) y potus, con texturas de hoja generadas |
| `blender/build_house.py` | **la casa según el plano** (escala 0.022 m/px): arquitectura, mobiliario, plantas, vistas |
| `blender/bake_light.py` | luz precalculada con Cycles para 11, 18 y 20 h (lightmaps) + GLB para la web |
| `blender/render_views.py` | renders de control desde las vistas `cam_*` y una vista cenital para comparar con el plano |
| `build_web.sh` | corre todo y deja los archivos en `public/casa-materia/` |

```bash
ASSETS=<assets> WORK=<trabajo> RES=2048 SAMPLES=80 ./build_web.sh
```

### Cómo se ve tan real en la web
- La **arquitectura** (pisos, muros, techos, terreno) se une en pocos objetos con un segundo mapeo UV y la luz se calcula en Blender con Cycles (luz directa, rebotes, sombras de muebles y plantas, luces interiores y de noche). La web la dibuja como color × luz precalculada y mezcla los tres horarios cuando cambia el reloj.
- **Muebles, plantas y objetos** se iluminan en tiempo real con el mismo sol y cielo que se usaron al hornear.
- Los mapas de luz se guardan en 8 bits con curva gamma; `lightmaps.json` trae el máximo de cada uno para decodificarlos.

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

Casa completa según el plano, con luz precalculada. Falta: recorrido de cámara (puerta → patio → maqueta), variantes de la sala de workshops, ocupación de mesas y reservas.
