"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, EXPS, PICKUP, Shape, money } from "./data";

/* Reserva simulada en pasos: experiencia → fecha → horario → personas → revisar → confirmar.
   Es una demostración: no se guarda ni se envía ningún dato. */
const STEPS = ["Experiencia", "Fecha", "Horario", "Personas", "Revisar"];
function days() {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 1; out.length < 14; i++) {
    const x = new Date(d.getTime() + i * 864e5);
    if (x.getDay() !== 1) out.push(x); // los lunes cierra
  }
  return out;
}
/** Días en que se ofrece cada experiencia (0 = domingo). */
const DAYS_OF: Record<string, number[]> = { pinta: [0, 2, 3, 4, 5, 6], brunch: [0, 6], torno: [6], noche: [4, 5] };
const seats = (d: Date, t: string) => (d.getDate() * 7 + t.charCodeAt(0) * 3 + t.charCodeAt(3)) % 9; // cupos simulados

export function Booking({ initial, onClose }: { initial?: string | undefined; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(initial ? 1 : 0);
  const [exp, setExp] = useState(initial ?? "pinta");
  const D = useMemo(days, []);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const e = EXPS.find((x) => x.key === exp)!;
  const avail = D.map((d) => DAYS_OF[exp]!.includes(d.getDay()));
  const dd = day != null ? D[day]! : null;
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("es-AR", o);
  const max = e.kind === "taller" ? 4 : 8;

  const close = useCallback(() => onClose(), [onClose]);
  useEffect(() => { const k = (ev: KeyboardEvent) => ev.key === "Escape" && close(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [close]);
  useEffect(() => { box.current?.querySelector<HTMLElement>(".cb-book__body button:not(:disabled), .cb-book__body input")?.focus(); }, [step, done]);

  const can = [true, day != null, !!time, people > 0, name.trim().length >= 2][step]!;
  const next = () => { if (!can) return; if (step < 4) setStep(step + 1); else setDone(true); };
  const pickExp = (k: string) => { setExp(k); setDay(null); setTime(null); setPeople((p) => Math.min(p, EXPS.find((x) => x.key === k)!.kind === "taller" ? 4 : 8)); };

  return (
    <div className="cb-book" role="dialog" aria-modal="true" aria-labelledby="cb-book-t">
      <div className="cb-book__bg" onClick={close} />
      <div ref={box} className="cb-book__card">
        <button type="button" className="cb-book__x" onClick={close} aria-label="Cerrar">✕</button>
        {!done ? (
          <>
            <p className="cb-book__brand">Reservá tu mesa · <span>Demostración</span></p>
            <h2 id="cb-book-t">{["¿Qué plan hacemos?", "¿Qué día venís?", "¿A qué hora?", "¿Cuántas personas?", "Revisá tu reserva"][step]}</h2>
            <ol className="cb-steps" aria-label="Pasos de la reserva">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? "on" : i < step ? "ok" : ""}>
                  <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}><b>{i + 1}</b><span>{s}</span></button>
                </li>
              ))}
            </ol>
            <div className="cb-book__body">
              {step === 0 && (
                <div className="cb-opts">
                  {EXPS.map((x) => (
                    <button key={x.key} type="button" className={exp === x.key ? "on" : ""} aria-pressed={exp === x.key} onClick={() => pickExp(x.key)}>
                      <Shape k={x.shape} color={exp === x.key ? C.cream : C.olive} />
                      <span><b>{x.name}</b><small>{x.dur} · {x.from ? "desde " : ""}{money(x.price)}</small></span>
                    </button>
                  ))}
                </div>
              )}
              {step === 1 && (
                <>
                  <p className="cb-book__hint">{e.name}: {e.when}</p>
                  <div className="cb-days">{D.map((d, i) => (
                    <button key={i} type="button" disabled={!avail[i]} className={day === i ? "on" : ""} aria-pressed={day === i} onClick={() => { setDay(i); setTime(null); }} aria-label={fmt(d, { weekday: "long", day: "numeric", month: "long" }) + (avail[i] ? "" : ", sin turnos")}>
                      <small>{fmt(d, { weekday: "short" }).replace(".", "")}</small><b>{d.getDate()}</b>
                    </button>
                  ))}</div>
                </>
              )}
              {step === 2 && dd && (
                <div className="cb-times">{e.times.map((t) => {
                  const left = seats(dd, t);
                  const full = left === 0;
                  return <button key={t} type="button" disabled={full} className={time === t ? "on" : ""} aria-pressed={time === t} onClick={() => setTime(t)}><b>{t}</b><small>{full ? "Completo" : `${left} lugares`}</small></button>;
                })}</div>
              )}
              {step === 3 && (
                <div className="cb-people">
                  <div className="cb-step">
                    <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Menos personas">−</button>
                    <b aria-live="polite">{people}</b>
                    <button type="button" onClick={() => setPeople((p) => Math.min(max, p + 1))} aria-label="Más personas">+</button>
                  </div>
                  <p className="cb-book__hint">{people} × {money(e.price)} = <b>{money(e.price * people)}</b>{e.seats ? ` · ${e.seats}` : ""}</p>
                </div>
              )}
              {step === 4 && dd && (
                <div className="cb-review">
                  <dl>
                    <div><dt>Plan</dt><dd>{e.name}</dd></div>
                    <div><dt>Cuándo</dt><dd>{fmt(dd, { weekday: "long", day: "numeric", month: "long" })} · {time} h</dd></div>
                    <div><dt>Personas</dt><dd>{people}</dd></div>
                    <div><dt>Total</dt><dd>{money(e.price * people)}</dd></div>
                  </dl>
                  <div className="cb-cond">
                    <p><b>Incluye:</b> {e.includes.join(" · ")}.</p>
                    <p><b>Condiciones:</b> seña del 30 % para confirmar; podés cambiar el día hasta 24 h antes. {PICKUP}</p>
                  </div>
                  <label><span>Tu nombre</span><input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="given-name" placeholder="Para la invitación" /></label>
                </div>
              )}
            </div>
            <div className="cb-book__f">
              {step > 0 ? <button type="button" className="cb-link" onClick={() => setStep(step - 1)}>← Volver</button> : <span />}
              <button type="button" className="cb-btn" disabled={!can} onClick={next}>{step < 4 ? "Continuar →" : "Confirmar reserva"}</button>
            </div>
          </>
        ) : (
          <div className="cb-invite" role="status">
            <Shape k={e.shape} color={C.rust} className="cb-invite__shape" />
            <p className="cb-invite__k">Reserva confirmada · demo</p>
            <h2 id="cb-book-t">{name.trim().split(" ")[0]}, te esperamos.</h2>
            <dl>
              <div><dt>Plan</dt><dd>{e.name}</dd></div>
              <div><dt>Cuándo</dt><dd>{fmt(dd!, { weekday: "long", day: "numeric", month: "long" })} · {time} h</dd></div>
              <div><dt>Personas</dt><dd>{people}</dd></div>
              <div><dt>Total</dt><dd>{money(e.price * people)}</dd></div>
            </dl>
            <p className="cb-invite__concept">Esto es una demostración de Nexa: no se guardó ni se envió ningún dato. En la web real, acá se cobra la seña y la reserva entra en la agenda del estudio.</p>
            <button type="button" className="cb-btn" onClick={close}>Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}
