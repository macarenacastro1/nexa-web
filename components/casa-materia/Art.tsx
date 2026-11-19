import { useId } from "react";

/* Casa Materia · lenguaje gráfico de papel recortado.
   - Cut: tarjeta de papel crema con una silueta calada (el hueco deja ver lo que hay detrás).
   - Scrap: recorte de papel de color (o con textura) con una silueta de papel crema pegada encima.
   - Land: paisaje hecho de capas de papel, para usar de fondo.
   Todo es vectorial y propio; los bordes irregulares salen de un filtro de turbulencia. */

type Sh = { d: string; s?: number }[];
export const SIL: Record<string, Sh> = {
  amphora: [{ d: "M40 8h20v5h-3v10H43V13h-3z" }, { d: "M43 22c-12 4-17 12-17 24 0 18 11 36 24 38 13-2 24-20 24-38 0-12-5-20-17-24z" }, { d: "M43 27c-10-3-17 4-14 15", s: 4 }, { d: "M57 27c10-3 17 4 14 15", s: 4 }],
  bowls: [{ d: "M24 38h52c0 14-11 22-26 22S24 52 24 38z" }, { d: "M16 64h68c0 15-15 25-34 25S16 79 16 64z" }],
  jug: [{ d: "M46 8h8v14c0 4 6 6 6 10v6c8 6 12 16 12 28 0 16-10 26-22 26S28 82 28 66c0-12 4-22 12-28v-6c0-4 6-6 6-10z" }, { d: "M59 31c11 0 13 13 4 19", s: 4 }],
  pitcher: [{ d: "M32 20h32l7-6 4 4-6 8c2 10 6 24 6 40 0 14-10 22-22 22S30 80 30 66c0-16 4-28 2-38z" }, { d: "M33 34c-15 0-15 26 0 26", s: 5 }],
  bulbs: [{ d: "M38 8h24v8c10 4 12 14 4 22 10 6 10 16 2 22 8 6 8 18-6 28H38c-14-10-14-22-6-28-8-6-8-16 2-22-8-8-6-18 4-22z" }],
  urn: [{ d: "M41 12h18v7c10 6 18 18 18 32 0 14-10 24-21 26v6h8v7H36v-7h8v-6C33 75 23 65 23 51c0-14 8-26 18-32z" }, { d: "M40 25c-15-7-23 6-15 19", s: 4 }, { d: "M60 25c15-7 23 6 15 19", s: 4 }],
  vase: [{ d: "M44 8h12v10c0 6 14 12 14 34 0 22-8 38-20 38S30 74 30 52c0-22 14-28 14-34z" }],
  cup: [{ d: "M26 32h42v22c0 14-10 22-21 22S26 68 26 54z" }, { d: "M68 39c13 0 13 19 0 19", s: 5 }, { d: "M14 80h70c0 5-8 9-35 9S14 85 14 80z" }],
  glass: [{ d: "M32 8h36c0 28-8 42-18 44-10-2-18-16-18-44z" }, { d: "M48 50h4v32h-4z" }, { d: "M33 82h34v7H33z" }],
  bottle: [{ d: "M45 4h10v24c0 6 11 10 11 20v46H34V48c0-10 11-14 11-20z" }],
  chair: [{ d: "M36 6c-6 0-9 7-9 16v30h46V22c0-9-3-16-9-16z" }, { d: "M23 52h54v9H23z" }, { d: "M27 61h7v33h-7zM66 61h7v33h-7z" }],
  table: [{ d: "M8 34c0-7 21-9 42-9s42 2 42 9-21 11-42 11S8 41 8 34z" }, { d: "M20 42h8v42h-8zM72 42h8v42h-8z" }],
  bench: [{ d: "M4 40h92v10H4z" }, { d: "M10 50h8v34h-8zM82 50h8v34h-8z" }],
  stool: [{ d: "M26 28h48c0 6-4 9-24 9s-24-3-24-9z" }, { d: "M33 37h7l-6 54h-7zM60 37h7l7 54h-7z" }, { d: "M33 64h34v5H33z" }],
  lamp: [{ d: "M30 12h40l13 32H17z" }, { d: "M46 44h8v34h-8z" }, { d: "M30 78h40v9H30z" }],
  pebble: [{ d: "M50 10c22 0 34 16 32 38-2 24-18 42-36 42S16 72 18 48c2-22 10-38 32-38z" }],
  flower: [{ d: "M50 16c9 0 11 12 6 21 9-5 21-3 21 6s-12 11-21 6c5 9 3 21-6 21s-11-12-6-21c-9 5-21 3-21-6s12-11 21-6c-5-9-3-21 6-21z" }, { d: "M50 70v18", s: 4 }],
  yarn: [{ d: "M48 16a30 30 0 1 1 0 60a30 30 0 1 1 0-60z" }, { d: "M68 68l22 22", s: 4 }, { d: "M20 84c10-8 20-6 26-12", s: 3 }],
  pasta: [{ d: "M12 30c17 0 27 10 31 16 3-2 11-2 14 0 4-6 14-16 31-16v40c-17 0-27-10-31-16-3 2-11 2-14 0-4 6-14 16-31 16z" }],
  wheel: [{ d: "M10 78c0-7 18-11 40-11s40 4 40 11-18 11-40 11-40-4-40-11z" }, { d: "M35 68c-3-15 4-30 9-36h12c5 6 12 21 9 36z" }],
  leaf: [{ d: "M50 92C48 70 50 40 52 10c22 8 34 30 30 52-4 18-18 26-32 30z" }, { d: "M50 92c-14-6-30-20-30-40 0-16 12-32 32-42", s: 0 }],
};

