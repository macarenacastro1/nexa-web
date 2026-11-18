"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";
import { ExperienceDemo, IntelligenceDemo } from "./demos";
import FitBox from "./FitBox";
import { HomeSystemsDemo } from "./systems-demos";

gsap.registerPlugin(ScrollTrigger);

/**
 * 02 · Servicios. Formato original (acordeón + demostración) con las tres
 * divisiones. Experience abierta por defecto; una sola expandida a la vez.
 * En celular, la demostración aparece debajo de la división activa.
 */
export function useDivisions() {
  const L = useL();
  return [
    {
      key: "experience", path: "/experience/", name: "Nexa Experience",
      cat: L("Experiencias web y diseño digital", "Experiências web e design digital"),
      title: L("Sitios web que hacen destacar tu marca.", "Sites que fazem sua marca se destacar."),
      desc: L("Diseñamos sitios web, tiendas online y experiencias digitales que combinan identidad, diseño y facilidad de uso.", "Criamos sites, lojas online e experiências digitais que unem identidade, design e facilidade de uso."),
      feats: L(["Sitios web premium", "E-commerce", "Diseño UI/UX"], ["Sites premium", "E-commerce", "Design UI/UX"]),
      cta: L("Explorar Experience", "Explorar Experience"), tag: L("Concepto interactivo · Desarrollado por Nexa", "Conceito interativo · Desenvolvido pela Nexa"),
    },
    {
      key: "systems", path: "/systems/", name: "Nexa Systems",
      cat: L("Sistemas y plataformas a medida", "Sistemas e plataformas sob medida"),
      title: L("Un sistema pensado para tu negocio.", "Um sistema pensado para o seu negócio."),
      desc: L("Desarrollamos herramientas a medida para organizar pedidos, clientes, operaciones e información en un solo lugar.", "Desenvolvemos ferramentas sob medida para organizar pedidos, clientes, operações e informações em um só lugar."),
      feats: L(["Sistemas de gestión", "Aplicaciones web", "Portales y dashboards"], ["Sistemas de gestão", "Aplicações web", "Portais e dashboards"]),
      cta: L("Explorar Systems", "Explorar Systems"), tag: L("Demo interactiva · Datos ficticios", "Demo interativa · Dados fictícios"),
    },
    {
      key: "intelligence", path: "/intelligence/", name: "Nexa Intelligence",
      cat: L("Automatización e inteligencia artificial", "Automação e inteligência artificial"),
      title: L("Menos trabajo manual. Más tiempo para tu negocio.", "Menos trabalho manual. Mais tempo para o seu negócio."),
      desc: L("Conectamos tus herramientas y automatizamos tareas repetitivas para que tu equipo pueda concentrarse en lo importante.", "Conectamos suas ferramentas e automatizamos tarefas repetitivas para que sua equipe possa se concentrar no que importa."),
      feats: L(["Automatización de procesos", "Integración de herramientas", "Asistentes inteligentes"], ["Automação de processos", "Integração de ferramentas", "Assistentes inteligentes"]),
      cta: L("Explorar Intelligence", "Explorar Intelligence"), tag: L("Ejemplo ilustrativo · Datos simulados", "Exemplo ilustrativo · Dados simulados"),
    },
  ];
}

/* Recorrido automático por las tres divisiones; si la persona interactúa, el conteo vuelve a empezar. */
const STEP_MS = [9000, 9000, 11000];

function Demo({ k, tag }: { k: string; tag: string }) {
  return (
    <div className="svc__demo">
      {k === "experience" ? <ExperienceDemo compact /> : k === "systems" ? <HomeSystemsDemo /> : <IntelligenceDemo compact />}
      <p className="svc__tag">{tag}</p>
    </div>
  );
}

export default function Services() {
  const L = useL();
  const href = useHref();
  const D = useDivisions();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);
  const [run, setRun] = useState(0); // cambia para reiniciar el conteo
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!visible || hover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => { if (!document.hidden) setOpen((o) => (o + 1) % 3); else setRun((r) => r + 1); }, STEP_MS[open]);
    return () => clearTimeout(t);
  }, [open, run, visible, hover]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const touch = () => setRun((r) => r + 1);
  const paused = !visible || hover;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const pick = (i: number) => {
    setOpen(i);
    setRun((r) => r + 1);
    track("division_select", { division: D[i]!.key });
  };

  return (
    <section className="svc" id="servicios" ref={root} aria-labelledby="svc-title" onPointerDown={touch} onKeyDown={touch}>
      <div className="container">
        <div className="svc__head">
          <div>
            <p className="label rv">{L("Servicios", "Serviços")}</p>
            <h2 className="h2 rv" id="svc-title">{L("Lo que hacemos.", "O que fazemos.")}</h2>
          </div>
          <p className="lead rv">{L("Tres especialidades que combinamos según lo que necesita cada negocio.", "Três especialidades que combinamos conforme o que cada negócio precisa.")}</p>
        </div>

        <div className="svc__body svc3 rv">
          <ul className="svc__list">
            {D.map((d, i) => (
              <li key={d.key} className={`svc__item${open === i ? " on" : ""}`}>
                <button className="svc__btn" id={`div-${d.key}`} aria-expanded={open === i} aria-controls={`div-${d.key}-panel`} onClick={() => pick(i)}>
                  <span className="svc__num">0{i + 1}</span>
                  <span className="svc__names">
                    <span className="svc__name">{d.name}</span>
                    <span className="svc__cat">{d.cat}</span>
                  </span>
                  <span className="svc__plus" aria-hidden>{open === i ? "−" : "+"}</span>
                </button>
                <div className="svc__detail" id={`div-${d.key}-panel`} role="region" aria-labelledby={`div-${d.key}`}>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.desc}</p>
                    <ul>{d.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                    <a className="btn btn--line btn--sm" href={href(d.path)} onClick={() => track("cta_click", { cta: `servicios_${d.key}` })}>
                      {d.cta} <span className="arr">→</span>
                    </a>
                    {open === i && <div className="svc__inline"><Demo k={d.key} tag={d.tag} /></div>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="svc__visual" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Live open={open} run={run} paused={paused} />
            <div key={D[open]!.key} className="svc__stage"><FitBox reserve={200}><Demo k={D[open]!.key} tag={D[open]!.tag} /></FitBox></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tres rayitas (una por división): la activa se llena mientras corre el tiempo. */
function Live({ open, run, paused }: { open: number; run: number; paused: boolean }) {
  const L = useL();
  return (
    <div className="svc__live">
      <div className="svc__segs" aria-hidden>
        {STEP_MS.map((ms, i) => (
          <span key={i} className={i < open ? "done" : i === open ? "now" : ""}>
            {i === open && <i key={`${open}-${run}`} style={{ animationDuration: `${ms}ms`, animationPlayState: paused ? "paused" : "running" }} />}
          </span>
        ))}
      </div>
      <p><span className="svc__dot" aria-hidden />{L("Demo en vivo", "Demo ao vivo")}<span className="serif">{L("tocá y probá", "toque e teste")}</span></p>
    </div>
  );
}
