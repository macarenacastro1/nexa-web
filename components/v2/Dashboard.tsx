"use client";
import { useState } from "react";
import { useL } from "@/lib/i18n";

/* Panel de ejemplo (negocio ficticio "Rivera Insumos"): muestra cómo se ve un sistema de Nexa.
   Datos ilustrativos; se aclara en pantalla con la etiqueta "Ejemplo". */

const KPIS = [
  { k: "ventas", icon: "cash", label: "Ventas del mes", pt: "Vendas do mês", value: "$4.820.000", delta: "+18,2%", up: true, pts: [8, 12, 9, 14, 11, 17, 15, 21, 18, 24] },
  { k: "consultas", icon: "chat", label: "Consultas respondidas", pt: "Mensagens respondidas", value: "1.248", delta: "+32,5%", up: true, pts: [5, 7, 6, 10, 9, 13, 12, 15, 17, 20] },
  { k: "clientes", icon: "users", label: "Clientes nuevos", pt: "Clientes novos", value: "86", delta: "−4,1%", up: false, pts: [14, 16, 13, 15, 12, 11, 13, 10, 12, 9] },
  { k: "pedidos", icon: "box", label: "Pedidos", pt: "Pedidos", value: "312", delta: "+9,4%", up: true, pts: [9, 8, 11, 10, 12, 11, 14, 13, 15, 16] },
];
const NAV = [
  { k: "panel", icon: "grid", label: "Panel", pt: "Painel" },
  { k: "pedidos", icon: "box", label: "Pedidos", pt: "Pedidos" },
  { k: "stock", icon: "layers", label: "Stock", pt: "Estoque" },
  { k: "clientes", icon: "users", label: "Clientes", pt: "Clientes" },
  { k: "agenda", icon: "cal", label: "Agenda", pt: "Agenda" },
  { k: "auto", icon: "bolt", label: "Automatizaciones", pt: "Automações" },
];
const BARS = [
  { d: "Lun", p: "Seg", v: 42 }, { d: "Mar", p: "Ter", v: 58 }, { d: "Mié", p: "Qua", v: 51 }, { d: "Jue", p: "Qui", v: 96 }, { d: "Vie", p: "Sex", v: 64 }, { d: "Sáb", p: "Sáb", v: 71 }, { d: "Dom", p: "Dom", v: 38 },
];
const AGENDA = [
  { t: "Reposición automática · Vaso térmico", pt: "Reposição automática · Copo térmico", h: "09:30", c: "#0f9f8f" },
  { t: "Llamada con Café Molino", pt: "Ligação com Café Molino", h: "11:00 — 11:30", c: "#3b6fe0" },
  { t: "Campaña de reactivación enviada", pt: "Campanha de reativação enviada", h: "15:00", c: "#e8a33d" },
];

export function Icon({ n, size = 16 }: { n: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    box: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17 14.5c2.4.2 4 1.8 4.6 4.5" /></>,
    cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
    cash: <><circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.2-1.6M12 6.5v11" /></>,
    chat: <><path d="M4 5h16v11H9l-5 4V5z" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    arrow: <path d="M7 17L17 7M9 7h8v8" />,
    plus: <path d="M12 5v14M5 12h14" />,
    dots: <><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>,
    chev: <path d="M9 6l6 6-6 6" />,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{p[n]}</svg>;
}

function Spark({ pts, up }: { pts: number[]; up: boolean }) {
  const w = 160, h = 44, max = Math.max(...pts), min = Math.min(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 10)] as const);
  // curva suave (Catmull-Rom a Bézier)
  let d = `M${xy[0]![0]},${xy[0]![1]}`;
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[Math.max(0, i - 1)]!, p1 = xy[i]!, p2 = xy[i + 1]!, p3 = xy[Math.min(xy.length - 1, i + 2)]!;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const c = up ? "#16a34a" : "#dc2626";
  const id = `g${pts.join("")}${up}`;
  return (
    <svg className="v2-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".16" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={c} strokeWidth="1.8" pathLength={1} className="v2-spark__line" />
    </svg>
  );
}

