"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";

/* =====================================================================
   Demostraciones de las tres divisiones. Son vistas conceptuales: los
   proyectos de Experience se identifican con su estado real y los datos
   de Systems e Intelligence son de ejemplo (se dice en pantalla).
   ===================================================================== */

/* ---------------------------- EXPERIENCE ---------------------------- */
export const EXPERIENCE_PROJECTS = ["criscuolo", "piel", "ceramica"] as const;
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
    piel: {
      name: "Piel de Campo",
      status: L("Concepto en desarrollo", "Conceito em desenvolvimento"),
      summary: L("Experiencia editorial para una marca de indumentaria de cuero y gamuza, con piezas confeccionadas a medida.", "Experiência editorial para uma marca de roupas de couro e camurça, com peças confeccionadas sob medida."),
      shows: L(["Diseño e-commerce", "Presentación de colecciones", "Fotografía y materiales", "Confección a medida"], ["Design de e-commerce", "Apresentação de coleções", "Fotografia e materiais", "Confecção sob medida"]),
    },
    ceramica: {
      name: L("Estudio de cerámica", "Estúdio de cerâmica"),
      status: L("Concepto · nombre pendiente", "Conceito · nome a definir"),
      summary: L("Tienda de piezas de cerámica y reservas para talleres y experiencias.", "Loja de peças de cerâmica e reservas para oficinas e experiências."),
      shows: L(["Catálogo y compra online", "Agenda de talleres", "Fechas y horarios", "Cupos disponibles"], ["Catálogo e compra online", "Agenda de oficinas", "Datas e horários", "Vagas disponíveis"]),
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
  return (
    <Frame url="criscuolo.coffee" tone="light">
      <div className="pv-cc">
        <nav aria-hidden><b>CRISCUOLO</b><span>Origem · Grãos · Loja</span></nav>
        <div className="pv-cc__hero">
          <div>
            <small>Cerrado Mineiro · Brasil</small>
            <h4>Da fruta<br /><em>à xícara.</em></h4>
          </div>
          {/* foto real del empaque del concepto */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/criscuolo/pack.jpg" alt="Empaque de café Criscuolo, concepto de NEXA" loading="lazy" width={300} height={380} />
        </div>
        <div className="pv-cc__steps" aria-hidden>
          {["Fruto", "Secagem", "Torra", "Xícara"].map((s, i) => <span key={s}><b>0{i + 1}</b>{s}</span>)}
        </div>
      </div>
    </Frame>
  );
}

function PielPreview() {
  const L = useL();
  const items = L(
    [["Campera de gamuza", "Gamuza · a medida"], ["Chaleco de cuero", "Cuero vacuno · a medida"], ["Bolso de campo", "Cuero curtido · a medida"]],
    [["Jaqueta de camurça", "Camurça · sob medida"], ["Colete de couro", "Couro bovino · sob medida"], ["Bolsa de campo", "Couro curtido · sob medida"]],
  );
  return (
    <Frame url="pieldecampo.com" tone="dark">
      <div className="pv-pc">
        <nav aria-hidden><b>PIEL DE CAMPO</b><span>{L("Colección · Materiales · A medida", "Coleção · Materiais · Sob medida")}</span></nav>
        <div className="pv-pc__hero">
          <small>{L("Colección otoño", "Coleção outono")}</small>
          <h4>{L("Hecho a medida,", "Feito sob medida,")}<br /><em>{L("pensado para durar.", "pensado para durar.")}</em></h4>
        </div>
        <div className="pv-pc__grid">
          {items.map(([n, m], i) => (
            <div key={n}><span className={`sw sw--${i}`} aria-hidden /><b>{n}</b><small>{m}</small></div>
          ))}
        </div>
        <p className="pv-note">{L("Las piezas se confeccionan a medida según la colección; no son personalizables libremente.", "As peças são confeccionadas sob medida conforme a coleção; não são personalizáveis livremente.")}</p>
      </div>
    </Frame>
  );
}

function CeramicaPreview() {
  const L = useL();
  const days = L(["Jue 14", "Sáb 16", "Mar 19", "Jue 21"], ["Qui 14", "Sáb 16", "Ter 19", "Qui 21"]);
  const cupos = [3, 0, 5, 2];
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(0);
  return (
    <Frame url={L("estudiodeceramica.com", "estudiodeceramica.com")} tone="light">
      <div className="pv-ce">
        <nav aria-hidden><b>{L("ESTUDIO", "ESTÚDIO")}</b><span>{L("Piezas · Talleres · Experiencias", "Peças · Oficinas · Experiências")}</span></nav>
        <div className="pv-ce__cols">
          <div className="pv-ce__shop" aria-hidden>
            <small>{L("Tienda", "Loja")}</small>
            {[L("Taza esmaltada", "Caneca esmaltada"), L("Plato hondo", "Prato fundo"), L("Jarrón", "Vaso")].map((n, i) => (
              <div key={n}><span className={`clay clay--${i}`} /><b>{n}</b></div>
            ))}
          </div>
          <div className="pv-ce__book">
            <small>{L("Reservá un taller de torno", "Reserve uma oficina de torno")}</small>
            <div className="pv-ce__days" role="radiogroup" aria-label={L("Fecha del taller (ejemplo)", "Data da oficina (exemplo)")}>
              {days.map((d, i) => (
                <button key={d} role="radio" aria-checked={day === i} disabled={!cupos[i]} className={day === i ? "on" : ""} onClick={() => setDay(i)}>
                  {d}<em>{cupos[i] ? L(`${cupos[i]} cupos`, `${cupos[i]} vagas`) : L("Completo", "Esgotado")}</em>
                </button>
              ))}
            </div>
            <div className="pv-ce__slots" role="radiogroup" aria-label={L("Horario (ejemplo)", "Horário (exemplo)")}>
              {["10:00", "15:00", "18:30"].map((h, i) => (
                <button key={h} role="radio" aria-checked={slot === i} className={slot === i ? "on" : ""} onClick={() => setSlot(i)}>{h}</button>
              ))}
            </div>
            <span className="pv-ce__cta" aria-hidden>{L("Continuar reserva", "Continuar reserva")} →</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function ExperienceDemo({ compact = false }: { compact?: boolean }) {
  const L = useL();
  const href = useHref();
  const P = useExperienceProjects();
  const [k, setK] = useState<ExpKey>("criscuolo");
  const p = P[k];
  return (
    <div className="demo demo--exp">
      <div className="demo__tabs" role="tablist" aria-label={L("Proyectos de Experience", "Projetos de Experience")}>
        {EXPERIENCE_PROJECTS.map((key) => (
          <button key={key} role="tab" aria-selected={k === key} className={k === key ? "on" : ""}
            onClick={() => { setK(key); track("experience_demo_select", { project: key }); }}>
            {P[key].name}
          </button>
        ))}
      </div>
      <div key={k} className="demo__stage" role="tabpanel" aria-label={p.name}>
        {k === "criscuolo" ? <CriscuoloPreview /> : k === "piel" ? <PielPreview /> : <CeramicaPreview />}
      </div>
      <div className="demo__caption">
        <span className="status">{p.status}</span>
        {!compact && <p>{p.summary}</p>}
        <ul aria-label={L("Qué demuestra", "O que demonstra")}>{p.shows.map((s) => <li key={s}>{s}</li>)}</ul>
        {k === "criscuolo" && (
          <a className="demo__link" href="/casos/criscuolo/" onClick={() => track("project_open", { project: "criscuolo", from: "demo" })}>
            {L("Abrir el concepto", "Abrir o conceito")} →
          </a>
        )}
        {k !== "criscuolo" && <a className="demo__link demo__link--soft" href={href("/proyectos/")}>{L("Ver su estado en Proyectos", "Ver o status em Projetos")} →</a>}
      </div>
    </div>
  );
}

/* ----------------------------- SYSTEMS ----------------------------- */
export function SystemsDemo() {
  const L = useL();
  const ops = L(
    [
      { id: "OP-1042", what: "Pedido mayorista", who: "MR", stage: 1, due: "Hoy", note: "Falta confirmar el talle de 2 artículos." },
      { id: "OP-1041", what: "Proyecto de instalación", who: "JL", stage: 2, due: "Mañana", note: "Control de calidad asignado." },
      { id: "OP-1040", what: "Pedido web", who: "AS", stage: 3, due: "Entregado", note: "Entrega confirmada por el cliente." },
      { id: "OP-1039", what: "Reposición de stock", who: "MR", stage: 0, due: "Jueves", note: "Esperando la factura del proveedor." },
    ],
    [
      { id: "OP-1042", what: "Pedido atacadista", who: "MR", stage: 1, due: "Hoje", note: "Falta confirmar o tamanho de 2 itens." },
      { id: "OP-1041", what: "Projeto de instalação", who: "JL", stage: 2, due: "Amanhã", note: "Controle de qualidade atribuído." },
      { id: "OP-1040", what: "Pedido online", who: "AS", stage: 3, due: "Entregue", note: "Entrega confirmada pelo cliente." },
      { id: "OP-1039", what: "Reposição de estoque", who: "MR", stage: 0, due: "Quinta", note: "Aguardando a nota do fornecedor." },
    ],
  );
  const stages = L(["Recibido", "En preparación", "Control", "Entregado"], ["Recebido", "Em preparação", "Controle", "Entregue"]);
  const [sel, setSel] = useState(0);
  const o = ops[sel]!;
  return (
    <div className="demo demo--sys">
      <div className="sysd">
        <div className="sysd__head">
          <b>{L("Operaciones", "Operações")}</b>
          <span className="pill-demo">{L("Vista conceptual · Datos de ejemplo", "Visão conceitual · Dados de exemplo")}</span>
        </div>
        <div className="sysd__body">
          <ul className="sysd__list" role="listbox" aria-label={L("Operaciones (ejemplo)", "Operações (exemplo)")}>
            {ops.map((x, i) => (
              <li key={x.id} role="option" aria-selected={sel === i} tabIndex={0} className={sel === i ? "on" : ""}
                onClick={() => setSel(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(i); } if (e.key === "ArrowDown") setSel((s) => Math.min(ops.length - 1, s + 1)); if (e.key === "ArrowUp") setSel((s) => Math.max(0, s - 1)); }}>
                <span className="id">{x.id}</span>
                <span className="what">{x.what}</span>
                <span className={`st st--${x.stage}`}>{stages[x.stage]}</span>
                <span className="who" aria-label={L("Responsable", "Responsável")}>{x.who}</span>
              </li>
            ))}
          </ul>
          <div className="sysd__detail" aria-live="polite">
            <small>{o.id}</small>
            <h4>{o.what}</h4>
            <ol className="sysd__track">
              {stages.map((s, i) => <li key={s} className={i < o.stage ? "done" : i === o.stage ? "now" : ""}>{s}</li>)}
            </ol>
            <dl>
              <div><dt>{L("Responsable", "Responsável")}</dt><dd>{o.who}</dd></div>
              <div><dt>{L("Próximo paso", "Próximo passo")}</dt><dd>{o.due}</dd></div>
            </dl>
            <p className="sysd__note">{o.note}</p>
          </div>
        </div>
      </div>
      <p className="demo__hint">{L("Elegí una operación para ver su detalle.", "Escolha uma operação para ver o detalhe.")}</p>
    </div>
  );
}

/* --------------------------- INTELLIGENCE --------------------------- */
export function IntelligenceDemo() {
  const L = useL();
  const steps = L(
    [
      { t: "Llega una consulta", auto: true, body: "«Hola, ¿tienen 20 cajas del modelo B para el viernes?»" },
      { t: "El sistema identifica la información", auto: true, body: "Producto: modelo B · Cantidad: 20 · Fecha: viernes" },
      { t: "Consulta una herramienta conectada", auto: true, body: "Stock: disponible · Entrega posible: viernes" },
      { t: "Prepara la respuesta", auto: false, body: "Borrador listo. Una persona lo revisa y lo aprueba antes de enviarlo." },
    ],
    [
      { t: "Chega uma consulta", auto: true, body: "«Olá, vocês têm 20 caixas do modelo B para sexta?»" },
      { t: "O sistema identifica as informações", auto: true, body: "Produto: modelo B · Quantidade: 20 · Data: sexta" },
      { t: "Consulta uma ferramenta conectada", auto: true, body: "Estoque: disponível · Entrega possível: sexta" },
      { t: "Prepara a resposta", auto: false, body: "Rascunho pronto. Uma pessoa revisa e aprova antes de enviar." },
    ],
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) setI(steps.length - 1);
    const io = new IntersectionObserver(([e]) => { seen.current = !!e?.isIntersecting; }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [steps.length]);
  useEffect(() => {
    if (paused || reduce.current) return;
    const t = setInterval(() => { if (seen.current && !document.hidden) setI((x) => (x + 1) % steps.length); }, 2400);
    return () => clearInterval(t);
  }, [paused, steps.length]);

  return (
    <div className="demo demo--int" ref={ref}>
      <div className="intd">
        <div className="intd__head">
          <b>{L("Flujo de consulta", "Fluxo de consulta")}</b>
          <span className="pill-demo">{L("Ejemplo ilustrativo", "Exemplo ilustrativo")}</span>
        </div>
        <ol className="intd__steps">
          {steps.map((s, j) => (
            <li key={s.t} className={`${j < i ? "done" : j === i ? "now" : ""}${s.auto ? "" : " human"}`}>
              <button onClick={() => { setI(j); setPaused(true); }} aria-current={j === i ? "step" : undefined}>
                <span className="n">{j + 1}</span>
                <span className="t">{s.t}</span>
                <span className={`kind${s.auto ? "" : " kind--h"}`}>{s.auto ? L("Automático", "Automático") : L("Revisión humana", "Revisão humana")}</span>
              </button>
              {j <= i && <p>{s.body}</p>}
            </li>
          ))}
        </ol>
        {i === steps.length - 1 && (
          <div className="intd__approve" aria-hidden>
            <span>{L("Aprobar y enviar", "Aprovar e enviar")}</span><span>{L("Editar", "Editar")}</span>
          </div>
        )}
      </div>
      <p className="demo__hint">{paused ? <button className="linkish" onClick={() => setPaused(false)}>{L("Reanudar el recorrido", "Retomar o percurso")}</button> : L("Tocá un paso para detener el recorrido.", "Toque em uma etapa para parar o percurso.")}</p>
    </div>
  );
}
