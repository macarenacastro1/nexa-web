"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey } from "./state";
import OriginMap from "./OriginMap";
import { useInView } from "./useInView";

gsap.registerPlugin(ScrollTrigger);
const CherryScene = dynamic(() => import("./CherryScene"), { ssr: false });

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const inOut = (p: number, a: number, b: number, c: number, d: number) => Math.min(seg(p, a, b), 1 - seg(p, c, d));

export const Mark = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" aria-hidden>
    <path d="M4 4h32v32H4z M30 13.5A9.5 9.5 0 1 0 30 26.5H20V13.5z" fillRule="evenodd" fill="currentColor" />
  </svg>
);

export default function Journey() {
  const root = useRef<HTMLElement>(null);
  const r = {
    hero: useRef<HTMLDivElement>(null), hint: useRef<HTMLDivElement>(null), open: useRef<HTMLDivElement>(null),
    seed: useRef<HTMLDivElement>(null), field: useRef<HTMLDivElement>(null), fieldImg: useRef<HTMLDivElement>(null),
    origin: useRef<HTMLDivElement>(null), bar: useRef<HTMLSpanElement>(null),
  };
  const [dark, setDark] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const active = useInView(root, "100px");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const set = (el: HTMLElement | null, o: number, y = 0, extra = "") => { if (el) { el.style.opacity = String(o); el.style.transform = `translate3d(0,${y}px,0) ${extra}`; el.style.visibility = o < 0.01 ? "hidden" : "visible"; } };
    const update = (p: number) => {
      journey.progress = p;
      const h = 1 - seg(p, 0.015, 0.09);
      set(r.hero.current, h, (1 - h) * -40);
      set(r.hint.current, 1 - seg(p, 0.005, 0.04));
      const o = inOut(p, 0.27, 0.34, 0.44, 0.5);
      set(r.open.current, o, (1 - seg(p, 0.27, 0.34)) * 30);
      const s = inOut(p, 0.55, 0.6, 0.66, 0.7);
      set(r.seed.current, s, (1 - seg(p, 0.52, 0.58)) * 16);
      // ORIGEM: las fibras del grano se vuelven curvas de nivel y el mapa se aleja hasta la región
      // apertura circular desde el centro del grano (sin fundidos turbios)
      const rv = seg(p, 0.745, 0.86);
      if (r.field.current) {
        r.field.current.style.opacity = rv > 0 ? "1" : "0"; r.field.current.style.visibility = rv > 0 ? "visible" : "hidden";
        r.field.current.style.setProperty("--iris", `${(Math.pow(rv, 1.4) * 120).toFixed(2)}%`);
      }
      if (r.fieldImg.current) {
        const z = seg(p, 0.74, 0.97), e = 1 - Math.pow(1 - z, 3);
        r.fieldImg.current.style.transform = `scale(${(4 - e * 3).toFixed(3)}) rotate(${((1 - e) * -8).toFixed(2)}deg)`;
      }
      const og = seg(p, 0.85, 0.93);
      set(r.origin.current, og, (1 - og) * 30);
      if (r.bar.current) r.bar.current.style.transform = `scaleY(${p})`;
      setDark(p > 0.67 && p < 0.83);
      setStep(p < 0.22 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3);
    };
    update(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (st) => update(st.progress) });
      gsap.from(".cc-hero__copy > *, .cc-top > *", { opacity: 0, y: 24, duration: 1.4, stagger: 0.12, ease: "power3.out", delay: 0.3 });
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // la cabecera se vuelve clara al pasar sobre secciones oscuras (sensorial y final)
  useEffect(() => {
    const check = () => {
      const y = 40;
      setOverDark([...document.querySelectorAll<HTMLElement>(".cc-sens, .cc-final")].some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, []);

  const chapters = ["O início", "Da fruta ao grão", "A semente", "Origem"];

  return (
    <>
      <header className={`cc-top${dark || overDark ? " cc-top--light" : ""}`}>
        <a href="#" className="cc-logo" aria-label="Criscuolo Coffee"><Mark /><span>CRISCUOLO</span></a>
        <nav className="cc-nav">
          <a href="#jornada">A jornada</a><a href="#cafes">Cafés</a><a href="#origem">Origem</a><a href="#contato">Contato</a>
        </nav>
      </header>

      <section className="cc-journey" ref={root} id="jornada" aria-label="Da fruta à xícara">
        <div className={`cc-stage${dark ? " cc-stage--dark" : ""}`}>
          <div className="cc-canvas"><CherryScene active={active} /></div>

          {/* marco editorial */}
          <div className="cc-frame" aria-hidden>
            <span className="cc-frame__l">Fazendas &amp; Cafés Especiais</span>
            <span className="cc-frame__r">19°41′S — 46°10′W</span>
          </div>
          <aside className="cc-progress" aria-hidden>
            <span className="cc-progress__track"><span ref={r.bar} /></span>
            <ol>{chapters.map((c, i) => <li key={c} className={step === i ? "on" : ""}><b>0{i + 1}</b>{c}</li>)}</ol>
          </aside>

          {/* 01 — hero */}
          <div className="cc-hero" ref={r.hero}>
            <div className="cc-hero__copy">
              <h1 className="cc-display">Antes de ser café,<br />é origem.</h1>
              <div className="cc-hero__side">
                <p className="cc-italic">Uma jornada que começa na terra e revela sua essência em cada xícara.</p>
                <a href="#jornada" className="cc-btn" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 1.6, behavior: "smooth" }); }}>Explore a jornada</a>
              </div>
            </div>
          </div>
          <div className="cc-hint" ref={r.hint} aria-hidden><span>Scroll to discover</span><i /></div>

          {/* 02 — apertura */}
          <div className="cc-open" ref={r.open}>
            <h2 className="cc-display cc-display--md">Tudo começa aqui.</h2>
            <p className="cc-italic">Muito antes do primeiro gole.</p>
          </div>

          {/* semilla protagonista */}
          <div className="cc-seed" ref={r.seed}>
            <span className="cc-tech">Semente · Torra</span>
            <p className="cc-italic">Da fruta ao grão.</p>
          </div>

          {/* 03 — origem */}
          <div className="cc-field" ref={r.field} id="origem">
            <div className="cc-field__media" ref={r.fieldImg}><OriginMap /></div>
            <div className="cc-field__shade" />
            <div className="cc-origin" ref={r.origin}>
              <div className="cc-coords" aria-label="Coordenadas ilustrativas">
                <span>19°41′35″ S</span>
                <span>46°10′17″ W</span>
              </div>
              <div className="cc-origin__copy">
                <h2 className="cc-display cc-display--md">A origem define tudo.</h2>
                <p className="cc-italic">Do Cerrado Mineiro para o mundo.</p>
              </div>
              <dl className="cc-data">
                <div><dt>Região</dt><dd>Cerrado Mineiro</dd></div>
                <div><dt>Município</dt><dd>Campos Altos · MG</dd></div>
                <div><dt>Fazenda</dt><dd>Granno</dd></div>
                <div><dt>Café</dt><dd>100% Arábica</dd></div>
              </dl>
              <p className="cc-note">Coordenadas ilustrativas</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
