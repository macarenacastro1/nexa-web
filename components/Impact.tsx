"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waUrl } from "@/lib/config";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

function Animated({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const cur = useRef({ v: 0 });
  useEffect(() => {
    gsap.to(cur.current, {
      v: value, duration: 0.8, ease: "power3.out", overwrite: true,
      onUpdate: () => { if (ref.current) ref.current.textContent = prefix + Math.round(cur.current.v).toLocaleString("es-AR") + suffix; },
    });
  }, [value, prefix, suffix]);
  return <b ref={ref}>{prefix}0{suffix}</b>;
}

function Range({ label, value, min, max, step = 1, unit = "", hint, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; hint: string; onChange: (v: number) => void }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="range">
      <label>{label}<b>{unit === "$" ? `US$ ${value}` : `${value}${unit}`}</b></label>
      <input type="range" min={min} max={max} step={step} value={value} style={{ ["--p" as any]: `${p}%` }}
        aria-label={label} onChange={(e) => { onChange(+e.target.value); sound.tick(); }} />
      <small>{hint}</small>
    </div>
  );
}

const AUTOMATION = 0.7; // % de tareas repetitivas que se pueden automatizar

export default function Impact() {
  const root = useRef<HTMLElement>(null);
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(12);
  const [cost, setCost] = useState(8);
  const [toast, setToast] = useState("");

  const hoursMonth = people * hours * 4.33 * AUTOMATION;
  const yearly = hoursMonth * 12 * cost;
  const fte = hoursMonth / 160;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".impact .reveal", {
        opacity: 0, y: 36, duration: 1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".calc", start: "top 80%" },
      });
      gsap.from(".finale h2 .w", {
        yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.08, ease: "power4.out",
        scrollTrigger: { trigger: ".finale", start: "top 70%" },
      });
      gsap.from(".finale p, .finale .ctas, .contact > *", {
        opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".finale", start: "top 55%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    let ok = true;
    form.querySelectorAll<HTMLInputElement>("input, select, textarea").forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== "";
      f.closest(".field")!.classList.toggle("err", !valid);
      const s = f.closest(".field")!.querySelector("small");
      if (s) s.textContent = valid ? "" : "Completá este campo";
      if (!valid) ok = false;
    });
    if (!ok) return;
    form.reset();
    sound.chime();
    setToast("¡Gracias! Te respondemos en menos de 24 hs ✨");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <section className="impact" id="impacto" ref={root} aria-label="El impacto">
      <div className="container">
        <p className="eyebrow reveal">05 · El impacto</p>
        <h2 className="h2 reveal">¿Cuánto te está<br />costando el caos?</h2>
        <p className="lead reveal">Mové los controles y calculá cuánto tiempo y dinero podrías recuperar.</p>

        <div className="calc">
          <div className="calc__in reveal">
            <Range label="Personas en tu equipo" value={people} min={1} max={50} hint="Incluyéndote a vos." onChange={setPeople} />
            <Range label="Horas por semana en tareas repetitivas" value={hours} min={1} max={30} unit=" h" hint="Por persona: responder lo mismo, cargar datos, pasar planillas…" onChange={setHours} />
            <Range label="Costo por hora de trabajo" value={cost} min={3} max={50} unit="$" hint="Promedio aproximado, en dólares." onChange={setCost} />
          </div>
          <div className="calc__out reveal">
            <div className="big"><small>Horas que recuperás por mes</small><Animated value={hoursMonth} suffix=" h" /></div>
            <div className="out-row">
              <div><Animated value={yearly} prefix="US$ " /><small>ahorro estimado por año</small></div>
              <div><b>{fte.toFixed(1).replace(".", ",")}</b><small>personas de tiempo completo liberadas</small></div>
            </div>
            <p className="calc__note">Estimación basada en automatizar el 70% de las tareas repetitivas. Lo confirmamos en el diagnóstico gratis.</p>
            <a href="#contacto" className="btn btn--primary" style={{ justifySelf: "start" }}>Quiero recuperar ese tiempo</a>
          </div>
        </div>
      </div>

      <div className="finale">
        <div className="finale__glow" />
        <h2>
          <span style={{ display: "inline-block", overflow: "hidden", paddingBottom: ".2em", marginBottom: "-.12em" }}><span className="w">Menos</span> <span className="w">caos.</span></span><br />
          <span style={{ display: "inline-block", overflow: "hidden", paddingBottom: ".2em", marginBottom: "-.12em" }}><span className="w grad">Más</span> <span className="w grad">negocio.</span></span>
        </h2>
        <p>Agendá una llamada de 30 minutos. Detectamos qué automatizar primero, sin compromiso.</p>
        <div className="ctas">
          <a href="#contacto" className="btn btn--primary">Agendar llamada gratis</a>
          <a href={waUrl} target="_blank" rel="noopener" className="btn btn--ghost">Escribinos por WhatsApp</a>
        </div>
      </div>

      <div className="container contact" id="contacto">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 className="h2" style={{ fontSize: "clamp(34px,4.6vw,56px)" }}>Empecemos<br />tu proyecto.</h2>
          <p className="lead">Contanos qué te gustaría automatizar y te respondemos en menos de 24 hs.</p>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <div className="field"><label htmlFor="f-n">Nombre</label><input id="f-n" required autoComplete="name" /><small /></div>
          <div className="field"><label htmlFor="f-e">Email</label><input id="f-e" type="email" required autoComplete="email" /><small /></div>
          <div className="field"><label htmlFor="f-w">WhatsApp</label><input id="f-w" type="tel" required placeholder="+54 9 11 …" autoComplete="tel" /><small /></div>
          <div className="field"><label htmlFor="f-s">Servicio de interés</label>
            <select id="f-s" required defaultValue="">
              <option value="" disabled>Elegí una opción</option>
              <option>Página web inteligente</option>
              <option>Bot de WhatsApp</option>
              <option>Imágenes y contenido con IA</option>
              <option>Sistema a medida</option>
              <option>No sé, quiero asesoramiento</option>
            </select><small />
          </div>
          <div className="field field--full"><label htmlFor="f-m">¿Qué te gustaría automatizar?</label><textarea id="f-m" rows={4} required /><small /></div>
          <button className="btn btn--primary field--full" type="submit">Enviar</button>
        </form>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
    </section>
  );
}
