"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/config";
import { useL } from "@/lib/i18n";

/* =====================================================================
   Nexa Systems · tres sistemas de ejemplo que funcionan solos mientras
   están en pantalla (y también se pueden tocar). Se ven como productos
   reales de una empresa: logo, menú, datos y automatizaciones en vivo.
   ===================================================================== */

/** Ejecuta `fn` cada `ms` solo mientras el bloque está en pantalla, la pestaña visible y sin movimiento reducido. */
function useLive(fn: () => void, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let on = false;
    const io = new IntersectionObserver(([e]) => { on = !!e?.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    const first = setTimeout(() => { if (on && !document.hidden) cb.current(); }, 900);
    const t = setInterval(() => { if (on && !document.hidden) cb.current(); }, ms);
    return () => { io.disconnect(); clearInterval(t); clearTimeout(first); };
  }, [ms]);
  return ref;
}

function useToast() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const show = useCallback((text: string) => {
    const id = Date.now();
    setToast({ id, text });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  }, []);
  const node = toast ? <div key={toast.id} className="ap-toast" role="status">{toast.text}</div> : null;
  return { show, node };
}

const now = (() => { let m = 10 * 60 + 12; return () => { m += 1 + Math.floor(Math.random() * 3); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; }; })();

/* ------------------------------ piezas comunes ------------------------------ */
type Nav = { k: string; label: string; icon: keyof typeof ICONS };
const ICONS = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  cart: "M3 4h2l2.4 11h11.2L21 7H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7H2",
  cal: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4",
  chat: "M4 5h16v11H8l-4 4z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 3-4.3-4.3",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
};
const Icon = ({ d }: { d: keyof typeof ICONS }) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICONS[d]} /></svg>
);

function Shell({ brand, logo, url, nav, active, onNav, title, sub, user, bell, children }: {
  brand: string; logo: React.ReactNode; url: string; nav: Nav[]; active: string; onNav?: (k: string) => void;
  title: string; sub?: string; user: string; bell: number; children: React.ReactNode;
}) {
  return (
    <div className="ap">
      <div className="ap__chrome" aria-hidden><i /><i /><i /><span>{url}</span></div>
      <div className="ap__frame">
        <nav className="ap__side" aria-label={brand}>
          <div className="ap__logo" title={brand}>{logo}</div>
          {nav.map((n) => (
            <button key={n.k} type="button" className={`ap__nav${n.k === active ? " on" : ""}`} title={n.label} aria-label={n.label}
              aria-current={n.k === active ? "page" : undefined} onClick={() => onNav?.(n.k)} tabIndex={onNav ? 0 : -1}>
              <Icon d={n.icon} />
            </button>
          ))}
          <span className="ap__nav ap__nav--end" aria-hidden><Icon d="gear" /></span>
        </nav>
        <div className="ap__main">
          <header className="ap__top">
            <div className="ap__title"><b>{title}</b>{sub && <small>{sub}</small>}</div>
            <div className="ap__search" aria-hidden><Icon d="search" /><span>Buscar…</span></div>
            <span className="ap__bell" aria-hidden><Icon d="bell" />{bell > 0 && <em key={bell}>{bell}</em>}</span>
            <span className="ap__user" aria-hidden>{user}</span>
          </header>
          <div className="ap__content">{children}</div>
        </div>
      </div>
    </div>
  );
}

