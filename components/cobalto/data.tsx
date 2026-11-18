/* =====================================================================
   Cobalto · datos del concepto y dibujos.
   Nada de fotos: solo siluetas planas dibujadas, con borde irregular.
   ===================================================================== */

export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/** Paleta tomada de las referencias. */
export const C = {
  olive: "#5b4318", blue: "#a9bfcb", wine: "#4a1117", rust: "#8a451b", tan: "#cfb183", cream: "#e4e1b8", light: "#efecd0",
} as const;

export type ShapeKey = "bowl" | "bottle" | "cup" | "vase" | "tumbler" | "jug";

/** Siluetas en un lienzo de 100 × 100. La taza y la jarra llevan asa como trazo. */
const PATHS: Record<ShapeKey, { d: string; handle?: string }> = {
  bowl: { d: "M6 34 C30 30 70 30 94 34 C90 50 74 58 58 60 L58 68 C66 70 72 74 74 80 L26 80 C28 74 34 70 42 68 L42 60 C26 58 10 50 6 34Z" },
  bottle: { d: "M44 6 L56 6 L56 12 C58 14 58 18 55 20 L55 30 C64 36 66 44 66 54 L66 86 C56 92 44 92 34 86 L34 54 C34 44 36 36 45 30 L45 20 C42 18 42 14 44 12Z" },
  cup: { d: "M18 34 C40 31 60 31 76 34 C78 52 76 66 68 76 C56 82 38 82 28 76 C20 66 17 52 18 34Z", handle: "M76 44 C92 42 94 62 72 64" },
  vase: { d: "M38 14 L62 14 L60 24 C78 32 84 44 82 58 C80 76 66 84 50 84 C34 84 20 76 18 58 C16 44 22 32 40 24Z" },
  tumbler: { d: "M24 20 C42 17 58 17 76 20 L70 82 C56 87 44 87 30 82Z" },
  jug: { d: "M36 12 C44 10 56 10 64 12 L62 22 C74 30 78 46 76 62 C74 76 64 84 50 84 C36 84 26 76 24 62 C22 46 26 30 38 22 L36 16Z M36 12 L28 8 L36 18Z", handle: "M70 32 C88 30 90 56 74 60" },
};

export function Shape({ k, color, className = "", title }: { k: ShapeKey; color: string; className?: string; title?: string }) {
  const p = PATHS[k];
  return (
    <svg className={`cb-shape ${className}`} viewBox="0 0 100 100" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g filter="url(#cb-rough)" fill={color}>
        <path d={p.d} />
        {p.handle && <path d={p.handle} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />}
      </g>
    </svg>
  );
}

/** Filtro que vuelve irregular el borde de los dibujos (como recortados a mano). */
export function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="cb-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" />
      </filter>
    </svg>
  );
}

export type Exp = { key: string; name: string; dur: string; price: number; desc: string; when: string; shape: ShapeKey };
export const EXPS: Exp[] = [
  { key: "brunch", name: "Brunch & Paint", dur: "2 h", price: 32000, when: "Martes a domingo · 10 a 18 h", shape: "cup", desc: "Elegís una pieza, la pintás a tu ritmo y te servimos brunch con café de especialidad." },
  { key: "torno", name: "Torno inicial", dur: "3 h", price: 45000, when: "Sábados · 15 h", shape: "bowl", desc: "Tu primera vez en el torno, en grupos de seis. Hacés dos piezas y elegís cuál esmaltamos." },
  { key: "noche", name: "Wine & Clay", dur: "2 h 30", price: 38000, when: "Jueves y viernes · 20 h", shape: "bottle", desc: "Modelado a mano, vino natural y algo para picar. Una noche tranquila con amigos." },
];

export type Product = { id: string; name: string; price: number; shape: ShapeKey; fg: string; bg: string };
/** Ocho piezas para la grilla de 3 × 3 (el centro es el sello de la marca). */
export const SHOP: Product[] = [
  { id: "p1", name: "Compotera", price: 26000, shape: "bowl", fg: C.wine, bg: C.blue },
  { id: "p2", name: "Botella alta", price: 24000, shape: "bottle", fg: C.blue, bg: C.olive },
  { id: "p3", name: "Taza", price: 16000, shape: "cup", fg: C.rust, bg: C.tan },
  { id: "p4", name: "Florero bajo", price: 22000, shape: "vase", fg: C.rust, bg: C.wine },
  { id: "p5", name: "Botella", price: 24000, shape: "bottle", fg: C.blue, bg: C.rust },
  { id: "p6", name: "Taza ancha", price: 17000, shape: "cup", fg: C.cream, bg: C.olive },
  { id: "p7", name: "Cuenco", price: 21000, shape: "bowl", fg: C.olive, bg: C.blue },
  { id: "p8", name: "Jarrón", price: 28000, shape: "vase", fg: C.tan, bg: C.wine },
];
