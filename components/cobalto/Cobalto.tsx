"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Booking } from "./Booking";
import { CUTS, Cut, EXPS, SHOP, money, reduced } from "./data";

/* =====================================================================
   Cobalto · estudio de cerámica con brunch (concepto de NEXA)
   Toda la web es una hoja de papel plegado: los pliegues forman una
   cuadrícula y las piezas (PNG recortados) y los textos se ubican en
   sus cuadros. Etiquetas chicas en mayúsculas finas y espaciadas.
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
  const card = useRef<HTMLButtonElement>(null);
  useReveal();
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const openBooking = useCallback((exp?: string, from?: HTMLElement | null) => {
    const el = from ?? card.current;
    setBooking({ from: el?.getBoundingClientRect() ?? null, origin: el ?? null, ...(exp ? { exp } : {}) });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen]);

  return (
    <div className="cb" id="main">
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={() => openBooking()} />
      <Hero card={card} cardHidden={!!booking && booking.origin === card.current} onBook={() => openBooking()} />
      <Experience />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} — agregada`); }} />
      <Workshops onBook={(k, el) => openBooking(k, el)} />
      <Studio onBook={(el) => openBooking(undefined, el)} />
      <footer className="cb-foot">
        <span>Cobalto · ceramic café</span>
        <span>Concepto de portfolio desarrollado por NEXA. Marca ficticia: sin reservas ni ventas reales.</span>
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
      <a href="#main" className="cb-nav__logo">Cobalto</a>
      <nav className={menu ? "open" : ""} aria-label="Principal">
        {[["#experiencia", "Experiencia"], ["#shop", "Shop"], ["#talleres", "Talleres"], ["#estudio", "Estudio"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <button type="button" className="cb-nav__link" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito ({count})</button>
      <button type="button" className="cb-nav__link cb-nav__book" onClick={onBook}>Reservá</button>
      <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
    </header>
  );
}

/* ------------------------------ hero: la hoja plegada ------------------------------ */
function Hero({ card, cardHidden, onBook }: { card: React.RefObject<HTMLButtonElement | null>; cardHidden: boolean; onBook: () => void }) {
  return (
    <section className="cb-sheet cb-hero" aria-labelledby="cb-hero-t">
      <h1 id="cb-hero-t" className="cb-sr">Cobalto, ceramic café. A little art, a lot of fun.</h1>
      <div className="cb-hero__piece cb-hero__piece--a"><Cut img={CUTS.heroStack} eager /></div>
      <div className="cb-hero__piece cb-hero__piece--b"><Cut img={CUTS.heroVase} eager /></div>
      <div className="cb-hero__piece cb-hero__piece--c"><Cut img={CUTS.heroCup} /></div>
      <div className="cb-hero__piece cb-hero__piece--d"><Cut img={CUTS.heroPlate} /></div>
      <p className="cb-label cb-hero__l1" aria-hidden>A little art.<br />A lot of</p>
      <p className="cb-label cb-hero__l2" aria-hidden>fun.<br />Cobalto<br />ceramic café</p>
      <p className="cb-hero__sub">Pintá tu propia pieza de cerámica, disfrutá de un brunch y compartí una experiencia diferente.</p>
      <button ref={card} type="button" className="cb-card" style={{ visibility: cardHidden ? "hidden" : "visible" }} onClick={onBook}>
        <span className="cb-card__t">Reservá tu mesa</span>
        <span className="cb-card__s">Martes a domingo<br />10 — 22 h</span>
        <span className="cb-card__a" aria-hidden>→</span>
      </button>
    </section>
  );
}