const PAPER: Record<string, string> = {
  wine: "#7a2230", brown: "#4a2420", navy: "#2f4a73", clay: "#b5532f", olive: "#4f5b3a", ochre: "#c99a5b",
  rose: "#e3b8a0", sand: "#dcc8aa", stone: "#cfc2ad", night: "#2a241d", cream: "#f6efe2",
};
const CREAM = "#f8f2e6";

export function Shape({ k, color = CREAM, x = 0, y = 0, size = 100, rotate = 0 }: { k: string; color?: string; x?: number; y?: number; size?: number; rotate?: number }) {
  const sh = SIL[k] ?? SIL.vase!;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${size / 100})`} fill={color} stroke={color}>
      {sh.map((p, i) => p.s != null ? (p.s > 0 ? <path key={i} d={p.d} fill="none" strokeWidth={p.s} strokeLinecap="round" /> : null) : <path key={i} d={p.d} stroke="none" />)}
    </g>
  );
}

/** Filtros compartidos: borde cortado a mano y grano de papel. */
function Defs({ id, seed = 3, edge = 2.6 }: { id: string; seed?: number; edge?: number }) {
  return (
    <defs>
      <filter id={`${id}r`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={edge} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}g`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 7} />
        <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.11  0 0 0 0 0.08  0 0 0 0.55 -0.12" />
      </filter>
      <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".16" />
        <stop offset=".48" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#000" stopOpacity=".12" />
        <stop offset=".53" stopColor="#fff" stopOpacity=".06" />
        <stop offset="1" stopColor="#000" stopOpacity=".1" />
      </linearGradient>
      <pattern id={`${id}ck`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="16" height="16" fill="#efe6d4" />
        <rect width="8" height="8" fill="#1f1b17" />
        <rect x="8" y="8" width="8" height="8" fill="#1f1b17" />
      </pattern>
      <pattern id={`${id}wd`} width="22" height="40" patternUnits="userSpaceOnUse">
        <rect width="22" height="40" fill="#a8774d" />
        <rect x="11" width="11" height="40" fill="#9a6b43" />
        <path d="M0 0v40M11 0v40" stroke="#6f4a2c" strokeWidth=".8" opacity=".6" />
      </pattern>
    </defs>
  );
}

/** Relleno de un recorte: papel liso con pliegue, damero, madera o yeso. */
function Fill({ id, tex, paper, w, h }: { id: string; tex: string; paper: string; w: number; h: number }) {
  if (tex === "checker") return <rect width={w} height={h} fill={`url(#${id}ck)`} />;
  if (tex === "wood") return <rect width={w} height={h} fill={`url(#${id}wd)`} />;
  if (tex === "plaster")
    return (
      <>
        <rect width={w} height={h} fill={PAPER[paper] ?? paper} />
        <path d={`M0 ${h * 0.62}C${w * 0.3} ${h * 0.55} ${w * 0.6} ${h * 0.7} ${w} ${h * 0.6}V${h}H0z`} fill="#000" opacity=".07" />
        <path d={`M${w * 0.15} 0v${h}M${w * 0.85} 0v${h}`} stroke="#000" strokeOpacity=".06" strokeWidth="5" />
      </>
    );
  return (
    <>
      <rect width={w} height={h} fill={PAPER[paper] ?? paper} />
      <rect width={w} height={h} fill={`url(#${id}f)`} />
    </>
  );
}

/** Recorte de papel con una silueta crema pegada encima (estilo collage). */
export function Scrap({ s, paper = "clay", tex = "paper", w = 100, h = 125, size, seed = 3, extra, className }: { s: string; paper?: string; tex?: string; w?: number; h?: number; size?: number; seed?: number; extra?: { s: string; x: number; y: number; size: number; color?: string }[]; className?: string }) {
  const id = useId().replace(/:/g, "");
  const sz = size ?? Math.min(w, h) * 0.74;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden overflow="visible">
      <Defs id={id} seed={seed} />
      <g filter={`url(#${id}r)`}>
        <Fill id={id} tex={tex} paper={paper} w={w} h={h} />
        <rect width={w} height={h} filter={`url(#${id}g)`} opacity=".9" />
      </g>
      <g filter={`url(#${id}r)`}>
        <Shape k={s} x={(w - sz) / 2} y={(h - sz) / 2 + sz * 0.02} size={sz} />
        {extra?.map((e, i) => <Shape key={i} k={e.s} x={e.x} y={e.y} size={e.size} color={e.color} />)}
      </g>
    </svg>
  );
}

