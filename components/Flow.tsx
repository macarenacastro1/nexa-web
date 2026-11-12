"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useL } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

const ICONS = [
  <path key="r" d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  <path key="u" d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3zM9 22h6" />,
  <path key="e" d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  <path key="c" d="M20 6 9 17l-5-5" />,
];

export default function Flow() {
  const L = useL();
  const STAGES = [
    { t: L("Recibe", "Recebe"), d: L("Llega un mail con una factura adjunta.", "Chega um e-mail com uma nota anexada.") },
    { t: L("Entiende", "Entende"), d: L("La IA lee el PDF y extrae los datos.", "A IA lê o PDF e extrai os dados.") },
    { t: L("Carga", "Lança"), d: L("Se registra en el sistema y el pago queda listo para aprobar.", "É registrada no sistema e o pagamento fica pronto para aprovar.") },
    { t: L("Avisa", "Avisa"), d: L("Una persona aprueba el pago y se avisa a quien corresponde.", "Uma pessoa aprova o pagamento e quem precisa é avisado.") },
  ];
  const FIELDS: [string, string][] = L(
    [["Proveedor", "Andes Textil SA"], ["CUIT", "30-71234567-8"], ["Comprobante", "A 0003-00012876"], ["Importe", "$ 1.248.300"], ["Vencimiento", "14/11/2026"], ["Categoría", "Insumos · 98%"]],
    [["Fornecedor", "Têxtil Andes Ltda"], ["CNPJ", "12.345.678/0001-90"], ["Documento", "NF-e 000.128.76"], ["Valor", "R$ 124.830,00"], ["Vencimento", "14/11/2026"], ["Categoria", "Insumos · 98%"]],
  );
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 721px)", () => {
        ScrollTrigger.create({
          trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.4,
          onUpdate: (s) => setP(s.progress),
        });
      });
      mm.add("(max-width: 720px)", () => {
        // en celular: se reproduce sola al entrar en pantalla
        const o = { v: 0 };
        gsap.to(o, { v: 1, duration: 7, ease: "none", onUpdate: () => setP(o.v), scrollTrigger: { trigger: root.current, start: "top 60%" } });
      });
      gsap.from(".flow__head > *", { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const q = Math.min(1, Math.max(0, (p - 0.06) / 0.86)); // recorrido útil
  const active = q <= 0 ? -1 : Math.min(3, Math.floor(q * 4));
  const local = q * 4 - active; // progreso dentro del paso activo
  const fields = active > 1 ? FIELDS.length : active === 1 ? Math.floor(local * (FIELDS.length + 1)) : 0;
    const state = (i: number) => (active > i ? " done" : active === i ? " on" : "");

  return (
    <section className="flow" id="flujo" ref={root} aria-label={L("Ejemplo: procesamiento de facturas", "Exemplo: processamento de notas")}>
      <div className="flow__sticky">
        <div className="container">
          <div className="flow__head">
            <div>
              <p className="label">{L("Ejemplo · procesamiento de facturas", "Exemplo · processamento de notas")}</p>
              <h2 className="h2">{L("Del mail al sistema,", "Do e-mail ao sistema,")}<br /><span className="serif ctrl">{L("con aprobación humana.", "com aprovação humana.")}</span></h2>
            </div>
            <div className="flow__timer flow__timer--demo">{L("Demo ilustrativa · datos ficticios", "Demo ilustrativa · dados fictícios")}</div>
          </div>

          <div className="stages">
            <div className="stages__line"><i style={{ transform: `scaleX(${q})` }} /></div>
            <div className="stages__packet" style={{ left: `calc(12.5% + ${q * 75}%)`, opacity: q > 0 && q < 1 ? 1 : 0 }} />
            {STAGES.map((s, i) => (
              <div key={s.t} className={`stg${state(i)}`}>
                <div className="stg__node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[i]}</svg></div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <div className="stg__card">
                  {i === 0 && (
                    <div className="mailcard">
                      <div className="from"><span className="av">AT</span><div><strong>{L("Andes Textil SA", "Têxtil Andes Ltda")}</strong><small>{L("facturacion@andestextil.com", "financeiro@textilandes.com.br")}</small></div></div>
                      <div className="subj">{L("Factura A 0003-00012876", "NF-e 000.128.76")}</div>
                      <div className="body">{L("Hola, adjuntamos la factura correspondiente al pedido de octubre. Saludos.", "Olá, segue a nota referente ao pedido de outubro. Abraços.")}</div>
                      <div className="att"><i>PDF</i> {L("factura_12876.pdf", "nfe_12876.pdf")} · 184 KB</div>
                    </div>
                  )}
                  {i === 1 && FIELDS.map(([k, v], j) => (
                    <div key={k} className={`fld${j < fields ? " in" : ""}`}><span>{k}</span><b>{v}</b></div>
                  ))}
                  {i === 2 && (
                    <div className="erp">
                      <div className="r h"><span>{L("Comprobante", "Documento")}</span><span>{L("Proveedor", "Fornecedor")}</span><span>{L("Estado", "Status")}</span></div>
                      <div className="r"><span>A-12871</span><span>{L("Hilados Sur", "Fios Sul")}</span><span>{L("Pagada", "Paga")}</span></div>
                      <div className="r"><span>A-12874</span><span>{L("Tintes BA", "Tintas SP")}</span><span>{L("Pagada", "Paga")}</span></div>
                      {active >= 2 && <div className="r new"><span>A-12876</span><span>{L("Andes Textil", "Têxtil Andes")}</span><span>{L("Prog. 13/11", "Agend. 13/11")}</span></div>}
                      {active >= 2 && local > 0.4 || active > 2 ? (
                        <div className="tags"><span>✓ ERP</span><span>{L("Pago para aprobar", "Pagamento para aprovar")}</span><span>✓ CRM</span></div>
                      ) : null}
                    </div>
                  )}
                  {i === 3 && (
                    <div className="done-card">
                      {active >= 3 && (
                        <>
                          <div className="ntf"><i>✓</i><div><strong>{L("Administración", "Financeiro")}</strong><small>{L("Factura cargada · pago listo para aprobar", "Nota lançada · pagamento pronto para aprovar")}</small></div></div>
                          {local > 0.35 && <div className="ntf"><i>W</i><div><strong>{L("WhatsApp · Dueño", "WhatsApp · Dono")}</strong><small>{L("“Pago a Andes Textil listo para el 13/11”", "“Pagamento à Têxtil Andes pronto para 13/11”")}</small></div></div>}
                          {local > 0.7 && <p className="done-sum">{L("Pago aprobado por una persona del equipo.", "Pagamento aprovado por uma pessoa da equipe.")}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
