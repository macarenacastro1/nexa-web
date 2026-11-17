"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Booking } from "./Booking";
import { CUTS, Cut, EXPS, Jug, SHOP, money, reduced } from "./data";

/* =====================================================================
   Cobalto · estudio de cerámica con brunch (concepto de NEXA)
   Collage editorial: tarjetas de papel crema rotadas sobre fondo
   oscuro, piezas reales recortadas (PNG) flotando alrededor, una
   letra muy condensada y un sello de jarra dibujado a mano.
   ===================================================================== */

/** Las piezas recortadas se mueven apenas con el mouse (profundidad). */
function useParallax() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
        el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
      });
    };
    el.addEventListener("pointermove", on);
    return () => { el.removeEventListener("pointermove", on); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".cb [data-reveal]");
    if (reduced()) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

export default function Cobalto() {
  const [booking, setBooking] = useState<{ from: DOMRect | null; exp?: string; origin: HTMLElement | null } | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ticket = useRef<HTMLButtonElement>(null);
  useReveal();
  const say = useCallback((t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? null : x)), 2400); }, []);
  const openBooking = useCallback((exp?: string, from?: HTMLElement | null) => {
    const el = from ?? ticket.current;
    setBooking({ from: el?.getBoundingClientRect() ?? null, origin: el ?? null, ...(exp ? { exp } : {}) });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cb-lock", !!booking || cartOpen);
    return () => document.documentElement.classList.remove("cb-lock");
  }, [booking, cartOpen]);

  return (
    <div className="cb" id="main">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <filter id="cb-hand"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="5" /></filter>
      </svg>
      <Nav count={cart.length} onCart={() => setCartOpen(true)} onBook={() => openBooking()} />
      <Hero ticket={ticket} ticketHidden={!!booking && booking.origin === ticket.current} onBook={() => openBooking()} />
      <Manifesto />
      <Experience />
      <Workshops onBook={(k, el) => openBooking(k, el)} />
      <Shop onAdd={(id, name) => { setCart((c) => [...c, id]); say(`${name} · agregada`); }} />
      <Studio onBook={(el) => openBooking(undefined, el)} />
      <footer className="cb-foot">
        <span className="cb-word cb-foot__w">Cobalto</span>
        <span>Concepto de portfolio desarrollado por NEXA · marca ficticia, sin reservas ni ventas reales.</span>
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
      <a href="#main" className="cb-nav__logo" aria-label="Cobalto, inicio"><Jug className="cb-nav__jug" /><span className="cb-word">Cobalto</span></a>
      <nav className={menu ? "open" : ""} aria-label="Principal">
        {[["#experiencia", "Experiencia"], ["#talleres", "Talleres"], ["#shop", "Shop"], ["#estudio", "Estudio"]].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </nav>
      <button type="button" className="cb-nav__cart" onClick={onCart} aria-label={`Carrito: ${count} piezas`}>Carrito · {count}</button>
      <button type="button" className="cb-btn cb-btn--sm" onClick={onBook}>Reservá</button>
      <button type="button" className="cb-burger" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><i /><i /></button>
    </header>
  );
}

