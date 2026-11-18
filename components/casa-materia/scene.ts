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
   Casa Materia · motor de la escena (prueba: patio + sala de experiencias)
   El modelo viene de Blender (casa-materia/blender/build_pilot.py) y la web
   lo lee por convención de nombres: cam_*, roof_*, lamp_*, bulb_*, seat_*.
   ===================================================================== */

export type ViewKey = "patio" | "barra" | "sala" | "aerea";
export type TimeKey = "11" | "18" | "20";

type Light = { fog: number; sunPos: THREE.Vector3; sunColor: number; sun: number; env: number; bg: number; exposure: number; lamps: number; bulbs: number; bloom: number; sky: 0 | 1 | 2 };
/** Cada horario cambia el sol, el cielo, la exposición y las luminarias, no solo el fondo. */
const TIMES: Record<TimeKey, Light> = {
  "11": { fog: 0xd6dadb, sunPos: new THREE.Vector3(-6, 20, 9), sunColor: 0xfff1dc, sun: 3.4, env: 1.0, bg: 1.0, exposure: 0.95, lamps: 0, bulbs: 0.3, bloom: 0.0, sky: 0 },
  "18": { fog: 0xd9ad8a, sunPos: new THREE.Vector3(-22, 5.5, 4), sunColor: 0xffb070, sun: 2.6, env: 0.7, bg: 0.85, exposure: 1.0, lamps: 0.35, bulbs: 2.5, bloom: 0.15, sky: 1 },
  "20": { fog: 0x161a24, sunPos: new THREE.Vector3(12, 16, -10), sunColor: 0x9fb4ff, sun: 0.08, env: 0.12, bg: 0.14, exposure: 1.1, lamps: 1, bulbs: 7, bloom: 0.28, sky: 2 },
};

const toThree = (b: number[]) => new THREE.Vector3(b[0], b[2], -b[1]!); // Blender (Z arriba) → three (Y arriba)

export type SceneApi = { setView: (v: ViewKey) => void; setTime: (t: TimeKey) => void; jumpTo: (v: ViewKey, t: TimeKey) => void; dispose: () => void };

