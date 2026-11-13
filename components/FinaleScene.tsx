"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Estructura luminosa: una red geodésica de nodos y conexiones, ordenada y viva.
function Lattice() {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const { pointer, size } = useThree();

  const { lineGeo, pointGeo, edges } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(2.4, 2);
    const pos = base.getAttribute("position");
    // vértices únicos
    const map = new Map<string, number>();
    const verts: THREE.Vector3[] = [];
    const idx: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const k = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (!map.has(k)) { map.set(k, verts.length); verts.push(v); }
      idx.push(map.get(k)!);
    }
    const set = new Set<string>();
    const edges: [number, number][] = [];
    for (let i = 0; i < idx.length; i += 3) {
      [[idx[i], idx[i + 1]], [idx[i + 1], idx[i + 2]], [idx[i + 2], idx[i]]].forEach(([a, b]) => {
        const k = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!set.has(k)) { set.add(k); edges.push([a, b]); }
      });
    }
    const lp: number[] = [], lc: number[] = [];
    const c1 = new THREE.Color("#2de2d0"), c2 = new THREE.Color("#4c8dff"), c3 = new THREE.Color("#2bf59c");
    edges.forEach(([a, b]) => {
      lp.push(...verts[a].toArray(), ...verts[b].toArray());
      [verts[a], verts[b]].forEach((v) => {
        const t = (v.y + 2.4) / 4.8;
        const c = t < 0.5 ? c2.clone().lerp(c1, t * 2) : c1.clone().lerp(c3, (t - 0.5) * 2);
        lc.push(c.r, c.g, c.b);
      });
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
    lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(lc, 3));
    const pointGeo = new THREE.BufferGeometry().setFromPoints(verts);
    return { lineGeo, pointGeo, edges: edges.map(([a, b]) => [verts[a], verts[b]] as const) };
  }, []);

  const pulseEdges = useMemo(() => Array.from({ length: 60 }, () => ({ e: edges[Math.floor(Math.random() * edges.length)], o: Math.random(), s: 0.25 + Math.random() * 0.5 })), [edges]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dot = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d")!; const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.3, "rgba(255,255,255,.4)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += dt * 0.08;
      group.current.rotation.x += ((pointer.y * 0.25) - group.current.rotation.x) * 0.04;
      group.current.rotation.z += ((-pointer.x * 0.15) - group.current.rotation.z) * 0.04;
      const s = size.width < 720 ? 0.72 : 1;
      group.current.scale.setScalar(s * (1 + Math.sin(t * 0.8) * 0.012));
    }
    if (pulses.current) {
      pulseEdges.forEach((p, i) => {
        const u = (t * p.s + p.o) % 1;
        dummy.position.lerpVectors(p.e[0], p.e[1], u);
        dummy.scale.setScalar(0.012 + Math.sin(u * Math.PI) * 0.022);
        dummy.updateMatrix();
        pulses.current!.setMatrixAt(i, dummy.matrix);
      });
      pulses.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={pointGeo}>
        <pointsMaterial size={0.1} map={dot} color="#bffcf4" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
      <instancedMesh ref={pulses} args={[undefined, undefined, pulseEdges.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#c9fff6" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

export default function FinaleScene() {
  return (
    <Canvas resize={{ offsetSize: true }} dpr={[1, 2]} camera={{ position: [0, 0, 7.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <fog attach="fog" args={["#000000", 5.5, 10]} />
      <Lattice />
    </Canvas>
  );
}
