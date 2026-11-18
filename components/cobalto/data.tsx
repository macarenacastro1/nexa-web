/* =====================================================================
   Cobalto · datos del concepto y piezas comunes.
   Todas las fotos van como recortes sin fondo (WebP con transparencia).
   ===================================================================== */

export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export type Exp = { key: string; name: string; dur: string; price: number; desc: string; when: string; img: Img };
export type Img = { src: string; alt: string; w: number; h: number };

export const IMG = {
  marmol: { src: "/cobalto/marmol.webp", alt: "Vaso de cerámica marmolada con borde negro", w: 347, h: 477 },
  primitiva: { src: "/cobalto/primitiva.webp", alt: "Vaso de gres oscuro modelado a mano, con esmalte blanco craquelado", w: 368, h: 515 },
  tallada: { src: "/cobalto/tallada.webp", alt: "Vaso tallado a mano con esmalte blanco y barro oscuro", w: 398, h: 403 },
  circulos: { src: "/cobalto/circulos.webp", alt: "Taza de cerámica clara con dos círculos dibujados", w: 485, h: 279 },
  cafe: { src: "/cobalto/cafe.webp", alt: "Siete tazas de cerámica esmaltada con café latte, sobre bloques de madera", w: 425, h: 440 },
} satisfies Record<string, Img>;

export const EXPS: Exp[] = [
  { key: "brunch", name: "Brunch & Paint", dur: "2 h", price: 32000, when: "Martes a domingo · 10 a 18 h", img: IMG.circulos, desc: "Elegís una pieza en bizcocho, la pintás a tu ritmo y te servimos brunch con café de especialidad." },
  { key: "torno", name: "Torno inicial", dur: "3 h", price: 45000, when: "Sábados · 15 h", img: IMG.tallada, desc: "Tu primera vez en el torno, en grupos de seis. Hacés dos piezas y elegís cuál esmaltamos." },
  { key: "noche", name: "Wine & Clay", dur: "2 h 30", price: 38000, when: "Jueves y viernes · 20 h", img: IMG.primitiva, desc: "Modelado a mano, vino natural y algo para picar. Una noche tranquila con amigos." },
];

export type Product = { id: string; name: string; price: number; img: Img; note: string; tint: string };
export const SHOP: Product[] = [
  { id: "s1", name: "Vaso Mármol", price: 24000, img: IMG.marmol, note: "Barro marmolado · tallado kurinuki", tint: "#e3ddd3" },
  { id: "s2", name: "Vaso Primitivo", price: 21000, img: IMG.primitiva, note: "Gres oscuro · esmalte craquelado", tint: "#d9cfc2" },
  { id: "s3", name: "Vaso Tallado", price: 22000, img: IMG.tallada, note: "Tallado a mano · esmalte blanco", tint: "#e7e1d6" },
  { id: "s4", name: "Taza Círculos", price: 18000, img: IMG.circulos, note: "Pellizco · línea a mano", tint: "#ddd6ca" },
];

export function Pic({ img, className = "", eager = false, sizes }: { img: Img; className?: string; eager?: boolean; sizes?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`cb-pic ${className}`} src={img.src} alt={img.alt} width={img.w} height={img.h} loading={eager ? "eager" : "lazy"} decoding="async" {...(sizes ? { sizes } : {})} />;
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

/** Logotipo de Cobalto (SVG). El ancho lo define el CSS. */
export function Wordmark({ className = "", title = "Cobalto" }: { className?: string; title?: string }) {
  return (
    <svg className={`cb-wm ${className}`} viewBox={`-6 0 ${WM.w + 12} 300`} role="img" aria-label={title} fill="currentColor">
      {WM.marks.map((m, i) =>
        m.k === "stem" ? <path key={i} d={m.d} /> : m.k === "thin" ? <path key={i} d={m.d} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /> : <ellipse key={i} cx={m.cx} cy={m.cy} rx="5.6" ry="7" />,
      )}
    </svg>
  );
}

/** Siluetas de vasijas (dibujo propio) para la franja "hecho a mano". */
export const VESSELS = [
  "M20 4h20v8c0 6 14 12 14 34 0 26-10 40-24 40S6 72 6 46c0-22 14-28 14-34z",
  "M24 4h12v14c10 4 18 16 18 34s-10 34-24 34S6 70 6 52s8-30 18-34z",
  "M18 6h24l-2 10c8 6 10 20 10 36 0 20-8 34-20 34S10 72 10 52c0-16 2-30 10-36z",
  "M14 20c0-8 8-14 16-14s16 6 16 14c0 6-6 8-6 14 0 10 14 16 14 32 0 12-10 20-24 20S6 78 6 66c0-16 14-22 14-32 0-6-6-8-6-14z",
  "M22 4h16v6c0 4 6 6 6 14s-6 10-6 16c0 6 16 12 16 28 0 10-10 18-24 18S6 78 6 68c0-16 16-22 16-28 0-6-6-8-6-16s6-10 6-14z",
  "M8 30c0-14 10-24 22-24s22 10 22 24c0 26-10 56-22 56S8 56 8 30z",
];
