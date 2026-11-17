/* =====================================================================
   Cobalto · siluetas de cerámica dibujadas a mano en código.
   Perfiles simétricos suavizados (Catmull-Rom → Bézier) + textura
   moteada de gres. Nada de fotos: estética editorial plana.
   ===================================================================== */
type Pt = [number, number]; // [y 0..1 desde el borde, medio ancho en px]

function smooth(points: { x: number; y: number }[]) {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!, p1 = points[i]!, p2 = points[i + 1]!, p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Silueta de una pieza torneada: perfil derecho suavizado y espejado. */
export function vessel(profile: Pt[], cx: number, base: number, h: number) {
  const right = profile.map(([y, w]) => ({ x: cx + w, y: base - h + y * h }));
  const left = [...profile].reverse().map(([y, w]) => ({ x: cx - w, y: base - h + y * h }));
  return `M${right[0]!.x},${right[0]!.y}${smooth(right)} L${left[0]!.x},${left[0]!.y}${smooth(left)} Z`;
}

/** Perfiles de piezas (forma, no tamaño). */
export const PROFILES: Record<string, Pt[]> = {
  amphora: [[0, 15], [0.08, 13], [0.2, 15], [0.45, 42], [0.7, 38], [0.9, 20], [1, 19]],
  jug: [[0, 22], [0.12, 20], [0.3, 27], [0.62, 40], [0.88, 34], [1, 26]],
  bottle: [[0, 7], [0.25, 8], [0.42, 22], [0.62, 34], [0.86, 33], [1, 26]],
  bowl: [[0, 58], [0.4, 52], [0.75, 34], [1, 22]],
  vase: [[0, 20], [0.1, 16], [0.3, 30], [0.6, 44], [0.85, 36], [1, 22]],
  tall: [[0, 13], [0.15, 11], [0.55, 24], [0.85, 26], [1, 20]],
  cup: [[0, 30], [0.5, 29], [0.85, 25], [1, 21]],
  mug: [[0, 34], [0.6, 34], [0.92, 33], [1, 30]],
  pot: [[0, 22], [0.2, 24], [0.75, 23], [1, 20]],
  jar: [[0, 30], [0.08, 32], [0.9, 32], [1, 30]],
};

/** Textura moteada de gres + trazo de pincel; se monta una vez por página. */
export function Defs() {
  // puntos pseudoaleatorios fijos (sin Math.random para que el server y el cliente coincidan)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = Array.from({ length: 70 }, () => ({ x: rnd() * 90, y: rnd() * 90, r: 0.4 + rnd() * 1.1, o: 0.25 + rnd() * 0.5 }));
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <pattern id="cb-speck" width="90" height="90" patternUnits="userSpaceOnUse">
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#5a4636" opacity={d.o} />)}
        </pattern>
        <pattern id="cb-speck-light" width="90" height="90" patternUnits="userSpaceOnUse">
          {dots.map((d, i) => <circle key={i} cx={(d.x + 40) % 90} cy={(d.y + 25) % 90} r={d.r * 0.9} fill="#f3eadb" opacity={d.o * 0.6} />)}
        </pattern>
        <filter id="cb-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="11" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="22" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.4" />
        </filter>
        <filter id="cb-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
    </svg>
  );
}

