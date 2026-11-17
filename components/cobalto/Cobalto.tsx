"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Defs, PROFILES, Piece, vessel } from "./shapes";

/* =====================================================================
   Cobalto · estudio de cerámica con brunch (concepto de NEXA)
   Dirección editorial: chocolate, arena, papel y piedra; serif fina
   (Italiana) + grotesca liviana (Hanken Grotesk); siluetas recortadas.
   Hero: cuatro cuadros (taza, pinceles, croissant, tarjeta). La tarjeta
   se transforma en el calendario de reservas y termina en invitación.
   ===================================================================== */

const C = { choc: "#4a2c20", choc2: "#2e1b13", sand: "#d8c3a5", paper: "#efe8dc", stone: "#8e8b84", cream: "#f6f1e8", rust: "#9a5a35", sage: "#a3a58d" };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

type TileKey = "pieza" | "color" | "brunch";
type Exp = { key: string; name: string; dur: string; price: number; desc: string; when: string };
const EXPS: Exp[] = [
  { key: "brunch", name: "Brunch & Paint", dur: "2 h", price: 32000, when: "Martes a domingo · mañana y tarde", desc: "Elegís una pieza, la pintás a tu ritmo y te servimos brunch completo con café de especialidad." },
  { key: "torno", name: "Torno inicial", dur: "3 h", price: 45000, when: "Sábados · 15:00", desc: "Tu primera vez en el torno, en grupos de seis. Hacés dos piezas y elegís cuál esmaltamos." },
  { key: "noche", name: "Wine & Clay", dur: "2 h 30", price: 38000, when: "Jueves y viernes · 20:00", desc: "Modelado a mano, vino natural y algo para picar. Una noche tranquila para ir con amigos." },
];
const PIECES = [
  { kind: "mug", name: "Taza", price: 7500, handle: "right" as const },
  { kind: "bowl", name: "Bowl", price: 9000 },
  { kind: "cup", name: "Vaso", price: 6500 },
  { kind: "vase", name: "Florero", price: 12000 },
  { kind: "jug", name: "Jarra", price: 14000, handle: "right" as const },
] as const;
const SHOP = [
  { id: "s1", kind: "amphora", name: "Ánfora Arenisca", price: 48000, tone: C.sand, pattern: "stone" as const, handle: "both" as const },
  { id: "s2", kind: "jug", name: "Jarra Chocolate", price: 36000, tone: C.choc, handle: "right" as const },
  { id: "s3", kind: "bottle", name: "Botella Piedra", price: 29000, tone: C.stone, pattern: "stone" as const },
  { id: "s4", kind: "bowl", name: "Fuente Papel", price: 33000, tone: C.cream },
  { id: "s5", kind: "vase", name: "Florero Tierra", price: 31000, tone: C.choc, pattern: "stone-dark" as const },
  { id: "s6", kind: "tall", name: "Florero Hueso", price: 27000, tone: C.cream },
] as const;
const SWATCHES = [["Chocolate", C.choc], ["Arena", C.sand], ["Óxido", C.rust], ["Salvia", C.sage], ["Piedra", C.stone]] as const;

/** Agrega `in` cuando el bloque entra en pantalla (para revelar títulos). */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".cb [data-reveal]");
    if (reduced()) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.25 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

