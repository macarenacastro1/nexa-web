"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PHOTOS } from "./photos";

gsap.registerPlugin(ScrollTrigger);
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Foto con marcador elegante mientras no exista la imagen real */
export function Photo({ k, alt, tone = "#d9cdb8", className = "" }: { k: string; alt: string; tone?: string; className?: string }) {
  const src = PHOTOS[k];
  return (
    <div className={`cc-photo ${className}`} style={{ ["--tone" as any]: tone }}>
      {src ? <img src={BASE + src} alt={alt} loading="lazy" decoding="async" /> : (
        <div className="cc-photo__ph" role="img" aria-label={alt}><span>Fotografia</span><b>{alt}</b></div>
      )}
    </div>
  );
}

/* ================= A JORNADA DO GRÃO ================= */
const STAGES = [
  { k: "cultivo", t: "Cultivo", d: "Tudo começa no cuidado com a terra.", tone: "#7d8466" },
  { k: "colheita", t: "Colheita", d: "O tempo certo faz a diferença.", tone: "#8e4a3c" },
  { k: "selecao", t: "Seleção", d: "Cada grão carrega uma escolha.", tone: "#b49a74" },
  { k: "torra", t: "Torra", d: "Quando a técnica revela o potencial.", tone: "#6b4a34" },
  { k: "xicara", t: "Xícara", d: "O resultado de tudo o que veio antes.", tone: "#5a3a2c" },
];

export function GrainJourney() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.4,
        onUpdate: (s) => {
          setI(Math.min(STAGES.length - 1, Math.floor(s.progress * STAGES.length * 0.999)));
          if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-grain" ref={root} id="jornada-grao" aria-label="A jornada do grão">
      <div className="cc-grain__sticky">
        <div className="cc-grain__media">
          {STAGES.map((s, j) => (
            <div key={s.k} className={`cc-grain__img${j === i ? " on" : ""}`}><Photo k={s.k} alt={s.t} tone={s.tone} /></div>
          ))}
        </div>
        <div className="cc-grain__text">
          <span className="cc-tech">A jornada do grão</span>
          <div className="cc-grain__num" aria-hidden>
            {STAGES.map((s, j) => <span key={s.k} className={j === i ? "on" : ""}>0{j + 1}</span>)}
          </div>
          <div className="cc-grain__copy">
            {STAGES.map((s, j) => (
              <div key={s.k} className={`cc-grain__item${j === i ? " on" : ""}`}>
                <h3 className="cc-display cc-display--md">{s.t}</h3>
                <p className="cc-italic">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="cc-grain__progress"><span ref={bar} /></div>
          <ol className="cc-grain__list">{STAGES.map((s, j) => <li key={s.k} className={j === i ? "on" : ""}>{s.t}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}

/* ================= EXPERIÊNCIA SENSORIAL ================= */
const NOTES = [
  { w: "Chocolate", x: 14, y: 30, s: 1.2 }, { w: "Caramelo", x: 62, y: 22, s: 1 }, { w: "Frutas", x: 74, y: 58, s: 1.3 },
  { w: "Flores", x: 22, y: 66, s: 0.95 }, { w: "Castanhas", x: 46, y: 78, s: 1.05 }, { w: "Mel", x: 40, y: 42, s: 0.85 },
];
export function Sensorial() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState<string | null>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cc-sens__reveal", { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
      gsap.fromTo(".cc-sens .cc-photo", { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-sens" ref={root} aria-label="Experiência sensorial">
      <Photo k="sensorial" alt="Macro de café preparado" tone="#3a2419" />
      <div className="cc-sens__shade" />
      <div className="cc-sens__words" aria-hidden>
        {NOTES.map((n) => (
          <span key={n.w} className="cc-sens__pos" style={{ left: `${n.x}%`, top: `${n.y}%`, fontSize: `calc(clamp(30px, 4.4vw, 68px) * ${n.s})` }}>
            <span className="cc-sens__reveal">
              <span className={`cc-sens__word${on === n.w ? " on" : ""}${on && on !== n.w ? " dim" : ""}`} onMouseEnter={() => setOn(n.w)} onMouseLeave={() => setOn(null)}>{n.w}.</span>
            </span>
          </span>
        ))}
      </div>
      <div className="cc-sens__copy">
        <h2 className="cc-display cc-display--md">O sabor tem origem.</h2>
        <p className="cc-italic">Cada nota revela parte da jornada.</p>
      </div>
    </section>
  );
}

/* ================= A MARCA ================= */
export function Brand() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".cc-brand .cc-photo").forEach((el, j) => {
        gsap.fromTo(el, { yPercent: 8 + j * 3 }, { yPercent: -6 - j * 2, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.from(".cc-brand__copy > *", { opacity: 0, y: 30, stagger: 0.12, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cc-brand__copy", start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-brand" ref={root} aria-label="A marca">
      <div className="cc-brand__copy">
        <span className="cc-tech">A marca</span>
        <h2 className="cc-display cc-display--md">Mais do que café.<br />Uma história de origem.</h2>
        <p className="cc-italic">Entre a terra, o tempo e o cuidado, cada grão carrega uma história que merece ser conhecida.</p>
      </div>
      <div className="cc-brand__grid">
        <Photo k="marcaCampo" alt="A fazenda" tone="#7d8466" className="g1" />
        <Photo k="marcaMaos" alt="Mãos e grãos" tone="#8c6a4f" className="g2" />
        <Photo k="marcaProcesso" alt="O processo" tone="#b49a74" className="g3" />
        <Photo k="marcaPack" alt="Embalagem" tone="#501f26" className="g4" />
      </div>
    </section>
  );
}

/* ================= FINAL ================= */
export function Finale() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cc-final__copy > *", { opacity: 0, y: 30, stagger: 0.14, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 55%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-final" ref={root} aria-label="Toda xícara carrega uma origem">
      <div className="cc-final__media">
        <Photo k="final" alt="Xícara de café sobre pedra" tone="#2e241e" />
        {/* vapor discreto */}
        <svg className="cc-steam" viewBox="0 0 200 300" aria-hidden>
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M${80 + j * 20},290 C${60 + j * 25},230 ${120 + j * 10},190 ${90 + j * 18},130 S${70 + j * 22},40 ${100 + j * 12},0`} style={{ animationDelay: `${j * 1.6}s` }} />
          ))}
        </svg>
      </div>
      <div className="cc-final__copy">
        <h2 className="cc-display cc-display--md">Toda xícara<br />carrega uma origem.</h2>
        <p className="cc-italic">Descubra Criscuolo Coffee.</p>
        <div className="cc-final__ctas">
          <a href="#cafes" className="cc-btn cc-btn--light">Conheça nossos cafés</a>
          <a href="#contato" className="cc-btn cc-btn--ghost cc-btn--light-ghost">Entre em contato</a>
        </div>
      </div>
    </section>
  );
}
