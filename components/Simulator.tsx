"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Step = [string, number, string?]; // texto, duración (min manual / seg auto), problema opcional
type Proc = { key: string; tab: string; manual: Step[]; auto: Step[]; result: string; caseNote?: boolean };

const PROCS: Proc[] = [
  {
    key: "fact", tab: "Facturas",
    manual: [["Abrir el mail y descargar el PDF", 3], ["Tipear los datos en Excel", 8, "un número mal tipeado"], ["Cargarla en el sistema contable", 6], ["Controlar contra el pedido", 7], ["Avisar a pagos por mail", 3]],
    auto: [["Llega el mail", 0.5], ["La IA extrae los datos", 2], ["Se carga en el ERP", 1], ["Se valida contra el pedido", 1], ["Aviso automático", 0.5]],
    result: "Factura cargada, validada y con el pago programado.",
  },
  {
    key: "ventas", tab: "Clientes y ventas",
    manual: [["Revisar formularios y DMs", 6], ["Pasar los datos al CRM", 7], ["Calificar el contacto", 4, "se perdió en la bandeja"], ["Escribir el primer mensaje", 5], ["Agendar el seguimiento", 3]],
    auto: [["Entra la consulta", 0.5], ["La IA la califica", 1.5], ["Se crea en el CRM", 1], ["Respuesta personalizada", 2], ["Seguimiento agendado", 0.5]],
    result: "Lead calificado, respondido y con seguimiento en agenda.",
  },
  {
    key: "ops", tab: "Seguimiento de operaciones",
    manual: [["Pedir el estado a cada área", 12], ["Actualizar la planilla", 9, "dos versiones distintas"], ["Armar el reporte", 15], ["Mandar el reporte", 2]],
    auto: [["Los sistemas reportan solos", 1], ["Se consolida todo", 2], ["Dashboard actualizado", 1], ["Alerta solo si hay desvíos", 0.5]],
    result: "Reporte al día, en tiempo real, sin pedirle nada a nadie.",
    caseNote: true,
  },
  {
    key: "aten", tab: "Atención al cliente",
    manual: [["Leer el mensaje", 1], ["Buscar precio y stock", 5, "el stock estaba desactualizado"], ["Responder", 3], ["Cargar el pedido", 6], ["Enviar el link de pago", 2]],
    auto: [["Llega el WhatsApp", 0.3], ["La IA entiende el pedido", 1], ["Consulta stock real", 0.7], ["Responde y toma el pedido", 2], ["Envía el link de pago", 0.5]],
    result: "Cliente atendido en segundos, a cualquier hora.",
  },
  {
    key: "int", tab: "Integración entre sistemas",
    manual: [["Exportar desde la tienda", 4], ["Limpiar el Excel", 11], ["Importar al ERP", 6, "37 filas con error"], ["Corregir los errores", 14], ["Actualizar el stock web", 6]],
    auto: [["Cambio detectado", 0.3], ["Datos normalizados", 1], ["ERP sincronizado", 1.2], ["Tienda actualizada", 1], ["Registro de auditoría", 0.5]],
    result: "Tienda, ERP y stock hablando entre sí, siempre iguales.",
    caseNote: true,
  },
];

const MANUAL_REAL = 8.5; // segundos reales que dura la animación manual
const AUTO_REAL = 2.2;
const mmss = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;

