"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/config";
import { useL } from "@/lib/i18n";

/* =====================================================================
   Nexa Systems · tres sistemas de ejemplo (ficticios) e interactivos.
   ===================================================================== */

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const seen = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { seen.current = !!e?.isIntersecting; }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

/* ------------------------------ 1 · STOCK ------------------------------ */
function StockSystem() {
  const L = useL();
  const MIN = 15;
  const [items, setItems] = useState(() => [
    { id: "B", name: L("Caja modelo B", "Caixa modelo B"), qty: 34 },
    { id: "A", name: L("Caja modelo A", "Caixa modelo A"), qty: 120 },
    { id: "T", name: L("Tapa reforzada", "Tampa reforçada"), qty: 18 },
    { id: "E", name: L("Etiquetas x100", "Etiquetas x100"), qty: 52 },
  ]);
  const queries = L(
    [["Laura · Almacén Norte", "¿Tienen 20 cajas del modelo B para el viernes?", "B", 20], ["Martín · Kiosco Centro", "¿Me separan 5 tapas reforzadas?", "T", 5], ["Sofía · Mayorista Sur", "¿Hay 40 cajas modelo A?", "A", 40]],
    [["Laura · Empório Norte", "Vocês têm 20 caixas do modelo B para sexta?", "B", 20], ["Martín · Banca Centro", "Separam 5 tampas reforçadas pra mim?", "T", 5], ["Sofía · Atacado Sul", "Tem 40 caixas modelo A?", "A", 40]],
  ) as [string, string, string, number][];
  const [log, setLog] = useState<{ who: string; q: string; a: string }[]>([]);
  const [qi, setQi] = useState(0);
  const { ref, seen } = useInView<HTMLDivElement>();

  const sell = (id: string, n: number) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty - n) } : x)));
  const ask = () => {
    const [who, q, id, n] = queries[qi % queries.length]!;
    const it = items.find((x) => x.id === id)!;
    const ok = it.qty >= n;
    const a = ok
      ? L(`Sí, hay ${it.qty}. Te reservo ${n} y te paso el total.`, `Sim, temos ${it.qty}. Reservo ${n} e te passo o total.`)
      : L(`Hoy quedan ${it.qty}. ¿Te reservo esas y el resto llega el martes?`, `Hoje restam ${it.qty}. Reservo essas e o resto chega na terça?`);
    if (ok) sell(id, n);
    setLog((l) => [{ who, q, a }, ...l].slice(0, 2));
    setQi((x) => x + 1);
  };
  // una consulta automática la primera vez que el sistema entra en pantalla
  useEffect(() => {
    const t = setInterval(() => { if (seen.current) { ask(); clearInterval(t); } }, 1200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const low = items.filter((x) => x.qty < MIN);
  return (
    <div className="sx sx--stock" ref={ref}>
      <div className="sx__main">
        <table className="sx-table">
          <thead><tr><th>{L("Producto", "Produto")}</th><th>Stock</th><th>{L("Estado", "Status")}</th><th /></tr></thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className={x.qty < MIN ? "low" : ""}>
                <td>{x.name}</td>
                <td className="num">{x.qty}</td>
                <td><span className={`st ${x.qty < MIN ? "st--0" : "st--3"}`}>{x.qty < MIN ? L("Bajo", "Baixo") : L("OK", "OK")}</span></td>
                <td><button className="sx-btn" onClick={() => sell(x.id, 5)} disabled={!x.qty}>{L("Vender 5", "Vender 5")}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {low.length > 0 && (
          <div className="sx-alert" role="status">
            <b>{L("Reposición sugerida", "Reposição sugerida")}</b>
            <span>{low.map((x) => `${x.name}: ${L("pedir", "pedir")} ${60 - x.qty}`).join(" · ")}</span>
            <em>{L("Borrador de pedido al proveedor listo para aprobar", "Rascunho de pedido ao fornecedor pronto para aprovar")}</em>
          </div>
        )}
      </div>
      <aside className="sx__side">
        <div className="sx-side__head"><b>{L("Consultas por WhatsApp", "Consultas no WhatsApp")}</b><span className="kind">{L("respuesta automática", "resposta automática")}</span></div>
        <div className="sx-chat">
          {log.length === 0 && <p className="sx-empty">{L("Esperando consultas…", "Aguardando consultas…")}</p>}
          {log.map((m, i) => (
            <div key={log.length - i} className="sx-msg">
              <small>{m.who}</small>
              <p className="in">{m.q}</p>
              <p className="out">{m.a}</p>
            </div>
          ))}
        </div>
        <button className="sx-btn sx-btn--main" onClick={ask}>{L("Simular una consulta", "Simular uma consulta")}</button>
      </aside>
    </div>
  );
}

/* ------------------------------ 2 · TURNOS ------------------------------ */
function BookingSystem() {
  const L = useL();
  const days = L(["Lun", "Mar", "Mié", "Jue", "Vie"], ["Seg", "Ter", "Qua", "Qui", "Sex"]);
  const hours = ["09:00", "10:00", "11:00", "12:00", "16:00", "17:00"];
  const init: Record<string, string> = { "0-0": "Ana P.", "0-2": "Luis G.", "1-1": "Carla M.", "2-0": "Pedro S.", "2-4": "Julia R.", "3-3": "Tomás B.", "4-1": "Elena F.", "4-5": "Diego A." };
  const [booked, setBooked] = useState<Record<string, string>>(init);
  const [events, setEvents] = useState<string[]>([L("Recordatorio enviado a Ana P. (mañana 09:00)", "Lembrete enviado para Ana P. (amanhã 09:00)")]);
  const [waitlist, setWaitlist] = useState([L("Marcos V.", "Marcos V."), L("Paula D.", "Paula D.")]);
  const push = (e: string) => setEvents((x) => [e, ...x].slice(0, 4));

  const book = (k: string) => {
    if (booked[k]) return;
    setBooked((b) => ({ ...b, [k]: L("Vos", "Você") }));
    const [d, h] = k.split("-").map(Number);
    push(L(`Turno reservado: ${days[d!]} ${hours[h!]} · confirmación enviada`, `Horário reservado: ${days[d!]} ${hours[h!]} · confirmação enviada`));
  };
  const cancel = () => {
    const ks = Object.keys(booked).filter((k) => booked[k] !== L("Vos", "Você"));
    if (!ks.length) return;
    const k = ks[Math.floor(Math.random() * ks.length)]!;
    const [d, h] = k.split("-").map(Number);
    const who = booked[k]!;
    const next = waitlist[0];
    setBooked((b) => { const n = { ...b }; if (next) n[k] = next; else delete n[k]; return n; });
    push(L(`${who} canceló ${days[d!]} ${hours[h!]}`, `${who} cancelou ${days[d!]} ${hours[h!]}`));
    if (next) {
      setTimeout(() => push(L(`Turno ofrecido a ${next} (lista de espera) · aceptado`, `Horário oferecido a ${next} (lista de espera) · aceito`)), 600);
      setWaitlist((w) => w.slice(1));
    }
  };

  return (
    <div className="sx sx--book">
      <div className="sx__main">
        <div className="cal" role="grid" aria-label={L("Agenda de la semana (ejemplo)", "Agenda da semana (exemplo)")}>
          <span />
          {days.map((d) => <b key={d} role="columnheader">{d}</b>)}
          {hours.map((h, hi) => (
            <div key={h} className="cal__row" role="row">
              <span className="cal__h">{h}</span>
              {days.map((_, di) => {
                const k = `${di}-${hi}`;
                const who = booked[k];
                return (
                  <button key={k} role="gridcell" className={`cal__slot${who ? (who === L("Vos", "Você") ? " me" : " busy") : ""}`} onClick={() => book(k)} aria-label={who ? `${days[di]} ${h}: ${who}` : L(`Reservar ${days[di]} ${h}`, `Reservar ${days[di]} ${h}`)}>
                    {who ?? L("Libre", "Livre")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="demo__hint">{L("Tocá un horario libre para reservarlo.", "Toque em um horário livre para reservar.")}</p>
      </div>
      <aside className="sx__side">
        <div className="sx-side__head"><b>{L("Automático", "Automático")}</b><span className="kind">{L("recordatorios y lista de espera", "lembretes e lista de espera")}</span></div>
        <ul className="sx-events">{events.map((e, i) => <li key={events.length - i}>{e}</li>)}</ul>
        <p className="sx-wait">{L("Lista de espera:", "Lista de espera:")} {waitlist.length ? waitlist.join(", ") : L("vacía", "vazia")}</p>
        <button className="sx-btn sx-btn--main" onClick={cancel}>{L("Simular una cancelación", "Simular um cancelamento")}</button>
      </aside>
    </div>
  );
}

/* --------------------------- 3 · RADAR COMERCIAL --------------------------- */
function RadarSystem() {
  const L = useL();
  const [tab, setTab] = useState<"leads" | "metrics" | "rivals">("leads");
  const [crm, setCrm] = useState<Set<string>>(new Set());
  const leads = L(
    [["Café Aurora", "Gastronomía · Palermo", 82, "Sin web · 320 reseñas"], ["Estudio Lumen", "Odontología · Belgrano", 74, "Web caída · mucha demanda"], ["Ferretería Roca", "Comercio · Rosario", 61, "Solo Instagram"], ["Clínica Norte", "Salud · Córdoba", 55, "Web sin celular"]],
    [["Café Aurora", "Gastronomia · Pinheiros", 82, "Sem site · 320 avaliações"], ["Estúdio Lumen", "Odontologia · Moema", 74, "Site fora do ar · muita demanda"], ["Ferragens Roca", "Comércio · Curitiba", 61, "Só Instagram"], ["Clínica Norte", "Saúde · Recife", 55, "Site sem versão mobile"]],
  ) as [string, string, number, string][];
  const rivals = L(
    [["@estudio.orbita", "12,4 mil", "+2,1%", "9 posts/mes"], ["@agencia.pulso", "8,7 mil", "+4,8%", "14 posts/mes"], ["@lab.nodo", "3,2 mil", "+0,6%", "5 posts/mes"]],
    [["@estudio.orbita", "12,4 mil", "+2,1%", "9 posts/mês"], ["@agencia.pulso", "8,7 mil", "+4,8%", "14 posts/mês"], ["@lab.nodo", "3,2 mil", "+0,6%", "5 posts/mês"]],
  );
  const pts = [12, 18, 15, 22, 28, 24, 31, 35, 33, 41, 46, 52];
  const max = Math.max(...pts);
  const line = pts.map((v, i) => `${i ? "L" : "M"}${(i / 11) * 300},${90 - (v / max) * 80}`).join(" ");
  return (
    <div className="sx sx--radar">
      <div className="sx-tabs" role="tablist">
        {([["leads", L("Clientes potenciales", "Clientes potenciais")], ["metrics", L("Métricas", "Métricas")], ["rivals", L("Competencia", "Concorrência")]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>
      {tab === "leads" && (
        <ul className="rd-leads">
          {leads.map(([n, c, s, why]) => (
            <li key={n}>
              <div><b>{n}</b><small>{c}</small></div>
              <span className="rd-why">{why}</span>
              <span className="rd-score"><i style={{ width: `${s}%` }} />{s}</span>
              {crm.has(n) ? <span className="st st--3">{L("En el CRM", "No CRM")}</span> : <button className="sx-btn" onClick={() => setCrm((x) => new Set(x).add(n))}>{L("Pasar al CRM", "Enviar ao CRM")}</button>}
            </li>
          ))}
        </ul>
      )}
      {tab === "metrics" && (
        <div className="rd-metrics">
          <div className="rd-kpis">
            {[[L("Visitas a la web", "Visitas ao site"), "4.820", "+12%"], [L("Consultas", "Consultas"), "64", "+9%"], [L("Pasaron a venta", "Viraram venda"), "11", "+3"]].map(([k, v, d]) => (
              <div key={k}><small>{k}</small><b>{v}</b><em>{d}</em></div>
            ))}
          </div>
          <svg viewBox="0 0 300 95" className="rd-chart" aria-label={L("Consultas por semana (ejemplo)", "Consultas por semana (exemplo)")}>
            <defs><linearGradient id="rdg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2de2d0" stopOpacity=".35" /><stop offset="1" stopColor="#2de2d0" stopOpacity="0" /></linearGradient></defs>
            <path d={`${line} L300,95 L0,95 Z`} fill="url(#rdg)" />
            <path d={line} fill="none" stroke="#2de2d0" strokeWidth="2" className="rd-line" pathLength={1} />
          </svg>
          <small className="rd-cap">{L("Consultas por semana · últimas 12 semanas", "Consultas por semana · últimas 12 semanas")}</small>
        </div>
      )}
      {tab === "rivals" && (
        <ul className="rd-rivals">
          {rivals.map(([h, f, g, p]) => (
            <li key={h}><b>{h}</b><span>{f} {L("seguidores", "seguidores")}</span><em className={g.startsWith("+") ? "up" : ""}>{g}</em><span>{p}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SystemsDemo() {
  const L = useL();
  const SYS = [
    { k: "stock", name: L("Gestor de stock", "Gestor de estoque"), org: L("Distribuidora Andes", "Distribuidora Andes"), desc: L("Stock al día y consultas de clientes que se responden solas.", "Estoque em dia e consultas de clientes respondidas sozinhas.") },
    { k: "turnos", name: L("Agenda de turnos", "Agenda de horários"), org: L("Consultorio Sol", "Consultório Sol"), desc: L("Reservas online, recordatorios y lista de espera automática.", "Reservas online, lembretes e lista de espera automática.") },
    { k: "radar", name: L("Radar comercial", "Radar comercial"), org: L("Estudio Brisa", "Estúdio Brisa"), desc: L("Buscar clientes, seguir métricas y mirar a la competencia en un lugar.", "Buscar clientes, acompanhar métricas e olhar a concorrência num só lugar.") },
  ];
  const [k, setK] = useState(SYS[0]!.k);
  const s = SYS.find((x) => x.k === k)!;
  return (
    <div className="demo demo--sys2">
      <div className="demo__tabs" role="tablist" aria-label={L("Sistemas de ejemplo", "Sistemas de exemplo")}>
        {SYS.map((x) => (
          <button key={x.k} role="tab" aria-selected={k === x.k} className={k === x.k ? "on" : ""} onClick={() => { setK(x.k); track("systems_demo_select", { system: x.k }); }}>{x.name}</button>
        ))}
      </div>
      <div className="sxw">
        <div className="sxw__head">
          <span className="sxw__dots" aria-hidden><i /><i /><i /></span>
          <b>{s.org}</b><span className="sxw__sep">·</span><span>{s.name}</span>
          <span className="pill-demo">{L("Ejemplo ficticio", "Exemplo fictício")}</span>
        </div>
        <div key={k} className="sxw__body">
          {k === "stock" ? <StockSystem /> : k === "turnos" ? <BookingSystem /> : <RadarSystem />}
        </div>
      </div>
      <p className="demo__hint">{s.desc}</p>
    </div>
  );
}
