"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/config";
import { useHref, useL, useLang } from "@/lib/i18n";
import { rememberReturn } from "./criscuolo/BackToNexa";
import { Defs as CbDefs, Shape } from "./cobalto/data";

/* =====================================================================
   Demostraciones de las tres divisiones. Son vistas conceptuales: los
   proyectos de Experience se identifican con su estado real y los datos
   de Systems e Intelligence son de ejemplo (se dice en pantalla).
   ===================================================================== */

/* ---------------------------- EXPERIENCE ---------------------------- */
export const EXPERIENCE_PROJECTS = ["criscuolo", "cobalto"] as const;
export type ExpKey = (typeof EXPERIENCE_PROJECTS)[number];

export function useExperienceProjects() {
  const L = useL();
  return {
    criscuolo: {
      name: "Criscuolo Coffee",
      status: L("Concepto navegable", "Conceito navegável"),
      summary: L("Una experiencia de café que cuenta el camino del fruto a la taza.", "Uma experiência de café que conta o caminho da fruta à xícara."),
      shows: L(["Storytelling", "Dirección de arte", "Diseño editorial", "Transiciones inmersivas"], ["Storytelling", "Direção de arte", "Design editorial", "Transições imersivas"]),
    },
    cobalto: {
      name: "Cobalto",
      status: L("Concepto navegable", "Conceito navegável"),
      summary: L("Un ceramic café de Palermo: pintás tu taza, tomás el café en ella, comprás piezas y reservás tu mesa en el momento.", "Um ceramic café em Palermo: você pinta sua xícara, toma o café nela, compra peças e reserva sua mesa na hora."),
      shows: L(["Dirección de arte", "Tienda online", "Reservas", "Microinteracciones"], ["Direção de arte", "Loja online", "Reservas", "Microinterações"]),
    },
  } satisfies Record<ExpKey, { name: string; status: string; summary: string; shows: string[] }>;
}

function Frame({ url, tone, children }: { url: string; tone: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div className={`frame frame--${tone}`}>
      <div className="frame__bar" aria-hidden><i /><i /><i /><span>{url}</span></div>
      <div className="frame__body">{children}</div>
    </div>
  );
}

function CriscuoloPreview() {
  const L = useL();
  const { lang } = useLang();
  const v = useRef<HTMLVideoElement>(null);
  // se reproduce solo mientras está en pantalla (y nunca con movimiento reducido)
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <a className="vid-card" href="/casos/criscuolo/" onClick={() => { rememberReturn(lang); track("project_open", { project: "criscuolo", from: "video" }); }}
      aria-label={L("Ver el concepto de Criscuolo Coffee completo", "Ver o conceito da Criscuolo Coffee completo")}>
      <Frame url="criscuolo.coffee" tone="light">
        <video ref={v} className="vid-card__video" muted loop playsInline preload="metadata" poster="/criscuolo/recorrido-v3-poster.jpg" aria-hidden>
          <source src="/criscuolo/recorrido-v3.webm" type="video/webm" />
          <source src="/criscuolo/recorrido-v3.mp4" type="video/mp4" />
        </video>
      </Frame>
      <span className="vid-card__cta">
        <span className="vid-card__play" aria-hidden>▶</span>
        {L("Ver el concepto completo", "Ver o conceito completo")}
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}

