// Contenido del escritorio caótico: ventanas, anotaciones a mano y notificaciones (ES / PT).
import type { ReactNode } from "react";

/** Elige el texto según el idioma: L("español", "português"). */
export type Pick = <T>(es: T, pt: T) => T;

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
    <span className="tl"><i data-close /><i /><i /></span>
    <span>{title}</span>
    {badge && <b className="badge">{badge}</b>}
  </div>
);

export const getWindows = (L: Pick): Win[] => [
  {
    id: "mail", x: 2.5, y: 12, w: 320, r: -4, depth: 0.7, kind: "bar",
    node: (
      <div className="win">
        <Bar title={L("Bandeja de entrada — 2.318 sin leer", "Caixa de entrada — 2.318 não lidos")} badge="99+" />
        <div className="win__body">
          {[
            [L("URGENTE: factura vencida", "URGENTE: boleto vencido"), L("Andes Textil SA · 2º aviso", "Têxtil Andes Ltda · 2º aviso"), "09:12"],
            [L("Re: Re: Re: ¿Pudiste ver el presupuesto?", "Re: Re: Re: Conseguiu ver o orçamento?"), L("Cliente esperando hace 3 días", "Cliente esperando há 3 dias"), "08:47"],
            [L("Pedido #4471 sin confirmar", "Pedido #4471 sem confirmar"), L("Ventas online", "Vendas online"), "08:30"],
            [L("Reclamo: nadie me responde", "Reclamação: ninguém me responde"), L("soporte@ · prioridad alta", "suporte@ · prioridade alta"), L("Ayer", "Ontem")],
            [L("Reunión movida (otra vez)", "Reunião remarcada (de novo)"), L("Calendario", "Agenda"), L("Ayer", "Ontem")],
          ].map(([a, b, t]) => (
            <div className="mail-row" key={a}><span className="dot" /><div><strong>{a}</strong><small>{b}</small></div><time>{t}</time></div>
          ))}
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 320 240", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 34 116 C 110 122, 190 112, 262 118 M 268 118 C 300 112, 330 96, 352 70",
      text: L("¡3 días sin responder!", "3 dias sem resposta!"), ok: L("respondido ✓", "respondido ✓"), at: { left: "92%", top: "12%" }, d: 0.2,
    },
  },
  {
    id: "sheet", x: 66, y: 11, w: 345, r: 3, depth: 0.55, kind: "bar",
    node: (
      <div className="win win--light">
        <Bar title={L("Pedidos_FINAL_v3 (2).xlsx", "Pedidos_FINAL_v3 (2).xlsx")} />
        <div className="sheet">
          {["", "A", "B", "C", "D"].map((h) => <span className="h" key={"h" + h}>{h}</span>)}
          {[
            ["1", L("Cliente", "Cliente"), L("Monto", "Valor"), L("Estado", "Status"), L("Stock", "Estoque")],
            ["2", "Moda Norte", L("$184.000", "R$ 18.400"), L("¿pagó?", "pagou?"), "#REF!"],
            ["3", L("Dist. Sur", "Dist. Sul"), L("$92.500", "R$ 9.250"), L("pendiente", "pendente"), "12"],
            ["4", L("Textil Andes", "Têxtil Andes"), L("#¡VALOR!", "#VALOR!"), "???", "-4"],
            ["5", L("Local Centro", "Loja Centro"), L("$41.200", "R$ 4.120"), L("duplicado", "duplicado"), "0"],
            ["6", L("Tienda Web", "Loja Web"), L("$77.900", "R$ 7.790"), L("sin cargar", "não lançado"), "#N/A"],
          ].map((row) =>
            row.map((c, i) => (
              <span key={row[0] + i} className={i === 0 ? "h" : /#|\?|-4|duplicado/.test(c) ? "bad" : /pendiente|pendente|sin cargar|não lançado/.test(c) ? "warn" : ""}>{c}</span>
            ))
          )}
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 345 190", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 300 60 C 350 58, 356 132, 302 140 C 246 146, 240 66, 296 58 M 250 210 C 262 186, 272 166, 282 146",
      text: L("¿¿quién cargó esto??", "quem lançou isso??"), ok: L("validado ✓", "validado ✓"), at: { left: "36%", top: "106%" }, d: 0.5,
    },
  },
  {
    id: "wa", x: 74, y: 49, w: 290, r: -3, depth: 0.85, kind: "bar",
    node: (
      <div className="win">
        <Bar title="WhatsApp Business" badge="47" />
        <div className="win__body">
          <div className="chat-row"><span className="av" style={{ background: "#2bf59c" }}>LG</span><div><strong>Laura G.</strong><small>{L("escribiendo", "digitando")}<span className="typing"><i /><i /><i /></span></small></div><i className="badge">12</i></div>
          {[
            ["#4c8dff", "MP", L("Martín P.", "Marcos P."), L("¿Precio por mayor?", "Preço no atacado?"), "5"],
            ["#ffb547", "SC", L("Sofía C.", "Sofia C."), L("Quiero cambiar el pedido", "Quero trocar o pedido"), "8"],
            ["#a78bfa", "DR", L("Diego R.", "Diego R."), L("¿Hacen envíos a Córdoba?", "Vocês entregam em Curitiba?"), "3"],
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
        <strong>{L("No se pudo sincronizar", "Falha na sincronização")}</strong>
        <p>{L("Hay 3 versiones distintas de la lista de precios.", "Existem 3 versões diferentes da tabela de preços.")}</p>
        <div className="btns"><span>{L("Ignorar", "Ignorar")}</span><span>{L("Reintentar", "Tentar de novo")}</span></div>
      </div>
    ),
  },
  {
    id: "sticky1", x: 25, y: 66, w: 170, r: -7, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky" data-drag>{L("Llamar al contador!!!", "Ligar pro contador!!!")}<br />URGENTE<br />{L("(antes del viernes)", "(antes de sexta)")}</div>,
  },
  {
    id: "invoice", x: 54, y: 66, w: 250, r: 4, depth: 0.6, kind: "bar", hideSm: true,
    node: (
      <div className="win win--light">
        <Bar title={L("Factura_A_0003-00012876.pdf", "NF-e_000.128.76.pdf")} />
        <div className="invoice">
          <div className="row"><span>{L("Proveedor", "Fornecedor")}</span><b>{L("Andes Textil SA", "Têxtil Andes Ltda")}</b></div>
          <div className="row"><span>{L("Vencimiento", "Vencimento")}</span><b>{L("Hoy", "Hoje")}</b></div>
          <div className="tot"><span style={{ fontSize: 11, fontWeight: 500 }}>Total</span>{L("$1.248.300", "R$ 124.830")}</div>
          <span className="stamp">{L("VENCE HOY", "VENCE HOJE")}</span>
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 250 170", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 60 136 C 20 140, 18 170, 70 172 C 124 174, 132 140, 80 134 M 140 160 C 190 166, 230 176, 262 190",
      text: L("¿se pagó??", "foi pago??"), ok: L("pagada ✓", "paga ✓"), at: { left: "88%", top: "104%" }, d: 0.8,
    },
  },
  {
    id: "ig", x: 31, y: 14, w: 270, r: 2, depth: 0.75, kind: "toast",
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#e45fa0" }}>IG</span>
        <div><strong>Instagram</strong><small>{L("34 comentarios y 19 mensajes sin responder", "34 comentários e 19 mensagens sem resposta")}</small><em>{L("hace 2 min", "há 2 min")}</em></div>
      </div>
    ),
  },
  {
    id: "sys", x: 84, y: 28, w: 230, r: -5, depth: 0.5, kind: "bar", hideSm: true,
    node: (
      <div className="win">
        <Bar title={L("Estado de sistemas", "Status dos sistemas")} />
        <div className="sys">
          <div className="n">ERP <small>{L("● sin conexión", "● sem conexão")}</small></div>
          <div className="brk">— ✕ —</div>
          <div className="n">{L("Tienda web", "Loja virtual")} <small>{L("● 3 días sin sync", "● 3 dias sem sync")}</small></div>
        </div>
      </div>
    ),
  },
  {
    id: "sticky2", x: 88, y: 77, w: 150, r: 7, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky sticky--pink" data-drag>{L("Stock?? revisar planilla v3_FINAL", "Estoque?? ver planilha v3_FINAL")}</div>,
  },
  {
    id: "crm", x: 11, y: 37, w: 255, r: -2, depth: 0.9, kind: "toast",
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ff6b5b" }}>CRM</span>
        <div><strong>{L("47 leads sin seguimiento", "47 leads sem follow-up")}</strong><small>{L("El más antiguo: hace 12 días", "O mais antigo: há 12 dias")}</small><em>{L("ahora", "agora")}</em></div>
      </div>
    ),
  },
  {
    id: "file", x: 61, y: 36, w: 250, r: -6, depth: 0.8, kind: "alert",
    node: (
      <div className="win alert-win" data-shake>
        <div className="ico">⚠</div>
        <strong>{L("Archivo en uso", "Arquivo em uso")}</strong>
        <p>{L("“Clientes_definitivo_ESTE.xlsx” está abierto por otra persona.", "“Clientes_definitivo_ESSE.xlsx” está aberto por outra pessoa.")}</p>
        <div className="btns"><span>{L("Cancelar", "Cancelar")}</span><span>{L("Solo lectura", "Somente leitura")}</span></div>
      </div>
    ),
  },
  {
    id: "cal", x: 1.5, y: 76, w: 280, r: 3, depth: 0.65, kind: "bar", hideSm: true,
    node: (
      <div className="win">
        <Bar title={L("Calendario — Esta semana", "Agenda — Esta semana")} badge="6" />
        <div className="win__body cal">
          {(L(["Lun", "Mar", "Mié", "Jue", "Vie"], ["Seg", "Ter", "Qua", "Qui", "Sex"])).map((d) => <span key={d} className="d">{d}</span>)}
          <span className="ev">{L("Reunión", "Reunião")}</span><span className="ev2">{L("Entrega", "Entrega")}</span><span className="ev">Call</span><span className="ev3">{L("Pagos", "Pagtos")}</span><span className="ev2">{L("Vence", "Vence")}</span>
          <span className="ev2">{L("Reclamo", "Reclamação")}</span><span className="ev">Call</span><span className="ev3">{L("Stock", "Estoque")}</span><span className="ev">{L("Reunión", "Reunião")}</span><span className="ev2">{L("Choque", "Conflito")}</span>
        </div>
      </div>
    ),
    note: {
      viewBox: "0 0 280 120", svg: { left: "0", top: "0", width: "100%", height: "100%" },
      path: "M 226 88 L 274 110 M 274 86 L 228 112",
      text: L("otra vez…", "de novo…"), ok: L("reorganizado ✓", "reorganizado ✓"), at: { left: "70%", top: "-26%" }, d: 1.1,
    },
  },
  {
    id: "sticky3", x: 49, y: 13, w: 150, r: -4, depth: 1, kind: "sticky", hideSm: true,
    node: <div className="sticky sticky--blue" data-drag>{L("23:47 — otra vez tarde en la oficina", "23:47 — de novo até tarde no escritório")}</div>,
  },
  {
    id: "backup", x: 82, y: 4.5, w: 250, r: 4, depth: 0.45, kind: "toast", hideSm: true,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ffb547" }}>!</span>
        <div><strong>{L("Sistema", "Sistema")}</strong><small>{L("La copia de seguridad falló (otra vez)", "O backup falhou (de novo)")}</small><em>{L("hace 5 min", "há 5 min")}</em></div>
      </div>
    ),
  },
];

