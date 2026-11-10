"use client";
// Láminas de línea fina (estilo botánico/editorial) que se dibujan según el progreso local de cada etapa.
import type { CSSProperties } from "react";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** trazo que se dibuja: progreso 0 → 1 */
function D({ d, t, w = 1.4, o = 1, cls = "" }: { d: string; t: number; w?: number; o?: number; cls?: string }) {
  return <path d={d} className={cls} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - t, strokeWidth: w, opacity: o } as CSSProperties} />;
}

/* ---------- Fig. 01 — Cultivo: rama de cafeto ---------- */
function leaf(cx: number, cy: number, len: number, ang: number) {
  const r = (ang * Math.PI) / 180, ex = cx + Math.cos(r) * len, ey = cy + Math.sin(r) * len;
  const nx = -Math.sin(r) * len * 0.28, ny = Math.cos(r) * len * 0.28;
  const mx = (cx + ex) / 2, my = (cy + ey) / 2;
  return {
    outline: `M${cx},${cy} Q${mx + nx},${my + ny} ${ex},${ey} Q${mx - nx},${my - ny} ${cx},${cy}`,
    rib: `M${cx},${cy} L${ex},${ey}`,
    veins: [0.3, 0.5, 0.7].map((k) => { const px = cx + (ex - cx) * k, py = cy + (ey - cy) * k; return `M${px},${py} l${nx * 0.6 + (ex - cx) * 0.08},${ny * 0.6 + (ey - cy) * 0.08} M${px},${py} l${-nx * 0.6 + (ex - cx) * 0.08},${-ny * 0.6 + (ey - cy) * 0.08}`; }).join(" "),
  };
}
function Cultivo({ t }: { t: number }) {
  const stem = "M60,470 C110,400 150,330 180,260 S240,120 300,40";
  const nodes: [number, number][] = [[118, 382], [160, 300], [196, 222], [240, 140], [278, 78]];
  const leaves = nodes.flatMap(([x, y], i) => [leaf(x, y, 92 - i * 8, -160 + i * 6), leaf(x, y, 98 - i * 8, -20 - i * 4)]);
  const cherries = nodes.slice(0, 4).flatMap(([x, y], i) => [[x - 6, y + 12], [x + 8, y + 14], [x + 1, y + 26], [x + 14, y + 2]].slice(0, 4 - (i % 2)));
  return (
    <g>
      <D d={stem} t={seg(t, 0, 0.35)} w={2.2} />
      {leaves.map((l, i) => {
        const k = seg(t, 0.15 + i * 0.045, 0.45 + i * 0.045);
        return <g key={i}><D d={l.outline} t={k} /><D d={l.rib} t={k} w={0.9} /><D d={l.veins} t={seg(k, 0.4, 1)} w={0.6} o={0.7} /></g>;
      })}
      {cherries.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7.5} className="fill" style={{ opacity: seg(t, 0.6 + i * 0.02, 0.75 + i * 0.02), transform: `scale(${0.6 + 0.4 * seg(t, 0.6 + i * 0.02, 0.75 + i * 0.02)})`, transformOrigin: `${x}px ${y}px`, transformBox: "view-box" } as CSSProperties} />
      ))}
    </g>
  );
}

/* ---------- Fig. 02 — Colheita: cerezas cayendo en la peneira ---------- */
function Colheita({ t }: { t: number }) {
  const drops = Array.from({ length: 14 }, (_, i) => ({ x: 140 + ((i * 53) % 130), d: (i % 7) * 0.06 }));
  return (
    <g>
      <D d="M70,330 C70,420 330,420 330,330" t={seg(t, 0, 0.3)} w={2} />
      <D d="M70,330 C70,290 330,290 330,330 C330,370 70,370 70,330" t={seg(t, 0.05, 0.35)} w={2} />
      {Array.from({ length: 9 }, (_, i) => <D key={i} d={`M${95 + i * 26},${300 + Math.abs(4 - i) * 2} L${100 + i * 24},${400 - Math.abs(4 - i) * 6}`} t={seg(t, 0.2 + i * 0.02, 0.45 + i * 0.02)} w={0.6} o={0.6} />)}
      {Array.from({ length: 4 }, (_, i) => <D key={"h" + i} d={`M${80 + i * 4},${345 + i * 16} C${150},${360 + i * 18} ${250},${360 + i * 18} ${320 - i * 4},${345 + i * 16}`} t={seg(t, 0.25, 0.5)} w={0.6} o={0.6} />)}
      {drops.map((c, i) => {
        const k = seg(t, 0.35 + c.d, 0.75 + c.d);
        const y = 40 + k * (300 + (i % 3) * 8);
        return <circle key={i} cx={c.x + Math.sin(i) * 6} cy={y} r={8} className="fill" style={{ opacity: k > 0 ? 1 : 0 }} />;
      })}
      <D d="M190,40 C200,90 230,120 220,170" t={seg(t, 0.3, 0.5)} w={1} o={0.5} />
    </g>
  );
}

