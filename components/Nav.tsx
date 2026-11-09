"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONFIG } from "@/lib/config";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const CH = [
  ["problema", "El problema"],
  ["inteligencia", "La inteligencia"],
  ["negocio", "Tu negocio"],
  ["impacto", "El impacto"],
];

export default function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("problema");
  const [on, setOn] = useState(false);

  useEffect(() => sound.subscribe(setOn), []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      CH.forEach(([id]) => {
        ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setActive(id) });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#problema" className="logo"><span className="logo__mark">N</span>{CONFIG.brand}</a>
        <nav className="chapters" aria-label="Capítulos">
          {CH.map(([id, label], i) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}><i>0{i === 0 ? "1–2" : i + 2}</i><span>{label}</span></a>
          ))}
        </nav>
        <button className={`sound-btn${on ? " on" : ""}`} onClick={() => sound.toggle()} aria-pressed={on} aria-label={on ? "Desactivar sonido" : "Activar sonido"} title="Sonido">
          {on ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" /></svg>
          )}
        </button>
        <a href="#contacto" className="btn btn--primary btn--sm">Agendar llamada</a>
      </div>
      <div className="nav__progress" ref={bar} />
    </header>
  );
}