export default function Simulator() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [run, setRun] = useState(0); // re-disparar
  const [inView, setInView] = useState(false);
  const [mt, setMt] = useState(0); // progreso manual 0..1
  const [at, setAt] = useState(0); // progreso auto 0..1
  const proc = PROCS[idx];
  const mTotal = proc.manual.reduce((a, s) => a + s[1], 0);
  const aTotal = proc.auto.reduce((a, s) => a + s[1], 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 65%", once: true, onEnter: () => setInView(true) });
      gsap.from(".sim .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!inView) return;
    setMt(0); setAt(0);
    const m = { v: 0 }, a = { v: 0 };
    const t1 = gsap.to(m, { v: 1, duration: MANUAL_REAL, ease: "none", delay: 0.4, onUpdate: () => setMt(m.v) });
    const t2 = gsap.to(a, { v: 1, duration: AUTO_REAL, ease: "power1.inOut", delay: 0.4, onUpdate: () => setAt(a.v) });
    return () => { t1.kill(); t2.kill(); };
  }, [inView, idx, run]);

  // en qué paso está cada carril
  const stepAt = (steps: Step[], total: number, t: number) => {
    let acc = 0;
    const cur = t * total;
    for (let i = 0; i < steps.length; i++) { acc += steps[i][1]; if (cur < acc - 1e-6) return i; }
    return steps.length;
  };
  const mi = stepAt(proc.manual, mTotal, mt);
  const ai = stepAt(proc.auto, aTotal, at);
  const saving = 1 - aTotal / 60 / mTotal;

  return (
    <section className="sim" id="simulador" ref={root} aria-label="Simulador de automatizaciones">
      <div className="container">
        <p className="label rv"><b>04</b> Simulador</p>
        <h2 className="h2 rv">Same process.<br /><span className="serif" style={{ color: "var(--mute)" }}>Two very different days.</span></h2>
        <p className="lead rv">Elegí un proceso de tu empresa y mirá cómo se hace a mano y cómo se hace solo.</p>

        <div className="sim__tabs rv" role="tablist">
          {PROCS.map((p, i) => (
            <button key={p.key} role="tab" aria-selected={i === idx} className={`tab${i === idx ? " on" : ""}`} onClick={() => setIdx(i)}>
              <small>0{i + 1}</small>{p.tab}
            </button>
          ))}
        </div>

        <div className="race rv">
          <div className="lane lane--manual">
            <div className="lane__head">
              <h3>MANUAL</h3>
              <div className="clock">{mmss(mt * mTotal)}<small>min · {mTotal} en total</small></div>
            </div>
            <div className="lane__bar"><i style={{ width: `${mt * 100}%` }} /></div>
            <ol className="steps-l">
              {proc.manual.map(([s, d, w], i) => (
                <li key={s} className={`step-l${i < mi ? " is-ok" : i === mi ? " run" : ""}`}>
                  <span className="n">{i < mi ? "✓" : i + 1}</span>
                  <span>{s}{w && i <= mi && mt > 0 ? <span className="warn">⚠ {w}</span> : null}</span>
                  <time>{d} min</time>
                </li>
              ))}
            </ol>
            <p className="lane__foot">{mt >= 1 ? <><b>Terminado</b> después de {mTotal} minutos y algún error de tipeo.</> : "Una persona haciendo todo a mano…"}</p>
          </div>

          <div className="lane lane--auto">
            <div className="lane__head">
              <h3>AUTOMATIZADO</h3>
              <div className="clock">00:{String(Math.round(at * aTotal)).padStart(2, "0")}<small>seg · {aTotal} en total</small></div>
            </div>
            <div className="lane__bar"><i style={{ width: `${at * 100}%` }} /></div>
            <ol className="steps-l">
              {proc.auto.map(([s, d], i) => (
                <li key={s} className={`step-l${i < ai ? " is-ok" : i === ai ? " run" : ""}`}>
                  <span className="n">{i < ai ? "✓" : i + 1}</span>
                  <span>{s}</span>
                  <time>{d} s</time>
                </li>
              ))}
            </ol>
            <p className="lane__foot">{at >= 1 ? <><b>✓ {proc.result}</b>{mt < 1 && " Mientras tanto, el proceso manual sigue…"}</> : "Ejecutando…"}</p>
          </div>
        </div>

        <div className="sim__sum rv">
          <div><small>Manual</small><b>{mTotal} min</b></div>
          <div className="g"><small>Automatizado</small><b>{aTotal} s</b></div>
          <div className="g"><small>Menos tiempo</small><b>{(saving * 100).toFixed(1).replace(".", ",")}%</b></div>
          <button className="btn btn--line btn--sm" onClick={() => setRun((r) => r + 1)}>↺ Volver a simular</button>
        </div>
        {proc.caseNote && (
          <p className="sim__case">Caso real: así funciona <a href="#contacto">Tex Hub, el sistema que desarrollamos para Texbros</a>.</p>
        )}
      </div>
    </section>
  );
}
