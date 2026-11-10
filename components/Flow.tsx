"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ICONS = [
  <path key="r" d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  <path key="u" d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3zM9 22h6" />,
  <path key="e" d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  <path key="c" d="M20 6 9 17l-5-5" />,
];
const STAGES = [
  { t: "RECEIVE", d: "Llega un mail con una factura adjunta." },
  { t: "UNDERSTAND", d: "La IA lee el PDF y extrae los datos." },
  { t: "EXECUTE", d: "Se carga en el ERP y se programa el pago." },
  { t: "COMPLETE", d: "Todos quedan avisados. Nadie tocó nada." },
];
const FIELDS = [
  ["Proveedor", "Andes Textil SA"],
  ["CUIT", "30-71234567-8"],
  ["Comprobante", "A 0003-00012876"],
  ["Importe", "$ 1.248.300"],
  ["Vencimiento", "14/11/2026"],
  ["Categoría", "Insumos · 98%"],
];

export default function Flow() {
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
  const secs = q * 6;
  const state = (i: number) => (active > i ? " done" : active === i ? " on" : "");

  return (
    <section className="flow" id="flujo" ref={root} aria-label="Cómo funciona una automatización">
      <div className="flow__sticky">
        <div className="container">
          <div className="flow__head">
            <div>
              <p className="label"><b>03</b> El flujo</p>
              <h2 className="h2">From inbox to done.<br /><span className="serif" style={{ color: "var(--mute)" }}>Without anyone touching it.</span></h2>
            </div>
            <div className="flow__timer">Tiempo total<b>00:0{Math.min(6, Math.floor(secs))}<span style={{ color: "var(--mute-2)" }}>.{Math.floor((secs % 1) * 10)}</span></b>antes: 24 min a mano</div>
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
                      <div className="from"><span className="av">AT</span><div><strong>Andes Textil SA</strong><small>facturacion@andestextil.com</small></div></div>
                      <div className="subj">Factura A 0003-00012876</div>
                      <div className="body">Hola, adjuntamos la factura correspondiente al pedido de octubre. Saludos.</div>
                      <div className="att"><i>PDF</i> factura_12876.pdf · 184 KB</div>
                    </div>
                  )}
                  {i === 1 && FIELDS.map(([k, v], j) => (
                    <div key={k} className={`fld${j < fields ? " in" : ""}`}><span>{k}</span><b>{v}</b></div>
                  ))}
                  {i === 2 && (
                    <div className="erp">
                      <div className="r h"><span>Comprobante</span><span>Proveedor</span><span>Estado</span></div>
                      <div className="r"><span>A-12871</span><span>Hilados Sur</span><span>Pagada</span></div>
                      <div className="r"><span>A-12874</span><span>Tintes BA</span><span>Pagada</span></div>
                      {active >= 2 && <div className="r new"><span>A-12876</span><span>Andes Textil</span><span>Prog. 13/11</span></div>}
                      {active >= 2 && local > 0.4 || active > 2 ? (
                        <div className="tags"><span>✓ ERP</span><span>✓ Pago programado</span><span>✓ CRM</span></div>
                      ) : null}
                    </div>
                  )}
                  {i === 3 && (
                    <div className="done-card">
                      {active >= 3 && (
                        <>
                          <div className="ntf"><i>✓</i><div><strong>Administración</strong><small>Factura cargada y pago programado</small></div></div>
                          {local > 0.35 && <div className="ntf"><i>W</i><div><strong>WhatsApp · Dueño</strong><small>“Pago a Andes Textil listo para el 13/11”</small></div></div>}
                          {local > 0.7 && <p className="big">Procesada en <b>6 segundos</b>.</p>}
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