/* ------------------------------ hero: el collage ------------------------------ */
function Hero({ ticket, ticketHidden, onBook }: { ticket: React.RefObject<HTMLButtonElement | null>; ticketHidden: boolean; onBook: () => void }) {
  const ref = useParallax();
  return (
    <section ref={ref} className="cb-hero" aria-labelledby="cb-hero-t">
      {/* piezas reales recortadas, a distintas profundidades */}
      <div className="cb-float cb-float--stack" style={{ ["--d" as string]: 26 }}><Cut img={CUTS.heroStack} eager /></div>
      <div className="cb-float cb-float--vase" style={{ ["--d" as string]: 40 }}><Cut img={CUTS.heroVase} eager /></div>
      <div className="cb-float cb-float--plate" style={{ ["--d" as string]: 18 }}><Cut img={CUTS.heroPlate} /></div>
      <div className="cb-float cb-float--cup" style={{ ["--d" as string]: 32 }}><Cut img={CUTS.heroCup} /></div>

      <div className="cb-paper cb-paper--name" style={{ ["--d" as string]: 8 }}>
        <h1 id="cb-hero-t" className="cb-word cb-word--xl">Cobalto</h1>
        <p className="cb-tag">Ceramic café · Palermo</p>
      </div>

      <div className="cb-paper cb-paper--text" style={{ ["--d" as string]: 12 }}>
        <Jug className="cb-paper__jug" />
        <div>
          <p className="cb-hero__lead">A little art.<br />A lot of fun.</p>
          <p className="cb-just">Pintá tu propia pieza de cerámica, disfrutá de un brunch y compartí una experiencia diferente.</p>
        </div>
      </div>

      {/* la entrada: se transforma en el calendario de reservas */}
      <button ref={ticket} type="button" className="cb-ticket" style={{ visibility: ticketHidden ? "hidden" : "visible", ["--d" as string]: 16 }} onClick={onBook}>
        <span className="cb-ticket__k">Admite · 1 mesa</span>
        <span className="cb-ticket__t">Reservá tu mesa</span>
        <span className="cb-ticket__s">Martes a domingo · 10 a 22 h</span>
      </button>
    </section>
  );
}

/* ------------------------------ manifiesto (como un afiche) ------------------------------ */
function Manifesto() {
  return (
    <section className="cb-mani" aria-label="Cobalto en una frase">
      <div className="cb-mani__card" data-reveal>
        <p className="cb-word cb-word--brush">Barro</p>
        <p className="cb-mani__line">Café por la mañana. Pintura por la tarde. Vino por la noche.</p>
      </div>
    </section>
  );
}

