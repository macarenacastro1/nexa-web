"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

import { intelState } from "@/lib/intelState";

const TOOLS = [
  { name: "WhatsApp", ico: "W", color: "#25d366" },
  { name: "Tu web", ico: "◎", color: "#a78bfa" },
  { name: "Email", ico: "@", color: "#0a84ff" },
  { name: "Planillas", ico: "▦", color: "#30d158" },
  { name: "Instagram", ico: "IG", color: "#e1306c" },
  { name: "Pagos", ico: "$", color: "#64d2ff" },
  { name: "CRM", ico: "◉", color: "#ff9f0a" },
  { name: "Stock", ico: "▣", color: "#ffd60a" },
];

const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const seg = (p: number, a: number, b: number) => ease((p - a) / (b - a));

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.2, "rgba(255,255,255,.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Glow({ color, scale, opacity = 1 }: { color: string; scale: number; opacity?: number }) {
  const tex = useMemo(glowTexture, []);
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
}

function Network() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const coreGlow = useRef<THREE.Sprite>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const lineRefs = useRef<any[]>([]);
  const pulseRefs = useRef<(THREE.Group | null)[]>([]);
  const { viewport, size, pointer } = useThree();
  const wide = size.width > 900;

  const data = useMemo(() => {
    return TOOLS.map((t, i) => {
      const a = (i / TOOLS.length) * Math.PI * 2 + 0.3;
      const pos = new THREE.Vector3(Math.cos(a) * 3.7, Math.sin(a * 2) * 0.5 + Math.sin(a) * 1.5, Math.sin(a) * 0.9);
      const mid = pos.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.9 * (i % 2 ? 1 : -1), 0));
      const curve = new THREE.QuadraticBezierCurve3(pos, mid, new THREE.Vector3(0, 0, 0));
      return { ...t, pos, curve, points: curve.getPoints(48), offset: Math.random() };
    });
  }, []);

  useFrame((state, dt) => {
    const p = intelState.progress;
    const t = state.clock.elapsedTime;
    const connect = seg(p, 0.02, 0.32);
    const think = seg(p, 0.3, 0.62);
    const act = seg(p, 0.62, 0.9);

    if (group.current) {
      const g = group.current;
      const targetX = wide ? 2.1 : 0;
      const targetY = wide ? 0 : -1.85;
      g.position.x += (targetX - g.position.x) * 0.08;
      g.position.y += (targetY - g.position.y) * 0.08;
      const s = wide ? 1 : Math.min(1, viewport.width / 7.4);
      g.scale.setScalar(s);
      g.rotation.y += ((p * Math.PI * 0.9 + pointer.x * 0.25) - g.rotation.y) * 0.06;
      g.rotation.x += ((-0.18 + pointer.y * 0.12) - g.rotation.x) * 0.06;
    }
    if (core.current) {
      core.current.rotation.y += dt * (0.3 + think * 1.2);
      core.current.scale.setScalar(0.62 + think * 0.18 + Math.sin(t * 2) * 0.015);
      const m = core.current.material as any;
      m.distort = 0.18 + think * 0.17;
      m.emissiveIntensity = 0.25 + think * 0.8 + act * 0.25;
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12;
      shell.current.rotation.z += dt * 0.05;
      (shell.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + think * 0.2;
    }
    if (coreGlow.current) {
      const s = 2.6 + think * 2.2 + act * 0.8 + Math.sin(t * 2.4) * 0.12;
      coreGlow.current.scale.set(s, s, 1);
      (coreGlow.current.material as THREE.SpriteMaterial).opacity = 0.3 + think * 0.35;
    }
    data.forEach((d, i) => {
      const n = nodeRefs.current[i];
      const appear = seg(p, 0.02 + i * 0.025, 0.2 + i * 0.025);
      if (n) {
        const from = d.pos.clone().multiplyScalar(2.6);
        n.position.lerpVectors(from, d.pos, appear);
        n.position.y += Math.sin(t * 1.2 + i) * 0.06;
        n.scale.setScalar(0.001 + appear);
      }
      const l = lineRefs.current[i];
      if (l?.material) l.material.opacity = 0.05 + connect * 0.4;
      // two pulses per connection: inbound while thinking, outbound while acting
      for (let k = 0; k < 2; k++) {
        const pr = pulseRefs.current[i * 2 + k];
        if (!pr) continue;
        const speed = 0.25 + think * 0.35 + act * 0.2;
        let u = (t * speed + d.offset + k * 0.5) % 1;
        const outbound = act > 0.5 ? k === 0 : false;
        if (outbound) u = 1 - u;
        pr.position.copy(d.curve.getPoint(u));
        const vis = Math.max(connect * 0.6, think, act);
        pr.scale.setScalar(vis * (0.7 + Math.sin(u * Math.PI) * 0.6));
      }
    });
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial color="#2e1065" emissive="#6d28d9" emissiveIntensity={0.6} roughness={0.15} metalness={0.55} distort={0.3} speed={2.2} />
      </mesh>
      <mesh ref={shell} scale={1.25}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.12} />
      </mesh>
      <sprite ref={coreGlow} scale={[4, 4, 1]}>
        <spriteMaterial map={useMemo(glowTexture, [])} color="#7c3aed" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <Html center position={[0, -1.35, 0]} zIndexRange={[10, 0]}>
        <div className="node-label" style={{ transform: "none", borderColor: "rgba(167,139,250,.5)" }}>
          <i style={{ background: "var(--violet)" }}>AI</i>Cerebro NEXA
        </div>
      </Html>

      {data.map((d, i) => (
        <group key={d.name}>
          <Line ref={(r: any) => (lineRefs.current[i] = r)} points={d.points} color={d.color} lineWidth={1.2} transparent opacity={0.1} />
          {[0, 1].map((k) => (
            <group key={k} ref={(r) => { pulseRefs.current[i * 2 + k] = r; }}>
              <mesh>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <Glow color={d.color} scale={0.5} />
            </group>
          ))}
          <group ref={(r) => { nodeRefs.current[i] = r; }}>
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.55} roughness={0.25} metalness={0.3} />
            </mesh>
            <Glow color={d.color} scale={1} opacity={0.5} />
            <Html center position={[0, 0.4, 0]} zIndexRange={[10, 0]}>
              <div className="node-label" style={{ transform: "none" }}>
                <i style={{ background: d.color, color: "#000" }}>{d.ico}</i>{d.name}
              </div>
            </Html>
          </group>
        </group>
      ))}
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const p = intelState.progress;
    const z = 10.5 - seg(p, 0, 0.5) * 1.8;
    state.camera.position.z += (z - state.camera.position.z) * 0.06;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function IntelScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.6, 10.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 6]} intensity={60} color="#ddd6fe" />
      <pointLight position={[-6, -3, -2]} intensity={40} color="#7c3aed" />
      <Network />
      <Sparkles count={140} scale={[16, 9, 8]} size={2.2} speed={0.25} color="#a78bfa" opacity={0.7} />
      <Rig />
    </Canvas>
  );
}
