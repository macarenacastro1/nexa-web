import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/* =====================================================================
   Casa Materia · motor de la escena
   El modelo viene de Blender (casa-materia/blender/build_house.py + bake_light.py).
   - La arquitectura trae luz precalculada con Cycles (lightmaps por horario):
     se dibuja como albedo × luz, con las sombras de muebles y plantas ya incluidas.
   - Muebles, plantas y objetos se iluminan en tiempo real (sol, cielo, lámparas).
   Convenciones de nombres: cam_*, roof_*, lamp_*, bulb_*, seat_*, door_main_*.
   ===================================================================== */

export type ViewKey = "aerea" | "entrada" | "patio" | "barra" | "experiencias" | "workshops" | "atelier" | "horno" | "boutique" | "banos";
export type TimeKey = "11" | "18" | "20";

type Light = { fog: number; sunPos: THREE.Vector3; sunColor: number; sun: number; env: number; bg: number; exposure: number; lamps: number; bulbs: number; bloom: number; hemi: number; sky: 0 | 1 | 2 };
/** Mismos soles y cielos que se usaron para hornear la luz en Blender. */
const TIMES: Record<TimeKey, Light> = {
  "11": { fog: 0xd6dadb, sunPos: new THREE.Vector3(8.66, 21.84, -18.65), sunColor: 0xfff2e0, sun: 4.0, env: 1.0, bg: 1.0, exposure: 0.9, lamps: 0.25, bulbs: 0.4, bloom: 0.0, hemi: 0, sky: 0 },
  "18": { fog: 0xd9ad8a, sunPos: new THREE.Vector3(-27.65, 7.45, -8.93), sunColor: 0xffa05c, sun: 2.6, env: 0.8, bg: 0.85, exposure: 1.0, lamps: 0.7, bulbs: 2.5, bloom: 0.12, hemi: 0.15, sky: 1 },
  "20": { fog: 0x161a24, sunPos: new THREE.Vector3(14.25, 24.76, 9.15), sunColor: 0x9fb4ff, sun: 0.0, env: 0.15, bg: 0.14, exposure: 0.85, lamps: 1, bulbs: 6, bloom: 0.3, hemi: 0.55, sky: 2 },
};
// En la web la base es "/"; en una vista previa alojada en otra ruta, la define la página (__NX_BASE).
const BASE = (typeof window !== "undefined" && (window as unknown as { __NX_BASE?: string }).__NX_BASE) || "/";
const SKY_FILES = ["cielo-dia.hdr", "cielo-tarde.hdr", "cielo-noche.hdr"].map((f) => `${BASE}casa-materia/${f}`);
const MODEL = `${BASE}casa-materia/casa-materia.glb`;
const LM_BASE = `${BASE}casa-materia/luz/`;

const toThree = (b: number[]) => new THREE.Vector3(b[0], b[2], -b[1]!); // Blender (Z arriba) → three (Y arriba)

export type SceneApi = { setView: (v: ViewKey) => void; setTime: (t: TimeKey) => void; jumpTo: (v: ViewKey, t: TimeKey) => void; dispose: () => void };

type LmEntry = Record<TimeKey, { file: string; max: number }>;
type BakeGroup = { mats: THREE.MeshBasicMaterial[]; uniforms: { lightMap2: { value: THREE.Texture | null }; uLmA: { value: number }; uLmB: { value: number }; uLmMix: { value: number } }; tex: Partial<Record<TimeKey, THREE.Texture>>; entry: LmEntry };