/* ---------- Fig. 03 — Seleção: granos que se ordenan sobre el terreiro ---------- */
function Selecao({ t }: { t: number }) {
  const n = 48, k = seg(t, 0.3, 0.9);
  const ease = k * k * (3 - 2 * k);
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => <D key={"g" + i} d={`M${40 + i * 10},${460} L${120 + i * 26},${150}`} t={seg(t, 0, 0.3)} w={0.6} o={0.45} />)}
      {Array.from({ length: 6 }, (_, i) => <D key={"r" + i} d={`M${40 - i * 4},${460 - i * 60} L${360 + i * 4},${460 - i * 60}`} t={seg(t, 0.05, 0.35)} w={0.6} o={0.45} />)}
      {Array.from({ length: n }, (_, i) => {
        const rx = 60 + ((i * 97) % 280), ry = 170 + ((i * 61) % 270);
        const gx = 90 + (i % 8) * 32, gy = 200 + Math.floor(i / 8) * 40;
        const x = rx + (gx - rx) * ease, y = ry + (gy - ry) * ease;
        const rot = ((i * 47) % 180) * (1 - ease);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} style={{ opacity: seg(t, 0.1 + (i % 10) * 0.015, 0.3 + (i % 10) * 0.015) }}>
            <ellipse rx="9" ry="6" className="stroke" /><path d="M-7,0 C-3,-2 3,2 7,0" className="stroke thin" />
          </g>
        );
      })}
    </g>
  );
}

/* ---------- Fig. 04 — Torra: curva de tostado ---------- */
function Torra({ t }: { t: number }) {
  const curve = "M60,330 C90,360 120,370 150,350 S220,250 260,205 S320,150 350,140";
  const k = seg(t, 0.25, 0.85);
  return (
    <g>
      <D d="M60,90 L60,400 L360,400" t={seg(t, 0, 0.25)} w={1.4} />
      {[1, 2, 3, 4, 5].map((i) => <D key={i} d={`M60,${400 - i * 55} L360,${400 - i * 55}`} t={seg(t, 0.1, 0.3)} w={0.5} o={0.35} />)}
      {[1, 2, 3, 4, 5, 6].map((i) => <D key={"v" + i} d={`M${60 + i * 50},400 L${60 + i * 50},406`} t={seg(t, 0.15, 0.3)} w={1} />)}
      <D d={curve} t={k} w={2.6} />
      <circle cx="260" cy="205" r="6" className="fill" style={{ opacity: seg(t, 0.68, 0.74) }} />
      <D d="M260,205 L260,120" t={seg(t, 0.7, 0.8)} w={0.8} o={0.7} />
      <text x="266" y="118" className="lbl" style={{ opacity: seg(t, 0.75, 0.85) }}>1º crack</text>
      <text x="60" y="78" className="lbl" style={{ opacity: seg(t, 0.15, 0.3) }}>Temperatura</text>
      <text x="300" y="428" className="lbl" style={{ opacity: seg(t, 0.15, 0.3) }}>Tempo</text>
    </g>
  );
}

/* ---------- Fig. 05 — Xícara: taza vista desde arriba ---------- */
function Xicara({ t }: { t: number }) {
  let spiral = "M200,260";
  for (let a = 0; a < Math.PI * 8; a += 0.2) { const r = 2 + a * 3.6; spiral += ` L${(200 + Math.cos(a) * r).toFixed(1)},${(260 + Math.sin(a) * r).toFixed(1)}`; }
  return (
    <g>
      <D d="M200,90 a170,170 0 1,0 0.1,0" t={seg(t, 0, 0.3)} w={1} o={0.6} />
      <D d="M200,130 a130,130 0 1,0 0.1,0" t={seg(t, 0.1, 0.4)} w={2} />
      <D d="M200,150 a110,110 0 1,0 0.1,0" t={seg(t, 0.15, 0.45)} w={1} />
      <D d="M328,236 C380,236 380,286 328,286" t={seg(t, 0.3, 0.5)} w={2} />
      <D d={spiral} t={seg(t, 0.4, 0.85)} w={0.9} o={0.8} />
      {[0, 1, 2].map((i) => <D key={i} d={`M${170 + i * 30},120 C${155 + i * 30},90 ${190 + i * 30},70 ${175 + i * 30},40`} t={seg(t, 0.7 + i * 0.05, 0.95)} w={1} o={0.5} cls="steam" />)}
    </g>
  );
}

export const PLATES = [
  { fig: "Fig. 01", cap: "Coffea arabica · ramo com frutos", C: Cultivo },
  { fig: "Fig. 02", cap: "Colheita seletiva · peneira", C: Colheita },
  { fig: "Fig. 03", cap: "Secagem no terreiro", C: Selecao },
  { fig: "Fig. 04", cap: "Curva de torra", C: Torra },
  { fig: "Fig. 05", cap: "Xícara · vista superior", C: Xicara },
];

export default function Plate({ i, t }: { i: number; t: number }) {
  const P = PLATES[i];
  return (
    <svg className="cc-plate" viewBox="0 0 400 500" aria-label={P.cap}>
      <P.C t={t} />
    </svg>
  );
}
