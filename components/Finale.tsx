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

export default function Finale() {
  const L = useL();
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 150%", once: true, onEnter: () => setMount(true) });
      gsap.from(".finale .w", { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.07, ease: "power4.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
      gsap.from(".finale__logo", { opacity: 0, scale: 0.85, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
      gsap.from(".finale__cta", { opacity: 0, y: 24, duration: 1, delay: 0.5, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
      gsap.from(".finale__canvas", { opacity: 0, scale: 0.9, duration: 2, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
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

  const W = ({ children }: { children: React.ReactNode }) => (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: ".12em", marginBottom: "-.12em" }}><span className="w">{children}</span></span>
  );

  return (
    <section className="finale" id="futuro" ref={root} aria-label={L("Hablemos de tu proyecto", "Vamos falar do seu projeto")}>
      <div className="finale__canvas">{mount && <FinaleScene />}</div>
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
