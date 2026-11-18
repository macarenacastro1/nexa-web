"use client";
import { useCallback, useEffect, useState } from "react";
import { Booking } from "./Booking";
import { C, Defs, EXPS, MENU_FULL, MENU_TOP, PICKUP, SHOP, Shape, money, reduced, type Exp } from "./data";

/* =====================================================================
   Cobalto · ceramic café (concepto de NEXA)
   Identidad artesanal (letra a mano, siluetas, bloques de color) puesta
   al servicio de lo comercial: entender el plan, ver precios y reservar.
   ===================================================================== */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".cb [data-reveal]");
    if (reduced()) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });

type Panel = "brunch" | "carta" | null;

export default function Cobalto() {
  const [booking, setBooking] = useState<{ exp?: string } | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pastHero, setPastHero] = useState(false);
  useReveal();
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const book = useCallback((exp?: string) => { setPanel(null); setBooking(exp ? { exp } : {}); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen || !!panel);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen, panel]);
  useEffect(() => {
    const f = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <div className="cb" id="main">
      <Defs />
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={() => book()} />
      <Hero onBook={() => book()} />
      <How />
      <Plans onBook={book} onBrunch={() => setPanel("brunch")} />
      <Workshops onBook={book} />
      <Cafe onMenu={() => setPanel("carta")} />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} · agregada al carrito`); }} onCart={() => setCartOpen(true)} count={cart.length} />
      <Visit onBook={() => book()} />
      <footer className="cb-foot">
        <p className="cb-logo cb-foot__logo">COBALTO</p>
        <p className="cb-caps">Ceramic café · Palermo</p>
        <p className="cb-foot__note">Concepto de portfolio desarrollado por NEXA. Cobalto es una marca ficticia: precios, horarios y cupos son de ejemplo, y no se toman reservas ni pagos reales.</p>
      </footer>
      <button type="button" className={`cb-float${pastHero ? " on" : ""}`} onClick={() => book()} tabIndex={pastHero ? 0 : -1} aria-hidden={!pastHero}>Reservá →</button>
      {booking && <Booking initial={booking.exp} onClose={() => setBooking(null)} />}
      {panel === "brunch" && <BrunchPanel onClose={() => setPanel(null)} onBook={() => book("brunch")} />}
      {panel === "carta" && <MenuPanel onClose={() => setPanel(null)} />}
      {cartOpen && <Cart items={cart} onRemove={(i) => setCart((c) => c.filter((_, j) => j !== i))} onClose={() => setCartOpen(false)} onClear={() => setCart([])} />}
      {toast && <div className="cb-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ------------------------------ navegación ------------------------------ */
const LINKS: [string, string][] = [["como-funciona", "La experiencia"], ["talleres", "Talleres"], ["cafe", "Café y brunch"], ["tienda", "Tienda"], ["visita", "Visitanos"]];
function Nav({ count, onCart, onBook }: { count: number; onCart: () => void; onBook: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <header className={`cb-nav${menu ? " open" : ""}`}>
      <a href="#main" className="cb-logo cb-nav__logo">COBALTO</a>
      <nav aria-label="Principal">
        {LINKS.map(([h, t]) => <a key={h} href={`#${h}`} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <div className="cb-nav__r">
        <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito <span>{count}</span></button>
        <button type="button" className="cb-btn cb-btn--sm" onClick={onBook}>Reservá</button>
        <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
      </div>
    </header>
  );
}