const Mark = ({ c1, c2, shape }: { c1: string; c2: string; shape: "rv" | "pr" | "vx" }) => (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
    <defs><linearGradient id={`lg-${shape}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
    <rect width="32" height="32" rx="9" fill={`url(#lg-${shape})`} />
    {shape === "rv" && <path d="M9 23V9h7.5a4.5 4.5 0 0 1 0 9H13l6 5" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    {shape === "pr" && <path d="M16 7l8 5v8l-8 5-8-5v-8z M16 7v18 M8 12l16 8" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />}
    {shape === "vx" && <path d="M8 9l8 15 8-15" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

/* ------------------------------ 1 · STOCK ------------------------------ */
type Item = { sku: string; name: string; qty: number; min: number; tone: string; incoming?: number };
type Wa = { id: number; who: string; text: string; out?: boolean; t: string; typing?: boolean };

function StockSystem() {
  const L = useL();
  const toast = useToast();
  const [items, setItems] = useState<Item[]>(() => [
    { sku: "CJ-3020", name: L("Caja kraft 30×20", "Caixa kraft 30×20"), qty: 248, min: 80, tone: "#c9a27a" },
    { sku: "VT-240", name: L("Vaso térmico 240 cc", "Copo térmico 240 ml"), qty: 96, min: 90, tone: "#e9e4dc" },
    { sku: "BP-05", name: L("Bolsa papel madera N.º 5", "Saco de papel pardo n.º 5"), qty: 610, min: 200, tone: "#b8895c" },
    { sku: "CE-48", name: L("Cinta de embalar 48 mm", "Fita de embalagem 48 mm"), qty: 132, min: 60, tone: "#d7c9a8" },
    { sku: "FS-50", name: L("Film stretch 50 cm", "Filme stretch 50 cm"), qty: 41, min: 30, tone: "#cfe3ea" },
  ]);
  const clients = L(
    [["Panadería La Espiga", "¿Tienen 24 vasos térmicos para mañana?", "VT-240", 24], ["Café Molino", "Necesito 50 cajas kraft 30×20, ¿hay?", "CJ-3020", 50], ["Heladería Polo", "¿Me reservan 12 rollos de film?", "FS-50", 12], ["Rotisería Don Beto", "¿Hay bolsas N.º 5? Serían 200", "BP-05", 200]],
    [["Padaria Espiga", "Vocês têm 24 copos térmicos para amanhã?", "VT-240", 24], ["Café Moinho", "Preciso de 50 caixas kraft 30×20, tem?", "CJ-3020", 50], ["Sorveteria Polo", "Reservam 12 rolos de filme pra mim?", "FS-50", 12], ["Rotisseria Seu Beto", "Tem saco n.º 5? Seriam 200", "BP-05", 200]],
  ) as [string, string, string, number][];
  const [chat, setChat] = useState<Wa[]>([]);
  const [answered, setAnswered] = useState(37);
  const [orders, setOrders] = useState(18);
  const [po, setPo] = useState<Item | null>(null);
  const qi = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const take = (sku: string, n: number) => {
    setItems((xs) => xs.map((x) => (x.sku === sku ? { ...x, qty: Math.max(0, x.qty - n) } : x)));
    const it = itemsRef.current.find((x) => x.sku === sku);
    if (it && it.qty - n < it.min && it.qty >= it.min && !it.incoming) setTimeout(() => setPo({ ...it, qty: it.qty - n }), 700);
  };

  const step = () => {
    const [who, q, sku, n] = clients[qi.current % clients.length]!;
    qi.current += 1;
    const id = Date.now();
    setChat((c) => [...c, { id, who, text: q, t: now() }, { id: id + 1, who, text: "", out: true, t: "", typing: true }].slice(-5));
    setTimeout(() => {
      const it = itemsRef.current.find((x) => x.sku === sku)!;
      const ok = it.qty >= n;
      const text = ok
        ? L(`¡Hola! Sí, tenemos ${it.qty} en stock. Te reservo ${n} y te paso el total por acá.`, `Oi! Sim, temos ${it.qty} em estoque. Reservo ${n} e te passo o total por aqui.`)
        : L(`Hoy quedan ${it.qty}. Te reservo esas y el resto llega el martes, ¿te sirve?`, `Hoje restam ${it.qty}. Reservo essas e o resto chega na terça, pode ser?`);
      setChat((c) => c.map((m) => (m.id === id + 1 ? { ...m, text, typing: false, t: now() } : m)));
      setAnswered((a) => a + 1);
      if (ok) { take(sku, n); setOrders((o) => o + 1); }
    }, 1300);
  };
  const ref = useLive(step, 5200);

  const approve = () => {
    if (!po) return;
    const sku = po.sku;
    setItems((xs) => xs.map((x) => (x.sku === sku ? { ...x, incoming: 300 } : x)));
    setPo(null);
    toast.show(L("Orden de compra enviada a Cartonera Sur", "Pedido de compra enviado à Cartonagem Sul"));
    setTimeout(() => {
      setItems((xs) => xs.map((x) => (x.sku === sku ? { ...x, qty: x.qty + 300, incoming: undefined } : x)));
      toast.show(L("Mercadería recibida · stock actualizado", "Mercadoria recebida · estoque atualizado"));
    }, 4200);
  };
  const sell = (sku: string) => { take(sku, 10); setOrders((o) => o + 1); toast.show(L("Venta registrada · stock descontado", "Venda registrada · estoque baixado")); };

  const nav: Nav[] = [
    { k: "home", label: L("Inicio", "Início"), icon: "home" }, { k: "stock", label: "Stock", icon: "box" },
    { k: "orders", label: L("Pedidos", "Pedidos"), icon: "cart" }, { k: "chat", label: "WhatsApp", icon: "chat" }, { k: "rep", label: L("Reportes", "Relatórios"), icon: "chart" },
  ];
  return (
    <div ref={ref} className="ap-wrap">
      <Shell brand="Rivera Insumos" logo={<Mark c1="#ff8a3d" c2="#e2452b" shape="rv" />} url="gestion.riverainsumos.com" nav={nav} active="stock"
        title={L("Stock", "Estoque")} sub={L("Depósito central", "Depósito central")} user="MR" bell={po ? 1 : 0}>
        <div className="ap-split">
          <div className="ap-col">
            <div className="ap-kpis">
              <div><small>{L("Pedidos hoy", "Pedidos hoje")}</small><b key={orders} className="tick">{orders}</b></div>
              <div><small>{L("Consultas respondidas", "Consultas respondidas")}</small><b key={answered} className="tick">{answered}</b><em>{L("sin intervención", "sem intervenção")}</em></div>
              <div><small>{L("Respuesta promedio", "Resposta média")}</small><b>6 s</b></div>
            </div>
            {po && (
              <div className="ap-alert" role="status">
                <div><b>{L("Stock bajo", "Estoque baixo")} · {po.name}</b><span>{L(`Quedan ${po.qty} u. (mínimo ${po.min}). Orden de compra a Cartonera Sur lista.`, `Restam ${po.qty} un. (mínimo ${po.min}). Pedido de compra à Cartonagem Sul pronto.`)}</span></div>
                <button type="button" className="ap-btn ap-btn--pri" onClick={approve}>{L("Aprobar pedido", "Aprovar pedido")}</button>
              </div>
            )}
            <table className="ap-table">
              <thead><tr><th>{L("Producto", "Produto")}</th><th>{L("Stock", "Estoque")}</th><th className="hide-s">{L("Estado", "Status")}</th><th /></tr></thead>
              <tbody>
                {items.map((x) => {
                  const low = x.qty < x.min;
                  return (
                    <tr key={x.sku} className={low ? "low" : ""}>
                      <td><span className="ap-thumb" style={{ background: x.tone }} /><span className="ap-prod"><b>{x.name}</b><small>{x.sku}</small></span></td>
                      <td><span className="ap-qty"><b key={x.qty} className="tick">{x.qty}</b><i><s style={{ width: `${Math.min(100, (x.qty / (x.min * 3)) * 100)}%` }} /></i></span></td>
                      <td className="hide-s">{x.incoming ? <span className="ap-chip ap-chip--blue">{L(`+${x.incoming} en camino`, `+${x.incoming} a caminho`)}</span> : <span className={`ap-chip ${low ? "ap-chip--warn" : "ap-chip--ok"}`}>{low ? L("Reponer", "Repor") : L("Disponible", "Disponível")}</span>}</td>
                      <td><button type="button" className="ap-btn" onClick={() => sell(x.sku)} disabled={x.qty < 10}>{L("Vender 10", "Vender 10")}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <aside className="ap-wa" aria-label="WhatsApp">
            <div className="ap-wa__head"><span className="ap-wa__av"><Mark c1="#ff8a3d" c2="#e2452b" shape="rv" /></span><div><b>Rivera Insumos</b><small><i />{L("Asistente activo · responde con el stock en vivo", "Assistente ativo · responde com o estoque ao vivo")}</small></div></div>
            <div className="ap-wa__body" aria-live="polite">
              {chat.length === 0 && <p className="ap-wa__empty">{L("Esperando mensajes de clientes…", "Aguardando mensagens de clientes…")}</p>}
              {chat.map((m) => (
                <div key={m.id} className={`ap-wa__msg${m.out ? " out" : ""}`}>
                  {!m.out && <small>{m.who}</small>}
                  {m.typing ? <p className="typing" aria-label={L("Escribiendo", "Digitando")}><i /><i /><i /></p> : <p>{m.text}<span className="t">{m.t}{m.out && " ✓✓"}</span></p>}
                </div>
              ))}
            </div>
          </aside>
        </div>
        {toast.node}
      </Shell>
    </div>
  );
}

/* ------------------------------ 2 · TURNOS ------------------------------ */
type Appt = { who: string; what: string; st: "ok" | "pend" | "here" | "new" };
function BookingSystem() {
  const L = useL();
  const toast = useToast();
  const pros = ["Dra. Paula Ríos", "Dr. Martín Sosa"];
  const hours = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
  const T = L({ c: "Control", l: "Limpieza", o: "Ortodoncia", e: "Extracción", b: "Blanqueamiento" }, { c: "Revisão", l: "Limpeza", o: "Ortodontia", e: "Extração", b: "Clareamento" });
  const [agenda, setAgenda] = useState<Record<string, Appt>>({
    "0-0": { who: "Ana Pereyra", what: T.c, st: "here" }, "1-0": { who: "Luis Gómez", what: T.o, st: "here" },
    "0-1": { who: "Carla Méndez", what: T.l, st: "ok" }, "1-2": { who: "Pedro Salas", what: T.e, st: "pend" },
    "0-3": { who: "Julia Ramos", what: T.b, st: "pend" }, "1-3": { who: "Tomás Bravo", what: T.c, st: "ok" },
    "0-4": { who: "Lucía García", what: T.l, st: "ok" }, "1-5": { who: "Elena Funes", what: T.o, st: "pend" },
    "0-6": { who: "Diego Álvarez", what: T.c, st: "ok" },
  });
  const [feed, setFeed] = useState<{ id: number; t: string; text: string; kind: string }[]>([
    { id: 1, t: "08:00", text: L("Recordatorios del día enviados por WhatsApp (9)", "Lembretes do dia enviados por WhatsApp (9)"), kind: "wa" },
  ]);
  const [wait, setWait] = useState(["Marcos Villa", "Paula Díaz", "Sergio Ledesma"]);
  const [recovered, setRecovered] = useState(4);
  const step = useRef(0);
  const waitRef = useRef(wait);
  waitRef.current = wait;
  const agRef = useRef(agenda);
  agRef.current = agenda;
  const push = (text: string, kind: string) => setFeed((f) => [{ id: Date.now() + Math.random(), t: now(), text, kind }, ...f].slice(0, 5));

  const cycle = () => {
    const a = agRef.current;
    const s = step.current++ % 3;
    if (s === 0) {
      const k = Object.keys(a).find((x) => a[x]!.st === "pend");
      if (!k) return;
      push(L(`${a[k]!.who} confirmó su turno por WhatsApp`, `${a[k]!.who} confirmou o horário pelo WhatsApp`), "ok");
      setAgenda((g) => ({ ...g, [k]: { ...g[k]!, st: "ok" } }));
    } else if (s === 1) {
      const ks = Object.keys(a).filter((x) => a[x]!.st === "ok");
      const k = ks[ks.length - 1];
      if (!k) return;
      const who = a[k]!.who;
      const [p, h] = k.split("-").map(Number);
      push(L(`${who} canceló ${hours[h!]} con ${pros[p!]!.split(" ").slice(0, 2).join(" ")}`, `${who} cancelou ${hours[h!]} com ${pros[p!]!.split(" ").slice(0, 2).join(" ")}`), "cancel");
      setAgenda((g) => { const n = { ...g }; delete n[k]; return n; });
      const next = waitRef.current[0];
      setWait((w) => w.slice(1));
      if (next) {
        setTimeout(() => {
          push(L(`Hueco ofrecido a ${next} (lista de espera) · aceptó`, `Horário oferecido a ${next} (lista de espera) · aceitou`), "wait");
          setAgenda((g) => ({ ...g, [k]: { who: next, what: a[k]!.what, st: "new" } }));
          setRecovered((r) => r + 1);
        }, 1500);
      }
    } else {
      const free: string[] = [];
      pros.forEach((_, p) => hours.forEach((_, h) => { if (!a[`${p}-${h}`]) free.push(`${p}-${h}`); }));
      const k = free[Math.floor(Math.random() * free.length)];
      if (!k) return;
      const names = ["Sofía Paz", "Andrés Molina", "Valentina Ruiz", "Joaquín Ortiz", "Camila Rey"];
      const who = names[Math.floor(Math.random() * names.length)]!;
      push(L(`Nueva reserva desde la web: ${who} · ${hours[+k.split("-")[1]!]}`, `Nova reserva pelo site: ${who} · ${hours[+k.split("-")[1]!]}`), "web");
      setAgenda((g) => ({ ...g, [k]: { who, what: T.c, st: "new" } }));
    }
  };
  const ref = useLive(cycle, 4200);

  const book = (k: string) => {
    if (agenda[k]) return;
    setAgenda((g) => ({ ...g, [k]: { who: L("Paciente nuevo", "Paciente novo"), what: T.c, st: "new" } }));
    toast.show(L("Turno reservado · confirmación enviada por WhatsApp", "Horário reservado · confirmação enviada por WhatsApp"));
  };
  const total = Object.keys(agenda).length;
  const ok = Object.values(agenda).filter((x) => x.st !== "pend").length;
  const nav: Nav[] = [
    { k: "home", label: L("Inicio", "Início"), icon: "home" }, { k: "cal", label: L("Agenda", "Agenda"), icon: "cal" },
    { k: "pat", label: L("Pacientes", "Pacientes"), icon: "users" }, { k: "chat", label: "WhatsApp", icon: "chat" }, { k: "rep", label: L("Reportes", "Relatórios"), icon: "chart" },
  ];
  const ST = L({ ok: "Confirmado", pend: "Sin confirmar", here: "En sala", new: "Nuevo" }, { ok: "Confirmado", pend: "Sem confirmar", here: "Na sala", new: "Novo" });
  return (
    <div ref={ref} className="ap-wrap">
      <Shell brand="Odonto Prisma" logo={<Mark c1="#36c2b4" c2="#2a6fdb" shape="pr" />} url="agenda.odontoprisma.com" nav={nav} active="cal"
        title={L("Agenda · hoy", "Agenda · hoje")} sub={L("Jueves 14 · Sede Centro", "Quinta 14 · Unidade Centro")} user="RC" bell={0}>
        <div className="ap-split">
          <div className="ap-col">
            <div className="ap-kpis">
              <div><small>{L("Turnos de hoy", "Horários de hoje")}</small><b key={total} className="tick">{total}</b></div>
              <div><small>{L("Confirmados", "Confirmados")}</small><b key={ok} className="tick">{ok}/{total}</b></div>
              <div><small>{L("Huecos recuperados (semana)", "Vagas recuperadas (semana)")}</small><b key={recovered} className="tick">{recovered}</b></div>
            </div>
            <div className="ap-cal" role="grid" aria-label={L("Agenda del día", "Agenda do dia")}>
              <span />
              {pros.map((p) => <b key={p} role="columnheader"><i className="ap-av">{p.split(" ")[1]![0]}{p.split(" ")[2]![0]}</i>{p}</b>)}
              {hours.map((h, hi) => (
                <div key={h} className="ap-cal__row" role="row">
                  <span className="ap-cal__h">{h}</span>
                  {pros.map((_, pi) => {
                    const k = `${pi}-${hi}`;
                    const a = agenda[k];
                    return a ? (
                      <div key={k} role="gridcell" className={`ap-slot ap-slot--${a.st}`}>
                        <b>{a.who}</b><small>{a.what}</small><em>{ST[a.st]}</em>
                      </div>
                    ) : (
                      <button key={k} type="button" role="gridcell" className="ap-slot ap-slot--free" onClick={() => book(k)} aria-label={L(`Reservar ${h}`, `Reservar ${h}`)}>
                        + {L("Libre", "Livre")}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <aside className="ap-feed" aria-label={L("Actividad automática", "Atividade automática")}>
            <b className="ap-feed__title">{L("Lo que el sistema hizo solo", "O que o sistema fez sozinho")}</b>
            <ul aria-live="polite">{feed.map((f) => <li key={f.id} className={`k-${f.kind}`}><span className="t">{f.t}</span>{f.text}</li>)}</ul>
            <div className="ap-wait"><small>{L("Lista de espera", "Lista de espera")}</small>{wait.length ? wait.map((w) => <span key={w}>{w}</span>) : <span>{L("Vacía", "Vazia")}</span>}</div>
          </aside>
        </div>
        {toast.node}
      </Shell>
    </div>
  );
}

/* --------------------------- 3 · RADAR COMERCIAL --------------------------- */
type Lead = { n: string; c: string; r: string; s: number; sig: string[]; svc: string };
function RadarSystem() {
  const L = useL();
  const toast = useToast();
  const [tab, setTab] = useState<"leads" | "metrics" | "rivals">("leads");
  const [crm, setCrm] = useState<Set<string>>(new Set());
  const [pipe, setPipe] = useState(23);
  const [scan, setScan] = useState(0);
  const LEADS: Lead[] = L(
    [
      { n: "Café Aurora", c: "Cafetería · Palermo", r: "4,7 (512)", s: 86, sig: ["Sin web", "Mucha demanda"], svc: "Web con pedidos online" },
      { n: "Estudio Dental Lumen", c: "Odontología · Belgrano", r: "4,8 (230)", s: 79, sig: ["Web caída", "Turnos por teléfono"], svc: "Sistema de turnos" },
      { n: "Ferretería Roca", c: "Comercio · Rosario", r: "4,5 (318)", s: 71, sig: ["Solo Instagram"], svc: "Tienda online" },
      { n: "Kinesio Vital", c: "Salud · Córdoba", r: "4,6 (97)", s: 64, sig: ["Web sin celular"], svc: "Rediseño web" },
      { n: "Lavadero Blanco", c: "Servicios · La Plata", r: "4,4 (151)", s: 58, sig: ["Sin WhatsApp"], svc: "Asistente de WhatsApp" },
    ],
    [
      { n: "Café Aurora", c: "Cafeteria · Pinheiros", r: "4,7 (512)", s: 86, sig: ["Sem site", "Muita demanda"], svc: "Site com pedidos online" },
      { n: "Clínica Dental Lumen", c: "Odontologia · Moema", r: "4,8 (230)", s: 79, sig: ["Site fora do ar", "Agenda por telefone"], svc: "Sistema de agendamento" },
      { n: "Ferragens Roca", c: "Comércio · Curitiba", r: "4,5 (318)", s: 71, sig: ["Só Instagram"], svc: "Loja online" },
      { n: "Fisio Vital", c: "Saúde · Campinas", r: "4,6 (97)", s: 64, sig: ["Site sem versão mobile"], svc: "Redesign do site" },
      { n: "Lavanderia Branca", c: "Serviços · Santos", r: "4,4 (151)", s: 58, sig: ["Sem WhatsApp"], svc: "Assistente de WhatsApp" },
    ],
  );
  const RIV = L(
    [["@estudio.orbita", "12,4 mil", 2.1, "Reels de casos", [3, 5, 2, 6, 4, 7, 5]], ["@agencia.pulso", "8,7 mil", 4.8, "Tutoriales cortos", [6, 4, 7, 8, 6, 9, 10]], ["@lab.nodo", "3,2 mil", 0.6, "Carruseles", [2, 1, 3, 2, 2, 3, 2]]],
    [["@estudio.orbita", "12,4 mil", 2.1, "Reels de cases", [3, 5, 2, 6, 4, 7, 5]], ["@agencia.pulso", "8,7 mil", 4.8, "Tutoriais curtos", [6, 4, 7, 8, 6, 9, 10]], ["@lab.nodo", "3,2 mil", 0.6, "Carrosséis", [2, 1, 3, 2, 2, 3, 2]]],
  ) as [string, string, number, string, number[]][];
  // búsqueda en vivo: los prospectos aparecen de a uno mientras se analizan
  const ref = useLive(() => setScan((s) => (s >= LEADS.length ? s : s + 1)), 900);
  const send = (n: string) => {
    setCrm((x) => new Set(x).add(n));
    setPipe((p) => p + 1);
    toast.show(L(`${n} pasó al CRM · etapa “Contactar”`, `${n} foi para o CRM · etapa “Contatar”`));
    track("systems_demo_action", { system: "radar", action: "crm" });
  };
  const pts = [12, 18, 15, 22, 28, 24, 31, 35, 33, 41, 46, 52];
  const max = Math.max(...pts);
  const line = pts.map((v, i) => `${i ? "L" : "M"}${(i / 11) * 300},${90 - (v / max) * 78}`).join(" ");
  const nav: Nav[] = [
    { k: "leads", label: L("Prospectos", "Prospects"), icon: "search" }, { k: "metrics", label: L("Métricas", "Métricas"), icon: "chart" },
    { k: "rivals", label: L("Competencia", "Concorrência"), icon: "eye" }, { k: "crm", label: "CRM", icon: "users" },
  ];
  const titles = { leads: L("Prospectos", "Prospects"), metrics: L("Métricas", "Métricas"), rivals: L("Competencia", "Concorrência") };
  return (
    <div ref={ref} className="ap-wrap">
      <Shell brand="Vértice" logo={<Mark c1="#8b5cf6" c2="#4c8dff" shape="vx" />} url="app.vertice.studio" nav={nav} active={tab}
        onNav={(k) => { if (k !== "crm") setTab(k as typeof tab); }} title={titles[tab]} sub={L(`CRM: ${pipe} oportunidades abiertas`, `CRM: ${pipe} oportunidades abertas`)} user="VG" bell={crm.size}>
        <div className="ap-tabs" role="tablist">
          {(["leads", "metrics", "rivals"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{titles[k]}</button>
          ))}
        </div>
        {tab === "leads" && (
          <div className="ap-col">
            <div className="ap-query">
              <span><small>{L("Rubro", "Segmento")}</small>{L("Comercios y salud", "Comércio e saúde")}</span>
              <span><small>{L("Zona", "Região")}</small>{L("Buenos Aires y alrededores", "São Paulo e região")}</span>
              <span className="ap-query__st">{scan < LEADS.length ? <><i className="spin" />{L(`Analizando negocios… ${scan}/${LEADS.length}`, `Analisando negócios… ${scan}/${LEADS.length}`)}</> : L(`${LEADS.length} oportunidades encontradas`, `${LEADS.length} oportunidades encontradas`)}</span>
            </div>
            <ul className="ap-leads">
              {LEADS.slice(0, Math.max(scan, 0)).map((l) => (
                <li key={l.n}>
                  <span className="ap-ring" style={{ ["--p" as string]: l.s }}><b>{l.s}</b></span>
                  <div className="ap-leads__id"><b>{l.n}</b><small>{l.c} · ★ {l.r}</small></div>
                  <div className="ap-leads__sig">{l.sig.map((s) => <span key={s} className="ap-chip ap-chip--warn">{s}</span>)}<em>{L("Ofrecer:", "Oferecer:")} {l.svc}</em></div>
                  {crm.has(l.n) ? <span className="ap-chip ap-chip--ok">✓ {L("En el CRM", "No CRM")}</span> : <button type="button" className="ap-btn ap-btn--pri" onClick={() => send(l.n)}>{L("Pasar al CRM", "Enviar ao CRM")}</button>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === "metrics" && (
          <div className="ap-col">
            <div className="ap-kpis ap-kpis--4">
              {[[L("Visitas a la web", "Visitas ao site"), "4.820", "+12%"], [L("Consultas", "Consultas"), "64", "+9%"], [L("Propuestas", "Propostas"), "19", "+4"], [L("Ventas", "Vendas"), "11", "+3"]].map(([k, v, d]) => (
                <div key={k}><small>{k}</small><b>{v}</b><em className="up">{d}</em></div>
              ))}
            </div>
            <div className="ap-card">
              <div className="ap-card__h"><b>{L("Consultas por semana", "Consultas por semana")}</b><small>{L("últimas 12 semanas", "últimas 12 semanas")}</small></div>
              <svg viewBox="0 0 300 95" className="ap-chart" role="img" aria-label={L("Consultas por semana, en subida", "Consultas por semana, em alta")}>
                <defs><linearGradient id="apg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6d5cf6" stopOpacity=".28" /><stop offset="1" stopColor="#6d5cf6" stopOpacity="0" /></linearGradient></defs>
                {[20, 45, 70].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#e7e8ee" />)}
                <path d={`${line} L300,95 L0,95 Z`} fill="url(#apg)" />
                <path d={line} fill="none" stroke="#6d5cf6" strokeWidth="2.2" className="ap-line" pathLength={1} />
              </svg>
            </div>
            <div className="ap-card">
              <div className="ap-card__h"><b>{L("¿De dónde vienen?", "De onde vêm?")}</b></div>
              {[["Google", 46], ["Instagram", 31], [L("Recomendados", "Indicações"), 15], ["WhatsApp", 8]].map(([k, v]) => (
                <div key={k as string} className="ap-bar"><span>{k}</span><i><s style={{ width: `${v}%` }} /></i><b>{v}%</b></div>
              ))}
            </div>
          </div>
        )}
        {tab === "rivals" && (
          <div className="ap-col">
            <div className="ap-insight"><b>{L("Lo que está funcionando", "O que está funcionando")}</b>{L("@agencia.pulso creció 4,8% este mes publicando tutoriales cortos tres veces por semana.", "@agencia.pulso cresceu 4,8% este mês publicando tutoriais curtos três vezes por semana.")}</div>
            <ul className="ap-rivals">
              {RIV.map(([h, f, g, topic, bars]) => (
                <li key={h}>
                  <span className="ap-rivals__av">{h[1]!.toUpperCase()}</span>
                  <div><b>{h}</b><small>{f} {L("seguidores", "seguidores")}</small></div>
                  <em className={g > 1 ? "up" : ""}>+{String(g).replace(".", ",")}%</em>
                  <span className="ap-spark" aria-hidden>{bars.map((b, i) => <i key={i} style={{ height: `${b * 10}%` }} />)}</span>
                  <span className="ap-chip">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {toast.node}
      </Shell>
    </div>
  );
}

export function SystemsDemo() {
  const L = useL();
  const SYS = [
    { k: "stock", name: L("Stock y pedidos", "Estoque e pedidos"), desc: L("Rivera Insumos vende packaging a comercios. Su sistema descuenta el stock con cada venta, contesta solo las consultas por WhatsApp y prepara el pedido al proveedor antes de quedarse sin mercadería.", "A Rivera Insumos vende embalagens para o comércio. O sistema baixa o estoque a cada venda, responde sozinho as consultas no WhatsApp e prepara o pedido ao fornecedor antes de faltar mercadoria.") },
    { k: "turnos", name: L("Turnos", "Agendamentos"), desc: L("Odonto Prisma tiene dos profesionales y la agenda siempre llena. Los pacientes reservan desde la web, confirman por WhatsApp y, si alguien cancela, el hueco se ofrece solo a la lista de espera.", "A Odonto Prisma tem dois profissionais e a agenda sempre cheia. Os pacientes reservam pelo site, confirmam pelo WhatsApp e, se alguém cancela, a vaga é oferecida sozinha à lista de espera.") },
    { k: "radar", name: L("Clientes y competencia", "Clientes e concorrência"), desc: L("Vértice es un estudio que busca clientes todos los meses. Su radar encuentra negocios que necesitan sus servicios, mide qué canal trae más consultas y sigue lo que hace la competencia.", "A Vértice é um estúdio que busca clientes todo mês. O radar encontra negócios que precisam dos seus serviços, mede qual canal traz mais consultas e acompanha o que a concorrência faz.") },
  ];
  const [k, setK] = useState(SYS[0]!.k);
  const s = SYS.find((x) => x.k === k)!;
  return (
    <div className="demo demo--sys3">
      <div className="demo__tabs" role="tablist" aria-label={L("Sistemas", "Sistemas")}>
        {SYS.map((x) => (
          <button key={x.k} type="button" role="tab" aria-selected={k === x.k} className={k === x.k ? "on" : ""} onClick={() => { setK(x.k); track("systems_demo_select", { system: x.k }); }}>{x.name}</button>
        ))}
      </div>
      <div key={k} className="sys3__stage">
        {k === "stock" ? <StockSystem /> : k === "turnos" ? <BookingSystem /> : <RadarSystem />}
      </div>
      <p className="sys3__desc">{s.desc}</p>
    </div>
  );
}
