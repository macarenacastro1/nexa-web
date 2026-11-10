"use client";
import { useMemo } from "react";
import * as THREE from "three";

/** Sombra suave barata: un plano con degradé radial (reemplaza ContactShadows, que re-renderiza cada cuadro). */
export default function SoftShadow({ position = [0, -1, 0] as [number, number, number], scale = [3, 1.2] as [number, number], opacity = 0.3, color = "#3a1a14" }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!; const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(0.45, "rgba(0,0,0,.45)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} alphaMap={tex} />
    </mesh>
  );
}
