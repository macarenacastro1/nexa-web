/* Ilustraciones vectoriales de Casa Materia: naturalezas muertas planas en la paleta de la casa.
   Cada escena se dibuja en un viewBox 400×500 y se recorta con la forma del contenedor. */

const P = { cream: "#f4efe6", sand: "#e9dfcf", stone: "#d9ccb6", clay: "#b5532f", clayD: "#8f3f22", ochre: "#c99a5b", leaf: "#4f5b3a", leafL: "#6f7d52", ink: "#231d17", night: "#2a241d", rose: "#e3b8a0" };

function Monstera({ x, y, s = 1, r = 0, c = P.leaf }: { x: number; y: number; s?: number; r?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C-4-40-2-80 4-120" stroke={c} strokeWidth="3" fill="none" />
      <path d="M4-120c-46-6-80 26-74 70 10 20 30 30 52 28 6-12 14-30 22-44-8 16-12 30-14 44 22 2 44-6 60-24 18-28 4-70-46-74z" fill={c} />
      <path d="M-36-80l18 10M-46-58l22 6M30-92l-16 12M44-66l-22 6" stroke={P.cream} strokeWidth="5" strokeLinecap="round" opacity=".9" />
    </g>
  );
}
function Palm({ x, y, s = 1, c = P.leafL }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
      <path d="M0 0C2-60 6-120 10-170" stroke={c} strokeWidth="3" fill="none" />
      {[-70, -45, -20, 10, 35, 60].map((a, i) => (
        <path key={i} transform={`translate(10 -170) rotate(${a})`} d="M0 0C10-30 8-70 0-100C-8-70-10-30 0 0z" />
      ))}
    </g>
  );
}
function Vase({ x, y, k, c, s = 1 }: { x: number; y: number; k: number; c: string; s?: number }) {
  const d = [
    "M-12-120h24v14c0 8 30 22 30 58 0 30-18 48-42 48S-42-18-42-48c0-36 30-50 30-58z",
    "M-18-90h36l-8 16c20 12 30 30 30 46 0 18-18 28-40 28S-40-10-40-28c0-16 10-34 30-46z",
    "M-30-70c0-20 14-30 30-30s30 10 30 30c0 40-12 70-30 70S-30-30-30-70z",
    "M-8-150h16v30c0 14 16 30 16 66 0 30-10 54-24 54S-24-24-24-54c0-36 16-52 16-66z",
  ][k % 4];
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={d} fill={c} />;
}
function Bowl({ x, y, w = 90, c }: { x: number; y: number; w?: number; c: string }) {
  return <path transform={`translate(${x} ${y})`} d={`M${-w / 2} 0h${w}c0 ${w * 0.38}-${w * 0.2} ${w * 0.5}-${w / 2} ${w * 0.5}S${-w / 2} ${w * 0.38} ${-w / 2} 0z`} fill={c} />;
}
function Cup({ x, y, c, steam = false }: { x: number; y: number; c: string; steam?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {steam && <path d="M-8-70c-10-12 10-18 0-32M10-70c-10-12 10-18 0-32" stroke={P.cream} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".85" />}
      <path d="M26-40c18 0 18 26 0 26" stroke={c} strokeWidth="8" fill="none" />
      <path d="M-30-56h60v26c0 18-12 30-30 30s-30-12-30-30z" fill={c} />
      <ellipse cx="0" cy="4" rx="46" ry="8" fill={c} opacity=".55" />
    </g>
  );
}
function Glass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-24-120h48c0 40-8 62-24 64-16-2-24-24-24-64z" fill={P.cream} opacity=".55" />
      <path d="M-21-96h42c-2 26-10 38-21 40-11-2-19-14-21-40z" fill="#7a2230" />
      <path d="M0-56V0M-20 0h40" stroke={P.cream} strokeWidth="4" opacity=".8" />
    </g>
  );
}
function Bottle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-8-210h16v50c0 10 22 22 22 46V0h-60v-114c0-24 22-36 22-46z" fill="#3d4a30" />
      <rect x="-22" y="-100" width="44" height="46" rx="3" fill={P.sand} />
      <path d="M-12-84h24M-12-72h16" stroke={P.clay} strokeWidth="3" />
    </g>
  );
}
function Lights({ y = 70, n = 9 }: { y?: number; n?: number }) {
  return (
    <g>
      <path d={`M-10 ${y}Q200 ${y + 70} 410 ${y}`} stroke={P.ink} strokeWidth="1.5" fill="none" opacity=".6" />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const xx = -10 + 420 * t;
        const yy = y + 140 * t * (1 - t);
        return <circle key={i} cx={xx} cy={yy + 8} r="5.5" fill="#ffd9a0" />;
      })}
    </g>
  );
}
function Table({ y = 400, c = P.ochre }: { y?: number; c?: string }) {
  return <rect x="-20" y={y} width="440" height="140" fill={c} />;
}

