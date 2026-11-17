/* =====================================================================
   Cobalto · datos del concepto y piezas comunes.
   Las fotos van como PNG recortados (sin fondo). Mientras no estén,
   <Cut> muestra un marcador que dice qué PNG falta.
   ===================================================================== */

export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export type Exp = { key: string; name: string; dur: string; price: number; desc: string; when: string };
export const EXPS: Exp[] = [
  { key: "brunch", name: "Brunch & Paint", dur: "2 h", price: 32000, when: "Martes a domingo · 10 a 18 h", desc: "Elegís una pieza, la pintás a tu ritmo y te servimos brunch con café de especialidad." },
  { key: "torno", name: "Torno inicial", dur: "3 h", price: 45000, when: "Sábados · 15 h", desc: "Tu primera vez en el torno, en grupos de seis. Hacés dos piezas y elegís cuál esmaltamos." },
  { key: "noche", name: "Wine & Clay", dur: "2 h 30", price: 38000, when: "Jueves y viernes · 20 h", desc: "Modelado a mano, vino natural y algo para picar. Una noche tranquila con amigos." },
];

/** Recortes (PNG sin fondo). `src: null` = todavía no llegó la foto. */
export type CutImg = { src: string | null; need: string; alt: string; ratio: number };
const img = (src: string, alt: string, ratio: number): CutImg => ({ src, need: "", alt, ratio });
/** Piezas recortadas (PNG sin fondo) que pasó la owner como referencia de estilo. */
export const P = {
  marmol: img("/cobalto/marmol.webp", "Vaso de cerámica marmolada con borde negro", 347 / 477),
  primitiva: img("/cobalto/primitiva.webp", "Vaso de gres oscuro modelado a mano, con esmalte blanco craquelado", 368 / 515),
  tallada: img("/cobalto/tallada.webp", "Vaso tallado a mano con esmalte blanco y barro oscuro", 398 / 403),
  circulos: img("/cobalto/circulos.webp", "Taza de cerámica clara con dos círculos dibujados", 485 / 279),
};
export const CUTS = { heroStack: P.marmol, heroVase: P.tallada, heroCup: P.circulos, heroPlate: P.primitiva, hands: P.marmol, kiln: P.tallada, studio: P.primitiva };
export type Product = { id: string; name: string; price: number; img: CutImg; note: string };
export const SHOP: Product[] = [
  { id: "s1", name: "Vaso Mármol", price: 24000, img: P.marmol, note: "Barro marmolado · tallado kurinuki" },
  { id: "s2", name: "Vaso Primitivo", price: 21000, img: P.primitiva, note: "Gres oscuro · esmalte craquelado" },
  { id: "s3", name: "Vaso Tallado", price: 22000, img: P.tallada, note: "Tallado a mano · esmalte blanco" },
  { id: "s4", name: "Taza Círculos", price: 18000, img: P.circulos, note: "Pellizco · línea a mano" },
];