/* ------------------------------ 1 · la experiencia ------------------------------ */
function Experience() {
  const steps = [
    { n: "01", t: "Elegís tu pieza", d: "Tazas, bowls, floreros y jarras en bizcocho, listos para pintar.", img: CUTS.heroCup },
    { n: "02", t: "Pintás con brunch", d: "Te mostramos las técnicas. El resto es tiempo para vos.", img: CUTS.hands },
    { n: "03", t: "La horneamos", d: "Esmaltamos y horneamos tu pieza. La retirás en siete días.", img: CUTS.kiln },
  ];
  return (
    <section className="cb-sheet cb-exp" id="experiencia" aria-labelledby="cb-exp-t">
      <h2 id="cb-exp-t" className="cb-label cb-exp__h" data-reveal>La<br />experiencia</h2>
      {steps.map((s, i) => (
        <article key={s.n} className={`cb-exp__step cb-exp__step--${i}`} data-reveal>
          <div className="cb-exp__img"><Cut img={s.img} /></div>
          <p className="cb-label"><span>{s.n}</span><br />{s.t}</p>
          <p className="cb-small">{s.d}</p>
        </article>
      ))}
    </section>
  );
}

/* ------------------------------ 2 · shop: una hoja por pieza ------------------------------ */
function Shop({ onAdd }: { onAdd: (id: string, name: string) => void }) {
  return (
    <section className="cb-shop" id="shop" aria-labelledby="cb-shop-t">
      <div className="cb-sheet cb-shop__intro">
        <h2 id="cb-shop-t" className="cb-label" data-reveal>Ceramic<br />shop</h2>
        <p className="cb-label cb-shop__r" data-reveal>Piezas hechas<br />una por una<br />en el estudio</p>
      </div>
      <ul className="cb-shop__grid">
        {SHOP.map((p) => (
          <li key={p.id} className="cb-sheet cb-sheet--item" data-reveal>
            <div className="cb-shop__img"><Cut img={p.img} /></div>
            <div className="cb-shop__meta">
              <p className="cb-label">{p.name}<br />{money(p.price)}</p>
              <button type="button" className="cb-add" onClick={() => onAdd(p.id, p.name)} aria-label={`Agregar ${p.name} al carrito`}>Agregar +</button>
            </div>
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
      <div className="cb-drawer__p cb-paper">
        <div className="cb-drawer__h"><h2 id="cb-cart-t" className="cb-label">Carrito</h2><button type="button" className="cb-label" onClick={onClose}>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><p className="cb-label">Gracias por<br />tu compra</p><p className="cb-small">Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-small">Todavía no agregaste piezas.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><div className="cb-lines__img"><Cut img={s.img} /></div><p className="cb-label">{s.name}<br />{money(s.price)}</p><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p className="cb-label"><span>Total</span><span>{money(total)}</span></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ 3 · talleres ------------------------------ */
function Workshops({ onBook }: { onBook: (k: string, el: HTMLElement) => void }) {
  return (
    <section className="cb-sheet cb-ws" id="talleres" aria-labelledby="cb-ws-t">
      <h2 id="cb-ws-t" className="cb-label cb-ws__h" data-reveal>Talleres</h2>
      {EXPS.map((e, i) => (
        <article key={e.key} className={`cb-ws__item cb-ws__item--${i}`} data-reveal>
          <p className="cb-label"><span>0{i + 1}</span><br />{e.name}</p>
          <p className="cb-small">{e.desc}</p>
          <p className="cb-label cb-ws__meta">{e.when}<br />{e.dur} · {money(e.price)}</p>
          <button type="button" className="cb-link-btn" onClick={(ev) => onBook(e.key, ev.currentTarget)}>Reservar →</button>
        </article>
      ))}
    </section>
  );
}

/* ------------------------------ 4 · el estudio ------------------------------ */
function Studio({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-sheet cb-studio" id="estudio" aria-labelledby="cb-st-t">
      <div className="cb-studio__img" data-reveal><Cut img={CUTS.studio} /></div>
      <h2 id="cb-st-t" className="cb-label cb-studio__h" data-reveal>El estudio<br />una casa vieja<br />en Palermo</h2>
      <p className="cb-label cb-studio__a" data-reveal>Gorriti 4800<br />Palermo<br />Buenos Aires</p>
      <p className="cb-label cb-studio__b" data-reveal>Martes a domingo<br />10 — 22 h<br />hola@cobalto.studio</p>
      <button type="button" className="cb-btn cb-studio__btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa</button>
    </section>
  );
}