function CobaltoPreview() {
  const L = useL();
  const { lang } = useLang();
  return (
    <a className="vid-card" href="/casos/cobalto/" onClick={() => { rememberReturn(lang); track("project_open", { project: "cobalto", from: "preview" }); }}
      aria-label={L("Ver el concepto de Cobalto completo", "Ver o conceito da Cobalto completo")}>
      <Frame url="cobalto.studio" tone="light">
        <CbDefs />
        <div className="cbp" aria-hidden>
          <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Syne:wght@600&family=Inter:wght@400&display=swap" />
          <div className="cbp__card"><span className="cbp__logo">COBALTO</span><span className="cbp__caps">Ceramic café · Hecho para tocar</span></div>
          <div className="cbp__grid">
            {([["#a9bfcb", "#4a1117", "bowl"], ["#5b4318", "#a9bfcb", "bottle"], ["#cfb183", "#8a451b", "cup"], ["#4a1117", "#cfb183", "vase"]] as const).map(([bg, fg, k]) => (
              <span key={k} style={{ background: bg }}><Shape k={k} color={fg} /></span>
            ))}
          </div>
        </div>
      </Frame>
      <span className="vid-card__cta">
        <span className="vid-card__play" aria-hidden>▶</span>
        {L("Ver el concepto completo", "Ver o conceito completo")}
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}

export function ExperienceDemo({ compact = false, active, onPick }: { compact?: boolean; active?: ExpKey; onPick?: (k: ExpKey) => void }) {
  const L = useL();
  const all = useExperienceProjects();
  const [own, setK] = useState<ExpKey>("criscuolo");
  const k = active ?? own;
  const p = all[k];
  return (
    <div className="demo demo--exp">
      {EXPERIENCE_PROJECTS.length > 1 && <div className="demo__tabs" role="tablist" aria-label={L("Proyectos", "Projetos")}>
        {EXPERIENCE_PROJECTS.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={k === x} className={k === x ? "on" : ""} onClick={() => { setK(x); onPick?.(x); track("experience_project_select", { project: x }); }}>{all[x].name}</button>
        ))}
      </div>}
      <div className="demo__stage" aria-label={p.name} key={k}>
        {k === "criscuolo" ? <CriscuoloPreview /> : <CobaltoPreview />}
      </div>
      <div className="demo__caption">
        <span className="status">{p.name} · {p.status}</span>
        {!compact && <p>{p.summary}</p>}
        <ul aria-label={L("Qué demuestra", "O que demonstra")}>{p.shows.map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </div>
  );
}

/* --------------------------- INTELLIGENCE --------------------------- */
type Case = { k: string; tab: string; from: string; msg: string; fields: [string, string][]; tools: string[]; draft: string };

