"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Booking } from "./Booking";
import { EXPS, IMG, Pic, SHOP, VESSELS, Wordmark, money, reduced, type Exp } from "./data";

/* =====================================================================
   Cobalto · ceramic café (concepto de NEXA)
   Sitio moderno y limpio: papel cálido, tinta espresso y las piezas
   recortadas como protagonistas. Todo se puede tocar.
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
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={(el) => book(el)} />
      <Hero onBook={(el) => book(el)} />
      <Marquee />
      <How />
      <Cafe onBook={(el) => book(el, "brunch")} />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} · agregada al carrito`); }} />
      <Workshops onBook={(el, k) => book(el, k)} />
      <Handmade />
      <Visit onBook={(el) => book(el)} />
      <footer className="cb-foot">
        <Wordmark className="cb-foot__wm" />
        <div className="cb-foot__cols">
          <p>Gorriti 4800, Palermo<br />Buenos Aires</p>
          <p>Martes a domingo<br />10 — 22 h</p>
          <p><a href="#main">Instagram</a><br /><a href="#main">hola@cobalto.studio</a></p>
        </div>
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
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 40);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`cb-nav${solid ? " solid" : ""}${menu ? " open" : ""}`}>
      <a href="#main" className="cb-nav__logo" aria-label="Cobalto, inicio"><Wordmark /></a>
      <nav aria-label="Principal">
        {[["#experiencia", "Experiencia"], ["#cafe", "Café"], ["#shop", "Shop"], ["#talleres", "Talleres"], ["#visita", "Visitanos"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <div className="cb-nav__r">
        <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito <span>{count}</span></button>
        <button type="button" className="cb-pill" onClick={(e) => onBook(e.currentTarget)}>Reservá</button>
        <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
      </div>
    </header>
  );
}

/* ------------------------------ hero ------------------------------ */
const HERO = [IMG.marmol, IMG.circulos, IMG.tallada, IMG.primitiva];
function Hero({ onBook }: { onBook: (el: HTMLElement) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  // las piezas siguen apenas al puntero, cada una a su profundidad
  useEffect(() => {
    const el = stage.current;
    if (!el || reduced() || !window.matchMedia("(hover: hover)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--mx", x.toFixed(3));
        el.style.setProperty("--my", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", move);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="cb-hero" aria-labelledby="cb-hero-t">
      <div className="cb-hero__top">
        <p className="cb-eyebrow">Ceramic café · Palermo, Buenos Aires</p>
        <h1 id="cb-hero-t" className="cb-hero__h">Pintá tu taza.<br /><em>Tomá el café en ella.</em></h1>
        <div className="cb-hero__cta">
          <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa <span aria-hidden>→</span></button>
          <a className="cb-link" href="#shop">Ver piezas del estudio</a>
        </div>
      </div>
      <div className="cb-hero__stage" ref={stage}>
        {HERO.map((img, i) => (
          <figure key={img.src} className={`cb-hero__p cb-hero__p--${i}`} style={{ ["--d" as string]: String([1.4, 0.8, 1.1, 1.7][i]) }}>
            <Pic img={img} eager />
          </figure>
        ))}
        <p className="cb-hero__shelf" aria-hidden><span>Serie otoño · 2026</span><span>Tocá una pieza</span></p>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Brunch & Paint", "Café de especialidad", "Torno", "Wine & Clay", "Piezas únicas", "Hecho en Palermo"];
  return (
    <div className="cb-marquee" aria-hidden>
      <div className="cb-marquee__t">{[...items, ...items, ...items].map((t, i) => <span key={i}>{t}<i>✺</i></span>)}</div>
    </div>
  );
}

/* ------------------------------ cómo funciona ------------------------------ */
function How() {
  const steps = [
    { n: "01", t: "Elegís tu pieza", d: "Tazas, vasos, bowls y floreros en bizcocho, listos para pintar.", img: IMG.circulos },
    { n: "02", t: "Pintás sin apuro", d: "Te mostramos las técnicas y los esmaltes. El resto es tiempo para vos.", img: IMG.marmol },
    { n: "03", t: "La horneamos", d: "Esmaltamos y horneamos a 1240 °C. La retirás en siete días.", img: IMG.tallada },
  ];
  return (
    <section className="cb-sec cb-how" id="experiencia" aria-labelledby="cb-how-t">
      <div className="cb-head" data-reveal>
        <p className="cb-eyebrow">La experiencia</p>
        <h2 id="cb-how-t" className="cb-h2">Una tarde con las manos<br />en el barro.</h2>
      </div>
      <ol className="cb-how__list">
        {steps.map((s) => (
          <li key={s.n} className="cb-how__item" data-reveal>
            <span className="cb-how__n">{s.n}</span>
            <div className="cb-how__img"><Pic img={s.img} /></div>
            <h3>{s.t}</h3>
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
    <section className="cb-sec cb-cafe" id="cafe" aria-labelledby="cb-cafe-t">
      <div className="cb-cafe__img" data-reveal><Pic img={IMG.cafe} /></div>
      <div className="cb-cafe__txt" data-reveal>
        <p className="cb-eyebrow">Café & brunch</p>
        <h2 id="cb-cafe-t" className="cb-h2">Cada taza del café<br />salió de este horno.</h2>
        <p className="cb-lead">Café de especialidad tostado en Buenos Aires, pan de masa madre y algo dulce del día. Lo servimos en las mismas piezas que hacemos en el taller: ninguna es igual a otra.</p>
        <ul className="cb-menu">
          <li><span>Flat white</span><i /><b>{money(4200)}</b></li>
          <li><span>Tostado de masa madre</span><i /><b>{money(7800)}</b></li>
          <li><span>Brunch Cobalto</span><i /><b>{money(14500)}</b></li>
        </ul>
        <button type="button" className="cb-btn cb-btn--line" onClick={(e) => onBook(e.currentTarget)}>Reservá Brunch & Paint <span aria-hidden>→</span></button>
      </div>
    </section>
  );
}

/* ------------------------------ shop ------------------------------ */
function Shop({ onAdd }: { onAdd: (id: string, name: string) => void }) {
  return (
    <section className="cb-sec cb-shop" id="shop" aria-labelledby="cb-shop-t">
      <div className="cb-head cb-head--row" data-reveal>
        <div>
          <p className="cb-eyebrow">Shop</p>
          <h2 id="cb-shop-t" className="cb-h2">Piezas hechas<br />una por una.</h2>
        </div>
        <p className="cb-lead">Series cortas que salen del taller cada mes. Envíos a todo el país o retiro en el estudio.</p>
      </div>
      <ul className="cb-shop__grid">
        {SHOP.map((p) => (
          <li key={p.id} className="cb-prod" data-reveal style={{ ["--tint" as string]: p.tint }}>
            <div className="cb-prod__img"><Pic img={p.img} /></div>
            <div className="cb-prod__meta">
              <div><h3>{p.name}</h3><p>{p.note}</p></div>
              <b>{money(p.price)}</b>
            </div>
            <button type="button" className="cb-prod__add" onClick={() => onAdd(p.id, p.name)} aria-label={`Agregar ${p.name} al carrito`}><span aria-hidden>+</span> Agregar</button>
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
        <div className="cb-drawer__h"><h2 id="cb-cart-t">Carrito</h2><button type="button" className="cb-link" onClick={onClose}>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><h3>Gracias por tu compra.</h3><p>Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-empty">Todavía no agregaste piezas.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><div className="cb-lines__img" style={{ background: s.tint }}><Pic img={s.img} /></div><p>{s.name}<br /><b>{money(s.price)}</b></p><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p><span>Total</span><b>{money(total)}</b></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ talleres: la pieza sigue al cursor ------------------------------ */
function Workshops({ onBook }: { onBook: (el: HTMLElement, k: string) => void }) {
  const [hov, setHov] = useState<Exp | null>(null);
  const float = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = float.current;
    if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  };
  return (
    <section className="cb-sec cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <div className="cb-head" data-reveal>
        <p className="cb-eyebrow">Talleres</p>
        <h2 id="cb-ws-t" className="cb-h2">Elegí tu plan.</h2>
      </div>
      <ul className="cb-ws__list" onPointerMove={move} onPointerLeave={() => setHov(null)}>
        {EXPS.map((e, i) => (
          <li key={e.key} data-reveal>
            <button type="button" className="cb-ws__row" onPointerEnter={() => setHov(e)} onFocus={() => setHov(e)} onBlur={() => setHov(null)} onClick={(ev) => onBook(ev.currentTarget, e.key)}>
              <span className="cb-ws__n">0{i + 1}</span>
              <span className="cb-ws__name">{e.name}</span>
              <span className="cb-ws__desc">{e.desc}</span>
              <span className="cb-ws__when">{e.when}<br />{e.dur}</span>
              <span className="cb-ws__price">{money(e.price)}</span>
              <span className="cb-ws__go" aria-hidden>Reservar →</span>
            </button>
          </li>
        ))}
      </ul>
      <div ref={float} className={`cb-ws__float${hov ? " on" : ""}`} aria-hidden>
        {EXPS.map((e) => <Pic key={e.key} img={e.img} className={hov?.key === e.key ? "on" : ""} />)}
      </div>
    </section>
  );
}

/* ------------------------------ hecho a mano ------------------------------ */
function Handmade() {
  return (
    <section className="cb-hand" aria-labelledby="cb-hand-t">
      <h2 id="cb-hand-t" className="cb-hand__h" data-reveal>Hecho a mano,<br /><em>una por una.</em></h2>
      <div className="cb-hand__row" aria-hidden>
        {VESSELS.map((d, i) => (
          <svg key={i} viewBox="0 0 60 92" style={{ ["--i" as string]: String(i) }}><path d={d} /></svg>
        ))}
      </div>
      <dl className="cb-hand__stats">
        <div><dt>Piezas por mes</dt><dd>320</dd></div>
        <div><dt>Temperatura del horno</dt><dd>1240 °C</dd></div>
        <div><dt>Días hasta retirarla</dt><dd>7</dd></div>
      </dl>
    </section>
  );
}

/* ------------------------------ visita ------------------------------ */
function Visit({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-sec cb-visit" id="visita" aria-labelledby="cb-visit-t">
      <div data-reveal>
        <p className="cb-eyebrow">Visitanos</p>
        <h2 id="cb-visit-t" className="cb-h2">Una casa vieja<br />en Palermo.</h2>
        <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa <span aria-hidden>→</span></button>
      </div>
      <dl className="cb-visit__info" data-reveal>
        <div><dt>Dirección</dt><dd>Gorriti 4800<br />Palermo, Buenos Aires</dd></div>
        <div><dt>Horarios</dt><dd>Martes a domingo<br />10 — 22 h</dd></div>
        <div><dt>Contacto</dt><dd>hola@cobalto.studio<br />+54 11 0000 0000</dd></div>
      </dl>
      <div className="cb-visit__pic" data-reveal><Pic img={IMG.primitiva} /></div>
    </section>
  );
}
