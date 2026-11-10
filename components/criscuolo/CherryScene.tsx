"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { cherrySkin, pulpFace, parchment, roastedBean } from "./textures";
import { journey } from "./state";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// pequeño relieve orgánico, continuo en ambas mitades
const bump = (x: number, y: number, z: number) =>
  0.012 * Math.sin(5.1 * x + 1.3) * Math.sin(4.3 * y + 0.7) * Math.sin(6.2 * z + 2.1) + 0.006 * Math.sin(11 * x + 3 * z) * Math.cos(9 * y);

/** media esfera (corte en el plano x = 0) con UV continuas entre mitades */
function halfGeometry(left: boolean) {
  const phiStart = left ? -Math.PI / 2 : Math.PI / 2;
  const geo = new THREE.SphereGeometry(1, 128, 96, phiStart, Math.PI);
  const pos = geo.getAttribute("position"), uv = geo.getAttribute("uv");
  const ws = 128;
  for (let i = 0; i < pos.count; i++) {
    const ix = i % (ws + 1);
    uv.setX(i, (phiStart + (ix / ws) * Math.PI) / (Math.PI * 2));
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = 1 + bump(x, y, z);
    pos.setXYZ(i, x * k, y * k, z * k);
  }
  return geo;
}

/** semilla de café: un lado convexo y la cara plana con el surco característico */
function seedGeometry() {
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    x *= 0.6; y *= 0.84;
    if (z < 0) {
      z *= 0.1; // cara plana
      const ox = x - 0.035 * Math.sin(y * 3.2); // surco en "S"
      z += 0.075 * Math.exp(-Math.pow(ox / 0.045, 2)) * (1 - Math.pow(y / 0.84, 2));
    } else z *= 0.38;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function Cherry() {
  const { pointer, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const hero = useRef<THREE.Mesh>(null);
  const leftSeed = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Group>(null);
  const embedded = useRef<THREE.Object3D>(null);
  const beansRef = useRef<THREE.Group>(null);
  const beanRefs = useRef<(THREE.Mesh | null)[]>([]);

  const tex = useMemo(() => ({ skin: cherrySkin(), pulp: pulpFace(), seed: parchment(), roast: [roastedBean(0), roastedBean(1), roastedBean(2)] }), []);
  const geo = useMemo(() => ({ l: halfGeometry(true), r: halfGeometry(false), seed: seedGeometry(), disc: new THREE.CircleGeometry(1.012, 128) }), []);
  const mats = useMemo(() => {
    const skin = new THREE.MeshPhysicalMaterial({
      map: tex.skin.map, normalMap: tex.skin.normal, normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.75,
    });
    const pulp = new THREE.MeshPhysicalMaterial({ map: tex.pulp, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2, envMapIntensity: 0.7 });
    const seed = new THREE.MeshPhysicalMaterial({
      map: tex.seed.map, normalMap: tex.seed.normal, normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.52, clearcoat: 0.3, clearcoatRoughness: 0.45, envMapIntensity: 0.8,
    });
    // grano tostado: misma fibra, tono marrón y brillo de aceites
    const roastMats = tex.roast.map((r) => new THREE.MeshPhysicalMaterial({
      map: r.map, normalMap: r.normal, normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.48, clearcoat: 0.32, clearcoatRoughness: 0.35, sheen: 0.25, sheenColor: new THREE.Color("#c08a5a"), envMapIntensity: 0.85, transparent: true,
    }));
    const roastedHero = roastMats[0].clone(); roastedHero.transparent = false;
    return { skin, pulp, seed, seedL: seed.clone(), roastMats, roastedHero };
  }, [tex]);

  // composición del hero: un grano protagonista y otros en profundidad
  const beans = useMemo(() => {
    const list = [{ p: new THREE.Vector3(0, 0, 0), r: new THREE.Euler(0.5, 2.6, 0.5), s: 1.25, d: 1 }];
    const spots = [[-3.3, 1.2, -1.5], [3.1, 1.6, -2.4], [-2.4, -1.5, 0.6], [2.6, -1.2, 0.9], [-4.6, -0.2, -3.5], [4.8, 0.1, -3.8], [-1.2, 2.3, -3], [1.4, -2.4, -1.6], [0.6, 2.1, 1.3]];
    spots.forEach(([x, y, z], i) => list.push({ p: new THREE.Vector3(x, y, z), r: new THREE.Euler(i * 1.7, i * 2.3, i * 0.9), s: 0.38 + ((i * 37) % 10) / 40, d: 0.4 + ((i * 13) % 10) / 16 }));
    return list;
  }, []);
  const roastA = useMemo(() => new THREE.Color("#ffffff"), []);
  const roastB = useMemo(() => new THREE.Color("#c8cc9a"), []);
  const roastC = useMemo(() => new THREE.Color("#5c321b"), []);

  const tmp = useMemo(() => ({ p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), tq: new THREE.Quaternion(), e: new THREE.Euler() }), []);

  useFrame((state) => {
    const p = journey.progress;
    const t = state.clock.elapsedTime;
    const mobile = size.width < 720;

    // HERO: flota, gira con el scroll, reacciona al cursor
    const heroT = seg(p, 0, 0.2);
    const open = ease(seg(p, 0.22, 0.42));
    const release = ease(seg(p, 0.44, 0.6));
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.9) * 0.05 * (1 - open);
      group.current.rotation.y = ease(heroT) * Math.PI * 2 + Math.sin(t * 0.35) * 0.06 * (1 - heroT);
      const s = mobile ? 0.72 : 1;
      const cherryIn = ease(seg(p, 0.09, 0.22));
      group.current.scale.setScalar(s * (0.001 + cherryIn * 0.999));
      group.current.visible = cherryIn > 0.002;
    }
    if (tilt.current) {
      tilt.current.rotation.x += ((-pointer.y * 0.18 + 0.12) * (1 - open) - tilt.current.rotation.x) * 0.06;
      tilt.current.rotation.z += ((pointer.x * -0.12 + 0.18) * (1 - open) - tilt.current.rotation.z) * 0.06;
    }
    // APERTURA: las mitades se separan y giran para mostrar el corte
    const sep = open * (mobile ? 0.95 : 1.25);
    const ang = open * Math.PI * 0.36;
    const out = release;
    if (left.current && right.current) {
      left.current.position.set(-sep - out * 1.6, -out * 0.3, -out * 1.5);
      left.current.rotation.set(0, -ang - out * 0.4, 0);
      right.current.position.set(sep + out * 1.6, -out * 0.3, -out * 1.5);
      right.current.rotation.set(0, ang + out * 0.4, 0);
      const fade = 1 - seg(p, 0.5, 0.62);
      const tr = fade < 0.999;
      [mats.skin, mats.pulp, mats.seedL].forEach((m) => { if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = fade; });
      // las caras internas solo existen una vez abierta la fruta (evita la línea de unión)
      left.current.children[1].visible = right.current.children[1].visible = open > 0.002;
      left.current.visible = right.current.visible = fade > 0.01;
    }
    if (shadow.current) shadow.current.visible = p < 0.6;

    // SEMILLA PROTAGONISTA: sale de la mitad derecha y viene al centro
    if (embedded.current && hero.current) {
      embedded.current.updateWorldMatrix(true, false);
      embedded.current.matrixWorld.decompose(tmp.p, tmp.q, tmp.s);
      const k = release;
      // gira suave y termina con la cara del surco mirando a cámara para la inmersión
      const face = ease(seg(p, 0.5, 0.66));
      tmp.e.set(lerp(0.35, 0.06, face), Math.PI + lerp(0.9, 0, face) + Math.sin(t * 0.4) * 0.03 * (1 - face), lerp(0.25, 0.32, face));
      tmp.tq.setFromEuler(tmp.e);
      hero.current.position.lerpVectors(tmp.p, new THREE.Vector3(0, 0.02, 0), k);
      hero.current.quaternion.slerpQuaternions(tmp.q, tmp.tq, k);
      const target = mobile ? 1.05 : 1.25;
      hero.current.scale.setScalar(lerp(tmp.s.x, target, k));
    }

    // GRANOS DEL HERO: flotan, reaccionan al cursor y se dispersan al bajar
    const scatter = ease(seg(p, 0.05, 0.2));
    mats.roastMats.forEach((m) => (m.opacity = 1 - seg(p, 0.1, 0.19)));
    if (beansRef.current) {
      beansRef.current.visible = scatter < 0.999;
      beansRef.current.scale.setScalar(mobile ? 0.7 : 1);
      beansRef.current.rotation.y += ((pointer.x * 0.25) - beansRef.current.rotation.y) * 0.05;
      beansRef.current.rotation.x += ((-pointer.y * 0.15) - beansRef.current.rotation.x) * 0.05;
    }
    beans.forEach((b, i) => {
      const m = beanRefs.current[i];
      if (!m) return;
      const away = i === 0 ? 0 : scatter * 2.4;
      m.position.set(b.p.x * (1 + away), b.p.y * (1 + away) + Math.sin(t * (0.6 + b.d * 0.5) + i) * 0.08, b.p.z + (i === 0 ? scatter * 3 : 0));
      m.rotation.set(b.r.x + t * 0.05 * b.d, b.r.y + t * 0.08 * (i === 0 ? 1.4 : b.d) + scatter * 2, b.r.z);
      const k = b.s * (i === 0 ? Math.max(0.0001, 1 - ease(seg(p, 0.04, 0.15))) : 1);
      m.scale.set(k * (1 + (i % 3) * 0.04), k * (1 - (i % 2) * 0.05), k);
    });

    // TORRA: la semilla protagonista pasa de pergamino a verde y a grano tostado
    const roast = seg(p, 0.54, 0.68);
    if (roast < 0.5) mats.seed.color.lerpColors(roastA, roastB, roast * 2); else mats.seed.color.lerpColors(roastB, roastC, (roast - 0.5) * 2);
    mats.seed.roughness = lerp(0.52, 0.36, roast);
    mats.seed.clearcoat = lerp(0.3, 0.6, roast);

    // CÁMARA: se acerca a la cereza y luego entra en la textura de la semilla
    const cam = state.camera as THREE.PerspectiveCamera;
    const zHero = lerp(16.5, 10.2, ease(heroT));
    const zSeed = lerp(zHero, 6.6, ease(seg(p, 0.42, 0.6)));
    const zDive = lerp(zSeed, 1.05, ease(seg(p, 0.6, 0.8)));
    // en el hero la fruta queda en el tercio superior, dejando aire para el titular
    const lookY = lerp(mobile ? -1.75 : -0.75, mobile ? 0.25 : 0.55, ease(seg(p, 0.12, 0.34))) * (1 - seg(p, 0.42, 0.6));
    cam.position.set(Math.sin(t * 0.2) * 0.05, lookY + lerp(0.35, 0, open), zDive);
    cam.lookAt(0, lookY, 0);
  });

  const scale: [number, number, number] = [0.94, 1.12, 0.94];
  return (
    <>
      <group ref={group}>
        <group ref={tilt}>
          <group scale={scale}>
            <group ref={left}>
              <mesh geometry={geo.l} material={mats.skin} castShadow />
              <mesh geometry={geo.disc} material={mats.pulp} rotation={[0, Math.PI / 2, 0]} position={[0.002, 0, 0]} />
              <mesh ref={leftSeed} geometry={geo.seed} material={mats.seedL} rotation={[0, -Math.PI / 2, 0]} position={[0.004, 0, 0]} scale={[0.92, 0.92 / 1.12 * 1.06, 0.92]} />
              {/* pedúnculo */}
              <mesh position={[0, 1.0, 0]} rotation={[0, 0, 0.1]}>
                <cylinderGeometry args={[0.035, 0.06, 0.16, 16]} />
                <meshStandardMaterial color="#4a3a22" roughness={0.8} />
              </mesh>
            </group>
            <group ref={right}>
              <mesh geometry={geo.r} material={mats.skin} castShadow />
              <mesh geometry={geo.disc} material={mats.pulp} rotation={[0, -Math.PI / 2, 0]} position={[-0.002, 0, 0]} />
              <object3D ref={embedded} rotation={[0, Math.PI / 2, 0]} position={[-0.004, 0, 0]} scale={[0.92, 0.92 / 1.12 * 1.06, 0.92]} />
              {/* corona: cicatriz de la flor */}
              <mesh position={[0, -1.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.07, 0.022, 10, 24]} />
                <meshStandardMaterial color="#2b1a14" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      <mesh ref={hero} geometry={geo.seed} material={mats.seed} />
      <group ref={beansRef}>
        {beans.map((b, i) => (
          <mesh key={i} ref={(r) => { beanRefs.current[i] = r; }} geometry={geo.seed} material={i === 0 ? mats.roastedHero : mats.roastMats[i % 3]} />
        ))}
      </group>
      <group ref={shadow}>
        <ContactShadows position={[0, -1.45, 0]} opacity={0.32} scale={7} blur={2.8} far={3} color="#3a1a14" />
      </group>
    </>
  );
}

export default function CherryScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.35, 14], fov: 25 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}>
      {/* luz de estudio natural: ventana grande cálida, relleno suave y contraluz */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#6b5a4c"]} />
        <Lightformer form="rect" intensity={2.2} color="#fff3e0" position={[-4, 4, 4]} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#ffe9d4" position={[5, 1, 3]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#fff8ee" position={[2, 4, -5]} scale={[8, 2, 1]} />
      </Environment>
      <directionalLight position={[-3, 5, 4]} intensity={1.1} color="#fff1dd" />
      <ambientLight intensity={0.15} />
      <Cherry />
    </Canvas>
  );
}
