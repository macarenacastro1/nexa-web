"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Area = {
  key: string; tab: string; svc: string; title: string; desc: string; feats: string[];
  metric: [string, string]; trigger: [string, string]; ai: string; actions: string[];
  screen: "chat" | "wa" | "gallery" | "bars"; script: [string, string][]; log: string[]; caseLink?: string;
};

const AREAS: Area[] = [
  {
    key: "ventas", tab: "Ventas", svc: "Páginas web inteligentes",
    title: "Tu web vende mientras dormís.",
    desc: "No es una vidriera: es un vendedor que conversa, cotiza, agenda y cobra.",
    feats: ["Asistente con IA entrenado con tu negocio", "Turnos y reservas con Google Calendar", "Cotizador automático y pagos online", "Leads calificados directo a tu WhatsApp"],
    metric: ["+42%", "consultas convertidas en ventas"],
    trigger: ["Visitante en tu web", "23:12 · desde Instagram"],
    ai: "Conversa, cotiza y califica",
    actions: ["Turno agendado", "Lead a tu WhatsApp", "Pago confirmado"],
    screen: "chat",
    script: [["in", "Hola, ¿cuánto sale el servicio completo?"], ["out", "¡Hola! El plan completo es $85.000. ¿Te reservo un turno esta semana?"], ["in", "Sí, el jueves a la tarde"], ["out", "Listo ✅ Jueves 17:30. Te llega la confirmación por WhatsApp."]],
    log: ["Lead nuevo · intención: compra", "Turno → Calendar jue 17:30", "Aviso enviado a tu WhatsApp", "Seña cobrada · $8.500"],
  },
  {
    key: "atencion", tab: "Atención", svc: "Bots de atención en WhatsApp",
    title: "Cada cliente, respondido en segundos.",
    desc: "Un asistente en tu WhatsApp que entiende, responde y toma pedidos. Las 24 horas.",
    feats: ["Respuestas naturales con IA", "Catálogo, precios y stock dentro del chat", "Toma de pedidos y turnos", "Deriva a una persona cuando hace falta"],
    metric: ["24/7", "atención sin sumar personal"],
    trigger: ["Mensaje de WhatsApp", "02:47 · cliente nuevo"],
    ai: "Entiende la intención y busca en tu catálogo",
    actions: ["Responde con precio y foto", "Toma el pedido", "Avisa a tu equipo"],
    screen: "wa",
    script: [["in", "Hola! Tienen la campera negra en M?"], ["out", "¡Hola! Sí 🙌 Nos quedan 3 en talle M. Sale $64.900. ¿Te la separo?"], ["in", "Dale! Envío a Rosario?"], ["out", "Perfecto. Envío a Rosario $4.200, llega en 48 hs. Te paso el link de pago 👇"]],
    log: ["Intención: consulta de stock", "Stock verificado · M: 3 u.", "Pedido #4812 creado", "Link de pago enviado"],
  },
  {
    key: "marketing", tab: "Marketing", svc: "Imágenes y recursos visuales con IA",
    title: "Un mes de contenido, en una tarde.",
    desc: "Posts, carruseles, fotos de producto y reels con tu identidad de marca, listos para publicar.",
    feats: ["Fotos de producto generadas con IA", "Posts y carruseles con tu estilo", "Reels y piezas para anuncios", "Calendario de publicación"],
    metric: ["x3", "más contenido publicado"],
    trigger: ["Brief de campaña", "Lanzamiento colección otoño"],
    ai: "Genera piezas con tu marca",
    actions: ["12 posts y carruseles", "4 reels", "Calendario listo"],
    screen: "gallery",
    script: [],
    log: ["Brief analizado · tono: cálido", "Kit de marca aplicado", "16 piezas generadas", "Programado lun · mié · vie"],
  },
  {
    key: "operaciones", tab: "Operaciones", svc: "Sistemas a medida",
    title: "Toda tu operación, en un solo lugar.",
    desc: "Pedidos, stock, clientes, producción y reportes conectados en un sistema hecho para vos.",
    feats: ["Dashboards en tiempo real", "Roles y permisos por área", "Automatizaciones entre sectores", "Integración con tus herramientas"],
    metric: ["-60%", "tiempo en tareas administrativas"],
    trigger: ["Entra un pedido", "Moda Norte · 120 unidades"],
    ai: "El sistema actualiza todo",
    actions: ["Stock descontado", "Factura emitida", "Producción notificada"],
    screen: "bars",
    script: [],
    log: ["Pedido #2044 recibido", "Stock actualizado · -120 u.", "Factura A emitida", "Orden a producción · prioridad 2"],
    caseLink: "Así lo hicimos con Texbros en Tex Hub",
  },
];

const GAL = [
  "linear-gradient(160deg,#7c3aed,#1e1b4b)", "linear-gradient(160deg,#f5f5f7,#c4b5fd)", "linear-gradient(160deg,#18181b,#7c3aed)",
  "linear-gradient(160deg,#a78bfa,#f5f3ff)", "radial-gradient(circle at 30% 30%,#ddd6fe,#4c1d95)", "linear-gradient(160deg,#0a0a0a,#3f3f46)",
];

