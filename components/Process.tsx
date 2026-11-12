"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useL } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

/** 04 · Cómo trabajamos: cuatro etapas con una línea de avance sutil. */
export default function Process() {
  const L = useL();
  const root = useRef<HTMLElement>(null);
  const steps = L(
    [
      ["Entendemos", "Escuchamos tu idea, conocemos tu negocio y definimos el problema que queremos resolver."],
      ["Diseñamos", "Organizamos la experiencia, las funcionalidades y la propuesta visual antes de construir."],
      ["Desarrollamos", "Convertimos la propuesta en una solución funcional, con pruebas y validaciones según su alcance."],
      ["Acompañamos", "Te ayudamos con la puesta en marcha y definimos cómo mantener y evolucionar tu solución."],
    ],
    [
      ["Entendemos", "Ouvimos sua ideia, conhecemos seu negócio e definimos o problema que queremos resolver."],
      ["Desenhamos", "Organizamos a experiência, as funcionalidades e a proposta visual antes de construir."],
      ["Desenvolvemos", "Transformamos a proposta em uma solução funcional, com testes e validações conforme o escopo."],
      ["Acompanhamos", "Ajudamos na implantação e definimos como manter e evoluir sua solução."],
    ],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = root.current!;
      if (reduce) {
        el.style.setProperty("--p", "1");
        el.querySelectorAll(".proc__step").forEach((s) => s.classList.add("on"));
        return;
      }
      ScrollTrigger.create({
        trigger: ".proc__steps",
        start: "top 75%",
        end: "bottom 55%",
        scrub: 0.5,
        onUpdate: (s) => {
          el.style.setProperty("--p", String(s.progress));
          el.querySelectorAll(".proc__step").forEach((st, i) => st.classList.toggle("on", s.progress >= i / 4 + 0.02));
        },
      });
      gsap.from(".proc__head > *", { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="proc" id="proceso" ref={root} aria-labelledby="proc-title">
      <div className="container">
        <div className="proc__head">
          <p className="label">{L("Cómo trabajamos", "Como trabalhamos")}</p>
          <h2 className="h2" id="proc-title">{L("De la idea", "Da ideia")} <span className="serif ctrl">{L("a la solución.", "à solução.")}</span></h2>
          <p className="lead">{L("Un proceso claro, colaborativo y pensado alrededor de lo que necesita tu negocio.", "Um processo claro, colaborativo e pensado em torno do que o seu negócio precisa.")}</p>
        </div>
        <ol className="proc__steps">
          <span className="proc__line" aria-hidden><i /></span>
          {steps.map(([t, d], i) => (
            <li key={t} className="proc__step">
              <span className="proc__n" aria-hidden>0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
        <p className="proc__note">
          {L(
            "Cada proyecto arranca con un alcance definido por escrito: qué se construye, en qué etapas y qué se revisa en cada una. Cuando el proyecto lo requiere, sumamos revisiones especializadas de seguridad y calidad.",
            "Cada projeto começa com um escopo definido por escrito: o que se constrói, em quais etapas e o que se revisa em cada uma. Quando o projeto exige, incluímos revisões especializadas de segurança e qualidade.",
          )}
        </p>
      </div>
    </section>
  );
}
