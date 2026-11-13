"use client";
import { useL } from "@/lib/i18n";

/* =====================================================================
   Ilustraciones de cada servicio (páginas de división). Hechas con CSS,
   livianas y animadas con moderación. Son esquemas, no capturas reales.
   ===================================================================== */

function Browser({ children, url = "tumarca.com" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="svb">
      <div className="svb__bar" aria-hidden><i /><i /><i /><span>{url}</span></div>
      <div className="svb__body">{children}</div>
    </div>
  );
}

/* --- Experience --- */
const ExpSite = () => (
  <Browser>
    <div className="vx-site">
      <div className="vx-site__copy"><i className="t1" /><i className="t2" /><i className="t3" /><b /></div>
      <div className="vx-site__img" />
    </div>
    <div className="vx-site__row"><i /><i /><i /></div>
  </Browser>
);
function ExpShop() {
  const L = useL();
  return (
    <Browser url="tutienda.com">
      <div className="vx-shop">
        {[0, 1, 2, 3].map((i) => <div key={i} className="vx-shop__p"><span className={`vx-shop__img v${i}`} /><i /><em>$ {[24, 38, 19, 52][i]}.900</em></div>)}
      </div>
      <div className="vx-shop__cart"><span>{L("Carrito", "Carrinho")} · 2</span><b>{L("Pagar", "Pagar")}</b></div>
    </Browser>
  );
}
const ExpMotion = () => (
  <Browser>
    <div className="vx-motion">
      <span className="m1" /><span className="m2" /><span className="m3" />
      <div className="vx-motion__scroll"><i /></div>
    </div>
  </Browser>
);
function ExpUx() {
  const L = useL();
  return (
    <div className="vx-ux">
      <div className="vx-ux__wf"><small>{L("Boceto", "Esboço")}</small><i /><i /><i className="s" /><i className="s" /></div>
      <span className="vx-ux__arrow" aria-hidden>→</span>
      <div className="vx-ux__ui"><small>{L("Interfaz", "Interface")}</small><i /><i /><i className="s" /><i className="s" /></div>
    </div>
  );
}

/* --- Systems --- */
function SysApp() {
  const L = useL();
  return (
    <div className="vs-app">
      <Browser url="app.tuempresa.com"><div className="vs-app__rows">{[0, 1, 2, 3].map((i) => <i key={i} />)}</div></Browser>
      <div className="vs-app__phone"><b>{L("Pedidos", "Pedidos")}</b>{[0, 1, 2].map((i) => <i key={i} />)}</div>
    </div>
  );
}
function SysBoard() {
  const L = useL();
  const cols = L([["Nuevo", 2], ["En curso", 3], ["Listo", 2]], [["Novo", 2], ["Em andamento", 3], ["Pronto", 2]]) as [string, number][];
  return (
    <div className="vs-board">
      {cols.map(([t, n], c) => (
        <div key={t} className="vs-board__col"><small>{t}</small>{Array.from({ length: n }, (_, i) => <i key={i} className={c === 1 && i === 0 ? "move" : ""} />)}</div>
      ))}
    </div>
  );
}
const SysDash = () => (
  <div className="vs-dash">
    <div className="vs-dash__kpis"><i /><i /><i /></div>
    <div className="vs-dash__bars">{[40, 62, 48, 75, 58, 88, 70].map((h, i) => <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />)}</div>
  </div>
);
function SysOps() {
  const L = useL();
  const items = L(["Control de calidad", "Carga de remito", "Firma del cliente"], ["Controle de qualidade", "Lançamento do romaneio", "Assinatura do cliente"]);
  return (
    <div className="vs-ops">
      {items.map((t, i) => <div key={t} style={{ animationDelay: `${0.3 + i * 0.5}s` }}><span>✓</span>{t}</div>)}
    </div>
  );
}
function SysPortal() {
  const L = useL();
  const st = L(["Recibido", "En preparación", "En camino", "Entregado"], ["Recebido", "Em preparação", "A caminho", "Entregue"]);
  return (
    <Browser url="clientes.tuempresa.com">
      <div className="vs-portal">
        <b>{L("Tu pedido #1042", "Seu pedido #1042")}</b>
        <ol>{st.map((s, i) => <li key={s} className={i < 2 ? "done" : i === 2 ? "now" : ""}>{s}</li>)}</ol>
        <span className="vs-portal__dl">{L("Descargar factura", "Baixar nota")} ↓</span>
      </div>
    </Browser>
  );
}

/* --- Intelligence --- */
function IntFlow() {
  const L = useL();
  const n = L(["Llega un pedido", "Se valida", "Se carga", "Se avisa"], ["Chega um pedido", "É validado", "É lançado", "Avisa"]);
  return <div className="vi-flow">{n.map((t, i) => <span key={t} style={{ animationDelay: `${i * 0.35}s` }}>{t}</span>)}</div>;
}
const IntHub = () => (
  <div className="vi-hub">
    <span className="vi-hub__c">Nexa</span>
    {["CRM", "Tienda", "Planillas", "Mail", "WhatsApp", "ERP"].map((t, i) => <span key={t} className={`vi-hub__n n${i}`}>{t}</span>)}
  </div>
);
function IntChat() {
  const L = useL();
  return (
    <div className="vi-chat">
      <p className="in">{L("¿A qué hora abren el sábado?", "Que horas abrem no sábado?")}</p>
      <p className="out">{L("Los sábados de 10 a 14 h. ¿Querés que te reserve un turno?", "Aos sábados das 10 às 14 h. Quer que eu reserve um horário?")}</p>
      <p className="in">{L("Sí, a las 11", "Sim, às 11")}</p>
      <p className="out">{L("Listo. Te paso a una persona para confirmar el pago.", "Pronto. Vou te passar para uma pessoa confirmar o pagamento.")}</p>
    </div>
  );
}
function IntDoc() {
  const L = useL();
  const f = L([["Proveedor", "Proveedor Sur"], ["Fecha", "12/11"], ["Total", "$ 248.300"]], [["Fornecedor", "Fornecedor Sul"], ["Data", "12/11"], ["Total", "R$ 2.483"]]);
  return (
    <div className="vi-doc">
      <div className="vi-doc__page"><i className="h" /><i /><i className="hl" /><i /><i className="hl" /><i /><i className="hl" /></div>
      <span aria-hidden>→</span>
      <div className="vi-doc__table">{f.map(([k, v], i) => <div key={k} style={{ animationDelay: `${0.4 + i * 0.3}s` }}><em>{k}</em>{v}</div>)}</div>
    </div>
  );
}

const MAP = {
  experience: [ExpSite, ExpShop, ExpMotion, ExpUx],
  systems: [SysApp, SysBoard, SysDash, SysOps, SysPortal],
  intelligence: [IntFlow, IntHub, IntChat, IntDoc],
} as const;

export function ServiceVisual({ division, i }: { division: keyof typeof MAP; i: number }) {
  const V = MAP[division][i] ?? MAP[division][0];
  return <div className="svv" aria-hidden><V /></div>;
}

/** Composición del encabezado de cada división (tres esquemas superpuestos). */
export function HeroArt({ division }: { division: keyof typeof MAP }) {
  const list = MAP[division];
  const pick = [0, 1, list.length - 1];
  return (
    <div className={`hero-art hero-art--${division}`} aria-hidden>
      {pick.map((i, j) => { const V = list[i]!; return <div key={j} className={`hero-art__card c${j}`}><V /></div>; })}
    </div>
  );
}
