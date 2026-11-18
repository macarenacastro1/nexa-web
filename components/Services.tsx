"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";
import { ExperienceDemo, IntelligenceDemo, type ExpKey } from "./demos";
import FitBox from "./FitBox";
import { SystemsDemo } from "./systems-demos";

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
      title: L("Tu marca merece una experiencia propia.", "Sua marca merece uma experiência própria."),
      desc: L("Diseñamos sitios web, tiendas online e interfaces que combinan estética, interacción y facilidad de uso.", "Criamos sites, lojas online e interfaces que combinam estética, interação e facilidade de uso."),
      feats: L(["Sitios web premium", "E-commerce", "Diseño UI/UX"], ["Sites premium", "E-commerce", "Design UI/UX"]),
      cta: L("Explorar Experience", "Explorar Experience"),
    },
    {
      key: "systems", path: "/systems/", name: "Nexa Systems",
      cat: L("Sistemas y plataformas a medida", "Sistemas e plataformas sob medida"),
      title: L("Software pensado para tu manera de trabajar.", "Software pensado para o seu jeito de trabalhar."),
      desc: L("Desarrollamos herramientas digitales para centralizar información, organizar operaciones y facilitar el trabajo de equipos y clientes.", "Desenvolvemos ferramentas digitais para centralizar informações, organizar operações e facilitar o trabalho de equipes e clientes."),
      feats: L(["Aplicaciones web", "Sistemas de gestión", "Portales y dashboards"], ["Aplicações web", "Sistemas de gestão", "Portais e dashboards"]),
      cta: L("Explorar Systems", "Explorar Systems"),
    },
    {
      key: "intelligence", path: "/intelligence/", name: "Nexa Intelligence",
      cat: L("Automatización e inteligencia artificial", "Automação e inteligência artificial"),
      title: L("Menos tareas repetidas. Más tiempo para lo importante.", "Menos tarefas repetidas. Mais tempo para o que importa."),
      desc: L("Conectamos herramientas y automatizamos procesos para reducir el trabajo manual y mejorar el control de la información.", "Conectamos ferramentas e automatizamos processos para reduzir o trabalho manual e melhorar o controle das informações."),
      feats: L(["Automatización de procesos", "Integraciones entre herramientas", "Asistentes inteligentes"], ["Automação de processos", "Integrações entre ferramentas", "Assistentes inteligentes"]),
      cta: L("Explorar Intelligence", "Explorar Intelligence"),
    },
  ];
}

/* Recorrido automático: cada paso dura ~8 s. Si la persona toca algo, el conteo vuelve a empezar. */
type Step = { div: number; sub?: string; ms: number };
const TOUR: Step[] = [
  { div: 0, sub: "criscuolo", ms: 8000 },
  { div: 1, sub: "stock", ms: 8000 },
  { div: 1, sub: "turnos", ms: 8000 },
  { div: 1, sub: "radar", ms: 8000 },
  { div: 2, ms: 10000 },
];

function Demo({ k, sub, onSub }: { k: string; sub?: string | undefined; onSub: (s: string) => void }) {
  if (k === "experience") return <ExperienceDemo compact {...(sub ? { active: sub as ExpKey } : {})} onPick={onSub} />;
  if (k === "systems") return <SystemsDemo {...(sub ? { active: sub } : {})} onPick={onSub} />;
  return <IntelligenceDemo />;
}

export default function Services() {
  const L = useL();
  const href = useHref();
  const D = useDivisions();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);
  const [sub, setSub] = useState<Record<number, string>>({ 0: "criscuolo", 1: "stock" });
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0); // cambia para reiniciar el conteo
  const [visible, setVisible] = useState(false);
  const step0 = TOUR[step]!;

  // avanza solo mientras la sección está en pantalla y la pestaña visible
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (document.hidden) return setRun((r) => r + 1);
      const next = (step + 1) % TOUR.length;
      const n = TOUR[next]!;
      setStep(next);
      setOpen(n.div);
      if (n.sub) setSub((x) => ({ ...x, [n.div]: n.sub! }));
    }, step0.ms);
    return () => clearTimeout(t);
  }, [step, run, visible, step0.ms]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // cualquier interacción reinicia el conteo desde donde está la persona
  const touch = () => setRun((r) => r + 1);
  const syncStep = (div: number, sb?: string) => {
    const i = TOUR.findIndex((t) => t.div === div && (sb === undefined || t.sub === undefined || t.sub === sb));
    if (i >= 0) setStep(i);
    setRun((r) => r + 1);
  };
  const onSub = (div: number) => (sb: string) => { setSub((x) => ({ ...x, [div]: sb })); syncStep(div, sb); };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const pick = (i: number) => {
    setOpen(i);
    syncStep(i, sub[i]);
    track("division_select", { division: D[i]!.key });
  };

  return (
    <section className="svc" id="servicios" ref={root} aria-labelledby="svc-title" onPointerDown={touch} onKeyDown={touch}>
      <div className="container">
        <div className="svc__head">
          <div>
            <p className="label rv">{L("Servicios", "Serviços")}</p>
            <h2 className="h2 rv" id="svc-title">{L("Lo que", "O que")} <span className="serif ctrl">{L("hacemos.", "fazemos.")}</span></h2>
          </div>
          <p className="lead rv">{L("Diseño, desarrollo y automatización. Tres especialidades que combinamos según lo que necesita cada proyecto.", "Design, desenvolvimento e automação. Três especialidades que combinamos conforme o que cada projeto precisa.")}</p>
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
                  <span className="svc__plus" aria-hidden>+</span>
                </button>
                <div className="svc__detail" id={`div-${d.key}-panel`} role="region" aria-labelledby={`div-${d.key}`}>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.desc}</p>
                    <ul>{d.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                    <a className="btn btn--line btn--sm" href={href(d.path)} onClick={() => track("cta_click", { cta: `servicios_${d.key}` })}>
                      {d.cta} <span className="arr">→</span>
                    </a>
                    {open === i && <div className="svc__inline"><Demo k={d.key} sub={sub[i]} onSub={onSub(i)} /><Progress run={`${step}-${run}`} ms={step0.ms} active={visible} /></div>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="svc__visual">
            <div key={D[open]!.key} className="svc__stage"><FitBox reserve={170}><Demo k={D[open]!.key} sub={sub[open]} onSub={onSub(open)} /></FitBox></div>
            <Progress run={`${step}-${run}`} ms={step0.ms} active={visible} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Línea fina que muestra cuánto falta para pasar a la siguiente demo. */
function Progress({ run, ms, active }: { run: string; ms: number; active: boolean }) {
  return <span className="svc__line" aria-hidden><i key={run} style={{ animationDuration: `${ms}ms`, animationPlayState: active ? "running" : "paused" }} /></span>;
}
