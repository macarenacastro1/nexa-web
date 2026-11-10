"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const CH = [
  ["caos", "01–02", "Chaos → Control"],
  ["flujo", "03", "Flujo"],
  ["simulador", "04", "Simulador"],
  ["impacto", "05", "Impacto"],
];

export const Logo = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="1" y="1" width="22" height="22" rx="6" stroke="url(#lg)" strokeWidth="1.5" />
    <path d="M7.5 17V7l9 10V7" stroke="url(#lg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#4c8dff" /><stop offset=".5" stopColor="#2de2d0" /><stop offset="1" stopColor="#2bf59c" /></linearGradient></defs>
  </svg>
);

export default function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("caos");
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
        <nav className="chapters" aria-label="Escenas">
          {CH.map(([id, n, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}><i>{n}</i><span>{label}</span></a>
          ))}
        </nav>
        <button className={`icon-btn${on ? " on" : ""}`} onClick={() => sound.toggle()} aria-pressed={on} aria-label={on ? "Desactivar sonido" : "Activar sonido"} title="Sonido">
          {on ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" /></svg>
          )}
        </button>
        <a href="#contacto" className="btn btn--solid btn--sm">Agendar diagnóstico</a>
      </div>
      <div className="nav__progress" ref={bar} />
    </header>
  );
}
