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

/* ---------------------------------------------------------------------
   Datos comerciales. Cobalto es una marca ficticia: precios, horarios y
   cupos son de ejemplo para la demo (se aclara en la página).
   --------------------------------------------------------------------- */
export type Exp = {
  key: string; name: string; short: string; kind: "plan" | "taller";
  dur: string; price: number; from?: boolean; when: string; times: string[];
  includes: string[]; booking: string; seats?: string; shape: ShapeKey; desc: string;
};
export const EXPS: Exp[] = [
  { key: "pinta", name: "Pintá & Café", short: "Pintá & Café", kind: "plan", dur: "2 h aprox.", price: 18000, from: true, when: "Martes a domingo · 10 a 19 h", times: ["10:00", "12:00", "14:00", "16:00", "17:30"],
    includes: ["Una pieza a elección", "Pinturas, pinceles y delantal", "Un café o bebida", "Horneado y esmaltado"], booking: "Recomendada (también podés venir sin reserva si hay lugar)", shape: "cup",
    desc: "Elegís una pieza de cerámica, la pintás mientras disfrutás de un café y nosotros nos encargamos del horneado." },
  { key: "brunch", name: "Brunch & Paint", short: "Brunch & Paint", kind: "plan", dur: "2 h 30", price: 32000, when: "Sábados y domingos · 10 y 13 h", times: ["10:00", "13:00"],
    includes: ["Una pieza a elección", "Brunch para una persona (bebida caliente, jugo, tostado y algo dulce)", "Materiales y horneado"], booking: "Necesaria", seats: "Hasta 12 personas por turno", shape: "bowl",
    desc: "Una experiencia que combina cerámica, café y algo rico para compartir." },
  { key: "torno", name: "Torno Inicial", short: "Torno Inicial", kind: "taller", dur: "3 h", price: 45000, when: "Sábados · 15 h", times: ["15:00"],
    includes: ["Uso del torno y barro", "Dos piezas por persona", "Esmaltado y horneado de una pieza"], booking: "Necesaria", seats: "6 lugares por clase", shape: "vase",
    desc: "Tu primera vez en el torno. Aprendés a centrar el barro y levantar tus primeras piezas." },
  { key: "noche", name: "Wine & Clay", short: "Wine & Clay", kind: "taller", dur: "2 h 30", price: 38000, when: "Jueves y viernes · 20 h", times: ["20:00"],
    includes: ["Modelado a mano", "Dos copas de vino natural", "Algo para picar", "Horneado de tu pieza"], booking: "Necesaria", seats: "10 lugares por noche", shape: "bottle",
    desc: "Modelado a mano, vino natural y algo para picar. Una noche tranquila para crear con amigos." },
];
export const PICKUP = "Tu pieza está lista para retirar a los 7 días (ejemplo).";

export type Product = { id: string; name: string; price: number; shape: ShapeKey; fg: string; bg: string; note: string; stock: number };
export const SHOP: Product[] = [
  { id: "p1", name: "Compotera", price: 26000, shape: "bowl", fg: C.wine, bg: C.blue, note: "Gres esmaltado · 22 cm", stock: 3 },
  { id: "p2", name: "Botella alta", price: 24000, shape: "bottle", fg: C.blue, bg: C.olive, note: "Para agua o flores · 28 cm", stock: 5 },
  { id: "p3", name: "Taza", price: 16000, shape: "cup", fg: C.rust, bg: C.tan, note: "300 ml · apta lavavajillas", stock: 12 },
  { id: "p4", name: "Florero bajo", price: 22000, shape: "vase", fg: C.tan, bg: C.wine, note: "Esmalte arena · 16 cm", stock: 0 },
  { id: "p5", name: "Vaso", price: 14000, shape: "tumbler", fg: C.cream, bg: C.rust, note: "250 ml · terminación mate", stock: 8 },
  { id: "p6", name: "Jarra", price: 29000, shape: "jug", fg: C.olive, bg: C.blue, note: "1 litro · pico vertedor", stock: 2 },
];

export type MenuItem = { name: string; price: number; desc?: string };
export const MENU_TOP: (MenuItem & { icon: "cup" | "croissant" | "toast" | "cake" })[] = [
  { name: "Flat white", price: 4200, desc: "Café de especialidad con leche texturizada.", icon: "cup" },
  { name: "Medialuna de manteca", price: 2400, desc: "Hojaldrada, del día.", icon: "croissant" },
  { name: "Tostado de masa madre", price: 7800, desc: "Jamón cocido natural y queso.", icon: "toast" },
  { name: "Budín de limón", price: 3600, desc: "Con glaseado de limón.", icon: "cake" },
];
export const MENU_FULL: { group: string; items: MenuItem[] }[] = [
  { group: "Café", items: [{ name: "Espresso", price: 3000 }, { name: "Flat white", price: 4200 }, { name: "Latte", price: 4400 }, { name: "Filtrado del día", price: 3800 }] },
  { group: "Otras bebidas", items: [{ name: "Té en hebras", price: 3400 }, { name: "Chocolate caliente", price: 4600 }, { name: "Limonada", price: 4000 }] },
  { group: "Dulce", items: [{ name: "Medialuna de manteca", price: 2400 }, { name: "Budín de limón", price: 3600 }, { name: "Cookie de chocolate", price: 3200 }] },
  { group: "Salado", items: [{ name: "Tostado de masa madre", price: 7800 }, { name: "Tostada con palta", price: 8600 }] },
];
