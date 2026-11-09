"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { intelState } from "@/lib/intelState";

gsap.registerPlugin(ScrollTrigger);
const IntelScene = dynamic(() => import("./IntelScene"), { ssr: false });
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STEPS = [
  { t: "Conecta", d: "WhatsApp, tu web, mails, planillas, redes y pagos empiezan a hablar entre sí." },
  { t: "Entiende", d: "La IA lee cada mensaje y cada pedido, los clasifica y decide qué hacer." },
  { t: "Actúa", d: "Responde, agenda, cobra, carga el pedido y te avisa solo cuando hace falta." },
];

const EVENTS = [
  ["WhatsApp", "consulta de precio → respondida en 3 s"],
  ["Web", "turno reservado → Google Calendar"],
  ["Pagos", "transferencia → conciliada"],
  ["Email", "factura → archivada y registrada"],
  ["Instagram", "comentario → respondido + lead creado"],
  ["Stock", "bajo mínimo → orden a proveedor"],
  ["CRM", "lead tibio → seguimiento enviado"],
  ["Planillas", "pedidos del día → reporte listo"],
];

export default function Intelligence() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(-1);
  const [log, setLog] = useState<{ id: number; a: string; b: string; time: string }[]>([]);
  const [mount, setMount] = useState(false);

  useIso(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current, start: "top 80%", once: true, onEnter: () => setMount(true),
      });
      ScrollTrigger.create({
        trigger: root.current, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (self) => {
          intelState.progress = self.progress;
          setStep(self.progress < 0.04 ? -1 : self.progress < 0.33 ? 0 : self.progress < 0.64 ? 1 : 2);
        },
      });
      gsap.from(".intel__copy > *:not(.intel__steps)", {
        opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (step < 1) return;
    let i = 0;
    const id = setInterval(() => {
      const [a, b] = EVENTS[i++ % EVENTS.length];
      const d = new Date();
      const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLog((l) => [{ id: Date.now(), a, b, time }, ...l].slice(0, 5));
    }, 1100);
    return () => clearInterval(id);
  }, [step]);

  return (
    <section className="intel" id="inteligencia" ref={root} aria-label="La inteligencia">
      <div className="intel__sticky">
        <div className="intel__canvas">{mount && <IntelScene />}</div>
        <div className="intel__copy">
          <p className="eyebrow">03 · La inteligencia</p>
          <h2 className="h2">Detrás del orden,<br /><span className="grad">un cerebro.</span></h2>
          <ol className="intel__steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className={`intel__step${step >= i ? " on" : ""}`}>
                <span>0{i + 1}</span>
                <div><h3>{s.t}</h3><p>{s.d}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="intel__log" aria-hidden>
          <header><span>Actividad en vivo</span><span style={{ color: "var(--green)" }}>● online</span></header>
          <ul>
            {log.length === 0 && <li style={{ opacity: .5 }}>Esperando eventos…</li>}
            {log.map((e) => <li key={e.id}><span style={{ opacity: .5 }}>{e.time}</span><b>{e.a}</b>{e.b}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