export type Tpl = { app: string; color: string; ico: string; title: string; body: string };
export const getNotifs = (L: Pick): Tpl[] => [
  { app: "WhatsApp", color: "#2bf59c", ico: "W", title: L("Carla R.", "Carla R."), body: L("¿Me pasás el precio actualizado?", "Me manda o preço atualizado?") },
  { app: L("Correo", "E-mail"), color: "#4c8dff", ico: "@", title: L("Andes Textil SA", "Têxtil Andes Ltda"), body: L("Adjunto factura vencida. Por favor confirmar pago.", "Segue boleto vencido. Favor confirmar pagamento.") },
  { app: L("Banco", "Banco"), color: "#4c8dff", ico: "$", title: L("Débito rechazado", "Débito recusado"), body: L("Fondos insuficientes en cuenta corriente.", "Saldo insuficiente na conta corrente.") },
  { app: L("Calendario", "Agenda"), color: "#ff6b5b", ico: "31", title: L("Reunión en 5 minutos", "Reunião em 5 minutos"), body: L("Revisión de stock con proveedores", "Revisão de estoque com fornecedores") },
  { app: "Excel", color: "#2bf59c", ico: "X", title: L("Conflicto de versiones", "Conflito de versões"), body: L("Stock_2026_FINAL.xlsx fue modificado por 2 personas", "Estoque_2026_FINAL.xlsx foi alterado por 2 pessoas") },
  { app: "CRM", color: "#ff6b5b", ico: "C", title: L("Lead sin responder", "Lead sem resposta"), body: L("Juan M. espera respuesta hace 48 h", "João M. espera resposta há 48 h") },
  { app: "Instagram", color: "#e45fa0", ico: "IG", title: L("12 mensajes nuevos", "12 mensagens novas"), body: L("“¿Tienen talle M?” y 11 más", "“Tem tamanho M?” e mais 11") },
  { app: L("Sistema", "Sistema"), color: "#ffb547", ico: "!", title: L("Error de sincronización", "Erro de sincronização"), body: L("ERP ↔ tienda web: 37 productos sin actualizar", "ERP ↔ loja virtual: 37 produtos sem atualizar") },
  { app: L("Tareas", "Tarefas"), color: "#a78bfa", ico: "✓", title: L("3 tareas vencieron hoy", "3 tarefas venceram hoje"), body: L("Cargar pedidos · Conciliar pagos · Responder reclamos", "Lançar pedidos · Conciliar pagamentos · Responder reclamações") },
  { app: "WhatsApp", color: "#2bf59c", ico: "W", title: L("Martín P.", "Marcos P."), body: L("Hola?? Sigo esperando el presupuesto", "Oi?? Ainda estou esperando o orçamento") },
  { app: L("Correo", "E-mail"), color: "#4c8dff", ico: "@", title: L("Contador", "Contador"), body: L("Me faltan las facturas de octubre 🙃", "Faltam as notas de outubro 🙃") },
  { app: L("Ventas", "Vendas"), color: "#2de2d0", ico: "#", title: L("Pedido duplicado", "Pedido duplicado"), body: L("#4471 y #4472 parecen el mismo pedido", "#4471 e #4472 parecem o mesmo pedido") },
];