export function IntelligenceDemo() {
  const L = useL();
  const CASES: Case[] = L(
    [
      { k: "stock", tab: "Consulta de stock", from: "WhatsApp · Laura", msg: "Hola, ¿tienen 20 cajas del modelo B para el viernes?", fields: [["Producto", "Modelo B"], ["Cantidad", "20"], ["Fecha", "viernes"]], tools: ["Stock", "CRM"], draft: "¡Hola Laura! Sí, tenemos 20 cajas del modelo B para el viernes. ¿Te las reservo?" },
      { k: "turno", tab: "Pedido de turno", from: "Web · Martín", msg: "Quisiera un turno para la semana que viene, de tarde.", fields: [["Servicio", "Consulta"], ["Preferencia", "tarde"], ["Semana", "próxima"]], tools: ["Agenda", "CRM"], draft: "Hola Martín, tengo martes 17:00 o jueves 18:30. ¿Cuál te queda mejor?" },
      { k: "factura", tab: "Factura recibida", from: "Mail · Proveedor Sur", msg: "Adjuntamos la factura A-1287 por el pedido de octubre.", fields: [["Proveedor", "Proveedor Sur"], ["Comprobante", "A-1287"], ["Vence", "14/11"]], tools: ["Contabilidad", "Pagos"], draft: "Factura cargada y conciliada con el pedido. Pago listo para aprobar." },
    ],
    [
      { k: "stock", tab: "Consulta de estoque", from: "WhatsApp · Laura", msg: "Oi, vocês têm 20 caixas do modelo B para sexta?", fields: [["Produto", "Modelo B"], ["Quantidade", "20"], ["Data", "sexta"]], tools: ["Estoque", "CRM"], draft: "Oi Laura! Sim, temos 20 caixas do modelo B para sexta. Quer que eu reserve?" },
      { k: "turno", tab: "Pedido de horário", from: "Site · Martín", msg: "Queria um horário para a semana que vem, à tarde.", fields: [["Serviço", "Consulta"], ["Preferência", "tarde"], ["Semana", "próxima"]], tools: ["Agenda", "CRM"], draft: "Oi Martín, tenho terça 17:00 ou quinta 18:30. Qual fica melhor?" },
      { k: "factura", tab: "Nota recebida", from: "E-mail · Fornecedor Sul", msg: "Segue a nota A-1287 referente ao pedido de outubro.", fields: [["Fornecedor", "Fornecedor Sul"], ["Documento", "A-1287"], ["Vence", "14/11"]], tools: ["Contabilidade", "Pagamentos"], draft: "Nota lançada e conferida com o pedido. Pagamento pronto para aprovar." },
    ],
  );
  const ALL_TOOLS = L(["CRM", "Stock", "Agenda", "Contabilidad", "Pagos"], ["CRM", "Estoque", "Agenda", "Contabilidade", "Pagamentos"]);
  const [ci, setCi] = useState(0);
  const [phase, setPhase] = useState(0); // 0 llega · 1 identifica · 2 consulta · 3 borrador · 4 aprobado
  const [manual, setManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduce = useRef(false);
  const c = CASES[ci]!;

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) setPhase(3);
    const io = new IntersectionObserver(([e]) => { seen.current = !!e?.isIntersecting; }, { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (reduce.current) return;
    const wait = phase === 3 ? 5200 : phase === 4 ? 2600 : 1300;
    const t = setTimeout(() => {
      if (!seen.current || document.hidden) return setPhase((p) => p); // espera a estar en pantalla
      if (phase < 3) setPhase(phase + 1);
      else if (!manual) { setPhase(0); setCi((x) => (x + 1) % CASES.length); }
    }, wait);
    return () => clearTimeout(t);
  }, [phase, ci, manual, CASES.length]);

  const pick = (i: number) => { setCi(i); setPhase(reduce.current ? 3 : 0); setManual(true); track("intelligence_demo_select", { case: CASES[i]!.k }); };
  const steps = L(["Identifica los datos", "Consulta las herramientas", "Prepara la respuesta"], ["Identifica os dados", "Consulta as ferramentas", "Prepara a resposta"]);

  return (
    <div className="demo demo--int2" ref={ref}>
      <div className="demo__tabs" role="tablist" aria-label={L("Ejemplos de automatización", "Exemplos de automação")}>
        {CASES.map((x, i) => <button key={x.k} role="tab" aria-selected={ci === i} className={ci === i ? "on" : ""} onClick={() => pick(i)}>{x.tab}</button>)}
      </div>
      <div className="ai" data-phase={phase}>
        <div className="ai__col ai__in">
          <small>{L("Llega", "Chega")}</small>
          <div key={`m-${ci}`} className="ai-msg"><b>{c.from}</b><p>{c.msg}</p></div>
        </div>
        <div className="ai__wire" aria-hidden><i /></div>
        <div className="ai__col ai__core">
          <div className="ai-node"><span className="ai-node__pulse" />{L("Automatización", "Automação")}</div>
          <ol className="ai-steps">
            {steps.map((s, j) => {
              const done = phase > j + 1 || phase >= 3;
              const now = !done && phase === j + 1;
              return <li key={s} className={done ? "done" : now ? "now" : ""}><span>{done ? "✓" : j + 1}</span>{s}</li>;
            })}
          </ol>
          {phase >= 1 && (
            <div key={`f-${ci}`} className="ai-fields">{c.fields.map(([k, v]) => <span key={k}><em>{k}</em>{v}</span>)}</div>
          )}
        </div>
        <div className="ai__wire" aria-hidden><i /></div>
        <div className="ai__col ai__out">
          <small>{L("Herramientas conectadas", "Ferramentas conectadas")}</small>
          <div className="ai-tools">{ALL_TOOLS.map((t) => <span key={t} className={phase >= 2 && c.tools.includes(t) ? "on" : ""}>{t}</span>)}</div>
          {phase >= 3 && (
            <div key={`d-${ci}`} className={`ai-draft${phase === 4 ? " sent" : ""}`}>
              <span className="kind kind--h">{phase === 4 ? L("Aprobado", "Aprovado") : L("Espera tu aprobación", "Aguarda sua aprovação")}</span>
              <p>{c.draft}</p>
              {phase === 3 ? (
                <div className="ai-draft__btns">
                  <button onClick={() => { setPhase(4); setManual(false); }}>{L("Aprobar y enviar", "Aprovar e enviar")}</button>
                  <button className="ghost" onClick={() => setManual(true)}>{L("Editar", "Editar")}</button>
                </div>
              ) : <span className="ai-sent">✓ {L("Enviado", "Enviado")}</span>}
            </div>
          )}
        </div>
      </div>
      <p className="demo__hint">{L("Lo automático corre solo; lo importante lo aprueba una persona. Ejemplo ilustrativo.", "O automático roda sozinho; o importante uma pessoa aprova. Exemplo ilustrativo.")}</p>
    </div>
  );
}