export type ArtKey = "hero" | "cafe" | "vino" | "workshop" | "torno" | "manana" | "tarde" | "noche" | "tiles" | "lampara" | "crochet" | "pasta";

export default function Art({ k, className }: { k: ArtKey; className?: string }) {
  const body = (() => {
    switch (k) {
      case "hero":
        return (
          <>
            <rect width="400" height="500" fill={P.rose} />
            <circle cx="270" cy="150" r="70" fill={P.cream} opacity=".7" />
            <Palm x={80} y={430} s={1.3} />
            <Monstera x={345} y={420} s={1.25} r={18} />
            <Table y={400} c={P.clay} />
            <Vase x={150} y={400} k={0} c={P.cream} s={1.15} />
            <Vase x={238} y={400} k={2} c={P.ochre} />
            <Cup x={318} y={400} c={P.cream} steam />
          </>
        );
      case "cafe":
      case "manana":
        return (
          <>
            <rect width="400" height="500" fill={P.sand} />
            <circle cx="300" cy="120" r="56" fill="#f3c98b" />
            <Monstera x={60} y={420} s={1.1} r={-10} />
            <Table y={390} />
            <Cup x={150} y={390} c={P.clay} steam />
            <Vase x={250} y={390} k={1} c={P.cream} />
            <Bowl x={320} y={360} w={60} c={P.leaf} />
            <path d="M200 440c30-10 60-10 90 0" stroke={P.clayD} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".5" />
          </>
        );
      case "vino":
      case "noche":
        return (
          <>
            <rect width="400" height="500" fill={P.night} />
            <circle cx="90" cy="130" r="34" fill={P.cream} opacity=".9" />
            <Lights y={60} />
            <Palm x={340} y={420} s={1.1} c={P.leaf} />
            <Table y={390} c={P.clayD} />
            <Bottle x={120} y={390} />
            <Glass x={200} y={390} />
            <Glass x={258} y={390} />
            <Vase x={320} y={390} k={2} c={P.ochre} s={0.8} />
          </>
        );
      case "tarde":
        return (
          <>
            <rect width="400" height="500" fill={P.clay} />
            <circle cx="200" cy="300" r="120" fill={P.ochre} opacity=".85" />
            <Lights y={50} n={7} />
            <Monstera x={70} y={420} s={1.15} r={-8} c={P.leaf} />
            <Table y={390} c={P.ochre} />
            <Vase x={210} y={390} k={3} c={P.cream} />
            <Vase x={280} y={390} k={1} c={P.stone} s={0.8} />
          </>
        );
      case "workshop":
      case "tiles":
        return (
          <>
            <rect width="400" height="500" fill={P.stone} />
            <g transform="translate(70 90)">
              {Array.from({ length: 9 }, (_, i) => {
                const x = (i % 3) * 90, y = Math.floor(i / 3) * 90;
                const col = [P.cream, P.sand, P.cream][i % 3];
                return (
                  <g key={i} transform={`translate(${x} ${y})`}>
                    <rect width="84" height="84" rx="4" fill={col} />
                    <circle cx="42" cy="42" r="22" fill="none" stroke={i % 2 ? P.clay : P.leaf} strokeWidth="6" />
                    <path d="M42 8v14M42 62v14M8 42h14M62 42h14" stroke={P.ochre} strokeWidth="5" strokeLinecap="round" />
                  </g>
                );
              })}
            </g>
            <Table y={400} c={P.ochre} />
            <rect x="250" y="370" width="16" height="40" rx="3" fill={P.clay} transform="rotate(-20 258 390)" />
          </>
        );
      case "lampara":
        return (
          <>
            <rect width="400" height="500" fill={P.leaf} />
            <path d="M200 0v150" stroke={P.cream} strokeWidth="2" />
            <path d="M120 250c0-60 36-100 80-100s80 40 80 100z" fill={P.ochre} />
            <path d="M140 250c0-50 28-86 60-90M260 250c0-50-28-86-60-90M200 160v90" stroke={P.clayD} strokeWidth="2" fill="none" opacity=".5" />
            <ellipse cx="200" cy="250" rx="80" ry="10" fill="#ffd9a0" />
            <path d="M120 255L60 500h280L280 255z" fill="#ffd9a0" opacity=".18" />
          </>
        );
      case "crochet":
        return (
          <>
            <rect width="400" height="500" fill={P.rose} />
            <circle cx="160" cy="300" r="80" fill={P.clay} />
            {[-50, -25, 0, 25, 50].map((o) => <path key={o} d={`M${100 + o * 0.4} ${240 + o}c40 20 80 20 120 0`} stroke={P.clayD} strokeWidth="4" fill="none" opacity=".6" />)}
            <circle cx="275" cy="340" r="44" fill={P.cream} />
            <path d="M260 310c20 10 30 30 30 56M245 330c20 6 34 20 40 40" stroke={P.stone} strokeWidth="4" fill="none" />
            <path d="M240 120L330 420" stroke={P.ink} strokeWidth="6" strokeLinecap="round" />
            <path d="M160 380c40 60 140 50 200 100" stroke={P.clay} strokeWidth="4" fill="none" />
          </>
        );
      case "pasta":
        return (
          <>
            <rect width="400" height="500" fill={P.sand} />
            <Table y={300} c={P.ochre} />
            <path d="M120 300c0-40 40-60 80-60s80 20 80 60" fill={P.cream} />
            <ellipse cx="200" cy="300" rx="36" ry="12" fill="#f3c98b" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={110 + i * 40} y="370" width="22" height="80" rx="11" fill="#f1dfb3" transform={`rotate(${i * 6 - 12} ${121 + i * 40} 410)`} />)}
            <path d="M60 280h280" stroke={P.clayD} strokeWidth="10" strokeLinecap="round" />
          </>
        );
      case "torno":
        return (
          <>
            <rect width="400" height="500" fill={P.ochre} />
            <circle cx="200" cy="200" r="150" fill={P.sand} opacity=".5" />
            <ellipse cx="200" cy="400" rx="150" ry="34" fill={P.night} />
            <ellipse cx="200" cy="388" rx="110" ry="22" fill={P.stone} />
            <path d="M150 386c-6-60 10-110 22-130h56c12 20 28 70 22 130z" fill={P.clay} />
            <ellipse cx="200" cy="256" rx="28" ry="7" fill={P.clayD} />
            <path d="M130 320c30-10 40 20 30 40M270 320c-30-10-40 20-30 40" stroke={P.rose} strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M80 420c40 20 200 20 240 0" stroke={P.cream} strokeWidth="3" fill="none" opacity=".6" />
          </>
        );
    }
  })();
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-hidden>
      {body}
    </svg>
  );
}
