#!/usr/bin/env bash
# Casa Materia: de las fuentes a los archivos de la web.
#   ASSETS=<carpeta con texturas/modelos/cielos> WORK=<carpeta de trabajo> RES=2048 SAMPLES=80 ./build_web.sh
# Requiere: pip install bpy==5.1.2 numpy pillow opencv-python-headless ; npm i -g @gltf-transform/cli
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PUB="$HERE/../public/casa-materia"
: "${ASSETS:?falta ASSETS}" "${WORK:?falta WORK}"
mkdir -p "$WORK/house" "$WORK/bake" "$PUB/luz"
CM_EXPORT=0 CM_ASSETS="$ASSETS" CM_OUT="$WORK/house" python3 "$HERE/blender/build_house.py"
CM_BLEND="$WORK/house/casa-materia.blend" CM_ASSETS="$ASSETS" CM_OUT="$WORK/bake" CM_RES="${RES:-2048}" CM_SAMPLES="${SAMPLES:-80}" \
  python3 "$HERE/blender/bake_light.py"
# texturas a 1024 px + geometría meshopt (no usar "optimize": borra los marcadores cam_* y seat_*)
gltf-transform resize "$WORK/bake/casa-materia-baked.glb" "$WORK/bake/r.glb" --width 1024 --height 1024
gltf-transform meshopt "$WORK/bake/r.glb" "$PUB/casa-materia.glb"
cp "$WORK/bake"/lm_*.webp "$WORK/bake/lightmaps.json" "$PUB/luz/"
echo "listo: $PUB"
