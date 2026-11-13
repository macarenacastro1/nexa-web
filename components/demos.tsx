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
  const L = useL();
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
    <a className="vid-card" href="/casos/criscuolo/" onClick={() => track("project_open", { project: "criscuolo", from: "video" })}
      aria-label={L("Ver el concepto de Criscuolo Coffee completo", "Ver o conceito da Criscuolo Coffee completo")}>
      <Frame url="criscuolo.coffee" tone="light">
        <video ref={v} className="vid-card__video" muted loop playsInline preload="metadata" poster="/criscuolo/recorrido-poster.jpg" aria-hidden>
          <source src="/criscuolo/recorrido.webm" type="video/webm" />
          <source src="/criscuolo/recorrido.mp4" type="video/mp4" />
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

function PielPreview() {
  const L = useL();
  const items = L(
    [["Campera de gamuza", "Gamuza · a medida"], ["Chaleco de cuero", "Cuero vacuno · a medida"], ["Bolso de campo", "Cuero curtido · a medida"]],
    [["Jaqueta de camurça", "Camurça · sob medida"], ["Colete de couro", "Couro bovino · sob medida"], ["Bolsa de campo", "Couro curtido · sob medida"]],
  );
  const steps = L(["Elegís la pieza", "Tomamos tus medidas", "La confeccionamos", "Te la entregamos"], ["Você escolhe a peça", "Tiramos suas medidas", "Confeccionamos", "Entregamos"]);
  return (
    <Frame url="pieldecampo.com" tone="dark">
      <div className="autoscroll"><div className="autoscroll__page pv-pc">
        <nav aria-hidden><b>PIEL DE CAMPO</b><span>{L("Colección · Materiales · A medida", "Coleção · Materiais · Sob medida")}</span></nav>
        <div className="pv-pc__hero">
          <small>{L("Colección otoño", "Coleção outono")}</small>
          <h4>{L("Hecho a medida,", "Feito sob medida,")}<br /><em>{L("pensado para durar.", "pensado para durar.")}</em></h4>
        </div>
        <div className="pv-pc__big" aria-hidden><span className="sw sw--0" /><span className="sw sw--2" /></div>
        <div className="pv-pc__grid">
          {items.map(([n, m], i) => (
            <div key={n}><span className={`sw sw--${i}`} aria-hidden /><b>{n}</b><small>{m}</small></div>
          ))}
        </div>
        <div className="pv-pc__sec">
          <small>{L("Materiales", "Materiais")}</small>
          <div className="pv-pc__mats" aria-hidden>{["#8a6142", "#c9a77c", "#3d2717", "#6b4a2f", "#b08860"].map((c) => <i key={c} style={{ background: c }} />)}</div>
        </div>
        <div className="pv-pc__sec">
          <small>{L("Cómo pedir una pieza a medida", "Como pedir uma peça sob medida")}</small>
          <ol className="pv-pc__steps">{steps.map((t, i) => <li key={t}><b>0{i + 1}</b>{t}</li>)}</ol>
        </div>
        <p className="pv-note">{L("Las piezas se confeccionan a medida según la colección; no son personalizables libremente.", "As peças são confeccionadas sob medida conforme a coleção; não são personalizáveis livremente.")}</p>
      </div></div>
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
      <div className="autoscroll"><div className="autoscroll__page pv-ce">
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
        <div className="pv-ce__sec" aria-hidden>
          <small>{L("Experiencias", "Experiências")}</small>
          {[[L("Taller de torno · 2 h", "Oficina de torno · 2 h"), L("Hasta 6 personas", "Até 6 pessoas")], [L("Esmaltado de piezas", "Esmaltação de peças"), L("Sábados", "Sábados")], [L("Regalo empresarial", "Presente corporativo"), L("A pedido", "Sob encomenda")]].map(([t, d]) => (
            <div key={t}><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </div></div>
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
        {k !== "criscuolo" && <a className="demo__link demo__link--soft" href={href("/proyectos/")}>{L("Ver su estado en Proyectos", "Ver o status em Projetos")} →</a>}
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