export default function Cobalto() {
  const [booking, setBooking] = useState<{ from: DOMRect | null; exp?: string; origin: HTMLElement | null } | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  useReveal();
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const openBooking = useCallback((exp?: string, from?: HTMLElement | null) => {
    const el = from ?? cardRef.current;
    setBooking({ from: el?.getBoundingClientRect() ?? null, origin: el ?? null, ...(exp ? { exp } : {}) });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen]);

  return (
    <div className="cb" id="main">
      <Defs />
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={() => openBooking()} />
      <Hero cardRef={cardRef} cardHidden={!!booking && booking.origin === cardRef.current} onBook={() => openBooking()} />
      <Experience />
      <Workshops onBook={(k, el) => openBooking(k, el)} />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} · agregada al carrito`); }} />
      <Studio onBook={(el) => openBooking(undefined, el)} />
      <footer className="cb-foot">
        <span className="cb-foot__logo">Cobalto</span>
        <span>Concepto de portfolio desarrollado por NEXA · Cobalto es una marca ficticia: sin reservas ni ventas reales.</span>
      </footer>
      {booking && <Booking from={booking.from} initial={booking.exp} onClose={() => setBooking(null)} back={() => booking.origin?.getBoundingClientRect() ?? null} />}
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
      <a href="#main" className="cb-logo" aria-label="Cobalto, inicio">Cobalto</a>
      <nav className={menu ? "open" : ""} aria-label="Principal">
        {[["#experiencia", "Experiencia"], ["#talleres", "Talleres"], ["#shop", "Shop"], ["#estudio", "Estudio"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito ({count})</button>
      <button type="button" className="cb-btn cb-btn--sm" onClick={onBook}>Reservá</button>
      <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
    </header>
  );
}

/* ------------------------------ hero: cuatro cuadros ------------------------------ */
function Hero({ cardRef, cardHidden, onBook }: { cardRef: React.RefObject<HTMLButtonElement | null>; cardHidden: boolean; onBook: () => void }) {
  const [open, setOpen] = useState<{ k: TileKey; x: number; y: number } | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const tap = (k: TileKey, e: React.MouseEvent<HTMLButtonElement>) => {
    const g = grid.current!.getBoundingClientRect(), r = e.currentTarget.getBoundingClientRect();
    setOpen({ k, x: ((r.left + r.width / 2 - g.left) / g.width) * 100, y: ((r.top + r.height / 2 - g.top) / g.height) * 100 });
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <section className="cb-hero" aria-labelledby="cb-hero-t">
      <div className="cb-hero__copy">
        <p className="cb-eyebrow">Ceramic café · Palermo, Buenos Aires</p>
        <h1 id="cb-hero-t"><span>A little art.</span><span>A lot of fun.</span></h1>
        <div className="cb-hero__foot">
          <p className="cb-just">Pintá tu propia pieza de cerámica, disfrutá de un brunch y compartí una experiencia diferente.</p>
          <div className="cb-hero__ctas">
            <button type="button" className="cb-btn" onClick={onBook}>Reservá tu mesa</button>
            <span className="cb-meta">Martes a domingo<br />10:00 — 22:00</span>
          </div>
        </div>
      </div>

      <div ref={grid} className="cb-grid4">
        <button type="button" className="cb-tile cb-tile--choc" onClick={(e) => tap("pieza", e)} aria-label="La pieza: ver qué podés pintar">
          <svg viewBox="0 0 200 200" aria-hidden><Silhouette kind="mug" /></svg>
          <span className="cb-tile__l"><i>01</i>La pieza</span>
        </button>
        <button type="button" className="cb-tile cb-tile--paper" onClick={(e) => tap("color", e)} aria-label="El color: ver esmaltes y piezas pintadas">
          <svg viewBox="0 0 200 200" aria-hidden><Silhouette kind="brushes" /></svg>
          <span className="cb-tile__l"><i>02</i>El color</span>
        </button>
        <button type="button" className="cb-tile cb-tile--sand" onClick={(e) => tap("brunch", e)} aria-label="El brunch: ver qué incluye">
          <svg viewBox="0 0 200 200" aria-hidden><Silhouette kind="croissant" /></svg>
          <span className="cb-tile__l"><i>03</i>El brunch</span>
        </button>
        <div className="cb-tile cb-tile--choc2">
          <button ref={cardRef} type="button" className="cb-card" style={{ visibility: cardHidden ? "hidden" : "visible" }} onClick={onBook} aria-label="Tarjeta Cobalto: abrir el calendario de reservas">
            <span className="cb-card__name">Cobalto</span>
            <span className="cb-card__sub">ceramic café</span>
            <span className="cb-card__cta">Reservá tu mesa →</span>
          </button>
          <span className="cb-tile__l"><i>04</i>Tu mesa</span>
        </div>
        {open && <TilePanel {...open} onClose={() => setOpen(null)} onBook={() => { setOpen(null); onBook(); }} />}
      </div>
    </section>
  );
}

function Silhouette({ kind }: { kind: "mug" | "brushes" | "croissant" }) {
  if (kind === "mug") {
    const d = vessel(PROFILES.mug!, 92, 160, 96);
    return (
      <g className="cb-sil">
        <clipPath id="cb-clip-mug"><path d={d} /><path d="M126,86 c40,2 42,56 0,62 v-14 c22,-4 22,-32 0,-34 z" /></clipPath>
        <g clipPath="url(#cb-clip-mug)"><rect className="cb-sil__tex" x="-20" y="40" width="240" height="140" fill="#000" filter="url(#cb-stone)" /></g>
      </g>
    );
  }
  if (kind === "brushes") {
    const jar = vessel(PROFILES.jar!, 100, 168, 74);
    return (
      <g className="cb-sil" fill={C.choc}>
        {[[-12, 0], [0, 1], [12, 2]].map(([a, i]) => (
          <g key={i} transform={`rotate(${a} 100 120)`}>
            <rect x="96.5" y="30" width="7" height="100" rx="3.5" />
            <path d="M96.5,34 q3.5,-26 7,0 z" transform="translate(0 -4)" />
          </g>
        ))}
        <path d={jar} />
      </g>
    );
  }
  return (
    <g className="cb-sil">
      {/* croissant: medialuna con sus pliegues (cortes en el color del fondo) */}
      <path fill={C.choc} d="M18,138 C22,112 44,96 62,92 C70,76 86,66 100,66 C114,66 130,76 138,92 C156,96 178,112 182,138 C170,134 160,134 152,140 C146,124 134,116 124,116 C120,108 110,104 100,104 C90,104 80,108 76,116 C66,116 54,124 48,140 C40,134 30,134 18,138 Z" />
      <g fill="none" stroke={C.sand} strokeWidth="3.2" strokeLinecap="round">
        <path d="M62,92 C68,100 72,108 76,116" /><path d="M138,92 C132,100 128,108 124,116" />
        <path d="M92,67 C94,80 96,92 98,104" /><path d="M108,67 C106,80 104,92 102,104" />
      </g>
      <path d="M14,156 H186" stroke={C.choc} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function TilePanel({ k, x, y, onClose, onBook }: { k: TileKey; x: number; y: number; onClose: () => void; onBook: () => void }) {
  const [sw, setSw] = useState<string>(C.choc);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div ref={ref} tabIndex={-1} className={`cb-tpanel cb-tpanel--${k}`} style={{ ["--x" as string]: `${x}%`, ["--y" as string]: `${y}%` }} role="dialog" aria-label={k === "pieza" ? "La pieza" : k === "color" ? "El color" : "El brunch"}>
      <button type="button" className="cb-tpanel__x" onClick={onClose}>Cerrar ✕</button>
      {k === "pieza" && (
        <>
          <p className="cb-eyebrow">01 — La pieza</p>
          <h3>Elegí tu lienzo.</h3>
          <ul className="cb-tpanel__pieces">
            {PIECES.map((p) => <li key={p.name}><Piece kind={p.kind} tone={C.sand} handle={"handle" in p ? p.handle : undefined} size={64} /><b>{p.name}</b><small>{money(p.price)}</small></li>)}
          </ul>
          <p className="cb-tpanel__t">El precio de la pieza se suma a la experiencia. La esmaltamos, la horneamos y la retirás en siete días.</p>
        </>
      )}
      {k === "color" && (
        <>
          <p className="cb-eyebrow">02 — El color</p>
          <h3>Doce esmaltes de tierra.</h3>
          <div className="cb-tpanel__sw" role="radiogroup" aria-label="Esmalte">
            {SWATCHES.map(([n, c]) => <button key={n} type="button" role="radio" aria-checked={sw === c} className={sw === c ? "on" : ""} onClick={() => setSw(c)}><i style={{ background: c }} />{n}</button>)}
          </div>
          <div className="cb-tpanel__painted">
            <Piece kind="mug" tone={sw} handle="right" size={90} />
            <Piece kind="vase" tone={C.sand} pattern="stone" size={84} />
            <Piece kind="bowl" tone={sw} size={104} />
          </div>
        </>
      )}
      {k === "brunch" && (
        <>
          <p className="cb-eyebrow">03 — El brunch</p>
          <h3>Pintar con hambre, nunca.</h3>
          <ul className="cb-tpanel__menu">
            <li><span>Croissant de manteca</span><i /></li>
            <li><span>Tostón de masa madre, palta y huevo</span><i /></li>
            <li><span>Yogur con granola de la casa</span><i /></li>
            <li><span>Jugo exprimido y café de especialidad</span><i /></li>
          </ul>
          <p className="cb-tpanel__t">Opciones veganas y sin TACC avisando al reservar.</p>
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
    return el.animate(reverse ? [{ transform: "none" }, { transform: t }] : [{ transform: t }, { transform: "none" }], { duration: 760, easing: "cubic-bezier(.7,0,.15,1)", fill: "both" });
  };
  useLayoutEffect(() => { if (from) fly(from, false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { box.current?.querySelector<HTMLElement>(".cb-book__in button, .cb-book__in input")?.focus(); }, []);
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
        <button type="button" className="cb-book__x" onClick={close}>Cerrar ✕</button>
        {!done && <div className="cb-book__face" aria-hidden><span className="cb-card__name">Cobalto</span><span className="cb-card__sub">ceramic café</span></div>}
        {!done ? (
          <div className="cb-book__in">
            <p className="cb-eyebrow">Cobalto — reservas</p>
            <h2 id="cb-book-t">Reservá tu mesa</h2>
            <fieldset><legend>Experiencia</legend>
              <div className="cb-chips">{EXPS.map((x) => <button key={x.key} type="button" className={exp === x.key ? "on" : ""} aria-pressed={exp === x.key} onClick={() => { setExp(x.key); setTime(null); }}>{x.name}<small>{x.dur} · {money(x.price)}</small></button>)}</div>
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
            <svg className="cb-invite__vase" viewBox="0 0 140 170" aria-hidden><path d={vessel(PROFILES.amphora!, 70, 165, 150)} fill={C.sand} /><path d="M52,40 c-26,2 -30,40 -6,52 M88,40 c26,2 30,40 6,52" fill="none" stroke={C.sand} strokeWidth="9" strokeLinecap="round" /></svg>
            <p className="cb-eyebrow">Invitación</p>
            <h2 id="cb-book-t">{name.split(" ")[0]}, te esperamos en la mesa.</h2>
            <dl>
              <div><dt>Experiencia</dt><dd>{e.name}</dd></div>
              <div><dt>Fecha</dt><dd>{fmt(dd!, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
              <div><dt>Hora</dt><dd>{time}</dd></div>
              <div><dt>Personas</dt><dd>{people}</dd></div>
              <div><dt>Lugar</dt><dd>Gorriti 4800, Palermo</dd></div>
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

/* ------------------------------ 1 · la experiencia ------------------------------ */
function Experience() {
  const steps = [
    { n: "01", t: "Elegís tu pieza", d: "Tazas, bowls, floreros y jarras en bizcocho, listos para pintar.", cls: "choc", art: <Piece kind="mug" tone={C.cream} handle="right" size={130} /> },
    { n: "02", t: "Pintás con brunch", d: "Te mostramos las técnicas, servimos el brunch y el resto es tiempo para vos.", cls: "sand", art: <Piece kind="bowl" tone={C.choc} size={160} /> },
    { n: "03", t: "La horneamos", d: "Esmaltamos y horneamos tu pieza a 1.200 °C. La retirás en siete días.", cls: "stone", art: <Piece kind="vase" tone={C.sand} pattern="stone" size={130} /> },
  ];
  return (
    <section className="cb-sec cb-exp" id="experiencia" aria-labelledby="cb-exp-t">
      <div className="cb-wrap">
        <div className="cb-head" data-reveal>
          <p className="cb-eyebrow">La experiencia</p>
          <h2 id="cb-exp-t" className="cb-h2">Una mañana con las manos ocupadas.</h2>
        </div>
        <ol className="cb-exp__steps">
          {steps.map((s, i) => (
            <li key={s.n} data-reveal style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className={`cb-exp__art cb-exp__art--${s.cls}`}>{s.art}</div>
              <span>{s.n}</span><b>{s.t}</b><p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ 2 · talleres (como un afiche) ------------------------------ */
function Workshops({ onBook }: { onBook: (k: string, el: HTMLElement) => void }) {
  return (
    <section className="cb-sec cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <div className="cb-ws__bgvase" aria-hidden><svg viewBox="0 0 140 170"><path d={vessel(PROFILES.amphora!, 70, 170, 150)} /><path d="M52,40 c-30,2 -36,44 -8,58 M88,40 c30,2 36,44 8,58" fill="none" strokeWidth="12" strokeLinecap="round" /></svg></div>
      <div className="cb-wrap">
        <div className="cb-head" data-reveal>
          <p className="cb-eyebrow">Nuestros talleres</p>
          <h2 id="cb-ws-t" className="cb-h2">Tres formas de ensuciarse.</h2>
        </div>
        <ul className="cb-ws__list">
          {EXPS.map((e, i) => (
            <li key={e.key} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="cb-ws__n">0{i + 1}</span>
              <div className="cb-ws__main"><b>{e.name}</b><p>{e.desc}</p></div>
              <div className="cb-ws__when"><span>{e.when}</span><span>{e.dur}</span></div>
              <div className="cb-ws__f"><b>{money(e.price)}</b><button type="button" className="cb-link-btn" onClick={(ev) => onBook(e.key, ev.currentTarget)}>Reservar →</button></div>
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
        <div className="cb-shop__h" data-reveal>
          <div><p className="cb-eyebrow">Ceramic shop</p><h2 id="cb-shop-t" className="cb-h2">Piezas terminadas.</h2></div>
          <p className="cb-just">Hechas en el estudio, una por una, con barro y esmaltes de tierra. Envíos a todo el país.</p>
        </div>
        <ul className="cb-shop__grid">
          {SHOP.map((s, i) => (
            <li key={s.id} data-reveal style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
              <div className="cb-shop__art"><Piece kind={s.kind} tone={s.tone} pattern={"pattern" in s ? s.pattern : null} handle={"handle" in s ? s.handle : undefined} size={150} label={s.name} /></div>
              <div className="cb-shop__row"><span><b>{s.name}</b><small>{money(s.price)}</small></span><button type="button" className="cb-link-btn" onClick={() => onAdd(s.id, s.name)} aria-label={`Agregar ${s.name} al carrito`}>Agregar +</button></div>
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
        <div className="cb-drawer__h"><h2 id="cb-cart-t">Carrito</h2><button type="button" onClick={onClose}>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><b>Gracias por tu compra.</b><p>Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
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
function Studio({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-studio" id="estudio" aria-labelledby="cb-st-t">
      <div className="cb-studio__vase" aria-hidden>
        <svg viewBox="0 0 140 170" preserveAspectRatio="xMidYMax meet"><clipPath id="cb-clip-amph"><path d={vessel(PROFILES.amphora!, 70, 170, 150)} /></clipPath><rect width="140" height="170" fill="#000" clipPath="url(#cb-clip-amph)" filter="url(#cb-stone)" /><path d="M52,40 c-30,2 -36,44 -8,58 M88,40 c30,2 36,44 8,58" fill="none" stroke={C.sand} strokeWidth="12" strokeLinecap="round" /></svg>
      </div>
      <div className="cb-wrap cb-studio__in" data-reveal>
        <p className="cb-eyebrow">El estudio</p>
        <h2 id="cb-st-t" className="cb-h2">Una casa vieja en Palermo, llena de barro.</h2>
        <div className="cb-studio__info">
          <div><b>Dónde</b><p>Gorriti 4800<br />Palermo, Buenos Aires</p></div>
          <div><b>Cuándo</b><p>Martes a domingo<br />10:00 — 22:00</p></div>
          <div><b>Contacto</b><p>hola@cobalto.studio<br />@cobalto.ceramica</p></div>
        </div>
        <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa</button>
      </div>
    </section>
  );
}
