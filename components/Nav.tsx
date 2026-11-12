"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sound } from "@/lib/sound";
import { useL, useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const CH: [string, string, string][] = [
  ["servicios", "Servicios", "Serviços"],
  ["flujo", "Cómo funciona", "Como funciona"],
  ["simulador", "Simulador", "Simulador"],
  ["impacto", "Calculadora", "Calculadora"],
];

/** Logo oficial de NEXA: la N dentro del cuadrado redondeado, con brillo neón. */
export const Logo = ({ glow = true }: { glow?: boolean }) => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden className={glow ? "logo-glow" : undefined}>
    <defs>
      <linearGradient id="nexa-lg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4c8dff" />
        <stop offset=".45" stopColor="#22d3ee" />
        <stop offset="1" stopColor="#2bf59c" />
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="38" height="38" rx="11" stroke="url(#nexa-lg)" strokeWidth="3.2" />
    <path d="M17 31V17l14 14V17" stroke="url(#nexa-lg)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Nav() {
  const { lang, setLang } = useLang();
  const L = useL();
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [on, setOn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => sound.subscribe(setOn), []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      ScrollTrigger.create({ start: 40, end: "max", onToggle: (s) => setScrolled(s.isActive) });
      CH.forEach(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setActive(id) }));
    });
    return () => ctx.revert();
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#caos" className="logo"><Logo />NEXA</a>
        <nav className="chapters" aria-label={L("Secciones", "Seções")}>
          {CH.map(([id, es, pt]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{L(es, pt)}</a>
          ))}
        </nav>
        <div className="lang" role="group" aria-label={L("Idioma", "Idioma")}>
          {(["es", "pt"] as const).map((l) => (
            <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)} title={l === "es" ? "Español" : "Português"}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className={`icon-btn${on ? " on" : ""}`} onClick={() => sound.toggle()} aria-pressed={on} aria-label={on ? L("Desactivar sonido", "Desativar som") : L("Activar sonido", "Ativar som")} title={L("Sonido", "Som")}>
          {on ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" /></svg>
          )}
        </button>
        <a href="#contacto" className="btn btn--solid btn--sm">{L("Agendar diagnóstico", "Agendar diagnóstico")}</a>
      </div>
      <div className="nav__progress" ref={bar} />
    </header>
  );
}
