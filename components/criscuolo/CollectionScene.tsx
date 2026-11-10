"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import SoftShadow from "./SoftShadow";
import * as THREE from "three";
import { PRODUCTS } from "./products";
import { pouchGeometry, pouchFront, pouchBack, pouchSide, paperNormal } from "./pouch";

export type Ctl = { selected: number | null; hover: number | null; dragY: number; dragging: boolean };

// amortiguación basada en tiempo: igual de suave a 30 o a 144 fps
const damp = (a: number, b: number, k: number, dt = 1 / 60) => a + (b - a) * (1 - Math.exp(-k * 60 * dt));

function Pouches({ ctl, onPick, onHover }: { ctl: React.MutableRefObject<Ctl>; onPick: (i: number) => void; onHover: (i: number | null) => void }) {
  const { size, pointer } = useThree();
  const geo = useMemo(pouchGeometry, []);
  const mats = useMemo(() => {
    const normal = paperNormal();
    // orden de caras de la caja: +x, -x, +y, -y, frente (+z), dorso (-z)
    return PRODUCTS.map((p) => {
      const m = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, normalMap: normal, normalScale: new THREE.Vector2(0.1, 0.1), roughness: 0.72, envMapIntensity: 0.8 });
      const side = m(pouchSide(p)), plain = new THREE.MeshStandardMaterial({ color: p.bg, roughness: 0.75 });
      return [side, side, plain, plain, m(pouchFront(p)), m(pouchBack(p))];
    });
  }, []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const spin = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const c = ctl.current;
    const mobile = size.width < 760;
    const gap = mobile ? 1.05 : 1.55;
    // giro arrastrable de la bolsa elegida, con inercia suave
    const d = Math.min(dt, 0.1);
    if (c.selected !== null) spin.current = damp(spin.current, c.dragY + Math.sin(t * 0.4) * (c.dragging ? 0 : 0.12), 0.08, d);
    PRODUCTS.forEach((_, i) => {
      const g = refs.current[i];
      if (!g) return;
      let x = (i - 1.5) * gap, y = 0.12 + Math.sin(t * 0.8 + i * 1.3) * 0.03, z = 0, ry = 0.38 - i * 0.07, s = mobile ? 0.62 : 1;
      if (c.selected === null && mobile) {
        // en celular: grilla de 2 × 2
        x = ((i % 2) - 0.5) * 1.22; y = (i < 2 ? 0.66 : -0.86) + Math.sin(t * 0.8 + i * 1.3) * 0.03; ry = 0.35; s = 0.54;
      }
      if (c.selected === null) {
        if (c.hover === i) { y += 0.12; ry *= 0.3; }
        ry += pointer.x * 0.15;
      } else if (c.selected === i) {
        x = mobile ? 0 : -1.25; y = mobile ? 0.35 : 0.05; z = 1.1; ry = spin.current + 0.3; s = mobile ? 0.74 : 1.22;
      } else {
        // las demás salen de cuadro hacia los costados
        const side = i < c.selected ? -1 : 1;
        const order = Math.abs(i - c.selected);
        x = side * (mobile ? 4.5 : 7.5) + side * order * 1.2; z = -2.5; y = -0.2; ry = side * 0.6;
      }
      g.position.set(damp(g.position.x, x, 0.07, d), damp(g.position.y, y, 0.07, d), damp(g.position.z, z, 0.07, d));
      g.rotation.y = damp(g.rotation.y, ry, 0.08, d);
      g.rotation.z = damp(g.rotation.z, c.selected === i ? 0 : (i - 1.5) * 0.015, 0.06, d);
      const ss = damp(g.scale.x, s, 0.08, d); g.scale.setScalar(ss);
    });
  });

  return (
    <>
      {PRODUCTS.map((p, i) => (
        <group key={p.n} ref={(r) => { refs.current[i] = r; }} position={[(i - 1.5) * 1.55, 0, 0]}
          onPointerOver={(e) => { e.stopPropagation(); onHover(i); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { onHover(null); document.body.style.cursor = ""; }}
          onClick={(e) => { e.stopPropagation(); onPick(i); }}>
          <mesh geometry={geo} material={mats[i]} />
        </group>
      ))}
    </>
  );
}

export default function CollectionScene({ ctl, onPick, onHover, active = true }: { ctl: React.MutableRefObject<Ctl>; onPick: (i: number) => void; onHover: (i: number | null) => void; active?: boolean }) {
  // las texturas usan las tipografías de la marca: esperamos a que estén cargadas
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 64px "Cormorant Garamond"'), document.fonts.load('italic 400 64px "Cormorant Garamond"'),
      document.fonts.load('300 32px "Manrope"'), document.fonts.load('500 32px "Manrope"'), document.fonts.load('600 32px "Manrope"'),
    ]).catch(() => null).finally(() => setFontsReady(true));
  }, []);
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.5]} camera={{ position: [0, 0.1, 5.6], fov: 32 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#6b5a4c"]} />
        <Lightformer form="rect" intensity={2} color="#fff3e0" position={[-4, 4, 4]} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ffe9d4" position={[5, 1, 3]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#fff8ee" position={[2, 4, -5]} scale={[8, 2, 1]} />
      </Environment>
      <directionalLight position={[-3, 5, 5]} intensity={1.2} color="#fff1dd" />
      <ambientLight intensity={0.2} />
      {fontsReady && <Pouches ctl={ctl} onPick={onPick} onHover={onHover} />}
      <SoftShadow position={[0, -0.8, 0]} scale={[9, 1.6]} opacity={0.2} />
    </Canvas>
  );
}
