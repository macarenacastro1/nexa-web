"use client";
import { useMemo } from "react";
import { PRODUCTS } from "./products";

// Terreno ilustrativo: colinas suaves del Cerrado. Las curvas de nivel se calculan con "marching squares".
const VW = 160, VH = 100;
const HILLS = [
  [96, 54, 26, 1.0], [52, 30, 20, 0.7], [128, 22, 18, 0.62], [30, 78, 24, 0.55], [140, 80, 16, 0.5], [70, 72, 14, 0.4], [112, 40, 10, 0.3],
] as const;
function height(x: number, y: number) {
  let h = 0;
  for (const [cx, cy, s, a] of HILLS) h += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s));
  h += 0.035 * Math.sin(x * 0.21 + y * 0.07) + 0.025 * Math.sin(y * 0.33 - x * 0.11) + 0.015 * Math.sin(x * 0.6 + y * 0.5);
  return h;
}

function contours() {
  const NX = 200, NY = 125, dx = VW / NX, dy = VH / NY;
  const g: number[][] = [];
  let min = Infinity, max = -Infinity;
  for (let j = 0; j <= NY; j++) { g[j] = []; for (let i = 0; i <= NX; i++) { const v = height(i * dx, j * dy); g[j][i] = v; min = Math.min(min, v); max = Math.max(max, v); } }
  const LEVELS = 26;
  const out: { d: string; major: boolean }[] = [];
  for (let l = 1; l < LEVELS; l++) {
    const iso = min + ((max - min) * l) / LEVELS;
    let d = "";
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], e = g[j + 1][i];
      const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (e > iso ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x0 = i * dx, y0 = j * dy;
      const lerp = (p: number, q: number) => (iso - p) / (q - p);
      const T = [x0 + dx * lerp(a, b), y0], R = [x0 + dx, y0 + dy * lerp(b, c)], B = [x0 + dx * lerp(e, c), y0 + dy], L = [x0, y0 + dy * lerp(a, e)];
      const seg = (p: number[], q: number[]) => { d += `M${p[0].toFixed(2)},${p[1].toFixed(2)}L${q[0].toFixed(2)},${q[1].toFixed(2)}`; };
      switch (idx) {
        case 1: case 14: seg(L, B); break;
        case 2: case 13: seg(B, R); break;
        case 3: case 12: seg(L, R); break;
        case 4: case 11: seg(T, R); break;
        case 5: seg(L, T); seg(B, R); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(L, T); break;
        case 10: seg(T, R); seg(L, B); break;
      }
    }
    out.push({ d, major: l % 5 === 0 });
  }
  return out;
}

// posición de cada lote en el plano (ilustrativa, alrededor de Campos Altos)
export const MAP_POINT = { x: 96, y: 54 };
const LOTS = [[96, 54], [80, 40], [110, 66], [66, 30]];

export default function OriginMap({ onPick, active = 0, cross = false }: { onPick?: (i: number) => void; active?: number; cross?: boolean }) {
  const lines = useMemo(contours, []);
  return (
    <svg className="cc-omap" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" aria-label="Mapa ilustrativo da região de Campos Altos">
      <g className="cc-omap__lines">
        {lines.map((l, i) => <path key={i} d={l.d} className={l.major ? "major" : ""} vectorEffect="non-scaling-stroke" />)}
      </g>
      {/* río y camino rural */}
      <path className="cc-omap__river" d="M0,62 C18,58 26,70 44,66 S70,52 84,60 S104,78 122,72 S148,58 160,62" vectorEffect="non-scaling-stroke" />
      <path className="cc-omap__road" d="M20,0 C34,22 58,26 76,44 S92,50 96,54 S118,86 132,100" vectorEffect="non-scaling-stroke" />
      {/* lotes */}
      {LOTS.map(([x, y], i) => (
        <g key={i} className={`cc-omap__lot${i === active ? " main" : ""}`} transform={`translate(${x} ${y})`} onClick={() => onPick?.(i)} style={{ cursor: onPick ? "pointer" : undefined }}>
          <circle r={i === active ? 1.1 : 0.75} />
          {i === active && <circle r="3.2" className="ring" />}
          <text x="2.2" y="0.9">{PRODUCTS[i].n} · {PRODUCTS[i].name}</text>
        </g>
      ))}
      {cross && (
        <g className="cc-omap__cross">
          <line x1="0" x2={VW} y1={LOTS[active][1]} y2={LOTS[active][1]} vectorEffect="non-scaling-stroke" />
          <line y1="0" y2={VH} x1={LOTS[active][0]} x2={LOTS[active][0]} vectorEffect="non-scaling-stroke" />
        </g>
      )}
      <text x={MAP_POINT.x + 2.2} y={MAP_POINT.y - 3} className="cc-omap__town">CAMPOS ALTOS</text>
    </svg>
  );
}