export function createScene(canvas: HTMLCanvasElement, opts: { onProgress: (p: number) => void; onReady: () => void; onError: (e: unknown) => void; lowPower: boolean }): SceneApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1 : 1.6));
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.shadowMap.enabled = !opts.lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1814);
  scene.fog = new THREE.FogExp2(0xd6dadb, 0.011);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 500);
  camera.position.set(-8, 25, 14);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 0.6;
  controls.maxDistance = 60;

  // sol (solo afecta a muebles, plantas y objetos: la arquitectura ya trae su luz)
  const center = new THREE.Vector3(13.4, 0, -10.5);
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = !opts.lowPower;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 90 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sun.target.position.copy(center);
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xffd6a8, 0x3a2a1c, 0);
  scene.add(hemi);

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: opts.lowPower ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  if (!opts.lowPower) {
    const gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.6, thickness: 1.0, scale: 1.0, samples: 12 });
    gtao.blendIntensity = 0.5; // la arquitectura ya trae oclusión horneada: acá solo suma contactos finos
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.35, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const skies: THREE.Texture[] = [];
  const envs: THREE.Texture[] = [];
  const roofs: THREE.Mesh[] = [];
  const views: Partial<Record<ViewKey, { pos: THREE.Vector3; target: THREE.Vector3 }>> = {};
  const lampLights: THREE.Light[] = [];
  const groups: Record<string, BakeGroup> = {};
  let bulbMats: THREE.MeshStandardMaterial[] = [];
  let opalMats: THREE.MeshStandardMaterial[] = [];
  const state = { sun: 3, env: 1, bg: 1, exposure: 1, lamps: 0, bulbs: 0.3, bloom: 0, hemi: 0 };
  let skyIdx = -1;
  let curTime: TimeKey = "11";
  let raf = 0;
  let alive = true;
  let current: ViewKey = "aerea";
  const texLoader = new THREE.TextureLoader();

  const applyLight = () => {
    sun.intensity = state.sun;
    scene.environmentIntensity = state.env;
    scene.backgroundIntensity = state.bg;
    renderer.toneMappingExposure = state.exposure;
    bloom.strength = state.bloom;
    hemi.intensity = state.hemi;
    lampLights.forEach((l) => { l.intensity = (l.userData.max as number) * state.lamps; });
    bulbMats.forEach((m) => { m.emissiveIntensity = state.bulbs; });
    opalMats.forEach((m) => { m.emissiveIntensity = 0.6 + state.lamps * 3; });
  };
  const useSky = (i: number) => {
    if (i === skyIdx || !envs[i]) return;
    skyIdx = i;
    scene.environment = envs[i]!;
    scene.background = skies[i]!;
  };

  // ---------------------------------------------------------------- luz precalculada
  const loadLm = (g: BakeGroup, t: TimeKey) =>
    g.tex[t]
      ? Promise.resolve(g.tex[t]!)
      : texLoader.loadAsync(LM_BASE + g.entry[t].file).then((tex) => {
          tex.flipY = false;
          tex.colorSpace = THREE.SRGBColorSpace; // guardada con curva gamma: más precisión en sombras
          tex.channel = 1;                      // segundo mapeo UV (TEXCOORD_1)
          tex.anisotropy = 4;
          g.tex[t] = tex;
          return tex;
        });

  function bakedMaterial(src: THREE.MeshStandardMaterial, g: BakeGroup) {
    const m = new THREE.MeshBasicMaterial({ name: src.name, map: src.map, color: src.color, side: src.side, transparent: false });
    m.lightMapIntensity = 1;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, g.uniforms);
      sh.fragmentShader = "uniform sampler2D lightMap2; uniform float uLmA; uniform float uLmB; uniform float uLmMix;\n" + sh.fragmentShader.replace(
        "vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );",
        "vec4 lightMapTexel = mix( texture2D( lightMap, vLightMapUv ) * uLmA, texture2D( lightMap2, vLightMapUv ) * uLmB, uLmMix );",
      );
    };
    g.mats.push(m);
    return m;
  }

  // ---------------------------------------------------------------- carga
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdr = new HDRLoader();
  let manifest: Record<string, LmEntry> = {};
  Promise.all([Promise.all(SKY_FILES.map((f) => hdr.loadAsync(f))), fetch(LM_BASE + "lightmaps.json").then((r) => r.json() as Promise<Record<string, LmEntry>>)])
    .then(([texs, man]) => {
      manifest = man;
      texs.forEach((t, i) => {
        t.mapping = THREE.EquirectangularReflectionMapping;
        skies[i] = t;
        envs[i] = pmrem.fromEquirectangular(t).texture;
      });
      useSky(0);
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(MODEL, (g) => { onModel(g).catch(opts.onError); }, (e) => e.total && opts.onProgress(Math.min(0.97, e.loaded / e.total)), opts.onError);
    })
    .catch(opts.onError);

  async function onModel(gltf: { scene: THREE.Group }) {
    const root = gltf.scene;
    const aniso = renderer.capabilities.getMaxAnisotropy();
    // grupos horneados: el nodo del objeto unido (bake_*, roof_techos) y sus primitivas
    root.traverse((o) => {
      if (manifest[o.name] && !groups[o.name]) {
        groups[o.name] = { mats: [], tex: {}, entry: manifest[o.name]!, uniforms: { lightMap2: { value: null }, uLmA: { value: 1 }, uLmB: { value: 1 }, uLmMix: { value: 0 } } };
      }
    });
    const groupOf = (o: THREE.Object3D): BakeGroup | null => {
      for (let p: THREE.Object3D | null = o; p; p = p.parent) if (groups[p.name]) return groups[p.name]!;
      return null;
    };
    const cache = new Map<string, THREE.MeshBasicMaterial>();
    root.traverse((o) => {
      const n = o.name;
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat.map) mat.map.anisotropy = aniso;
        const g = groupOf(m);
        if (g) {
          const key = `${mat.uuid}:${g.entry["11"].file}`;
          if (!cache.has(key)) cache.set(key, bakedMaterial(mat, g));
          m.material = cache.get(key)!;
          m.castShadow = false;
          m.receiveShadow = false;
        } else {
          const skip = /vidrio|lamparita|opal|espejo/i.test(mat.name);
          m.castShadow = !skip;
          m.receiveShadow = true;
          if (/vidrio/i.test(mat.name)) { mat.transparent = true; mat.depthWrite = false; mat.envMapIntensity = 1.4; }
          if (/lamparita/i.test(mat.name)) bulbMats.push(mat);
          if (/opal/i.test(mat.name)) opalMats.push(mat);
        }
        for (let p: THREE.Object3D | null = m; p; p = p.parent) {
          if (p.name.startsWith("roof_")) {
            if (!(m.material as THREE.Material).userData.roofClone) {
              const orig = m.material as THREE.Material;
              m.material = orig.clone();
              (m.material as THREE.Material).onBeforeCompile = orig.onBeforeCompile; // clone() no copia el shader modificado
              (m.material as THREE.Material).userData.roofClone = true;
              if (g) g.mats.push(m.material as THREE.MeshBasicMaterial);
            }
            roofs.push(m);
            break;
          }
        }
      }
      if (n.startsWith("cam_")) {
        const t = (o.userData.target as number[] | undefined) ?? [13.4, 10.5, 0];
        views[n.slice(4) as ViewKey] = { pos: o.getWorldPosition(new THREE.Vector3()), target: toThree(t) };
      }
    });
    bulbMats = [...new Set(bulbMats)];
    opalMats = [...new Set(opalMats)];
    scene.add(root);
    root.updateMatrixWorld(true);

    // luces en tiempo real (para muebles y plantas): colgantes de ratán y guirnaldas
    root.traverse((o) => {
      if (/^lamp_ratan_.*_foco$/.test(o.name)) {
        const p = new THREE.PointLight(0xffc68a, 0, 7, 2);
        p.userData.max = 6;
        o.getWorldPosition(p.position);
        p.position.y -= 0.1;
        scene.add(p);
        lampLights.push(p);
      }
    });
    [[9.0, 2.8, -12.0], [18.0, 2.8, -12.3], [11.5, 2.8, -4.3]].forEach(([x, y, z]) => {
      const p = new THREE.PointLight(0xffb36b, 0, 9, 2);
      p.userData.max = 5;
      p.position.set(x!, y!, z!);
      scene.add(p);
      lampLights.push(p);
    });

    // luz precalculada del horario inicial antes de mostrar
    await Promise.all(Object.values(groups).map((g) => loadLm(g, "11")));
    Object.values(groups).forEach((g) => setGroupLm(g, "11", "11", 0));
    setTimeNow("11");
    jump("aerea");
    opts.onProgress(1);
    opts.onReady();
    // el resto de los horarios se baja en segundo plano
    (["18", "20"] as TimeKey[]).forEach((t) => Object.values(groups).forEach((g) => loadLm(g, t).catch(() => undefined)));
  }

  function setGroupLm(g: BakeGroup, a: TimeKey, b: TimeKey, mix: number) {
    const ta = g.tex[a]!, tb = g.tex[b] ?? ta;
    g.mats.forEach((m) => { if (m.lightMap !== ta) { m.lightMap = ta; m.needsUpdate = true; } });
    g.uniforms.lightMap2.value = tb;
    g.uniforms.uLmA.value = g.entry[a].max;
    g.uniforms.uLmB.value = g.entry[b].max;
    g.uniforms.uLmMix.value = mix;
  }

  function setTimeNow(t: TimeKey) {
    const L = TIMES[t];
    Object.assign(state, { sun: L.sun, env: L.env, bg: L.bg, exposure: L.exposure, lamps: L.lamps, bulbs: L.bulbs, bloom: L.bloom, hemi: L.hemi });
    sun.position.copy(center).add(L.sunPos);
    sun.color.set(L.sunColor);
    (scene.fog as THREE.FogExp2).color.set(L.fog);
    useSky(L.sky);
    applyLight();
    Object.values(groups).forEach((g) => g.tex[t] && setGroupLm(g, t, t, 0));
    curTime = t;
  }

  async function setTime(t: TimeKey) {
    if (t === curTime) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await Promise.all(Object.values(groups).map((g) => loadLm(g, t)));
    if (reduce) return setTimeNow(t);
    const from = curTime;
    curTime = t;
    const L = TIMES[t];
    const sunFrom = sun.position.clone().sub(center);
    const col = sun.color.clone();
    const to = new THREE.Color(L.sunColor);
    const fogFrom = (scene.fog as THREE.FogExp2).color.clone();
    const fogTo = new THREE.Color(L.fog);
    const p = { k: 0 };
    let swapped = false;
    gsap.to(state, { sun: L.sun, env: L.env, bg: L.bg, exposure: L.exposure, lamps: L.lamps, bulbs: L.bulbs, bloom: L.bloom, hemi: L.hemi, duration: 2.4, ease: "power2.inOut", onUpdate: applyLight });
    gsap.to(p, {
      k: 1, duration: 2.4, ease: "power2.inOut",
      onUpdate: () => {
        sun.position.copy(center).add(sunFrom.clone().lerp(L.sunPos, p.k));
        sun.color.copy(col).lerp(to, p.k);
        (scene.fog as THREE.FogExp2).color.copy(fogFrom).lerp(fogTo, p.k);
        Object.values(groups).forEach((g) => setGroupLm(g, from, t, p.k));
        if (!swapped && p.k > 0.5) { swapped = true; useSky(L.sky); }
      },
      onComplete: () => Object.values(groups).forEach((g) => setGroupLm(g, t, t, 0)),
    });
  }

  function roofsVisible(v: boolean, dur: number) {
    roofs.forEach((m) => {
      const mat = m.material as THREE.Material;
      gsap.killTweensOf(mat);
      if (dur <= 0) { m.visible = v; mat.opacity = 1; mat.transparent = false; return; }
      mat.transparent = true;
      if (v) m.visible = true;
      gsap.to(mat, { opacity: v ? 1 : 0, duration: dur, ease: "power2.inOut", onComplete: () => { if (!v) m.visible = false; else mat.transparent = false; } });
    });
  }

  function jump(v: ViewKey) {
    const p = views[v];
    if (!p) return;
    camera.position.copy(p.pos);
    controls.target.copy(p.target);
    current = v;
    roofsVisible(v !== "aerea", 0);
  }

  function setView(v: ViewKey) {
    const p = views[v];
    if (!p || v === current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return jump(v);
    current = v;
    controls.enabled = false;
    roofsVisible(v !== "aerea", 1.2);
    const tl = gsap.timeline({ defaults: { duration: 2.4, ease: "power3.inOut" }, onComplete: () => { controls.enabled = true; } });
    tl.to(camera.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z }, 0);
    tl.to(controls.target, { x: p.target.x, y: p.target.y, z: p.target.z }, 0);
  }

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 50;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    controls.update();
    composer.render();
  };
  loop();

  return {
    setView,
    setTime: (t) => { setTime(t).catch(opts.onError); },
    jumpTo: (v, t) => {
      jump(v);
      Promise.all(Object.values(groups).map((g) => loadLm(g, t))).then(() => setTimeNow(t)).catch(opts.onError);
    },
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