/* ------------------------------ 1 · la experiencia ------------------------------ */
function Experience() {
  const steps = [
    { n: "01", t: "Elegís tu pieza", d: "Tazas, bowls, floreros y jarras en bizcocho, listos para pintar.", img: CUTS.heroCup },
    { n: "02", t: "Pintás con brunch", d: "Te mostramos las técnicas y el resto es tiempo para vos.", img: CUTS.hands },
    { n: "03", t: "La horneamos", d: "Esmaltamos y horneamos tu pieza. La retirás en siete días.", img: CUTS.kiln },
  ];
  return (
    <section className="cb-sec cb-exp" id="experiencia" aria-labelledby="cb-exp-t">
      <div className="cb-wrap">
        <header className="cb-head" data-reveal>
          <p className="cb-tag">La experiencia</p>
          <h2 id="cb-exp-t" className="cb-word cb-word--lg">Manos a la obra</h2>
        </header>
        <ol className="cb-exp__list">
          {steps.map((s, i) => (
            <li key={s.n} data-reveal style={{ transitionDelay: `${i * 0.12}s`, ["--r" as string]: `${[-2.5, 1.8, -1.2][i]}deg` }}>
              <div className="cb-exp__img"><Cut img={s.img} /></div>
              <div className="cb-exp__card">
                <span>{s.n}</span>
                <b>{s.t}</b>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
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
        <header className="cb-head" data-reveal>
          <p className="cb-tag">Talleres</p>
          <h2 id="cb-ws-t" className="cb-word cb-word--lg">Tres formas de ensuciarse</h2>
        </header>
        <ul className="cb-ws__list">
          {EXPS.map((e, i) => (
            <li key={e.key} data-reveal style={{ transitionDelay: `${i * 0.1}s`, ["--r" as string]: `${[1.5, -1.8, 1.1][i]}deg` }} className={`cb-ws__card cb-ws__card--${i}`}>
              <span className="cb-ws__n">0{i + 1}</span>
              <b className="cb-word">{e.name}</b>
              <p className="cb-just">{e.desc}</p>
              <dl><div><dt>Cuándo</dt><dd>{e.when}</dd></div><div><dt>Duración</dt><dd>{e.dur}</dd></div></dl>
              <div className="cb-ws__f"><b>{money(e.price)}</b><button type="button" className="cb-btn cb-btn--sm" onClick={(ev) => onBook(e.key, ev.currentTarget)}>Reservar</button></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ 3 · shop ------------------------------ */
function Shop({ onAdd }: { onAdd: (id: string, name: string) => void }) {
  return (
    <section className="cb-sec cb-shop" id="shop" aria-labelledby="cb-shop-t">
      <div className="cb-wrap">
        <header className="cb-head cb-head--split" data-reveal>
          <div><p className="cb-tag">Ceramic shop</p><h2 id="cb-shop-t" className="cb-word cb-word--lg">Piezas terminadas</h2></div>
          <p className="cb-just">Hechas en el estudio, una por una, con las imperfecciones naturales del barro y el esmalte. Envíos a todo el país.</p>
        </header>
        <ul className="cb-shop__grid">
          {SHOP.map((p, i) => (
            <li key={p.id} data-reveal style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
              <div className="cb-shop__img"><Cut img={p.img} /></div>
              <div className="cb-shop__row">
                <span><b>{p.name}</b><small>{money(p.price)}</small></span>
                <button type="button" className="cb-add" onClick={() => onAdd(p.id, p.name)} aria-label={`Agregar ${p.name} al carrito`}>+</button>
              </div>
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
        <div className="cb-drawer__h"><h2 id="cb-cart-t" className="cb-word">Carrito</h2><button type="button" onClick={onClose}>Cerrar ✕</button></div>
        {paid ? (
          <div className="cb-paid"><Jug className="cb-paid__jug" /><b>Gracias por tu compra.</b><p>Concepto: en la web real acá se conecta el pago online y te llega el seguimiento del envío.</p><button type="button" className="cb-btn" onClick={() => { onClear(); onClose(); }}>Seguir mirando</button></div>
        ) : list.length === 0 ? <p className="cb-muted">Todavía no agregaste piezas.</p> : (
          <>
            <ul className="cb-lines">{list.map((s, i) => <li key={i}><div className="cb-lines__img"><Cut img={s.img} /></div><span><b>{s.name}</b><small>{money(s.price)}</small></span><button type="button" className="cb-link" onClick={() => onRemove(i)}>Quitar</button></li>)}</ul>
            <div className="cb-drawer__f"><p><span>Total</span><b>{money(total)}</b></p><button type="button" className="cb-btn cb-btn--block" onClick={() => setPaid(true)}>Ir a pagar</button></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ 4 · el estudio (tarjeta de visita) ------------------------------ */
function Studio({ onBook }: { onBook: (el: HTMLElement) => void }) {
  return (
    <section className="cb-sec cb-studio" id="estudio" aria-labelledby="cb-st-t">
      <div className="cb-wrap cb-studio__in">
        <div className="cb-studio__img" data-reveal><Cut img={CUTS.studio} /></div>
        <div className="cb-studio__cards">
          <div className="cb-studio__top" data-reveal><h2 id="cb-st-t" className="cb-word cb-word--brush">Cobalto</h2><p>Ceramic café en una casa vieja de Palermo.</p></div>
          <div className="cb-studio__card" data-reveal>
            <Jug className="cb-studio__jug" />
            <address>
              <span>Gorriti 4800, Palermo<br />Buenos Aires</span>
              <span>Martes a domingo<br />10 a 22 h</span>
              <span>hola@cobalto.studio<br />@cobalto.ceramica</span>
            </address>
            <i className="cb-studio__star" aria-hidden>✦</i>
          </div>
          <button type="button" className="cb-btn" onClick={(e) => onBook(e.currentTarget)}>Reservá tu mesa</button>
        </div>
      </div>
    </section>
  );
}
