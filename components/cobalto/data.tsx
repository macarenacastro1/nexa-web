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
const cut = (need: string, alt: string, ratio = 1): CutImg => ({ src: null, need, alt, ratio });
export const CUTS = {
  heroStack: cut("Bowls o tazas apiladas", "Bowls de cerámica apilados", 1),
  heroVase: cut("Jarrón o ánfora", "Jarrón de cerámica", 0.8),
  heroPlate: cut("Plato visto desde arriba", "Plato de cerámica", 1),
  heroCup: cut("Taza con esmalte", "Taza de cerámica esmaltada", 1),
  hands: cut("Manos pintando una pieza", "Manos pintando una taza", 1.25),
  brunch: cut("Café y croissant", "Café y croissant", 1.2),
  kiln: cut("Piezas recién horneadas", "Piezas recién salidas del horno", 1.1),
  studio: cut("Estante con piezas", "Estante del estudio con piezas", 1.4),
};
export type Product = { id: string; name: string; price: number; img: CutImg };
export const SHOP: Product[] = [
  { id: "s1", name: "Jarra Barro", price: 36000, img: cut("Jarra", "Jarra de cerámica", 0.85) },
  { id: "s2", name: "Bowl Oliva", price: 18000, img: cut("Bowl", "Bowl de cerámica", 1.3) },
  { id: "s3", name: "Taza Lunes", price: 9500, img: cut("Taza", "Taza de cerámica", 1) },
  { id: "s4", name: "Ánfora Tierra", price: 48000, img: cut("Ánfora", "Ánfora de cerámica", 0.75) },
  { id: "s5", name: "Plato Hondo", price: 14000, img: cut("Plato", "Plato de cerámica", 1.3) },
  { id: "s6", name: "Vaso Raku", price: 8500, img: cut("Vaso", "Vaso de cerámica", 0.85) },
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