const ars = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export function BarChart({ compact = false }: { compact?: boolean }) {
  const L = useL();
  const [hov, setHov] = useState(3);
  return (
    <div className={`v2-bars${compact ? " v2-bars--c" : ""}`} onPointerLeave={() => setHov(3)}>
      <div className="v2-bars__axis" aria-hidden><span>$2M</span><span>$1M</span><span>$500k</span></div>
      <div className="v2-bars__cols">
        {BARS.map((b, i) => (
          <button key={b.d} type="button" className={`v2-bars__col${hov === i ? " on" : ""}`} onPointerEnter={() => setHov(i)} onFocus={() => setHov(i)} aria-label={`${L(b.d, b.p)}: ${ars(b.v * 20500)}`}>
            <i style={{ height: `${b.v}%` }} />
            {hov === i && <em>{ars(b.v * 20500)}</em>}
            {!compact && <small>{L(b.d, b.p)}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ tilt = false }: { tilt?: boolean }) {
  const L = useL();
  const [nav, setNav] = useState("panel");
  return (
    <div className={`v2-dash${tilt ? " v2-dash--tilt" : ""}`} aria-label={L("Ejemplo de panel de un sistema hecho por Nexa", "Exemplo de painel de um sistema feito pela Nexa")}>
      <aside className="v2-dash__side">
        <div className="v2-dash__org"><span className="v2-dash__logo">R</span><div><b>Rivera Insumos</b><small>{L("8 personas", "8 pessoas")}</small></div><span className="v2-dash__tag">{L("Ejemplo", "Exemplo")}</span></div>
        <nav>
          {NAV.map((n) => (
            <button key={n.k} type="button" className={nav === n.k ? "on" : ""} onClick={() => setNav(n.k)}><Icon n={n.icon} /> {L(n.label, n.pt)}</button>
          ))}
        </nav>
        <p className="v2-dash__fav">{L("Favoritos", "Favoritos")}</p>
        <ul className="v2-dash__favs"><li><i style={{ background: "#e8a33d" }} />{L("Radar de clientes", "Radar de clientes")}</li><li><i style={{ background: "#0f9f8f" }} />{L("Campaña de invierno", "Campanha de inverno")}</li><li><i style={{ background: "#3b6fe0" }} />{L("Proveedores", "Fornecedores")}</li></ul>
      </aside>
      <div className="v2-dash__main">
        <header className="v2-dash__head">
          <div><h3>{L("Panel", "Painel")}</h3><p>{L("Todo tu negocio, en una pantalla", "Todo o seu negócio em uma tela")}</p></div>
          <span className="v2-dash__plus"><Icon n="plus" /></span>
        </header>
        <div className="v2-dash__kpis">
          {KPIS.map((k) => (
            <div key={k.k} className="v2-kpi">
              <p className="v2-kpi__l"><Icon n={k.icon} /> {L(k.label, k.pt)}<span className="v2-kpi__go"><Icon n="arrow" size={11} /></span></p>
              <p className="v2-kpi__v">{k.value}<span className={k.up ? "up" : "down"}>{k.up ? "↗" : "↘"} {k.delta}</span></p>
              <Spark pts={k.pts} up={k.up} />
            </div>
          ))}
        </div>
        <div className="v2-dash__row">
          <div className="v2-card">
            <p className="v2-card__h"><Icon n="chart" /> {L("Ventas de la semana", "Vendas da semana")} <span><Icon n="dots" /></span></p>
            <BarChart />
          </div>
          <div className="v2-card">
            <p className="v2-card__h"><Icon n="cal" /> {L("Agenda de hoy", "Agenda de hoje")} <span><Icon n="dots" /></span></p>
            <ul className="v2-agenda">
              {AGENDA.map((a) => (
                <li key={a.t}><i style={{ background: a.c }} /><div><b>{L(a.t, a.pt)}</b><small>{a.h}</small></div><Icon n="chev" size={14} /></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
