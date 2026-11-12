"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";

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
      key: "piel",
      name: "Piel de Campo",
      cat: L("E-commerce editorial · Indumentaria de cuero y gamuza", "E-commerce editorial · Roupas de couro e camurça"),
      status: L("Concepto · en desarrollo", "Conceito · em desenvolvimento"),
      challenge: L(
        "Las piezas se confeccionan a medida: el desafío es transmitir el valor del material y del oficio, y explicar el proceso de pedido sin que parezca un configurador libre.",
        "As peças são confeccionadas sob medida: o desafio é transmitir o valor do material e do ofício, e explicar o processo de pedido sem parecer um configurador livre.",
      ),
      solution: L(
        "Una tienda con lógica editorial: colecciones presentadas como historias, fotografía de materiales en primer plano y un recorrido claro desde la elección de la pieza hasta la toma de medidas.",
        "Uma loja com lógica editorial: coleções apresentadas como histórias, fotografia de materiais em primeiro plano e um percurso claro da escolha da peça até a tomada de medidas.",
      ),
      href: null,
      cta: null,
    },
    {
      key: "ceramica",
      name: L("Estudio de cerámica", "Estúdio de cerâmica"),
      cat: L("Tienda y reservas · Piezas y talleres", "Loja e reservas · Peças e oficinas"),
      status: L("Concepto · nombre pendiente", "Conceito · nome a definir"),
      challenge: L(
        "El estudio vende piezas y también talleres con cupos limitados: hoy esas dos cosas suelen gestionarse por mensajes y planillas separadas.",
        "O estúdio vende peças e também oficinas com vagas limitadas: hoje essas duas coisas costumam ser geridas por mensagens e planilhas separadas.",
      ),
      solution: L(
        "Una sola experiencia que combina catálogo con compra online y una agenda de talleres con fechas, horarios y cupos visibles para quien reserva.",
        "Uma única experiência que combina catálogo com compra online e uma agenda de oficinas com datas, horários e vagas visíveis para quem reserva.",
      ),
      href: null,
      cta: null,
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
  if (k === "piel")
    return (
      <div className="pj-vis pj-vis--pc" aria-hidden>
        <span className="pj-leather" /><span className="pj-suede" /><span className="pj-stitch" />
        <span className="pj-vis__word">Piel de Campo</span>
      </div>
    );
  return (
    <div className="pj-vis pj-vis--ce" aria-hidden>
      <span className="pj-pot pj-pot--a" /><span className="pj-pot pj-pot--b" /><span className="pj-pot pj-pot--c" />
    </div>
  );
}

export function ProjectCard({ p, i, detail = false }: { p: ReturnType<typeof useProjects>[number]; i: number; detail?: boolean }) {
  const L = useL();
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
          <a className="btn btn--line btn--sm" href={p.href} onClick={() => track("project_open", { project: p.key, from: detail ? "proyectos" : "home" })}>
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
