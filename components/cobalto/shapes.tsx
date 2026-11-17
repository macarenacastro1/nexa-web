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
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#3a342c" opacity={d.o} />)}
        </pattern>
        <pattern id="cb-speck-light" width="90" height="90" patternUnits="userSpaceOnUse">
          {dots.map((d, i) => <circle key={i} cx={(d.x + 40) % 90} cy={(d.y + 25) % 90} r={d.r * 0.9} fill="#f3eadb" opacity={d.o * 0.6} />)}
        </pattern>
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
  kind: keyof typeof PROFILES; tone?: string; pattern?: "dots" | "stripes" | "waves" | "flower" | null; handle?: "left" | "right" | "both"; size?: number; label?: string;
}) {
  const W = 140, H = 170, base = 160, h = kind === "bowl" ? 70 : kind === "cup" || kind === "mug" ? 85 : 140;
  const d = vessel(PROFILES[kind]!, W / 2, base, h);
  const light = tone === "#f7f1e6" || tone === "#ffffff";
  const id = `clip-${kind}-${tone.replace("#", "")}-${pattern ?? "n"}`;
  const top = base - h;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <clipPath id={id}><path d={d} /></clipPath>
      {handle && (handle === "right" || handle === "both") && <path d={`M${W / 2 + 28},${top + h * 0.22} c26,4 28,${h * 0.42} 0,${h * 0.5}`} fill="none" stroke={light ? "#2a2622" : tone} strokeWidth={light ? 7 : 8} strokeLinecap="round" />}
      {handle && (handle === "left" || handle === "both") && <path d={`M${W / 2 - 28},${top + h * 0.22} c-26,4 -28,${h * 0.42} 0,${h * 0.5}`} fill="none" stroke={light ? "#2a2622" : tone} strokeWidth={light ? 7 : 8} strokeLinecap="round" />}
      <path d={d} fill={tone} stroke={light ? "#2a2622" : "none"} strokeWidth={light ? 1.6 : 0} />
      <g clipPath={`url(#${id})`}>
        <rect width={W} height={H} fill={light ? "url(#cb-speck)" : "url(#cb-speck-light)"} />
        {pattern === "dots" && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={20 + (i % 6) * 20 + (Math.floor(i / 6) % 2) * 10} cy={top + 30 + Math.floor(i / 6) * 28} r={5} fill="#e5482f" />)}
        {pattern === "stripes" && [0, 1, 2, 3].map((i) => <rect key={i} x={0} y={top + 20 + i * 26} width={W} height={8} fill="#1d3fbf" />)}
        {pattern === "waves" && [0, 1, 2].map((i) => <path key={i} d={`M0,${top + 40 + i * 30} q17,-12 35,0 t35,0 t35,0 t35,0`} fill="none" stroke="#1d3fbf" strokeWidth="5" />)}
        {pattern === "flower" && <g transform={`translate(${W / 2} ${top + h * 0.5})`}>{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} rx="7" ry="16" cy="-14" fill="#e5482f" transform={`rotate(${a})`} />)}<circle r="7" fill="#f2b632" /></g>}
      </g>
    </svg>
  );
}
