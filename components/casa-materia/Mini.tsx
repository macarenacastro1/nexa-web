import { Cut } from "./Art";

/** Vista en miniatura de Casa Materia (paisaje + tarjetas caladas) para las tarjetas de proyecto del sitio. */
const CUTS = ["amphora", "bowls", "jug", "urn", "pitcher", "bulbs", "vase", "cup", "glass"];

export default function MateriaMini({ className = "" }: { className?: string }) {
  return (
    <div className={`cmm ${className}`} aria-hidden>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Serif:ital@1&display=swap" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/casa-materia/paisaje.webp" alt="" className="cmm__land" loading="lazy" />
      <div className="cmm__txt">
        <span className="cmm__logo">Casa <i>Materia</i></span>
        <span className="cmm__h">Una casa para hacer <i>con las manos.</i></span>
      </div>
      <div className="cmm__grid">{CUTS.map((k, i) => <Cut key={k} s={k} seed={i + 2} />)}</div>
    </div>
  );
}