/** Pieza suelta (tienda, galerías). tone: color de base; pattern: dibujo pintado. */
export function Piece({ kind, tone = "#f7f1e6", pattern, handle, size = 160, label }: {
  kind: keyof typeof PROFILES; tone?: string; pattern?: "dots" | "stripes" | "waves" | "flower" | "reactive" | "reactive2" | "dip" | "pool" | null; handle?: "left" | "right" | "both"; size?: number; label?: string;
}) {
  const W = 140, H = 170, base = 160, h = kind === "bowl" ? 70 : kind === "cup" || kind === "mug" ? 85 : 140;
  const d = vessel(PROFILES[kind]!, W / 2, base, h);
  const light = ["#f7f1e6", "#ffffff", "#f4ede1", "#e7dccb"].includes(tone);
  const id = `clip-${kind}-${tone.replace("#", "")}-${pattern ?? "n"}`;
  const top = base - h;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <clipPath id={id}><path d={d} /></clipPath>
      {handle && (handle === "right" || handle === "both") && <path d={`M${W / 2 + 28},${top + h * 0.22} c26,4 28,${h * 0.42} 0,${h * 0.5}`} fill="none" stroke={light ? "#e2d5c1" : tone} strokeWidth={8} strokeLinecap="round" />}
      {handle && (handle === "left" || handle === "both") && <path d={`M${W / 2 - 28},${top + h * 0.22} c-26,4 -28,${h * 0.42} 0,${h * 0.5}`} fill="none" stroke={light ? "#e2d5c1" : tone} strokeWidth={8} strokeLinecap="round" />}
      <path d={d} fill={tone} />
      <g clipPath={`url(#${id})`}>
        <rect width={W} height={H} fill={light ? "url(#cb-speck)" : "url(#cb-speck-light)"} />
        {pattern === "dots" && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={20 + (i % 6) * 20 + (Math.floor(i / 6) % 2) * 10} cy={top + 30 + Math.floor(i / 6) * 28} r={5} fill="#a5552a" />)}
        {pattern === "stripes" && [0, 1, 2, 3].map((i) => <rect key={i} x={0} y={top + 20 + i * 26} width={W} height={8} fill="#5f7f96" />)}
        {pattern === "waves" && [0, 1, 2].map((i) => <path key={i} d={`M0,${top + 40 + i * 30} q17,-12 35,0 t35,0 t35,0 t35,0`} fill="none" stroke="#5f7f96" strokeWidth="5" />)}
        {light && pattern && <rect x="0" y={top - 2} width={W} height="7" fill="#6b3a1c" opacity=".55" filter="url(#cb-soft)" />}
        {/* esmaltes reactivos, inmersión y charco: como las tazas de referencia */}
        {(pattern === "reactive" || pattern === "reactive2") && (
          <g filter="url(#cb-soft)">
            {(pattern === "reactive"
              ? [[28, .28, 20, "#8a4a22"], [44, .4, 14, "#6b3a1c"], [96, .22, 15, "#a5552a"], [104, .42, 10, "#c08a45"], [64, .6, 24, "#7a4220"], [30, .78, 16, "#a5552a"], [102, .74, 19, "#5f7f96"], [78, .86, 9, "#8a4a22"]]
              : [[36, .3, 26, "#5f7f96"], [62, .42, 18, "#7d98a9"], [100, .38, 22, "#6f8ca0"], [48, .7, 18, "#a5552a"], [96, .72, 15, "#8a4a22"], [70, .86, 10, "#a5552a"]]).map(([x, y, r, c], i) => (
              <circle key={i} cx={x as number} cy={top + (y as number) * h} r={r as number} fill={c as string} opacity=".9" />
            ))}
          </g>
        )}
        {pattern === "dip" && <path d={`M0,${top + h * 0.58} C30,${top + h * 0.5} 50,${top + h * 0.72} 80,${top + h * 0.6} S120,${top + h * 0.48} 140,${top + h * 0.55} V${H} H0 Z`} fill="#8a4a22" filter="url(#cb-soft)" />}
        {pattern === "pool" && <ellipse cx={W / 2} cy={top + h * 0.35} rx={W * 0.32} ry={h * 0.32} fill="#5f7f96" opacity=".9" filter="url(#cb-soft)" />}
        {pattern === "flower" && <g transform={`translate(${W / 2} ${top + h * 0.5})`}>{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} rx="7" ry="16" cy="-14" fill="#a5552a" transform={`rotate(${a})`} />)}<circle r="7" fill="#c99a4a" /></g>}
      </g>
    </svg>
  );
}