export default function Business() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(-1);
  const [visible, setVisible] = useState(false);
  const area = AREAS[idx];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".biz .reveal", {
        opacity: 0, y: 36, duration: 1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      ScrollTrigger.create({ trigger: root.current, start: "top 60%", end: "bottom top", onToggle: (s) => setVisible(s.isActive) });
    }, root);
    return () => ctx.revert();
  }, []);

  // flow playback: trigger → ai → actions → pause, looping
  useEffect(() => {
    if (!visible) return;
    setPhase(-1);
    let p = -1;
    const id = setInterval(() => {
      p = p >= 6 ? -1 : p + 1;
      setPhase(p);
    }, 1100);
    return () => clearInterval(id);
  }, [visible, idx]);

  useEffect(() => {
    gsap.fromTo(".biz__info > *, .flow", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" });
  }, [idx]);

  const n = Math.max(0, phase + 1); // how many steps revealed
  const lit = (i: number) => phase >= i;

  return (
    <section className="biz" id="negocio" ref={root} aria-label="Tu negocio">
      <div className="container">
        <p className="eyebrow reveal">04 · Tu negocio</p>
        <h2 className="h2 reveal">Elegí un área.<br />Mirala funcionar sola.</h2>
        <p className="lead reveal">Cuatro servicios, una misma idea: que tu empresa trabaje aunque vos no estés.</p>

        <div className="tabs reveal" role="tablist">
          {AREAS.map((a, i) => (
            <button key={a.key} role="tab" aria-selected={i === idx} className={`tab${i === idx ? " on" : ""}`} onClick={() => setIdx(i)}>
              <small>0{i + 1}</small>{a.tab}
            </button>
          ))}
        </div>

        <div className="biz__body reveal">
          <div className="biz__info">
            <span className="biz__svc">{area.svc}</span>
            <h3>{area.title}</h3>
            <p>{area.desc}</p>
            <ul className="biz__feats">{area.feats.map((f) => <li key={f}>{f}</li>)}</ul>
            <div className="biz__metric"><b>{area.metric[0]}</b><span>{area.metric[1]}</span></div>
            {area.caseLink && <a className="biz__case" href="#impacto">{area.caseLink} →</a>}
          </div>

          <div className="flow" aria-live="polite">
            <div className="flow__head"><span>Automatización · {area.tab}</span><span style={{ color: "var(--green)" }}>● ejecutando</span></div>

            <div className="flow__lane">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden>
                <path d="M60,50 H240" stroke="rgba(167,139,250,.45)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke">
                  <animate attributeName="stroke-dashoffset" from="14" to="0" dur=".8s" repeatCount="indefinite" />
                </path>
              </svg>
              <div className={`fnode${lit(0) ? " lit" : ""}`}>
                <span className="k">Disparador</span>
                <strong>{area.trigger[0]}</strong>
                <small>{area.trigger[1]}</small>
              </div>
              <div className={`fnode fnode--ai${lit(1) ? " lit" : ""}`}>
                <div className="orb" />
                <span className="k">IA</span>
                <strong>{area.ai}</strong>
              </div>
              <div className="actions">
                {area.actions.map((a, i) => (
                  <div key={a} className={`fnode${lit(2 + i) ? " lit" : ""}`} style={{ padding: "10px 12px" }}>
                    <strong style={{ marginTop: 0, fontSize: 13, display: "flex", justifyContent: "space-between", gap: 8 }}>
                      {a}<span className="ok" style={{ opacity: lit(2 + i) ? 1 : 0, transition: "opacity .3s" }}>✓</span>
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow__out">
              <div className="screen">
                <h5>{area.screen === "chat" ? "Chat de tu web" : area.screen === "wa" ? "WhatsApp" : area.screen === "gallery" ? "Piezas generadas" : "Producción semanal"}</h5>
                {(area.screen === "chat" || area.screen === "wa") && (
                  <div className="wa">
                    {area.script.slice(0, Math.min(area.script.length, n)).map(([w, m], i) => (
                      <div key={area.key + i} className={`m ${w}`}>{m}</div>
                    ))}
                  </div>
                )}
                {area.screen === "gallery" && (
                  <div className="gallery">
                    {GAL.slice(0, Math.min(6, Math.max(0, (phase - 1) * 2))).map((g, i) => (
                      <span key={i} style={{ background: g, animationDelay: `${(i % 2) * 0.12}s` }} />
                    ))}
                  </div>
                )}
                {area.screen === "bars" && (
                  <div className="bars-mini">
                    {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                      <i key={i} style={{ height: `${phase >= 2 ? h : 10}%`, transitionDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="screen">
                <h5>Registro</h5>
                <ul className="log">
                  {area.log.slice(0, Math.max(0, Math.min(area.log.length, phase))).map((l, i) => (
                    <li key={area.key + i}><time>{`10:4${i}`}</time><b>✓</b>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
