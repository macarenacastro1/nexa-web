"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useL } from "@/lib/i18n";
import LogoMark from "./LogoMark";
import { track } from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);
const FinaleScene = dynamic(() => import("./FinaleScene"), { ssr: false });

const POS: [number, number, number][] = [[14, 22, -6], [80, 18, 5], [8, 58, 4], [86, 52, -4], [24, 84, 3], [70, 84, -5], [40, 12, 2], [58, 30, -3]];

const W = ({ children }: { children: React.ReactNode }) => (
  <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: ".12em", marginBottom: "-.12em" }}><span className="w">{children}</span></span>
);

export default function Finale() {
  const L = useL();
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 150%", once: true, onEnter: () => setMount(true) });
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>(".finale__frag").forEach((el, i) => gsap.set(el, { xPercent: -50, yPercent: -50, rotate: POS[i]?.[2] ?? 0 }));
      // Ideas sueltas que, con el scroll, se juntan en el centro y se vuelven el mensaje.
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", scrub: 0.6, pin: true, anticipatePin: 1 } });
      tl.from(".finale__frag", { opacity: 0, scale: 0.6, duration: 0.1, stagger: 0.015 }, 0)
        .to(".finale__frag", { left: "50%", top: "50%", scale: 0.15, rotate: 0, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.02 }, 0.12)
        .fromTo(".finale__canvas", { scale: 0.55, opacity: 0.25 }, { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" }, 0.05)
        .fromTo(".finale__burst", { scale: 0.2, opacity: 0 }, { scale: 1.4, opacity: 1, duration: 0.14, ease: "power2.out" }, 0.44)
        .to(".finale__burst", { opacity: 0.35, duration: 0.2 }, 0.6)
        .from(".finale__logo", { opacity: 0, scale: 0.6, duration: 0.12 }, 0.44)
        .from(".finale .l1 .w", { yPercent: 110, opacity: 0, duration: 0.1, stagger: 0.025 }, 0.5)
        .from(".finale .l2 .w", { yPercent: 110, opacity: 0, duration: 0.1, stagger: 0.025 }, 0.56)
        .from(".finale__cta", { opacity: 0, y: 24, duration: 0.1 }, 0.66)
        .to({}, { duration: 0.24 }, 0.76);
      // las ideas flotan suavemente mientras esperan
      gsap.utils.toArray<HTMLElement>(".finale__frag i").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 10 : -10, x: i % 3 ? 6 : -6, duration: 2.6 + (i % 4) * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // botón magnético
  useEffect(() => {
    const el = cta.current!;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const mv = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      if (Math.hypot(dx, dy) < 160) { x(dx * 0.25); y(dy * 0.3); } else { x(0); y(0); }
    };
    window.addEventListener("pointermove", mv);
    return () => window.removeEventListener("pointermove", mv);
  }, []);

  const frags = L(
    ["Pedidos por WhatsApp", "Una planilla eterna", "¿Y si lo automatizamos?", "Una web que venda", "Turnos en papel", "Un boceto en una servilleta", "Facturas a mano", "Una app para el equipo"],
    ["Pedidos pelo WhatsApp", "Uma planilha sem fim", "E se automatizarmos?", "Um site que venda", "Agenda no papel", "Um rascunho no guardanapo", "Notas à mão", "Um app para a equipe"],
  );

  return (
    <section className="finale" id="futuro" ref={root} aria-label={L("Hablemos de tu proyecto", "Vamos falar do seu projeto")}>
      <div className="finale__canvas">{mount && <FinaleScene />}</div>
      <div className="finale__burst" aria-hidden />
      <div className="finale__frags" aria-hidden>
        {frags.map((f, i) => (
          <span key={f} className="finale__frag" style={{ left: `${POS[i]![0]}%`, top: `${POS[i]![1]}%` }}><i>{f}</i></span>
        ))}
      </div>
      <div className="finale__copy">
        <div className="finale__logo"><LogoMark /></div>
        <h2 className="display finale__title">
          <span className="l1">{L("Las buenas ideas", "Boas ideias").split(" ").map((w, i) => <span key={i}>{i > 0 && " "}<W>{w}</W></span>)}</span>
          <span className="l2">{L("merecen hacerse", "merecem virar").split(" ").map((w, i) => <span key={i}>{i > 0 && " "}<W>{w}</W></span>)} <W><span className="serif ctrl">{L("realidad.", "realidade.")}</span></W></span>
        </h2>
        <a href="#contacto" ref={cta} onClick={() => track("cta_click", { cta: "cierre_hablemos" })} className="finale__cta cta-big">{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </section>
  );
}
