"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CALC_KEY, type CalcSummary } from "@/lib/config";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);
const nf = (n: number, d = 0) => n.toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: d });

function Num({ value, dec = 0 }: { value: number; dec?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cur = useRef({ v: 0 });
  useEffect(() => {
    gsap.to(cur.current, { v: value, duration: 0.8, ease: "power3.out", overwrite: true, onUpdate: () => { if (ref.current) ref.current.textContent = nf(cur.current.v, dec); } });
  }, [value, dec]);
  return <span ref={ref}>0</span>;
}

function Range({ label, value, min, max, step = 1, fmt, hint, onChange }: { label: string; value: number; min: number; max: number; step?: number; fmt: (v: number) => string; hint: string; onChange: (v: number) => void }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="range">
      <label>{label}<b>{fmt(value)}</b></label>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} style={{ ["--p" as any]: `${p}%` }}
        onChange={(e) => { onChange(+e.target.value); sound.tick(); }} />
      <small>{hint}</small>
    </div>
  );
}

export default function Impact() {
  const root = useRef<HTMLElement>(null);
  const [tasks, setTasks] = useState(150);
  const [mins, setMins] = useState(10);
  const [pct, setPct] = useState(60);

  const manualH = (tasks * mins) / 60; // horas / semana
  const savedW = manualH * (pct / 100);
  const savedM = savedW * 4.33;
  const savedY = savedW * 48;
  const days = savedM / 8;

  // curva acumulada de 12 semanas (adopción gradual: rampa en las primeras 4)
  const weeks = Array.from({ length: 12 }, (_, i) => savedW * Math.min(1, (i + 1) / 4));
  const cum = weeks.reduce<number[]>((a, v) => [...a, (a[a.length - 1] || 0) + v], []);
  const maxC = Math.max(1, cum[cum.length - 1]);
  const pts = cum.map((v, i) => [(i / 11) * 400, 130 - (v / maxC) * 112]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".impact .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const toDiagnosis = () => {
    const summary: CalcSummary = { tasks, mins, pct, hours_week: Math.round(savedW * 10) / 10 };
    try { sessionStorage.setItem(CALC_KEY, JSON.stringify(summary)); } catch { /* sin almacenamiento */ }
    window.dispatchEvent(new CustomEvent<CalcSummary>(CALC_KEY, { detail: summary }));
  };

  return (
    <section className="impact" id="impacto" ref={root} aria-label="Calculadora de impacto">
      <div className="container">
        <p className="label rv">Calculadora de impacto</p>
        <h2 className="h2 rv">How much time is<br /><span className="serif" style={{ color: "var(--mute)" }}>chaos costing you?</span></h2>
        <p className="lead rv">Mové los controles con los números de tu empresa. Es una estimación orientativa: el número real lo vemos juntos en el diagnóstico.</p>

        <div className="calc">
          <div className="calc__in rv">
            <Range label="Tareas manuales por semana" value={tasks} min={10} max={600} step={10} fmt={(v) => nf(v)} hint="Responder mensajes, cargar datos, pasar planillas, armar reportes…" onChange={setTasks} />
            <Range label="Minutos por tarea" value={mins} min={1} max={60} fmt={(v) => `${v} min`} hint="Tiempo promedio que lleva cada una." onChange={setMins} />
            <Range label="Porcentaje automatizable" value={pct} min={10} max={90} step={5} fmt={(v) => `${v}%`} hint="En promedio, entre 50% y 70% de las tareas repetitivas se pueden automatizar." onChange={setPct} />
            <p className="calc__total">Hoy tu equipo dedica <b>{nf(manualH, 1)} horas por semana</b> a tareas manuales.</p>
          </div>

          <div className="calc__out rv">
            <div className="big"><small>Horas que podrías recuperar por semana</small><b><Num value={savedW} /><span className="u">h</span></b></div>
            <div className="split">
              <div className="split__bar"><i style={{ width: `${pct}%` }} /><i style={{ width: `${100 - pct}%` }} /></div>
              <div className="split__leg"><span>Automatizable · {nf(savedW, 1)} h</span><span>Sigue manual · {nf(manualH - savedW, 1)} h</span></div>
            </div>
            <div className="out-row">
              <div><b><Num value={savedM} /> h</b><small>por mes</small></div>
              <div><b><Num value={savedY} /> h</b><small>por año</small></div>
              <div><b><Num value={days} dec={1} /></b><small>jornadas de 8 h por mes</small></div>
            </div>
            <div>
              <svg className="cumul" viewBox="0 0 400 140" preserveAspectRatio="none" aria-label="Horas acumuladas en 12 semanas">
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2bf59c" stopOpacity=".28" /><stop offset="1" stopColor="#2bf59c" stopOpacity="0" /></linearGradient>
                  <linearGradient id="cl" x1="0" x2="1"><stop offset="0" stopColor="#4c8dff" /><stop offset=".5" stopColor="#2de2d0" /><stop offset="1" stopColor="#2bf59c" /></linearGradient>
                </defs>
                {[18, 55, 92, 129].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(255,255,255,.05)" />)}
                <path d={`${line} L400,140 L0,140 Z`} fill="url(#cg)" style={{ transition: "d .6s" }} />
                <path d={line} fill="none" stroke="url(#cl)" strokeWidth="2.2" style={{ transition: "d .6s" }} />
                <circle cx={pts[11][0] - 3} cy={pts[11][1]} r="4" fill="#2bf59c" />
              </svg>
              <div className="split__leg" style={{ marginTop: 6 }}><span style={{ visibility: "hidden" }} />Horas acumuladas en las primeras 12 semanas: <b style={{ color: "var(--text)", fontWeight: 500 }}>{nf(maxC)} h</b></div>
            </div>
            <p className="calc__note">Estimación con fines ilustrativos, no una garantía. Supone una adopción gradual durante el primer mes.</p>
            <div className="calc__cta">
              <a href="#contacto" onClick={toDiagnosis} className="btn btn--solid">Quiero ver esto en un diagnóstico <span className="arr">→</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