/** Tarjeta de papel crema con la silueta calada: el hueco deja ver el fondo. */
export function Cut({ s, w = 100, h = 128, seed = 5, className }: { s: string; w?: number; h?: number; seed?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const sz = Math.min(w, h) * 0.78;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden overflow="visible">
      <Defs id={id} seed={seed} edge={3.2} />
      <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-10" y="-10" width={w + 20} height={h + 20}>
        <rect x="2" y="2" width={w - 4} height={h - 4} fill="#fff" />
        <Shape k={s} color="#000" x={(w - sz) / 2} y={(h - sz) / 2} size={sz} />
      </mask>
      <g filter={`url(#${id}r)`}>
        <g mask={`url(#${id}m)`}>
          <rect width={w} height={h} fill={CREAM} />
          <rect width={w} height={h} filter={`url(#${id}g)`} opacity=".5" />
        </g>
      </g>
    </svg>
  );
}

/** Paisaje en capas de papel (cielo, sierras y pasto) para usar de fondo. */
export function Land({ className, tone = "day" }: { className?: string; tone?: "day" | "dusk" }) {
  const id = useId().replace(/:/g, "");
  const sky = tone === "day" ? ["#2c3d55", "#5c7590", "#b9b5a6"] : ["#2a1f2c", "#7a3e3a", "#d9935e"];
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset=".45" stopColor={sky[1]} />
          <stop offset=".62" stopColor={sky[2]} />
        </linearGradient>
        <filter id={`${id}c`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="4" seed="8" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.55" />
        </filter>
        <filter id={`${id}e`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="38" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}g`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="2" />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0.6 -0.15" />
        </filter>
        <filter id={`${id}t`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.18" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.3  0 0 0 0 0.12  0 0 0 1.4 -0.7" />
        </filter>
      </defs>
      <rect width="800" height="600" fill={`url(#${id}s)`} />
      <rect width="800" height="330" filter={`url(#${id}c)`} opacity=".42" />
      <g filter={`url(#${id}e)`}>
        <path d="M-40 360C60 330 120 300 200 318s150-40 230-30 130 50 210 30 140-20 200 0V600H-40z" fill="#c9b591" />
        <path d="M-40 392C80 372 150 340 260 360s170 10 250-6 180 30 330 18V600H-40z" fill="#e1d1b0" />
        <path d="M-40 420C120 410 220 386 330 400s230 20 300 6 120-6 210 2V600H-40z" fill="#b39a74" />
      </g>
      <path d="M-20 440C150 430 300 446 420 438s260-6 400 4V600H-20z" fill="#6b7442" filter={`url(#${id}e)`} />
      <rect y="430" width="800" height="170" filter={`url(#${id}t)`} />
      <rect width="800" height="600" filter={`url(#${id}g)`} opacity=".5" />
    </svg>
  );
}

/* ---------- composiciones con nombre, para la página ---------- */
export type ArtKey = "hero" | "cafe" | "vino" | "workshop" | "torno" | "manana" | "tarde" | "noche" | "tiles" | "lampara" | "crochet" | "pasta";

const SPEC: Record<ArtKey, { s: string; paper?: string; tex?: string; seed?: number }> = {
  hero: { s: "urn", paper: "navy" },
  cafe: { s: "cup", tex: "plaster", paper: "sand", seed: 4 },
  manana: { s: "cup", tex: "plaster", paper: "sand", seed: 4 },
  vino: { s: "glass", paper: "wine", seed: 6 },
  noche: { s: "bottle", paper: "navy", seed: 9 },
  tarde: { s: "pitcher", paper: "clay", seed: 2 },
  workshop: { s: "flower", paper: "olive", seed: 12 },
  torno: { s: "wheel", tex: "wood", seed: 7 },
  tiles: { s: "flower", paper: "clay", seed: 13 },
  lampara: { s: "lamp", paper: "navy", seed: 14 },
  crochet: { s: "yarn", paper: "rose", seed: 15 },
  pasta: { s: "pasta", paper: "ochre", seed: 16 },
};

export default function Art({ k, className, w = 100, h = 125 }: { k: ArtKey; className?: string; w?: number; h?: number }) {
  const sp = SPEC[k];
  return <Scrap s={sp.s} paper={sp.paper} tex={sp.tex} seed={sp.seed} w={w} h={h} className={className} />;
}
