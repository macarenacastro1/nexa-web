"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Defs, PROFILES, Piece, vessel } from "./shapes";

/* =====================================================================
   Cobalto · estudio de cerámica con brunch (concepto de NEXA)
   Hero: una mesa ilustrada donde cada objeto se puede tocar. La
   tarjeta con el nombre del estudio se transforma en el calendario
   de reservas y termina en una invitación. Marca y datos ficticios.
   ===================================================================== */

// tierra: arcilla, crema, óxido, azul esmalte y celadón (de las tazas de referencia)
const C = { cream: "#f4ede1", ink: "#3b2a20", cobalt: "#5f7f96", tomato: "#a5552a", mustard: "#c99a4a", sage: "#a9b49a", bisque: "#f4ede1", ochre: "#c08a45", clay: "#c7b59d", clayDark: "#a8937a", oat: "#e7dccb" };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

type ObjKey = "taza" | "pinceles" | "croissant";
export type Exp = { key: string; name: string; dur: string; price: number; desc: string; tone: string };
const EXPS: Exp[] = [
  { key: "brunch", name: "Brunch & Paint", dur: "2 h", price: 32000, desc: "Elegís una pieza, la pintás a tu ritmo y te servimos brunch completo con café de especialidad.", tone: C.tomato },
  { key: "torno", name: "Torno para principiantes", dur: "3 h", price: 45000, desc: "Tu primera vez en el torno, en grupos de seis. Hacés dos piezas y elegís cuál esmaltamos.", tone: C.cobalt },
  { key: "noche", name: "Noche de cerámica", dur: "2 h 30", price: 38000, desc: "Jueves y viernes a la noche: pintura, vino natural y algo para picar. Ideal para ir con amigos.", tone: C.ink },
];
const PIECES = [
  { kind: "mug", name: "Taza Lunes", price: 7500, handle: "right" as const },
  { kind: "bowl", name: "Bowl Sopa", price: 9000 },
  { kind: "cup", name: "Vaso Recto", price: 6500 },
  { kind: "vase", name: "Florero Bajo", price: 12000 },
  { kind: "jug", name: "Jarra Agua", price: 14000, handle: "right" as const },
] as const;
const SHOP = [
  { id: "s1", kind: "amphora", name: "Ánfora Celadón", price: 48000, tone: C.sage, handle: "both" as const },
  { id: "s2", kind: "jug", name: "Jarra Óxido", price: 36000, tone: C.oat, pattern: "reactive" as const, handle: "right" as const },
  { id: "s3", kind: "bottle", name: "Botella Arenisca", price: 29000, tone: C.oat, pattern: "stone" as const },
  { id: "s4", kind: "bowl", name: "Fuente Lago", price: 33000, tone: C.oat, pattern: "pool" as const },
  { id: "s5", kind: "vase", name: "Florero Tierra", price: 31000, tone: C.oat, pattern: "reactive2" as const },
  { id: "s6", kind: "tall", name: "Florero Café", price: 27000, tone: C.ink },
] as const;
const SWATCHES = [["Óxido", C.tomato], ["Cobalto", C.cobalt], ["Celadón", C.sage], ["Miel", C.mustard], ["Café", C.ink]] as const;