export function createScene(canvas: HTMLCanvasElement, opts: { onProgress: (p: number) => void; onReady: () => void; onError: (e: unknown) => void; lowPower: boolean }): SceneApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1 : 1.6));
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1814);
  scene.fog = new THREE.FogExp2(0xd6dadb, 0.014); // el terreno se funde con el horizonte, como una maqueta
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 400);
  camera.position.set(-8, 14, 10);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 0.6;
  controls.maxDistance = 40;

  // sol
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(opts.lowPower ? 2048 : 4096, opts.lowPower ? 2048 : 4096);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 80 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  const center = new THREE.Vector3(5.5, 0, -7.5);
  sun.target.position.copy(center);
  scene.add(sun, sun.target);

  // posprocesado: oclusión ambiental (contactos y rincones), brillo suave de las lámparas, salida con AgX
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: opts.lowPower ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  let gtao: GTAOPass | null = null;
  if (!opts.lowPower) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 16 });
    gtao.blendIntensity = 0.85;
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.35, 0.96);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // estado
  const skies: THREE.Texture[] = [];
  const envs: THREE.Texture[] = [];
  const roofs: THREE.Mesh[] = [];
  const views: Partial<Record<ViewKey, { pos: THREE.Vector3; target: THREE.Vector3 }>> = {};
  const lampLights: THREE.Light[] = [];
  let bulbMat: THREE.MeshStandardMaterial | null = null;
  let downMat: THREE.MeshStandardMaterial | null = null;
  const state = { sun: 3, env: 1, bg: 1, exposure: 1, lamps: 0, bulbs: 0.3, bloom: 0 };
  let skyIdx = -1;
  let raf = 0;
  let alive = true;
  let current: ViewKey = "aerea";

  const applyLight = () => {
    sun.intensity = state.sun;
    scene.environmentIntensity = state.env;
    scene.backgroundIntensity = state.bg;
    renderer.toneMappingExposure = state.exposure;
    bloom.strength = state.bloom;
    lampLights.forEach((l) => { l.intensity = (l.userData.max as number) * state.lamps; });
    if (bulbMat) bulbMat.emissiveIntensity = state.bulbs;
    if (downMat) downMat.emissiveIntensity = 0.2 + state.lamps * 5;
  };
  const useSky = (i: number) => {
    if (i === skyIdx || !envs[i]) return;
    skyIdx = i;
    scene.environment = envs[i]!;
    scene.background = skies[i]!;
  };

  // carga: primero los cielos (livianos), después la casa con progreso
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdr = new HDRLoader();
  const skyFiles = ["/casa-materia/cielo-dia.hdr", "/casa-materia/cielo-tarde.hdr", "/casa-materia/cielo-noche.hdr"];
  Promise.all(skyFiles.map((f) => hdr.loadAsync(f)))
    .then((texs) => {
      texs.forEach((t, i) => {
        t.mapping = THREE.EquirectangularReflectionMapping;
        skies[i] = t;
        envs[i] = pmrem.fromEquirectangular(t).texture;
      });
      useSky(0);
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load("/casa-materia/casa-materia-prueba.glb", onModel, (e) => e.total && opts.onProgress(e.loaded / e.total), opts.onError);
    })
    .catch(opts.onError);

  function onModel(gltf: { scene: THREE.Group }) {
    const root = gltf.scene;
    const aniso = renderer.capabilities.getMaxAnisotropy();
    root.traverse((o) => {
      const n = o.name;
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        const skip = /^(glass|bulb|arch_terreno|arch_junta|lamp_spot)/i.test(n) || /glass|vidrio/i.test(mat.name);
        m.castShadow = !skip;
        m.receiveShadow = !/^(bulb)/.test(n);
        if (mat.map) mat.map.anisotropy = aniso;
        if (/vidrio/i.test(mat.name)) { mat.transparent = true; mat.depthWrite = false; mat.envMapIntensity = 1.4; }
        if (/lamparita/i.test(mat.name)) bulbMat = mat;
        if (/spot_techo/i.test(mat.name)) downMat = mat;
        if (n.startsWith("roof_")) { m.material = mat.clone(); roofs.push(m); }
      }
      if (n.startsWith("cam_")) {
        const key = n.slice(4) as ViewKey;
        const t = (o.userData.target as number[] | undefined) ?? [5.5, 7, 0];
        views[key] = { pos: o.getWorldPosition(new THREE.Vector3()), target: toThree(t) };
      }
    });
    scene.add(root);
    root.updateMatrixWorld(true);

    // luces de las luminarias, ubicadas por nombre
    const seen = new Set<string>();
    root.traverse((o) => {
      const m = /^lamp_colgante_(\d+)/.exec(o.name);
      if (m && !seen.has(m[1]!)) {
        seen.add(m[1]!);
        const box = new THREE.Box3().setFromObject(o);
        const p = new THREE.PointLight(0xffc68a, 0, 6, 2);
        p.userData.max = 5;
        p.position.set((box.min.x + box.max.x) / 2, box.min.y - 0.05, (box.min.z + box.max.z) / 2);
        scene.add(p);
        lampLights.push(p);
      }
      if (/^lamp_spot/.test(o.name) && (o as THREE.Mesh).isMesh) {
        const box = new THREE.Box3().setFromObject(o);
        const s = new THREE.SpotLight(0xffd2a0, 0, 7, 0.95, 0.9, 2);
        s.userData.max = 14;
        s.position.set((box.min.x + box.max.x) / 2, box.min.y - 0.02, (box.min.z + box.max.z) / 2);
        s.target.position.set(s.position.x, 0, s.position.z);
        scene.add(s, s.target);
        lampLights.push(s);
      }
    });
    // relleno cálido de la guirnalda (tres puntos sobre el patio)
    [[3.8, 2.7, -1.9], [3.8, 2.7, -4.5], [3.8, 2.7, -7.1]].forEach(([x, y, z]) => {
      const p = new THREE.PointLight(0xffb36b, 0, 9, 2);
      p.userData.max = 6;
      p.position.set(x!, y!, z!);
      scene.add(p);
      lampLights.push(p);
    });
    // ambiente interior de la sala (luz indirecta del cielorraso)
    const fill = new THREE.PointLight(0xffd9b0, 0, 10, 2);
    fill.userData.max = 3.5;
    fill.position.set(5.5, 3.0, -12.3);
    scene.add(fill);
    lampLights.push(fill);

    setTimeNow("11");
    jump("aerea");
    opts.onReady();
  }

  function setTimeNow(t: TimeKey) {
    const L = TIMES[t];
    Object.assign(state, { sun: L.sun, env: L.env, bg: L.bg, exposure: L.exposure, lamps: L.lamps, bulbs: L.bulbs, bloom: L.bloom });
    sun.position.copy(center).add(L.sunPos);
    sun.color.set(L.sunColor);
    (scene.fog as THREE.FogExp2).color.set(L.fog);
    useSky(L.sky);
    applyLight();
  }

  function setTime(t: TimeKey) {
    const L = TIMES[t];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setTimeNow(t);
    const from = sun.position.clone().sub(center);
    const col = sun.color.clone();
    const to = new THREE.Color(L.sunColor);
    const fogFrom = (scene.fog as THREE.FogExp2).color.clone();
    const fogTo = new THREE.Color(L.fog);
    const p = { k: 0 };
    let swapped = false;
    gsap.to(state, { sun: L.sun, env: L.env, bg: L.bg, exposure: L.exposure, lamps: L.lamps, bulbs: L.bulbs, bloom: L.bloom, duration: 2.4, ease: "power2.inOut", onUpdate: applyLight });
    gsap.to(p, {
      k: 1, duration: 2.4, ease: "power2.inOut",
      onUpdate: () => {
        sun.position.copy(center).add(from.clone().lerp(L.sunPos, p.k));
        sun.color.copy(col).lerp(to, p.k);
        (scene.fog as THREE.FogExp2).color.copy(fogFrom).lerp(fogTo, p.k);
        if (!swapped && p.k > 0.5) { swapped = true; useSky(L.sky); }
      },
    });
  }

  function roofsVisible(v: boolean, dur: number) {
    roofs.forEach((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return jump(v);
    current = v;
    controls.enabled = false;
    roofsVisible(v !== "aerea", 1.2);
    const tl = gsap.timeline({ defaults: { duration: 2.2, ease: "power3.inOut" }, onComplete: () => { controls.enabled = true; } });
    tl.to(camera.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z }, 0);
    tl.to(controls.target, { x: p.target.x, y: p.target.y, z: p.target.z }, 0);
  }

  // tamaño y bucle
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
    setTime,
    jumpTo: (v, t) => { jump(v); setTimeNow(t); },
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