/* ------------------------------ hero: texto + mesa interactiva ------------------------------ */
type Spot = { k: "card" | "coffee" | "plate" | "paint" | "croissant"; x: number; y: number; label: string; act: () => void };
function Hero({ onBook }: { onBook: () => void }) {
  const [hov, setHov] = useState<Spot["k"] | null>(null);
  const spots: Spot[] = [
    { k: "card", x: 36, y: 12, label: "Reservá tu mesa", act: onBook },
    { k: "coffee", x: 70, y: 11, label: "La carta y el brunch", act: () => go("cafe") },
    { k: "plate", x: 60, y: 40, label: "Piezas para pintar", act: () => go("tienda") },
    { k: "paint", x: 92, y: 62, label: "Cómo funciona", act: () => go("como-funciona") },
    { k: "croissant", x: 30, y: 74, label: "Algo rico", act: () => go("cafe") },
  ];
  return (
    <section className="cb-hero" aria-labelledby="cb-hero-t">
      <div className="cb-hero__txt">
        <p className="cb-caps cb-hero__k">Ceramic café · Palermo</p>
        <h1 id="cb-hero-t" className="cb-logo cb-hero__h">Pintá cerámica.<br />Tomá un café.<br /><span>Pasá una tarde distinta.</span></h1>
        <p className="cb-hero__sub">Elegí una pieza, pintala a tu manera y disfrutá de algo rico mientras creás. Nosotros nos encargamos del horneado.</p>
        <div className="cb-hero__cta">
          <button type="button" className="cb-btn" onClick={onBook}>Reservá tu mesa →</button>
          <button type="button" className="cb-link" onClick={() => go("como-funciona")}>Mirá cómo funciona</button>
        </div>
      </div>
      <div className="cb-hero__art">
        <Table hov={hov} />
        {spots.map((s) => (
          <button key={s.k} type="button" className={`cb-spot${hov === s.k ? " on" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onPointerEnter={() => setHov(s.k)} onPointerLeave={() => setHov(null)} onFocus={() => setHov(s.k)} onBlur={() => setHov(null)} onClick={s.act}>
            <i aria-hidden /><span>{s.label}</span>
          </button>
        ))}
      </div>
      <nav className="cb-hero__quick" aria-label="Accesos rápidos">
        <button type="button" onClick={() => go("tienda")}>Piezas</button>
        <button type="button" onClick={() => go("como-funciona")}>Cómo funciona</button>
        <button type="button" onClick={() => go("cafe")}>La carta</button>
        <button type="button" onClick={onBook}>Reservar</button>
      </nav>
    </section>
  );
}

/** La mesa vista desde arriba, dibujada con la paleta de la marca. */
function Table({ hov }: { hov: string | null }) {
  const on = (k: string) => `cb-obj${hov === k ? " on" : ""}`;
  return (
    <svg className="cb-table" viewBox="0 0 600 600" role="img" aria-label="Ilustración de una mesa vista desde arriba: una pieza de cerámica a medio pintar, pinceles, pinturas, un café, una medialuna y una tarjeta de reserva.">
      <g filter="url(#cb-rough)">
        <rect x="8" y="8" width="584" height="584" rx="28" fill={C.blue} />
        {/* tarjeta de reserva */}
        <g className={on("card")} style={{ transformOrigin: "140px 120px" }}>
          <g transform="rotate(-9 140 120)">
            <rect x="52" y="66" width="176" height="108" rx="6" fill={C.olive} />
            <text x="140" y="122" textAnchor="middle" fill={C.blue} fontFamily="Syne, sans-serif" fontWeight="700" fontSize="27">RESERVÁ</text>
            <text x="140" y="148" textAnchor="middle" fill={C.light} fontFamily="Inter, sans-serif" fontSize="9.5" letterSpacing="2.4">MESA PARA 2 · SÁB 16 H</text>
          </g>
        </g>
        {/* café */}
        <g className={on("coffee")} style={{ transformOrigin: "462px 134px" }}>
          <circle cx="462" cy="134" r="78" fill={C.light} />
          <rect x="516" y="118" width="46" height="30" rx="15" fill={C.cream} />
          <circle cx="462" cy="134" r="56" fill={C.cream} />
          <circle cx="462" cy="134" r="44" fill={C.olive} />
          <path d="M462 160 C440 146 438 126 452 122 C458 120 462 126 462 130 C462 126 466 120 472 122 C486 126 484 146 462 160Z" fill={C.tan} />
        </g>
        {/* pieza de cerámica a medio pintar */}
        <g className={on("plate")} style={{ transformOrigin: "282px 318px" }}>
          <circle cx="282" cy="318" r="138" fill={C.cream} />
          <circle cx="282" cy="318" r="104" fill="none" stroke={C.tan} strokeWidth="4" />
          <path d="M178 318 A104 104 0 0 1 386 318" fill="none" stroke={C.rust} strokeWidth="18" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={222 + i * 30} cy={356 + (i % 2) * 14} r="9" fill={C.wine} />)}
          <path d="M240 270 C262 248 302 248 324 270" fill="none" stroke={C.blue} strokeWidth="10" strokeLinecap="round" />
        </g>
        {/* pinturas y pinceles */}
        <g className={on("paint")} style={{ transformOrigin: "470px 440px" }}>
          {[[454, 326, C.rust], [506, 360, C.wine], [452, 392, C.olive], [512, 420, C.tan]].map(([x, y, c], i) => (
            <g key={i}><circle cx={x as number} cy={y as number} r="24" fill={C.light} /><circle cx={x as number} cy={y as number} r="16" fill={c as string} /></g>
          ))}
          <g transform="rotate(-38 470 500)">
            <rect x="380" y="492" width="150" height="12" rx="6" fill={C.olive} /><rect x="528" y="490" width="22" height="16" rx="3" fill={C.tan} /><path d="M550 490 C566 494 572 498 576 498 C572 498 566 502 550 506Z" fill={C.wine} />
            <rect x="372" y="522" width="132" height="10" rx="5" fill={C.wine} /><rect x="502" y="520" width="18" height="14" rx="3" fill={C.tan} /><path d="M520 520 C532 524 538 527 542 527 C538 527 532 530 520 534Z" fill={C.rust} />
          </g>
        </g>
        {/* medialuna */}
        <g className={on("croissant")} style={{ transformOrigin: "128px 488px" }}>
          <ellipse cx="128" cy="488" rx="92" ry="64" fill={C.light} />
          <path d="M60 500 C70 440 186 440 196 500 C180 486 162 480 128 478 C94 480 76 486 60 500Z" fill={C.rust} />
          <path d="M96 470 C102 480 104 486 104 482 M128 462 C130 472 130 478 130 478 M160 470 C156 480 154 486 154 482" stroke={C.tan} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------ cómo funciona ------------------------------ */
function How() {
  const steps = [
    { t: "Elegí tu pieza", d: "Tazas, cuencos, platos y otras piezas listas para darles tu estilo.", k: "cup" as const },
    { t: "Pintala a tu manera", d: "Te damos las pinturas y los materiales. Vos ponés las ideas.", k: "bowl" as const },
    { t: "Nosotros la horneamos", d: "Nos encargamos del acabado para que después puedas retirar tu creación.", k: "vase" as const },
  ];
  return (
    <section className="cb-how" id="como-funciona" aria-labelledby="cb-how-t">
      <h2 id="cb-how-t" className="cb-logo cb-h2" data-reveal>Venís, pintás y nosotros hacemos el resto.</h2>
      <ol className="cb-how__list">
        {steps.map((s, i) => (
          <li key={s.t} data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
            <Shape k={s.k} color={C.blue} className="cb-how__shape" />
            <div>
              <p className="cb-how__n">0{i + 1}</p>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="cb-how__pick" data-reveal>{PICKUP}</p>
    </section>
  );
}

/* ------------------------------ ¿qué plan hacemos? ------------------------------ */
function Facts({ e, rows }: { e: Exp; rows?: [string, string][] }) {
  const r = rows ?? [
    ["Duración", e.dur],
    ["Precio", `${e.from ? "Desde " : ""}${money(e.price)} por persona`],
    ["Días y horarios", e.when],
    ["Reserva", e.booking],
    ...(e.seats ? [["Cupos", e.seats] as [string, string]] : []),
  ];
  return <dl className="cb-facts">{r.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}
function Plans({ onBook, onBrunch }: { onBook: (k?: string) => void; onBrunch: () => void }) {
  const [pinta, brunch, torno, noche] = EXPS as [Exp, Exp, Exp, Exp];
  return (
    <section className="cb-plans" id="planes" aria-labelledby="cb-plans-t">
      <div className="cb-head" data-reveal>
        <h2 id="cb-plans-t" className="cb-logo cb-h2">¿Qué plan hacemos?</h2>
        <p className="cb-lead">Una salida distinta, una tarde creativa o algo nuevo para aprender. Elegí lo que más te guste.</p>
      </div>
      <div className="cb-plans__grid">
        <article className="cb-plan cb-plan--a" data-reveal>
          <div className="cb-plan__art"><Shape k="cup" color={C.rust} /><Shape k="tumbler" color={C.olive} /></div>
          <p className="cb-plan__n">01</p>
          <h3 className="cb-logo">{pinta.name}</h3>
          <p>{pinta.desc}</p>
          <p className="cb-plan__inc"><b>Incluye:</b> {pinta.includes.join(" · ")}</p>
          <Facts e={pinta} />
          <button type="button" className="cb-btn" onClick={() => onBook("pinta")}>Reservar mesa →</button>
        </article>
        <article className="cb-plan cb-plan--b" data-reveal>
          <span className="cb-plan__tag">El más elegido</span>
          <div className="cb-plan__art"><Shape k="bowl" color={C.tan} /><Shape k="cup" color={C.blue} /></div>
          <p className="cb-plan__n">02</p>
          <h3 className="cb-logo">{brunch.name}</h3>
          <p>{brunch.desc}</p>
          <p className="cb-plan__inc"><b>Incluye:</b> {brunch.includes.join(" · ")}</p>
          <Facts e={brunch} />
          <div className="cb-plan__ctas">
            <button type="button" className="cb-btn cb-btn--light" onClick={onBrunch}>Ver la experiencia →</button>
            <button type="button" className="cb-link" onClick={() => onBook("brunch")}>Reservar</button>
          </div>
        </article>
        <article className="cb-plan cb-plan--c" data-reveal>
          <div className="cb-plan__art"><Shape k="vase" color={C.blue} /><Shape k="bottle" color={C.tan} /></div>
          <p className="cb-plan__n">03</p>
          <h3 className="cb-logo">Talleres</h3>
          <p>Para quienes quieren aprender técnicas nuevas, experimentar con materiales y crear desde cero.</p>
          <Facts e={torno} rows={[
            ["Talleres", `${torno.name} y ${noche.name}`],
            ["Duración", "2 h 30 a 3 h"],
            ["Precio", `Desde ${money(Math.min(torno.price, noche.price))} por persona`],
            ["Días", "Jueves, viernes y sábados"],
            ["Reserva", "Necesaria · cupos limitados"],
          ]} />
          <button type="button" className="cb-btn cb-btn--light" onClick={() => go("talleres")}>Explorar talleres →</button>
        </article>
      </div>
      <p className="cb-demo-note">Precios, horarios y cupos de ejemplo: Cobalto es una marca ficticia creada por Nexa para su portfolio.</p>
    </section>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="cb-drawer" role="dialog" aria-modal="true" aria-labelledby="cb-sheet-t">
      <div className="cb-drawer__bg" onClick={onClose} />
      <div className="cb-drawer__p cb-sheet">
        <div className="cb-drawer__h"><h2 id="cb-sheet-t" className="cb-logo">{title}</h2><button type="button" className="cb-link" onClick={onClose} autoFocus>Cerrar ✕</button></div>
        {children}
      </div>
    </div>
  );
}
function BrunchPanel({ onClose, onBook }: { onClose: () => void; onBook: () => void }) {
  const e = EXPS.find((x) => x.key === "brunch")!;
  return (
    <Sheet title={e.name} onClose={onClose}>
      <div className="cb-sheet__art"><Shape k="bowl" color={C.wine} /><Shape k="cup" color={C.rust} /></div>
      <p>{e.desc} Llegás, elegís tu pieza y te servimos el brunch en la mesa mientras pintás.</p>
      <ol className="cb-sheet__steps">
        <li><b>Llegás y elegís</b> una pieza entre tazas, cuencos y platos.</li>
        <li><b>Te servimos el brunch:</b> bebida caliente, jugo, tostado y algo dulce.</li>
        <li><b>Pintás sin apuro</b> durante dos horas y media.</li>
        <li><b>La horneamos</b> y la retirás a los 7 días.</li>
      </ol>
      <Facts e={e} />
      <button type="button" className="cb-btn cb-btn--block" onClick={onBook}>Reservar Brunch & Paint →</button>
    </Sheet>
  );
}
function MenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="LA CARTA" onClose={onClose}>
      <div className="cb-carta">
        {MENU_FULL.map((g) => (
          <section key={g.group}>
            <h3>{g.group}</h3>
            <ul className="cb-menu">{g.items.map((m) => <li key={m.name}><span>{m.name}</span><i /><b>{money(m.price)}</b></li>)}</ul>
          </section>
        ))}
        <p className="cb-demo-note">Carta y precios de ejemplo.</p>
      </div>
    </Sheet>
  );
}

/* ------------------------------ talleres ------------------------------ */
function Workshops({ onBook }: { onBook: (k: string) => void }) {
  const ws = EXPS.filter((e) => e.kind === "taller");
  return (
    <section className="cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <div className="cb-head" data-reveal>
        <h2 id="cb-ws-t" className="cb-logo cb-h2">Talleres</h2>
        <p className="cb-lead">Grupos chicos, todo el material incluido y una persona del estudio guiándote.</p>
      </div>
      <div className="cb-ws__list">
        {ws.map((e) => (
          <article key={e.key} className="cb-wsc" data-reveal>
            <Shape k={e.shape} color={C.tan} className="cb-wsc__shape" />
            <div className="cb-wsc__main">
              <h3 className="cb-logo">{e.name}</h3>
              <p>{e.desc}</p>
              <p className="cb-wsc__inc"><b>Incluye:</b> {e.includes.join(" · ")}</p>
            </div>
            <dl className="cb-wsc__data">
              <div><dt>Duración</dt><dd>{e.dur}</dd></div>
              <div><dt>Día y horario</dt><dd>{e.when}</dd></div>
              <div><dt>Precio</dt><dd>{money(e.price)}</dd></div>
              <div><dt>Cupos</dt><dd>{e.seats}</dd></div>
            </dl>
            <button type="button" className="cb-btn cb-btn--light cb-wsc__cta" onClick={() => onBook(e.key)}>Reservar este taller →</button>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ café y brunch ------------------------------ */
function FoodIcon({ k }: { k: "cup" | "croissant" | "toast" | "cake" }) {
  if (k === "cup") return <Shape k="cup" color={C.rust} />;
  const d = {
    croissant: "M8 68 C12 22 88 22 92 68 C78 60 64 57 50 57 C36 57 22 60 8 68Z",
    toast: "M22 30 C22 18 40 14 50 20 C60 14 78 18 78 30 C78 36 74 38 72 40 L72 78 L28 78 L28 40 C26 38 22 36 22 30Z",
    cake: "M14 48 C14 34 86 34 86 48 L84 78 L16 78Z",
  }[k];
  return <svg className="cb-shape" viewBox="0 0 100 100" aria-hidden><g filter="url(#cb-rough)"><path d={d} fill={k === "toast" ? C.tan : k === "cake" ? C.tan : C.rust} />{k === "croissant" && <path d="M34 36 L38 54 M50 32 L50 52 M66 36 L62 54" stroke={C.tan} strokeWidth="4" strokeLinecap="round" />}{k === "cake" && <path d="M16 46 C30 40 70 40 84 46 L84 52 C78 56 74 50 70 56 C64 62 60 50 54 54 C46 60 42 50 36 56 C28 60 24 50 16 54Z" fill={C.light} />}</g></svg>;
}
function Cafe({ onMenu }: { onMenu: () => void }) {
  return (
    <section className="cb-cafe" id="cafe" aria-labelledby="cb-cafe-t">
      <div className="cb-head cb-head--row" data-reveal>
        <div>
          <h2 id="cb-cafe-t" className="cb-logo cb-h2">Algo rico también es parte del plan.</h2>
          <p className="cb-lead">Café de especialidad, opciones dulces y saladas para acompañar tu tarde en Cobalto.</p>
        </div>
        <button type="button" className="cb-btn" onClick={onMenu}>Ver la carta →</button>
      </div>
      <ul className="cb-food">
        {MENU_TOP.map((m, i) => (
          <li key={m.name} data-reveal style={{ transitionDelay: `${i * 0.06}s` }}>
            <div className="cb-food__art"><FoodIcon k={m.icon} /></div>
            <h3>{m.name}</h3>
            <p>{m.desc}</p>
            <b>{money(m.price)}</b>
          </li>
        ))}
      </ul>
      <p className="cb-cafe__note" data-reveal><b>¿Venís a Brunch & Paint?</b> El brunch ya está incluido: bebida caliente, jugo, tostado y algo dulce.</p>
    </section>
  );
}

/* ------------------------------ tienda ------------------------------ */
function Shop({ onAdd, onCart, count }: { onAdd: (id: string, name: string) => void; onCart: () => void; count: number }) {
  return (
    <section className="cb-shop" id="tienda" aria-labelledby="cb-shop-t">
      <div className="cb-head cb-head--row" data-reveal>
        <div>
          <h2 id="cb-shop-t" className="cb-logo cb-h2">Piezas para llevarte a casa.</h2>
          <p className="cb-lead">Objetos de cerámica para usar, regalar y disfrutar todos los días.</p>
        </div>
        <button type="button" className="cb-link" onClick={onCart}>Ver carrito ({count})</button>
      </div>
      <ul className="cb-shop__grid">
        {SHOP.map((p) => (
          <li key={p.id} className="cb-prod" data-reveal>
            <div className="cb-prod__img" style={{ background: p.bg }}>
              <Shape k={p.shape} color={p.fg} />
              <span className="cb-prod__tag">Pieza conceptual</span>
            </div>
            <div className="cb-prod__meta">
              <div><h3>{p.name}</h3><p>{p.note}</p></div>
              <b>{money(p.price)}</b>
            </div>
            <p className={`cb-prod__stock${p.stock === 0 ? " out" : ""}`}>{p.stock === 0 ? "Sin stock por ahora" : p.stock <= 3 ? `Quedan ${p.stock}` : "Disponible"}</p>
            <button type="button" className="cb-btn cb-btn--line cb-btn--block" disabled={p.stock === 0} onClick={() => onAdd(p.id, p.name)}>{p.stock === 0 ? "Sin stock" : "Agregar al carrito"}</button>
          </li>
        ))}
      </ul>
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
        <div className="cb-drawer__h"><h2 id="cb-cart-t" className="cb-logo">CARRITO</h2><button type="button" className="cb-link" onClick={onClose} autoFocus>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><p className="cb-logo">¡GRACIAS!</p><p>Demostración: en la web real acá se conecta el pago online y te llega el seguimiento del envío. No se cobró nada.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-empty">Todavía no agregaste piezas.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><span className="cb-lines__img" style={{ background: s.bg }}><Shape k={s.shape} color={s.fg} /></span><p>{s.name}<br /><b>{money(s.price)}</b></p><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p><span>Total</span><b>{money(total)}</b></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar (demo)</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ visitanos ------------------------------ */
function Visit({ onBook }: { onBook: () => void }) {
  const [flip, setFlip] = useState(false);
  return (
    <section className="cb-visit" id="visita" aria-labelledby="cb-visit-t">
      <div className="cb-visit__txt" data-reveal>
        <h2 id="cb-visit-t" className="cb-logo cb-h2">Nos vemos en Cobalto.</h2>
        <dl className="cb-faq">
          <div><dt>¿Dónde queda?</dt><dd>En Palermo, Buenos Aires.</dd></div>
          <div><dt>¿Qué días abre?</dt><dd>De martes a domingo. Los lunes, cerrado.</dd></div>
          <div><dt>¿En qué horarios?</dt><dd>De 10 a 20 h. Wine & Clay, jueves y viernes a las 20 h.</dd></div>
          <div><dt>¿Necesito reservar?</dt><dd>Para pintar y para los talleres, sí. Para tomar un café, no hace falta.</dd></div>
          <div><dt>¿Cómo llego?</dt><dd>Al reservar te mandamos la dirección y cómo llegar.</dd></div>
        </dl>
        <button type="button" className="cb-btn" onClick={onBook}>Reservá tu mesa →</button>
      </div>
      <button type="button" className={`cb-card${flip ? " flip" : ""}`} onClick={() => setFlip((f) => !f)} aria-label={flip ? "Ver el frente de la tarjeta" : "Dar vuelta la tarjeta"} data-reveal>
        <span className="cb-card__in">
          <span className="cb-card__face">
            <span className="cb-logo">COBALTO</span>
            <span className="cb-caps">Ceramic café · Palermo</span>
            <span className="cb-card__hint">Tocá para dar vuelta</span>
          </span>
          <span className="cb-card__face cb-card__back">
            <span className="cb-card__row"><span>Palermo · Buenos Aires</span><span>Mar a dom · 10 a 20 h</span></span>
            <span className="cb-caps">Pintá · Tomá · Llevate</span>
            <span className="cb-card__shapes">
              <Shape k="bottle" color={C.blue} /><Shape k="bowl" color={C.blue} /><Shape k="cup" color={C.blue} /><Shape k="vase" color={C.blue} />
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