export default function Cobalto() {
  const [active, setActive] = useState<ObjKey | null>(null);
  const [booking, setBooking] = useState<{ from: DOMRect | null; exp?: string } | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const openBooking = useCallback((exp?: string, from?: HTMLElement | null) => {
    setActive(null);
    const el = from ?? cardRef.current;
    setBooking({ from: el?.getBoundingClientRect() ?? null, ...(exp ? { exp } : {}) });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen]);

  return (
    <div className="cb" id="main">
      <Defs />
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={() => openBooking()} />
      <Hero active={active} setActive={setActive} cardRef={cardRef} cardHidden={!!booking} onBook={() => openBooking()} />
      <Experience />
      <Workshops onBook={(k, el) => openBooking(k, el)} />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} se sumó al carrito`); }} />
      <Studio />
      <footer className="cb-foot">
        <span className="cb-foot__logo">Cobalto</span>
        <span>Concepto de portfolio desarrollado por NEXA · Cobalto es una marca ficticia: sin reservas ni ventas reales.</span>
      </footer>
      {booking && <Booking from={booking.from} initial={booking.exp} onClose={() => setBooking(null)} back={() => cardRef.current?.getBoundingClientRect() ?? null} />}
      {cartOpen && <Cart items={cart} onRemove={(i) => setCart((c) => c.filter((_, j) => j !== i))} onClose={() => setCartOpen(false)} onClear={() => setCart([])} />}
      {toast && <div className="cb-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ------------------------------ navegación ------------------------------ */
function Nav({ count, onCart, onBook }: { count: number; onCart: () => void; onBook: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="cb-nav">
      <a href="#main" className="cb-logo" aria-label="Cobalto, inicio">Cobalto<i aria-hidden /></a>
      <nav className={menu ? "open" : ""} aria-label="Principal">
        {[["#experiencia", "La experiencia"], ["#talleres", "Talleres"], ["#shop", "Ceramic Shop"], ["#estudio", "El estudio"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito <b>{count}</b></button>
      <button type="button" className="cb-btn cb-btn--sm" onClick={onBook}>Reservá</button>
      <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
    </header>
  );
}

/* ------------------------------ hero: la mesa ------------------------------ */
const TABLE = 412;
function Hero({ active, setActive, cardRef, cardHidden, onBook }: {
  active: ObjKey | null; setActive: (k: ObjKey | null) => void; cardRef: React.RefObject<HTMLButtonElement | null>; cardHidden: boolean; onBook: () => void;
}) {
  const [swatch, setSwatch] = useState<string>(C.tomato);
  const toggle = (k: ObjKey) => setActive(active === k ? null : k);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setActive]);
  const obj = (k: ObjKey, label: string) => ({
    role: "button", tabIndex: 0, "aria-label": label, "aria-pressed": active === k,
    className: `cb-obj${active === k ? " on" : ""}${active && active !== k ? " dim" : ""}`,
    onClick: () => toggle(k),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(k); } },
  });
  const mug = vessel(PROFILES.mug!, 455, TABLE, 96);
  const jar = vessel(PROFILES.jar!, 168, TABLE, 92);
  const cup = vessel(PROFILES.cup!, 640, TABLE - 8, 62);
  const bud = vessel(PROFILES.bottle!, 60, TABLE, 120);
  return (
    <section className="cb-hero" aria-labelledby="cb-hero-t">
      <div className="cb-hero__copy">
        <h1 id="cb-hero-t">A little art.<br /><span>A lot of <em>fun.</em><Stroke /></span></h1>
        <p>Pintá tu propia pieza de cerámica, disfrutá de un brunch y compartí una experiencia diferente.</p>
        <div className="cb-hero__ctas">
          <button type="button" className="cb-btn" onClick={onBook}>Reservá tu mesa</button>
          <span className="cb-hint">Tocá los objetos de la mesa</span>
        </div>
      </div>

      <div className="cb-table" onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
        <svg viewBox="0 0 1000 460" className="cb-table__svg" role="group" aria-label="Mesa del estudio: taza, pinceles, croissant, café y tarjeta de reservas">
          {/* tablero */}
          <path d={`M-3000,${TABLE} H4000`} stroke={C.cream} strokeWidth="3" />
          <rect x="-3000" y={TABLE + 2} width="7000" height="46" fill={C.clayDark} />
          <rect x="-3000" y={TABLE + 2} width="7000" height="46" fill="url(#cb-speck)" opacity=".35" />

          {/* florerito decorativo con rama */}
          <g aria-hidden>
            <path d={`M60,${TABLE - 118} C58,${TABLE - 180} 30,${TABLE - 220} 18,${TABLE - 250}`} fill="none" stroke={C.cream} strokeWidth="2.5" />
            {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={46 - i * 8} cy={TABLE - 160 - i * 24} rx="11" ry="5" fill={C.cream} filter="url(#cb-print)" transform={`rotate(${-40 + i * 8} ${46 - i * 8} ${TABLE - 160 - i * 24})`} />)}
            <path d={bud} fill={C.cream} filter="url(#cb-print)" />
          </g>

          {/* pinceles + potes de pintura */}
          <g {...obj("pinceles", "Pinceles y pinturas: ver colores y piezas pintadas")}>
            <rect x="110" y={TABLE - 260} width="300" height="262" fill="transparent" />
            {[[-0.18, C.tomato], [0.04, "#8a6a4c"], [0.22, C.ink]].map(([a, col], i) => (
              <g key={i} transform={`rotate(${(a as number) * 57} 168 ${TABLE - 60})`}>
                <rect x="164" y={TABLE - 230} width="8" height="150" rx="4" fill={col as string} />
                <rect x="163" y={TABLE - 252} width="10" height="26" fill={C.oat} />
                <path d={`M163,${TABLE - 252} q5,-26 10,0 z`} fill={C.ink} />
              </g>
            ))}
            <clipPath id="cb-jar"><path d={jar} /></clipPath>
            <g filter="url(#cb-print)"><rect x="120" y={TABLE - 100} width="100" height="104" fill="#000" clipPath="url(#cb-jar)" filter="url(#cb-stone)" /></g>
            {[[262, C.tomato], [318, C.cobalt], [372, C.sage]].map(([x, col]) => (
              <g key={x as number}>
                <path d={vessel(PROFILES.pot!, x as number, TABLE, 34)} fill={C.cream} filter="url(#cb-print)" />
                <ellipse cx={x as number} cy={TABLE - 33} rx="20" ry="5" fill={col as string} />
              </g>
            ))}
          </g>

          {/* taza sin pintar */}
          <g {...obj("taza", "Taza sin pintar: ver piezas para pintar")}>
            <rect x="395" y={TABLE - 110} width="140" height="112" fill="transparent" />
            <g filter="url(#cb-print)"><path d={`M488,${TABLE - 78} c34,2 36,52 0,58`} fill="none" stroke={C.cream} strokeWidth="9" strokeLinecap="round" />
            <path d={mug} fill={C.cream} />
            <path d={mug} fill="url(#cb-speck)" opacity=".35" /></g>
            <ellipse cx="455" cy={TABLE - 96} rx="33" ry="4.5" fill={C.oat} />
          </g>

          {/* café (decorativo) */}
          <g aria-hidden className="cb-coffee">
            {[0, 1].map((i) => <path key={i} className="cb-steam" style={{ animationDelay: `${i * 1.3}s` }} d={`M${628 + i * 22},${TABLE - 84} c-10,-14 10,-22 0,-38 c-8,-12 6,-20 2,-30`} fill="none" stroke={C.cream} strokeWidth="2" strokeLinecap="round" opacity=".8" />)}
            <path d={`M672,${TABLE - 58} c24,0 24,34 -4,36`} fill="none" stroke={C.ink} strokeWidth="7" />
            <path d={cup} fill={C.ink} />
            <path d={cup} fill="url(#cb-speck-light)" />
            <ellipse cx="640" cy={TABLE - 4} rx="62" ry="6" fill={C.ink} />
          </g>

          {/* croissant */}
          <g {...obj("croissant", "Croissant: ver el brunch")}>
            <rect x="700" y={TABLE - 80} width="170" height="82" fill="transparent" />
            <ellipse cx="785" cy={TABLE - 4} rx="82" ry="7" fill={C.cream} filter="url(#cb-print)" />
            <path d={`M722,${TABLE - 10} C728,${TABLE - 56} 760,${TABLE - 74} 786,${TABLE - 74} C814,${TABLE - 74} 844,${TABLE - 56} 850,${TABLE - 10} Z`} fill={C.ochre} />
            <path d={`M722,${TABLE - 10} C728,${TABLE - 56} 760,${TABLE - 74} 786,${TABLE - 74} C814,${TABLE - 74} 844,${TABLE - 56} 850,${TABLE - 10} Z`} fill="url(#cb-speck-light)" />
            {[748, 770, 802, 826].map((x, i) => <path key={x} d={`M${x},${TABLE - 12} q${i < 2 ? 6 : -6},-26 ${i < 2 ? 18 : -18},-${i === 1 || i === 2 ? 52 : 40}`} fill="none" stroke="#8a5a26" strokeWidth="2.4" strokeLinecap="round" />)}
          </g>
        </svg>

        {/* la tarjeta es HTML: es la que se transforma en el calendario */}
        <button ref={cardRef} type="button" className="cb-card" style={{ visibility: cardHidden ? "hidden" : "visible" }} onClick={onBook} aria-label="Tarjeta Cobalto: abrir el calendario de reservas">
          <span className="cb-card__name">Cobalto</span>
          <span className="cb-card__sub">ceramic café</span>
          <span className="cb-card__cta">Reservá →</span>
        </button>

        {active && <ObjPanel k={active} swatch={swatch} setSwatch={setSwatch} onClose={() => setActive(null)} onBook={onBook} />}
      </div>
    </section>
  );
}

function Stroke() {
  return (
    <svg className="cb-stroke" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden>
      <path d="M4,20 C60,8 130,6 200,12 S280,22 296,14" fill="none" stroke={C.tomato} strokeWidth="9" strokeLinecap="round" filter="url(#cb-rough)" />
    </svg>
  );
}

function ObjPanel({ k, swatch, setSwatch, onClose, onBook }: { k: ObjKey; swatch: string; setSwatch: (c: string) => void; onClose: () => void; onBook: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, [k]);
  return (
    <div ref={ref} tabIndex={-1} className={`cb-panel cb-panel--${k}`} role="dialog" aria-label={k === "taza" ? "Piezas para pintar" : k === "pinceles" ? "Colores y piezas pintadas" : "El brunch"}>
      <button type="button" className="cb-panel__x" onClick={onClose} aria-label="Cerrar">✕</button>
      {k === "taza" && (
        <>
          <p className="cb-kicker">Piezas para pintar</p>
          <h3>Elegí tu lienzo.</h3>
          <ul className="cb-panel__pieces">
            {PIECES.map((p) => (
              <li key={p.name}><Piece kind={p.kind} tone="#d8c7ae" handle={"handle" in p ? p.handle : undefined} size={58} /><b>{p.name}</b><small>{money(p.price)}</small></li>
            ))}
          </ul>
          <p className="cb-panel__note">El precio de la pieza se suma a la experiencia. Las horneamos y las retirás en 7 días.</p>
        </>
      )}
      {k === "pinceles" && (
        <>
          <p className="cb-kicker">Colores del estudio</p>
          <h3>Doce esmaltes, infinitas ideas.</h3>
          <div className="cb-panel__sw" role="radiogroup" aria-label="Color">
            {SWATCHES.map(([n, c]) => <button key={n} type="button" role="radio" aria-checked={swatch === c} aria-label={n} style={{ background: c }} className={swatch === c ? "on" : ""} onClick={() => setSwatch(c)} />)}
          </div>
          <div className="cb-panel__painted">
            <Piece kind="mug" tone={swatch} handle="right" size={82} />
            <Piece kind="bowl" tone={C.oat} pattern="reactive" size={96} />
            <Piece kind="vase" tone={C.oat} pattern="dip" size={78} />
          </div>
          <p className="cb-panel__note">Ejemplos pintados por personas que vinieron al estudio. Te damos ideas si no sabés por dónde empezar.</p>
        </>
      )}
      {k === "croissant" && (
        <>
          <p className="cb-kicker">El brunch</p>
          <h3>Pintar con hambre, nunca.</h3>
          <div className="cb-panel__brunch" aria-hidden>
            <span style={{ background: C.ochre }} /><span style={{ background: C.tomato }} /><span style={{ background: C.mustard }} /><span style={{ background: C.ink }} />
          </div>
          <p>Croissant de manteca, tostón de masa madre con palta y huevo, yogur con granola casera, jugo exprimido y café de especialidad.</p>
          <p className="cb-panel__note">Opciones veganas y sin TACC avisando al reservar.</p>
        </>
      )}
      <button type="button" className="cb-btn cb-btn--sm" onClick={onBook}>Reservá tu mesa</button>
    </div>
  );
}

/* ------------------------------ la tarjeta → calendario → invitación ------------------------------ */
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
function Booking({ from, initial, onClose, back }: { from: DOMRect | null; initial?: string | undefined; onClose: () => void; back: () => DOMRect | null }) {
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
        {!done && <div className="cb-book__face" aria-hidden><span className="cb-card__name">Cobalto</span><span className="cb-card__sub">ceramic café</span></div>}
        {!done ? (
          <div className="cb-book__in">
            <p className="cb-card__name cb-book__brand">Cobalto</p>
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
            <Stamp />
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
            <button type="button" className="cb-btn cb-btn--line" onClick={close}>Volver a la mesa</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stamp() {
  return (
    <svg className="cb-stampsvg" viewBox="0 0 120 120" aria-hidden>
      <defs><path id="cb-circ" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" /></defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke={C.tomato} strokeWidth="2" strokeDasharray="3 4" />
      <circle cx="60" cy="60" r="30" fill={C.tomato} />
      <text fontSize="11" fontWeight="700" letterSpacing="3" fill={C.tomato}><textPath href="#cb-circ">COBALTO · CERAMIC CAFÉ · </textPath></text>
      <path d={vessel(PROFILES.vase!, 60, 78, 36).replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (_, x, y) => `${(60 + (+x - 60) * 0.4).toFixed(1)},${y}`)} fill={C.cream} />
    </svg>
  );
}

/* ------------------------------ 1 · la experiencia ------------------------------ */
function Experience() {
  const steps = [
    { n: "01", t: "Elegís tu pieza", d: "Tazas, bowls, floreros y jarras recién salidos del horno, listos para pintar.", art: <Piece kind="mug" tone={C.cream} handle="right" size={120} /> },
    { n: "02", t: "Pintás con brunch", d: "Te explicamos las técnicas, servimos el brunch y el resto es tiempo para vos.", art: <Piece kind="bowl" tone={C.oat} pattern="reactive" size={140} /> },
    { n: "03", t: "La horneamos", d: "Esmaltamos y horneamos tu pieza a 1.200 °C. La retirás en siete días.", art: <Piece kind="vase" tone={C.oat} pattern="stone" size={120} /> },
  ];
  return (
    <section className="cb-sec cb-exp" id="experiencia" aria-labelledby="cb-exp-t">
      <div className="cb-wrap">
        <p className="cb-kicker">La experiencia</p>
        <h2 id="cb-exp-t" className="cb-h2">Una mañana con las manos <em>ocupadas.</em></h2>
        <ol className="cb-exp__steps">
          {steps.map((s) => <li key={s.n}><div className="cb-exp__art">{s.art}</div><span>{s.n}</span><b>{s.t}</b><p>{s.d}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ 2 · talleres ------------------------------ */
function Workshops({ onBook }: { onBook: (k: string, el: HTMLElement) => void }) {
  return (
    <section className="cb-sec cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <div className="cb-wrap">
        <p className="cb-kicker">Nuestros talleres</p>
        <h2 id="cb-ws-t" className="cb-h2">Elegí cómo querés <em>ensuciarte.</em></h2>
        <ul className="cb-ws__list">
          {EXPS.map((e) => (
            <li key={e.key} style={{ ["--t" as string]: e.tone }}>
              <div className="cb-ws__head"><b>{e.name}</b><span>{e.dur}</span></div>
              <p>{e.desc}</p>
              <div className="cb-ws__f"><b>{money(e.price)}<small> por persona</small></b><button type="button" className="cb-btn cb-btn--sm" onClick={(ev) => onBook(e.key, ev.currentTarget)}>Reservar</button></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ 3 · ceramic shop ------------------------------ */
function Shop({ onAdd }: { onAdd: (id: string, name: string) => void }) {
  return (
    <section className="cb-sec cb-shop" id="shop" aria-labelledby="cb-shop-t">
      <div className="cb-wrap">
        <div className="cb-shop__h">
          <div><p className="cb-kicker">Ceramic Shop</p><h2 id="cb-shop-t" className="cb-h2">Piezas terminadas, <em>para llevar.</em></h2></div>
          <p>Hechas en el estudio, una por una. Envíos a todo el país.</p>
        </div>
        <ul className="cb-shop__grid">
          {SHOP.map((s) => (
            <li key={s.id}>
              <div className="cb-shop__art"><Piece kind={s.kind} tone={s.tone} pattern={"pattern" in s ? s.pattern : null} handle={"handle" in s ? s.handle : undefined} size={150} label={s.name} /></div>
              <div className="cb-shop__row"><span><b>{s.name}</b><small>{money(s.price)}</small></span><button type="button" className="cb-add" onClick={() => onAdd(s.id, s.name)} aria-label={`Agregar ${s.name} al carrito`}>+</button></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Cart({ items, onRemove, onClose, onClear }: { items: string[]; onRemove: (i: number) => void; onClose: () => void; onClear: () => void }) {
  const list = items.map((id) => SHOP.find((s) => s.id === id)!).filter(Boolean);
  const total = list.reduce((n, s) => n + s.price, 0);
  const [paid, setPaid] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="cb-drawer" role="dialog" aria-modal="true" aria-labelledby="cb-cart-t">
      <div className="cb-drawer__bg" onClick={onClose} />
      <div className="cb-drawer__p">
        <div className="cb-drawer__h"><h2 id="cb-cart-t">Tu carrito</h2><button type="button" onClick={onClose} aria-label="Cerrar">✕</button></div>
        {paid ? (
          <div className="cb-paid"><Stamp /><b>¡Gracias por tu compra!</b><p>Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-muted">Todavía no agregaste piezas.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><Piece kind={s.kind} tone={s.tone} pattern={"pattern" in s ? s.pattern : null} size={48} /><span><b>{s.name}</b><small>{money(s.price)}</small></span><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p><span>Total</span><b>{money(total)}</b></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ 4 · el estudio ------------------------------ */
function Studio() {
  const line = ["amphora", "tall", "vase", "bowl", "jug", "bottle", "cup", "vase", "tall"] as const;
  return (
    <section className="cb-sec cb-studio" id="estudio" aria-labelledby="cb-st-t">
      <div className="cb-wrap">
        <p className="cb-kicker">El estudio</p>
        <h2 id="cb-st-t" className="cb-h2">Una casa vieja en Palermo, <em>llena de barro.</em></h2>
        <div className="cb-studio__shelf" aria-hidden>
          {line.map((k, i) => <Piece key={i} kind={k} tone={C.cream} handle={k === "jug" ? "right" : k === "amphora" ? "both" : undefined} size={i % 2 ? 92 : 118} />)}
        </div>
        <div className="cb-studio__info">
          <div><b>Dónde</b><p>Gorriti 4800, Palermo<br />Buenos Aires</p></div>
          <div><b>Cuándo</b><p>Martes a domingo · 10 a 22 h<br />Lunes cerrado</p></div>
          <div><b>Contacto</b><p>hola@cobalto.studio<br />@cobalto.ceramica</p></div>
        </div>
      </div>
    </section>
  );
}
