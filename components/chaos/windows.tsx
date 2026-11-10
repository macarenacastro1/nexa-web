// Contenido del escritorio caótico: ventanas, anotaciones a mano y notificaciones.
import type { ReactNode } from "react";

export type Note = {
  // posiciones en % relativas a la ventana
  path: string; viewBox: string; svg: { left: string; top: string; width: string; height: string };
  text: string; ok: string; at: { left: string; top: string }; d?: number;
};
export type Win = {
  id: string; x: number; y: number; w: number; r: number; depth: number;
  kind: "bar" | "toast" | "alert" | "sticky"; hideSm?: boolean; node: ReactNode; note?: Note;
};

export const Bar = ({ title, badge }: { title: string; badge?: string }) => (
  <div className="win__bar" data-drag>
    <span className="tl"><i data-close title="Cerrar" /><i /><i /></span>
    <span>{title}</span>
    {badge && <b className="badge">{badge}</b>}
  </div>
);

export const WINDOWS: Win[] = [
  {
    id: "mail", x: 2.5, y: 12, w: 320, r: -4, depth: 0.7, kind: "bar",
    node: (
      <div className="win">
        <Bar title="Bandeja de entrada — 2.318 sin leer" badge="99+" />
        <div className="win__body">
          {[
            ["URGENTE: factura vencida", "Andes Textil SA · 2º aviso", "09:12"],
            ["Re: Re: Re: ¿Pudiste ver el presupuesto?", "Cliente esperando hace 3 días", "08:47"],
            ["Pedido #4471 sin confirmar", "Ventas online", "08:30"],
            ["Reclamo: nadie me responde", "soporte@ · prioridad alta", "Ayer"],
            ["Reunión movida (otra vez)", "Calendario", "Ayer"],
          ].map(([a, b, t]) => (
            <div className="mail-row" key={a}><span className="dot" /><div><strong>{a}</strong><small>{b}</small></div><time>{t}</time></div>
          ))}
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 320 240", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 34 116 C 110 122, 190 112, 262 118 M 268 118 C 300 112, 330 96, 352 70",
      text: "¡3 días sin responder!", ok: "respondido ✓", at: { left: "92%", top: "12%" }, d: 0.2,
    },
  },
  {
    id: "sheet", x: 66, y: 11, w: 345, r: 3, depth: 0.55, kind: "bar",
    node: (
      <div className="win win--light">
        <Bar title="Pedidos_FINAL_v3 (2).xlsx" />
        <div className="sheet">
          {["", "A", "B", "C", "D"].map((h) => <span className="h" key={"h" + h}>{h}</span>)}
          {[
            ["1", "Cliente", "Monto", "Estado", "Stock"],
            ["2", "Moda Norte", "$184.000", "¿pagó?", "#REF!"],
            ["3", "Dist. Sur", "$92.500", "pendiente", "12"],
            ["4", "Textil Andes", "#¡VALOR!", "???", "-4"],
            ["5", "Local Centro", "$41.200", "duplicado", "0"],
            ["6", "Tienda Web", "$77.900", "sin cargar", "#N/A"],
          ].map((row) =>
            row.map((c, i) => (
              <span key={row[0] + i} className={i === 0 ? "h" : /#|\?|-4|duplicado/.test(c) ? "bad" : /pendiente|sin cargar/.test(c) ? "warn" : ""}>{c}</span>
            ))
          )}
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 345 190", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 300 60 C 350 58, 356 132, 302 140 C 246 146, 240 66, 296 58 M 250 210 C 262 186, 272 166, 282 146",
      text: "¿¿quién cargó esto??", ok: "validado ✓", at: { left: "36%", top: "106%" }, d: 0.5,
    },
  },
  {
    id: "wa", x: 74, y: 49, w: 290, r: -3, depth: 0.85, kind: "bar",
    node: (
      <div className="win">
        <Bar title="WhatsApp Business" badge="47" />
        <div className="win__body">
          <div className="chat-row"><span className="av" style={{ background: "#25d366" }}>LG</span><div><strong>Laura G.</strong><small>escribiendo<span className="typing"><i /><i /><i /></span></small></div><i className="badge">12</i></div>
          {[
            ["#0a84ff", "MP", "Martín P.", "¿Precio por mayor?", "5"],
            ["#ff9f0a", "SC", "Sofía C.", "Quiero cambiar el pedido", "8"],
            ["#bf5af2", "DR", "Diego R.", "¿Hacen envíos a Córdoba?", "3"],
          ].map(([c, i, n, m, b]) => (
            <div className="chat-row" key={n}><span className="av" style={{ background: c }}>{i}</span><div><strong>{n}</strong><small>{m}</small></div><i className="badge">{b}</i></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "alert", x: 7, y: 56, w: 250, r: 5, depth: 0.95, kind: "alert",
    node: (
      <div className="win alert-win" data-shake>
        <div className="ico">!</div>
        <strong>No se pudo sincronizar</strong>
        <p>Hay 3 versiones distintas de la lista de precios.</p>
        <div className="btns"><span>Ignorar</span><span>Reintentar</span></div>
      </div>
    ),
  },
  {
    id: "sticky1", x: 25, y: 66, w: 170, r: -7, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky" data-drag>Llamar al contador!!!<br />URGENTE<br />(antes del viernes)</div>,
  },
  {
    id: "invoice", x: 54, y: 66, w: 250, r: 4, depth: 0.6, kind: "bar", hideSm: true,
    node: (
      <div className="win win--light">
        <Bar title="Factura_A_0003-00012876.pdf" />
        <div className="invoice">
          <div className="row"><span>Proveedor</span><b>Andes Textil SA</b></div>
          <div className="row"><span>Vencimiento</span><b>Hoy</b></div>
          <div className="tot"><span style={{ fontSize: 11, fontWeight: 500 }}>Total</span>$1.248.300</div>
          <span className="stamp">VENCE HOY</span>
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 250 170", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 60 136 C 20 140, 18 170, 70 172 C 124 174, 132 140, 80 134 M 140 160 C 190 166, 230 176, 262 190",
      text: "¿se pagó??", ok: "pagada ✓", at: { left: "88%", top: "104%" }, d: 0.8,
    },
  },
  {
    id: "ig", x: 31, y: 14, w: 270, r: 2, depth: 0.75, kind: "toast",
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)" }}>IG</span>
        <div><strong>Instagram</strong><small>34 comentarios y 19 mensajes sin responder</small><em>hace 2 min</em></div>
      </div>
    ),
  },
  {
    id: "sys", x: 84, y: 28, w: 230, r: -5, depth: 0.5, kind: "bar", hideSm: true,
    node: (
      <div className="win">
        <Bar title="Estado de sistemas" />
        <div className="sys">
          <div className="n">ERP <small>● sin conexión</small></div>
          <div className="brk">— ✕ —</div>
          <div className="n">Tienda web <small>● 3 días sin sync</small></div>
        </div>
      </div>
    ),
  },
  {
    id: "sticky2", x: 88, y: 77, w: 150, r: 7, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky sticky--pink" data-drag>Stock?? revisar planilla v3_FINAL</div>,
  },
  {
    id: "crm", x: 11, y: 37, w: 255, r: -2, depth: 0.9, kind: "toast",
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ff6b5b" }}>CRM</span>
        <div><strong>47 leads sin seguimiento</strong><small>El más antiguo: hace 12 días</small><em>ahora</em></div>
      </div>
    ),
  },
  {
    id: "file", x: 61, y: 36, w: 250, r: -6, depth: 0.8, kind: "alert",
    node: (
      <div className="win alert-win" data-shake>
        <div className="ico">⚠</div>
        <strong>Archivo en uso</strong>
        <p>“Clientes_definitivo_ESTE.xlsx” está abierto por otra persona.</p>
        <div className="btns"><span>Cancelar</span><span>Solo lectura</span></div>
      </div>
    ),
  },
  {
    id: "cal", x: 1.5, y: 76, w: 280, r: 3, depth: 0.65, kind: "bar", hideSm: true,
    node: (
      <div className="win">
        <Bar title="Calendario — Esta semana" badge="6" />
        <div className="win__body cal">
          {["Lun", "Mar", "Mié", "Jue", "Vie"].map((d) => <span key={d} className="d">{d}</span>)}
          <span className="ev">Reunión</span><span className="ev2">Entrega</span><span className="ev">Call</span><span className="ev3">Pagos</span><span className="ev2">Vence</span>
          <span className="ev2">Reclamo</span><span className="ev">Call</span><span className="ev3">Stock</span><span className="ev">Reunión</span><span className="ev2">Choque</span>
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 280 120", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 226 88 L 274 110 M 274 86 L 228 112",
      text: "otra vez…", ok: "reorganizado ✓", at: { left: "70%", top: "-26%" }, d: 1.1,
    },
  },
  {
    id: "sticky3", x: 49, y: 13, w: 150, r: -4, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky sticky--blue" data-drag>23:47 — otra vez tarde en la oficina</div>,
  },
  {
    id: "backup", x: 82, y: 4.5, w: 250, r: 4, depth: 0.45, kind: "toast", hideSm: true,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ff9f0a" }}>!</span>
        <div><strong>Sistema</strong><small>La copia de seguridad falló (otra vez)</small><em>hace 5 min</em></div>
      </div>
    ),
  },
];

export type Tpl = { app: string; color: string; ico: string; title: string; body: string };
export const NOTIFS: Tpl[] = [
  { app: "WhatsApp", color: "#25d366", ico: "W", title: "Carla R.", body: "¿Me pasás el precio actualizado?" },
  { app: "Correo", color: "#4c8dff", ico: "@", title: "Andes Textil SA", body: "Adjunto factura vencida. Por favor confirmar pago." },
  { app: "Banco", color: "#0a84ff", ico: "$", title: "Débito rechazado", body: "Fondos insuficientes en cuenta corriente." },
  { app: "Calendario", color: "#ff453a", ico: "31", title: "Reunión en 5 minutos", body: "Revisión de stock con proveedores" },
  { app: "Excel", color: "#1f9d55", ico: "X", title: "Conflicto de versiones", body: "Stock_2026_FINAL.xlsx fue modificado por 2 personas" },
  { app: "CRM", color: "#ff6b5b", ico: "C", title: "Lead sin responder", body: "Juan M. espera respuesta hace 48 h" },
  { app: "Instagram", color: "#dd2a7b", ico: "IG", title: "12 mensajes nuevos", body: "“¿Tienen talle M?” y 11 más" },
  { app: "Sistema", color: "#ff9f0a", ico: "!", title: "Error de sincronización", body: "ERP ↔ tienda web: 37 productos sin actualizar" },
  { app: "Tareas", color: "#bf5af2", ico: "✓", title: "3 tareas vencieron hoy", body: "Cargar pedidos · Conciliar pagos · Responder reclamos" },
  { app: "WhatsApp", color: "#25d366", ico: "W", title: "Martín P.", body: "Hola?? Sigo esperando el presupuesto" },
  { app: "Correo", color: "#4c8dff", ico: "@", title: "Contador", body: "Me faltan las facturas de octubre 🙃" },
  { app: "Ventas", color: "#2de2d0", ico: "#", title: "Pedido duplicado", body: "#4471 y #4472 parecen el mismo pedido" },
];
