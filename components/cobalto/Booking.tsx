"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EXPS, Jug, money, reduced } from "./data";

/* Reserva: la tarjeta se agranda y se transforma en el calendario; termina en una invitación. */
const TIMES = ["10:00", "12:30", "15:00", "17:30", "20:00"];
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
const seat = (d: Date, t: string) => ((d.getDate() * 7 + t.charCodeAt(0) * 3 + t.charCodeAt(3)) % 9); // cupos simulados
export function Booking({ from, initial, onClose, back }: { from: DOMRect | null; initial?: string | undefined; onClose: () => void; back: () => DOMRect | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [exp, setExp] = useState(initial ?? "brunch");
  const D = useMemo(days, []);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const e = EXPS.find((x) => x.key === exp)!;

  const fly = (r: DOMRect, reverse: boolean) => {
    const el = box.current;
    if (!el || reduced()) return null;
    const to = el.getBoundingClientRect();
    const t = `translate(${r.left - to.left}px, ${r.top - to.top}px) scale(${r.width / to.width}, ${r.height / to.height})`;
    return el.animate(reverse ? [{ transform: "none", borderRadius: "6px" }, { transform: t, borderRadius: "3px" }] : [{ transform: t, borderRadius: "3px" }, { transform: "none", borderRadius: "6px" }], { duration: 700, easing: "cubic-bezier(.65,0,.15,1)", fill: "both" });
  };
  useLayoutEffect(() => { if (from) fly(from, false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { box.current?.querySelector<HTMLElement>("button, input")?.focus(); }, []);
  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    const r = back();
    const a = r && r.width ? fly(r, true) : null;
    if (a) a.onfinish = onClose; else onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing, onClose]);
  useEffect(() => { const k = (ev: KeyboardEvent) => ev.key === "Escape" && close(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [close]);

  const confirm = () => {
    if (day == null || !time) return setErr("Elegí un día y un horario.");
    if (name.trim().length < 2 || !/\S+@\S+\.\S+/.test(email)) return setErr("Completá tu nombre y un email válido.");
    setErr(null);
    setDone(true);
  };
  const dd = day != null ? D[day]! : null;
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("es-AR", o);
  return (
    <div className={`cb-book${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cb-book-t">
      <div className="cb-book__bg" onClick={close} />
      <div ref={box} className={`cb-book__card${done ? " done" : ""}`}>
        <button type="button" className="cb-book__x" onClick={close} aria-label="Cerrar">✕</button>
        {/* la cara de la tarjeta se ve mientras se agranda y se desvanece cuando aparece el calendario */}
        {!done && <div className="cb-book__face" aria-hidden><span className="cb-word">Cobalto</span><span className="cb-book__faceSub">Reservá tu mesa</span></div>}
        {!done ? (
          <div className="cb-book__in">
            <p className="cb-book__brand">Cobalto</p>
            <h2 id="cb-book-t">Reservá tu mesa</h2>
            <fieldset><legend>Experiencia</legend>
              <div className="cb-chips">{EXPS.map((x) => <button key={x.key} type="button" className={exp === x.key ? "on" : ""} aria-pressed={exp === x.key} onClick={() => setExp(x.key)}>{x.name}<small>{x.dur} · {money(x.price)}</small></button>)}</div>
            </fieldset>
            <fieldset><legend>Día</legend>
              <div className="cb-days">{D.map((d, i) => (
                <button key={i} type="button" className={day === i ? "on" : ""} aria-pressed={day === i} onClick={() => { setDay(i); setTime(null); }} aria-label={fmt(d, { weekday: "long", day: "numeric", month: "long" })}>
                  <small>{fmt(d, { weekday: "short" }).replace(".", "")}</small><b>{d.getDate()}</b>
                </button>
              ))}</div>
            </fieldset>
            <fieldset disabled={day == null}><legend>Horario</legend>
              <div className="cb-chips cb-chips--time">{TIMES.filter((t) => exp !== "noche" || t === "20:00").map((t) => {
                const left = dd ? seat(dd, t) : 0;
                const full = !!dd && left === 0;
                return <button key={t} type="button" disabled={full} className={time === t ? "on" : ""} aria-pressed={time === t} onClick={() => setTime(t)}>{t}<small>{!dd ? "—" : full ? "Completo" : `${left} lugares`}</small></button>;
              })}</div>
            </fieldset>
            <div className="cb-book__row">
              <fieldset><legend>Personas</legend>
                <div className="cb-step"><button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Menos personas">−</button><b aria-live="polite">{people}</b><button type="button" onClick={() => setPeople((p) => Math.min(8, p + 1))} aria-label="Más personas">+</button></div>
              </fieldset>
              <label><span>Nombre</span><input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" /></label>
              <label><span>Email</span><input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} autoComplete="email" /></label>
            </div>
            {err && <p className="cb-err" role="alert">{err}</p>}
            <div className="cb-book__f">
              <p>{e.name} · {people} {people === 1 ? "persona" : "personas"}<b>{money(e.price * people)}</b></p>
              <button type="button" className="cb-btn" onClick={confirm}>Confirmar reserva</button>
            </div>
          </div>
        ) : (
          <div className="cb-invite" role="status">
            <Jug className="cb-invite__jug" />
            <p className="cb-invite__k">Estás invitada/o</p>
            <h2 id="cb-book-t">{name.split(" ")[0]}, te esperamos en la mesa.</h2>
            <dl>
              <div><dt>Qué</dt><dd>{e.name}</dd></div>
              <div><dt>Cuándo</dt><dd>{fmt(dd!, { weekday: "long", day: "numeric", month: "long" })} · {time}</dd></div>
              <div><dt>Quiénes</dt><dd>{people} {people === 1 ? "persona" : "personas"}</dd></div>
              <div><dt>Dónde</dt><dd>Gorriti 4800, Palermo</dd></div>
            </dl>
            <p className="cb-invite__p">Te mandamos la confirmación a {email}. Vení con ropa cómoda: nosotros ponemos el delantal.</p>
            <p className="cb-invite__concept">Concepto: en la web real, la reserva queda en la agenda del estudio y se cobra una seña online.</p>
            <button type="button" className="cb-btn cb-btn--line" onClick={close}>Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