/** PNG recortado o marcador con la silueta punteada y qué foto falta. */
export function Cut({ img, className = "", eager = false }: { img: CutImg; className?: string; eager?: boolean }) {
  if (img.src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={`cb-cut ${className}`} src={img.src} alt={img.alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
  return (
    <div className={`cb-cut cb-cut--ph ${className}`} style={{ aspectRatio: String(img.ratio) }} role="img" aria-label={`${img.alt} (PNG pendiente)`}>
      <span>PNG</span>
      <small>{img.need}</small>
    </div>
  );
}

/** Sello de la marca: jarra dibujada a mano con una C adentro. */
export function Jug({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 150" fill="none" stroke={color} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M44 18 C43 12 47 9 60 9 C74 9 78 12 76 18 C75 22 70 23 70 28 C70 34 92 44 94 74 C96 104 86 126 78 134 L42 134 C34 126 24 104 26 74 C28 44 50 34 50 28 C50 23 45 22 44 18 Z" />
      <path d="M76 20 C90 18 101 24 100 36 C99 46 90 50 84 52" />
      <path d="M42 136 L78 136 L77 142 L43 142 Z" fill={color} />
      <path d="M71 70 C66 62 52 61 47 72 C42 84 47 98 58 99 C64 100 69 96 71 91" strokeWidth="5" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Logotipo "cobalto" dibujado a mano: muy alto y angosto, palos gruesos
   y curvas finas (alto contraste), con remates en gota.
   ------------------------------------------------------------------ */
type Mark = { k: "stem"; d: string } | { k: "thin"; d: string } | { k: "ball"; cx: number; cy: number };
const WM: { marks: Mark[]; w: number } = (() => {
  const T = 17, B = 286, X = 78, A = 8, W = 58, G = 22;
  const m: Mark[] = [];
  let x = 0;
  const stem = (sx: number, y1: number, y2: number) => m.push({ k: "stem", d: `M${sx},${y1 + 5} L${sx + T},${y1} L${sx + T},${y2} L${sx},${y2} Z` });
  const thin = (d: string) => m.push({ k: "thin", d });
  const ball = (cx: number, cy: number) => m.push({ k: "ball", cx, cy });
  const c = () => { stem(x, X + 24, B - 22); thin(`M${x + 8},${X + 26} C${x + 14},${X - 2} ${x + 44},${X - 4} ${x + W - 4},${X + 18}`); ball(x + W - 6, X + 22); thin(`M${x + 8},${B - 24} C${x + 16},${B + 4} ${x + 46},${B + 2} ${x + W},${B - 26}`); x += W + G - 6; };
  const o = () => { stem(x, X + 24, B - 22); stem(x + W - T, X + 24, B - 22); thin(`M${x + 8},${X + 26} C${x + 14},${X - 4} ${x + W - 14},${X - 4} ${x + W - 8},${X + 26}`); thin(`M${x + 8},${B - 24} C${x + 14},${B + 6} ${x + W - 14},${B + 6} ${x + W - 8},${B - 24}`); x += W + G; };
  const b = () => { stem(x, A, B); stem(x + W - T, X + 30, B - 22); thin(`M${x + T},${X + 40} C${x + 26},${X - 2} ${x + W - 12},${X} ${x + W - 8},${X + 32}`); thin(`M${x + T},${B - 30} C${x + 26},${B + 6} ${x + W - 12},${B + 6} ${x + W - 8},${B - 24}`); x += W + G; };
  const a = () => { stem(x + W - T, X + 22, B); thin(`M${x + 4},${X + 30} C${x + 10},${X - 6} ${x + W - 18},${X - 8} ${x + W - 12},${X + 26}`); ball(x + 8, X + 32); thin(`M${x + W - T},${X + 104} C${x + 2},${X + 112} ${x - 4},${B - 6} ${x + 18},${B - 2} C${x + 30},${B + 2} ${x + W - T - 4},${B - 14} ${x + W - T},${B - 30}`); x += W + G - 4; };
  const l = () => { stem(x, A, B); thin(`M${x + T},${B - 2} C${x + 24},${B} ${x + 30},${B - 4} ${x + 34},${B - 10}`); x += T + G + 10; };
  const t = () => { stem(x + 10, A + 34, B); thin(`M${x - 4},${X + 4} L${x + 44},${X + 4}`); thin(`M${x + 10 + T},${B - 2} C${x + 36},${B} ${x + 42},${B - 4} ${x + 46},${B - 12}`); x += T + G + 26; };
  c(); o(); b(); a(); l(); t(); o();
  return { marks: m, w: x - G };
})();

/** Logotipo de Cobalto (SVG). Escala con el tamaño de letra: alto = 1em × `size`. */
export function Wordmark({ className = "", title = "Cobalto" }: { className?: string; title?: string }) {
  return (
    <svg className={`cb-wm ${className}`} viewBox={`-6 0 ${WM.w + 12} 300`} role="img" aria-label={title} fill="currentColor">
      {WM.marks.map((m, i) =>
        m.k === "stem" ? <path key={i} d={m.d} /> : m.k === "thin" ? <path key={i} d={m.d} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /> : <ellipse key={i} cx={m.cx} cy={m.cy} rx="5.6" ry="7" />,
      )}
    </svg>
  );
}
