import { useId } from "react";

/**
 * Logo de NEXA con la luz que recorre el borde (versión en código del GIF oficial).
 * `animated` activa el destello; respeta "reducir movimiento".
 */
export default function LogoMark({ animated = true, className }: { animated?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={`logomark${animated ? " logomark--on" : ""} ${className ?? ""}`}>
      <defs>
        <linearGradient id={`g${id}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c8dff" />
          <stop offset=".45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#2bf59c" />
        </linearGradient>
        <filter id={`f${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect x="5" y="5" width="38" height="38" rx="11" stroke={`url(#g${id})`} strokeWidth="3.2" />
      <path d="M17 31V17l14 14V17" stroke={`url(#g${id})`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {animated && (
        <g className="logomark__sweep">
          <rect x="5" y="5" width="38" height="38" rx="11" pathLength={100} stroke="#e8fffb" strokeWidth="3.4" filter={`url(#f${id})`} />
          <rect x="5" y="5" width="38" height="38" rx="11" pathLength={100} stroke="#ffffff" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}
