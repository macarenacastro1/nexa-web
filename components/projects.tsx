"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL, useLang } from "@/lib/i18n";
import { rememberReturn } from "./criscuolo/BackToNexa";
import { Defs as CbDefs, Shape } from "./cobalto/data";

gsap.registerPlugin(ScrollTrigger);

/**
 * Proyectos con su estado real. Solo Criscuolo tiene una demo navegable;
 * los demás se muestran como conceptos en desarrollo, sin enlaces vacíos.
 * Para sumar un proyecto: agregarlo acá con su estado y, si existe, su ruta.
 */
export function useProjects() {
  const L = useL();
  return [
    {
      key: "criscuolo",
      name: "Criscuolo Coffee",
      cat: L("Experiencia web · Café de especialidad", "Experiência web · Café especial"),
      status: L("Concepto · demo navegable", "Conceito · demo navegável"),
      challenge: L(
        "Un café de especialidad del Cerrado Mineiro se vende por su origen, pero en una tienda online típica ese origen queda reducido a una ficha técnica.",
        "Um café especial do Cerrado Mineiro se vende pela origem, mas numa loja online típica essa origem vira só uma ficha técnica.",
      ),
      solution: L(
        "Planteamos un recorrido narrativo del fruto a la taza: cada etapa del proceso se convierte en una escena, y la colección aparece cuando el visitante ya entiende qué está comprando.",
        "Propusemos um percurso narrativo da fruta à xícara: cada etapa vira uma cena, e a coleção aparece quando o visitante já entende o que está comprando.",
      ),
      href: "/casos/criscuolo/",
      cta: L("Explorar el concepto", "Explorar o conceito"),
    },
    {
      key: "cobalto",
      name: "Cobalto",
      cat: L("Experiencia web · Ceramic café", "Experiência web · Ceramic café"),
      status: L("Concepto · demo navegable", "Conceito · demo navegável"),
      challenge: L(
        "Un estudio donde se pinta cerámica mientras se toma café vende un plan, no un producto: la web tiene que contagiar las ganas de ir y llevar directo a reservar.",
        "Um estúdio onde se pinta cerâmica enquanto se toma café vende um programa, não um produto: o site precisa dar vontade de ir e levar direto à reserva.",
      ),
      solution: L(
        "Un sitio limpio donde las piezas son las protagonistas: se mueven con el cursor, se compran en dos toques y cualquier botón abre la reserva con día, horario y cupos.",
        "Um site limpo onde as peças são as protagonistas: se movem com o cursor, se compram em dois toques e qualquer botão abre a reserva com dia, horário e vagas.",
      ),
      href: "/casos/cobalto/",
      cta: L("Explorar el concepto", "Explorar o conceito"),
    },
  ];
}

export function ProjectVisual({ k }: { k: string }) {
  if (k === "criscuolo")
    return (
      <div className="pj-vis pj-vis--cc">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/criscuolo/pack.jpg" alt="" loading="lazy" width={600} height={760} />
        <span className="pj-vis__word" aria-hidden>Da fruta à xícara</span>
      </div>
    );
  return (
    <div className="pj-vis pj-vis--cb" aria-hidden>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Syne:wght@600&display=swap" />
      <CbDefs />
      {([["#a9bfcb", "#4a1117", "bowl"], ["#5b4318", "#a9bfcb", "bottle"], ["#cfb183", "#8a451b", "cup"], ["#4a1117", "#cfb183", "vase"]] as const).map(([bg, fg, k]) => (
        <span key={k} style={{ background: bg }}><Shape k={k} color={fg} /></span>
      ))}
      <span className="pj-cb__seal">CO<br />BAL<br />TO</span>
    </div>
  );
}

export function ProjectCard({ p, i, detail = false }: { p: ReturnType<typeof useProjects>[number]; i: number; detail?: boolean }) {
  const L = useL();
  const { lang } = useLang();
  return (
    <article className={`pj${i % 2 ? " pj--flip" : ""}`} aria-labelledby={`pj-${p.key}`}>
      <ProjectVisual k={p.key} />
      <div className="pj__copy">
        <p className="pj__cat">{p.cat}</p>
        <h3 id={`pj-${p.key}`}>{p.name}</h3>
        <span className="status">{p.status}</span>
        <dl>
          <div><dt>{L("Desafío", "Desafio")}</dt><dd>{p.challenge}</dd></div>
          <div><dt>{L("Propuesta", "Proposta")}</dt><dd>{p.solution}</dd></div>
        </dl>
        {p.href ? (
          <a className="btn btn--line btn--sm" href={p.href} onClick={() => { rememberReturn(lang); track("project_open", { project: p.key, from: detail ? "proyectos" : "home" }); }}>
            {p.cta} <span className="arr">→</span>
          </a>
        ) : (
          <p className="pj__soon">{L("Caso en preparación: lo publicamos cuando estén listos sus materiales.", "Case em preparação: publicamos quando os materiais estiverem prontos.")}</p>
        )}
      </div>
    </article>
  );
}

/** 03 · Proyectos seleccionados (home). */
export default function Projects() {
  const L = useL();
  const href = useHref();
  const P = useProjects();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".pj").forEach((el) =>
        gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } }),
      );
      gsap.from(".pjs__head > *", { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="pjs" id="proyectos" ref={root} aria-labelledby="pjs-title">
      <div className="container">
        <div className="pjs__head">
          <p className="label">{L("Proyectos", "Projetos")}</p>
          <h2 className="h2" id="pjs-title">{L("Proyectos", "Projetos")} <span className="serif ctrl">{L("seleccionados.", "selecionados.")}</span></h2>
          <p className="lead">{L("Cada proyecto tiene su propia identidad, sus desafíos y una forma distinta de resolverlos.", "Cada projeto tem sua própria identidade, seus desafios e uma forma diferente de resolvê-los.")}</p>
        </div>
        <div className="pjs__list">
          {P.map((p, i) => <ProjectCard key={p.key} p={p} i={i} />)}
        </div>
        <a className="pjs__all" href={href("/proyectos/")}>{L("Ver todos los proyectos y su estado", "Ver todos os projetos e o status")} →</a>
      </div>
    </section>
  );
}
