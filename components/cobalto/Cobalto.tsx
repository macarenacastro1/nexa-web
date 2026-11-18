"use client";
import { useCallback, useEffect, useState } from "react";
import { Booking } from "./Booking";
import { C, Defs, EXPS, SHOP, Shape, money, reduced } from "./data";

/* =====================================================================
   Cobalto · ceramic café (concepto de NEXA)
   Identidad plana y dibujada: letra a mano, siluetas de piezas y bloques
   de color (oliva, celeste, bordó, óxido, arena y crema). Sin fotos.
   ===================================================================== */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".cb [data-reveal]");
    if (reduced()) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

export default function Cobalto() {
  const [booking, setBooking] = useState<{ from: DOMRect | null; exp?: string; origin: HTMLElement | null } | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  useReveal();
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const book = useCallback((el: HTMLElement | null, exp?: string) => {
    setBooking({ from: el?.getBoundingClientRect() ?? null, origin: el, ...(exp ? { exp } : {}) });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen]);

  return (
    <div className="cb" id="main">
      <Defs />
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={(el) => book(el)} />
      <Hero onBook={(el) => book(el)} />
      <Grid onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} · al carrito`); }} />
      <How />
      <Cafe onBook={(el) => book(el, "brunch")} />
      <Workshops onBook={(el, k) => book(el, k)} />
      <Visit onBook={(el) => book(el)} />
      <footer className="cb-foot">
        <p className="cb-logo cb-foot__logo">COBALTO</p>
        <p className="cb-caps">Hecho para tocar</p>
        <Shape k="cup" color={C.olive} className="cb-foot__cup" />
        <p className="cb-foot__note">Concepto de portfolio desarrollado por NEXA. Marca ficticia: sin reservas ni ventas reales.</p>
      </footer>
      {booking && <Booking from={booking.from} initial={booking.exp} onClose={() => setBooking(null)} back={() => booking.origin?.getBoundingClientRect() ?? null} />}
      {cartOpen && <Cart items={cart} onRemove={(i) => setCart((c) => c.filter((_, j) => j !== i))} onClose={() => setCartOpen(false)} onClear={() => setCart([])} />}
      {toast && <div className="cb-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ------------------------------ navegación ------------------------------ */
function Nav({ count, onCart, onBook }: { count: number; onCart: () => void; onBook: (el: HTMLElement) => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <header className={`cb-nav${menu ? " open" : ""}`}>
      <a href="#main" className="cb-logo cb-nav__logo">COBALTO</a>
      <nav aria-label="Principal">
        {[["#piezas", "Piezas"], ["#experiencia", "Experiencia"], ["#cafe", "Café"], ["#talleres", "Talleres"], ["#visita", "Visitanos"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <div className="cb-nav__r">
        <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito ({count})</button>
        <button type="button" className="cb-pill" onClick={(e) => onBook(e.currentTarget)}>Reservá</button>
        <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
      </div>
    </header>
  );
}

/* ------------------------------ hero: la tarjeta de la marca ------------------------------ */
function Hero({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-hero" aria-labelledby="cb-hero-t">
      <h1 id="cb-hero-t" className="cb-hero__t">
        <span className="cb-logo cb-hero__logo">COBALTO</span>
        <span className="cb-caps">Ceramic café · Hecho para tocar</span>
      </h1>
      <p className="cb-hero__sub">Pintá tu taza, tomá el café en ella y llevate algo hecho por vos.</p>
      <div className="cb-hero__cta">
        <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa</button>
        <a className="cb-link" href="#piezas">Ver piezas</a>
      </div>
      <Shape k="cup" color={C.olive} className="cb-hero__cup" />
    </section>
  );
}

/* ------------------------------ grilla 3 × 3: las piezas ------------------------------ */
function Grid({ onAdd }: { onAdd: (id: string, name: string) => void }) {
  const tiles = [...SHOP.slice(0, 4), null, ...SHOP.slice(4)];
  return (
    <section className="cb-grid" id="piezas" aria-labelledby="cb-grid-t">
      <h2 id="cb-grid-t" className="cb-sr">Piezas del estudio</h2>
      {tiles.map((p, i) =>
        p ? (
          <button key={p.id} type="button" className="cb-tile" style={{ background: p.bg, color: p.fg }} onClick={() => onAdd(p.id, p.name)} aria-label={`Agregar ${p.name}, ${money(p.price)}, al carrito`}>
            <Shape k={p.shape} color={p.fg} className="cb-tile__shape" />
            <span className="cb-tile__info"><span className="cb-logo">{p.name}</span><span className="cb-caps">{money(p.price)} · Agregar +</span></span>
          </button>
        ) : (
          <div key={i} className="cb-tile cb-tile--seal" style={{ background: C.cream }}>
            <span className="cb-seal" aria-label="Cobalto"><span>CO</span><span>BAL</span><span>TO</span></span>
          </div>
        ),
      )}
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
        <div className="cb-drawer__h"><h2 id="cb-cart-t" className="cb-logo">CARRITO</h2><button type="button" className="cb-link" onClick={onClose}>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><p className="cb-logo">GRACIAS</p><p>Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-empty">Todavía no agregaste piezas. Tocá una de la grilla.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><span className="cb-lines__img" style={{ background: s.bg }}><Shape k={s.shape} color={s.fg} /></span><p>{s.name}<br /><b>{money(s.price)}</b></p><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p><span>Total</span><b>{money(total)}</b></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ la experiencia ------------------------------ */
function How() {
  const steps = [
    { t: "Elegís", d: "Tazas, cuencos, botellas y floreros en bizcocho, listos para pintar.", k: "cup" as const },
    { t: "Pintás", d: "Te mostramos los esmaltes. El resto es tiempo para vos.", k: "bowl" as const },
    { t: "Horneamos", d: "La esmaltamos y horneamos. La retirás en siete días.", k: "vase" as const },
  ];
  return (
    <section className="cb-how" id="experiencia" aria-labelledby="cb-how-t">
      <div className="cb-how__head" data-reveal>
        <p className="cb-caps">La experiencia</p>
        <h2 id="cb-how-t" className="cb-logo cb-h2">UNA TARDE CON LAS MANOS EN EL BARRO</h2>
      </div>
      <ol className="cb-how__list">
        {steps.map((s, i) => (
          <li key={s.t} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
            <Shape k={s.k} color={C.blue} className="cb-how__shape" />
            <p className="cb-caps">0{i + 1}</p>
            <h3 className="cb-logo">{s.t.toUpperCase()}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------ café ------------------------------ */
function Cafe({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-cafe" id="cafe" aria-labelledby="cb-cafe-t">
      <div className="cb-cafe__art" aria-hidden data-reveal>
        <svg className="cb-steam" viewBox="0 0 100 60"><g fill="none" stroke={C.rust} strokeWidth="3.2" strokeLinecap="round" filter="url(#cb-rough)"><path d="M36 56 C26 44 46 36 36 22 C30 14 38 8 36 2" /><path d="M52 56 C42 42 62 34 52 18 C46 10 54 6 52 0" /><path d="M68 56 C58 44 78 36 68 22 C62 14 70 8 68 2" /></g></svg>
        <Shape k="cup" color={C.rust} className="cb-cafe__cup" />
      </div>
      <div className="cb-cafe__txt" data-reveal>
        <p className="cb-caps">Café & brunch</p>
        <h2 id="cb-cafe-t" className="cb-logo cb-h2">CADA TAZA SALIÓ DE ESTE HORNO</h2>
        <p>Café de especialidad, pan de masa madre y algo dulce del día, servido en las piezas que hacemos en el taller.</p>
        <ul className="cb-menu">
          <li><span>Flat white</span><i /><b>{money(4200)}</b></li>
          <li><span>Tostado de masa madre</span><i /><b>{money(7800)}</b></li>
          <li><span>Brunch Cobalto</span><i /><b>{money(14500)}</b></li>
        </ul>
        <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá Brunch & Paint</button>
      </div>
    </section>
  );
}

/* ------------------------------ talleres ------------------------------ */
function Workshops({ onBook }: { onBook: (el: HTMLElement, k: string) => void }) {
  return (
    <section className="cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <div className="cb-how__head" data-reveal>
        <p className="cb-caps">Talleres</p>
        <h2 id="cb-ws-t" className="cb-logo cb-h2">ELEGÍ TU PLAN</h2>
      </div>
      <ul className="cb-ws__list">
        {EXPS.map((e) => (
          <li key={e.key} data-reveal>
            <button type="button" className="cb-ws__row" onClick={(ev) => onBook(ev.currentTarget, e.key)}>
              <Shape k={e.shape} color={C.tan} className="cb-ws__shape" />
              <span className="cb-logo cb-ws__name">{e.name.toUpperCase()}</span>
              <span className="cb-ws__desc">{e.desc}</span>
              <span className="cb-caps cb-ws__when">{e.when}<br />{e.dur} · {money(e.price)}</span>
              <span className="cb-ws__go" aria-hidden>Reservar →</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------ visitanos: la tarjeta personal, da vuelta ------------------------------ */
function Visit({ onBook }: { onBook: (el: HTMLElement) => void }) {
  const [flip, setFlip] = useState(false);
  return (
    <section className="cb-visit" id="visita" aria-labelledby="cb-visit-t">
      <div className="cb-visit__txt" data-reveal>
        <p className="cb-caps">Visitanos</p>
        <h2 id="cb-visit-t" className="cb-logo cb-h2">UNA CASA VIEJA EN PALERMO</h2>
        <p>Martes a domingo, de 10 a 22 h. Vení a tomar un café aunque no pintes.</p>
        <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa</button>
      </div>
      <button type="button" className={`cb-card${flip ? " flip" : ""}`} onClick={() => setFlip((f) => !f)} aria-label={flip ? "Ver el frente de la tarjeta" : "Dar vuelta la tarjeta para ver la dirección"} data-reveal>
        <span className="cb-card__in">
          <span className="cb-card__face">
            <span className="cb-logo">COBALTO</span>
            <span className="cb-caps">Hecho para tocar</span>
            <span className="cb-card__hint">Tocá para dar vuelta</span>
          </span>
          <span className="cb-card__face cb-card__back">
            <span className="cb-card__row"><span>Gorriti 4800 · Palermo</span><span>hola@cobalto.studio</span></span>
            <span className="cb-caps">Hecho para tocar</span>
            <span className="cb-card__shapes">
              <Shape k="bottle" color={C.blue} /><Shape k="bowl" color={C.blue} /><Shape k="cup" color={C.blue} /><Shape k="vase" color={C.blue} />
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
