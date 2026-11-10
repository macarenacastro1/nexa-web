"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const FinaleScene = dynamic(() => import("./FinaleScene"), { ssr: false });

export default function Finale() {
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 150%", once: true, onEnter: () => setMount(true) });
      gsap.from(".finale .w", { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.07, ease: "power4.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
      gsap.from(".finale__cta, .finale__sub", { opacity: 0, y: 24, duration: 1, delay: 0.5, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
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
    <section className="finale" id="futuro" ref={root} aria-label="Cierre">
      <div className="finale__canvas">{mount && <FinaleScene />}</div>
      <div className="finale__copy">
        <h2 className="display">
          <span className="l1"><W>Stop</W> <W>managing</W> <W>chaos.</W></span>
          <span className="l2"><W>Start</W> <W>building</W> <W><span className="serif ctrl">the future.</span></W></span>
        </h2>
        <a href="#contacto" ref={cta} className="finale__cta cta-big">LET&apos;S AUTOMATE
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <p className="finale__sub">Diagnóstico gratis de 30 minutos · Sin compromiso</p>
      </div>
    </section>
  );
}
