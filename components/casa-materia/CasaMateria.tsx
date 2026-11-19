"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Art, { Cut, Land, Scrap, Shape, type ArtKey } from "./Art";

/* Casa Materia · atelier ficticio de Buenos Aires (concepto de portfolio de NEXA).
   Las imágenes son ilustraciones vectoriales propias (Art.tsx). Precios, dirección y horarios reales
   no existen: todo lo que parece dato está marcado como ejemplo. */

const NAV = [
  ["#experiencias", "Experiencias"],
  ["#workshops", "Workshops"],
  ["#atelier", "Atelier"],
  ["#un-dia", "Un día"],
  ["#boutique", "Boutique"],
  ["#visitanos", "Visitanos"],
] as const;

type Exp = { key: string; name: string; kind: string; img: ArtKey; text: string; incl: string[]; moments: string[] };
const EXPS: Exp[] = [
  { key: "cafe", name: "Cerámica & Café", kind: "Experiencia", img: "cafe", text: "Una mañana larga alrededor de la mesa: modelás tu pieza a mano mientras pasa el café de la barra y algo dulce de la casa.", incl: ["Arcilla y herramientas", "Café de especialidad", "Horneado de tu pieza"], moments: ["11:00"] },
  { key: "vino", name: "Cerámica & Vino", kind: "Experiencia", img: "vino", text: "Cae el sol en el patio, se prenden las guirnaldas y la mesa se llena de barro, copas y conversación. Ideal para ir con amigos o en pareja.", incl: ["Arcilla y herramientas", "Copa de vino", "Picada para compartir"], moments: ["18:00", "20:00"] },
  { key: "workshop", name: "Workshop del mes", kind: "Workshop", img: "workshop", text: "Un tema distinto cada mes: azulejos pintados, pantallas de lámparas, crochet o pastas frescas. Te llevás lo que hacés.", incl: ["Materiales", "Guía paso a paso", "Algo para tomar"], moments: ["11:00", "18:00"] },
  { key: "torno", name: "Curso de torno", kind: "Atelier", img: "torno", text: "Grupos chicos y un recorrido de un mes: centrar, levantar, tornear y esmaltar tus primeras piezas.", incl: ["Encuentros semanales", "Arcilla y esmaltes", "Horneados"], moments: ["18:00"] },
];

const WORKSHOPS = [
  { a: "tiles" as ArtKey, t: "Azulejos", d: "Pintá a mano tu propio azulejo con esmaltes y motivos de la casa.", c: "#b5532f" },
  { a: "lampara" as ArtKey, t: "Pantallas de lámparas", d: "Fibras, papel y estructura: armás una pantalla que da una luz cálida.", c: "#c99a5b" },
  { a: "crochet" as ArtKey, t: "Crochet", d: "De la primera cadena a una pieza chica, con hilos de algodón natural.", c: "#5f6b45" },
  { a: "pasta" as ArtKey, t: "Pastas frescas", d: "Harina, huevos y manos en la mesa; después, a comer juntos en el patio.", c: "#8a5a3c" },
];

const DAY: { a: ArtKey; h: string; t: string; d: string }[] = [
  { a: "manana", h: "Mañana", t: "Café y barro", d: "Abre la barra, huele a café y la primera mesa ya está con las manos en la arcilla." },
  { a: "tarde", h: "Tarde", t: "Workshops y torno", d: "Llega el grupo del workshop del mes y en el atelier giran los tornos sin apuro." },
  { a: "noche", h: "Noche", t: "Vino bajo las luces", d: "Se prenden las guirnaldas del patio y la mesa se llena de copas, piezas y charla." },
];

/* ---------- piezas gráficas ---------- */
const HERO_CUTS = ["amphora", "bowls", "jug", "urn", "pitcher", "bulbs", "vase", "cup", "glass"];
const COLLAGE: { s: string; paper?: string; tex?: string; t: string; span?: boolean }[] = [
  { s: "table", paper: "wine", t: "La mesa larga", span: true },
  { s: "chair", tex: "checker", t: "Sillas" },
  { s: "pebble", paper: "brown", t: "Espejos" },
  { s: "lamp", tex: "plaster", paper: "rose", t: "Lámparas" },
  { s: "stool", tex: "wood", t: "La barra" },
  { s: "bench", paper: "navy", t: "El patio", span: true },
];
const PIECES: [string, string, string][] = [
  ["amphora", "Ánfora del patio", "Terracota natural"],
  ["pitcher", "Jarra de la barra", "Gres esmaltado"],
  ["bulbs", "Florero tres curvas", "Esmalte arena"],
  ["bowls", "Cuencos apilados", "Gres crudo"],
];
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M60 156C58 120 60 70 60 10" />
      <path d="M60 14C24 30 8 70 14 110c18-6 34-22 46-44M60 14c36 16 52 56 46 96-18-6-34-22-46-44" />
      <path d="M60 50c-12 6-22 16-30 30M60 50c12 6 22 16 30 30M60 82c-10 6-18 14-24 24M60 82c10 6 18 14 24 24" />
    </svg>
  );
}

/* ---------- reserva simulada ---------- */
const STEPS = ["Plan", "Día", "Horario", "Personas", "Datos"];
function nextDays() {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 1; out.length < 12; i++) {
    const x = new Date(d.getTime() + i * 864e5);
    if (x.getDay() !== 1) out.push(x); // ejemplo: los lunes la casa descansa
  }
  return out;
}
const seats = (d: Date, t: string, k: string) => (d.getDate() * 5 + t.charCodeAt(1) * 3 + k.length * 7) % 8; // cupos de ejemplo

function Booking({ initial, onClose }: { initial?: string; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(initial ? 1 : 0);
  const [exp, setExp] = useState(initial ?? "cafe");
  const D = useMemo(nextDays, []);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const e = EXPS.find((x) => x.key === exp)!;
  const dd = day != null ? D[day]! : null;
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("es-AR", o);
  const max = e.key === "torno" ? 4 : 8;

  const close = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    const k = (ev: KeyboardEvent) => ev.key === "Escape" && close();
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [close]);
  useEffect(() => { box.current?.querySelector<HTMLElement>(".cm-book__body button:not(:disabled), .cm-book__body input")?.focus(); }, [step, done]);

  const can = [true, day != null, !!time, people > 0, name.trim().length >= 2][step]!;
  const next = () => { if (!can) return; if (step < 4) setStep(step + 1); else setDone(true); };
  const when = dd && time ? `${fmt(dd, { weekday: "long", day: "numeric", month: "long" })} · ${time} h` : "";

  return (
    <div className="cm-book" role="dialog" aria-modal="true" aria-labelledby="cm-book-t">
      <div className="cm-book__bg" onClick={close} />
      <div ref={box} className="cm-book__card">
        <button type="button" className="cm-book__x" onClick={close} aria-label="Cerrar">✕</button>
        {!done ? (
          <>
            <p className="cm-kicker">Reservar · <span>demostración</span></p>
            <h2 id="cm-book-t">{["¿Qué te gustaría hacer?", "¿Qué día venís?", "¿En qué momento?", "¿Cuántas personas?", "Último paso"][step]}</h2>
            <ol className="cm-steps" aria-label="Pasos de la reserva">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? "on" : i < step ? "ok" : ""}>
                  <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}>{s}</button>
                </li>
              ))}
            </ol>
            <div className="cm-book__body">
              {step === 0 && (
                <div className="cm-opts">
                  {EXPS.map((x) => (
                    <button key={x.key} type="button" className={exp === x.key ? "on" : ""} aria-pressed={exp === x.key} onClick={() => { setExp(x.key); setDay(null); setTime(null); setPeople((p) => Math.min(p, x.key === "torno" ? 4 : 8)); }}>
                      <Art k={x.img} w={100} h={100} />
                      <span><small>{x.kind}</small><b>{x.name}</b></span>
                    </button>
                  ))}
                </div>
              )}
              {step === 1 && (
                <div className="cm-days">
                  {D.map((d, i) => (
                    <button key={i} type="button" className={day === i ? "on" : ""} aria-pressed={day === i} onClick={() => { setDay(i); setTime(null); }} aria-label={fmt(d, { weekday: "long", day: "numeric", month: "long" })}>
                      <small>{fmt(d, { weekday: "short" }).replace(".", "")}</small><b>{d.getDate()}</b><small>{fmt(d, { month: "short" }).replace(".", "")}</small>
                    </button>
                  ))}
                </div>
              )}
              {step === 2 && dd && (
                <div className="cm-times">
                  {e.moments.map((t) => {
                    const left = seats(dd, t, e.key);
                    return (
                      <button key={t} type="button" disabled={left === 0} className={time === t ? "on" : ""} aria-pressed={time === t} onClick={() => setTime(t)}>
                        <b>{t}</b><small>{left === 0 ? "Completo" : `${left} lugares (ejemplo)`}</small>
                      </button>
                    );
                  })}
                </div>
              )}
              {step === 3 && (
                <div className="cm-people">
                  <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Menos personas">−</button>
                  <b aria-live="polite">{people}</b>
                  <button type="button" onClick={() => setPeople((p) => Math.min(max, p + 1))} aria-label="Más personas">+</button>
                  <p>Hasta {max} personas por reserva.</p>
                </div>
              )}
              {step === 4 && (
                <div className="cm-review">
                  <dl>
                    <div><dt>Plan</dt><dd>{e.name}</dd></div>
                    <div><dt>Cuándo</dt><dd>{when}</dd></div>
                    <div><dt>Personas</dt><dd>{people}</dd></div>
                    <div><dt>Incluye</dt><dd>{e.incl.join(" · ")}</dd></div>
                  </dl>
                  <label><span>Tu nombre</span><input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="off" placeholder="Para la reserva" /></label>
                </div>
              )}
            </div>
            <div className="cm-book__f">
              {step > 0 ? <button type="button" className="cm-link" onClick={() => setStep(step - 1)}>← Volver</button> : <span />}
              <button type="button" className="cm-btn" disabled={!can} onClick={next}>{step < 4 ? "Continuar" : "Confirmar"}</button>
            </div>
          </>
        ) : (
          <div className="cm-done" role="status">
            <svg viewBox="0 0 100 100" className="cm-done__v" aria-hidden><Shape k="urn" color="currentColor" /></svg>
            <p className="cm-kicker">Reserva de demostración</p>
            <h2 id="cm-book-t">{name.trim().split(" ")[0]}, te esperamos en la casa.</h2>
            <p className="cm-done__when">{e.name} · {when} · {people} {people === 1 ? "persona" : "personas"}</p>
            <p className="cm-done__note">Esto es un concepto de NEXA: no se guardó ni se envió ningún dato. En la web real, acá se confirma el pago y la reserva entra directo en la agenda de la casa.</p>
            <button type="button" className="cm-btn" onClick={close}>Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- página ---------- */
export default function CasaMateria() {
  const [book, setBook] = useState<{ open: boolean; k?: string }>({ open: false });
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
    const open = (k?: string) => { setMenu(false); setBook(k ? { open: true, k } : { open: true }); };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && (x.target.classList.add("in"), io.unobserve(x.target))), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".cm [data-r]").forEach((n) => io.observe(n));
    return () => { window.removeEventListener("scroll", on); io.disconnect(); };
  }, []);

  return (
    <div className="cm">
      <header className={`cm-nav${scrolled ? " is-s" : ""}${menu ? " is-m" : ""}`}>
        <a href="#top" className="cm-logo" onClick={() => setMenu(false)}>Casa <i>Materia</i></a>
        <nav aria-label="Secciones">
          {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}
        </nav>
        <button type="button" className="cm-btn cm-btn--sm" onClick={() => open()}>Reservar</button>
        <button type="button" className="cm-burger" aria-expanded={menu} aria-label={menu ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenu(!menu)}><i /><i /></button>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="cm-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/casa-materia/paisaje.webp" alt="" className="cm-hero__land" fetchPriority="high" />
          <div className="cm-hero__txt">
            <p className="cm-kicker" data-r>Atelier de experiencias · Buenos Aires</p>
            <h1 data-r>Una casa para hacer <em>con las manos.</em></h1>
            <p className="cm-hero__lead" data-r>Cerámica, café, vino y workshops alrededor de un patio. Venís a crear algo, te quedás por la tarde.</p>
            <div className="cm-hero__cta" data-r>
              <button type="button" className="cm-btn cm-btn--light" onClick={() => open()}>Reservar una experiencia</button>
              <a href="#experiencias" className="cm-link">Ver experiencias →</a>
            </div>
          </div>
          <div className="cm-hero__grid" data-r>
            {HERO_CUTS.map((k, i) => <Cut key={k} s={k} seed={i + 2} className="cm-cutcard" />)}
          </div>
        </section>

        {/* MANIFIESTO */}
        <section className="cm-intro">
          <p data-r>Casa Materia es un lugar para <em>bajar el ritmo</em>: una mesa larga, arcilla fresca, una taza de café o una copa de vino, y un patio lleno de plantas en el medio de todo.</p>
          <div className="cm-collage" data-r>
            {COLLAGE.map((c, i) => (
              <figure key={i} className={c.span ? "is-wide" : undefined}>
                <Scrap s={c.s} paper={c.paper} tex={c.tex} w={c.span ? 200 : 100} h={112} seed={i + 20} size={c.span ? 96 : 74} />
                <figcaption>{c.t}</figcaption>
              </figure>
            ))}
          </div>
          <ul className="cm-intro__list" data-r>
            <li><b>Experiencias</b><span>Cerámica & Café, Cerámica & Vino</span></li>
            <li><b>Workshops</b><span>Un tema nuevo cada mes</span></li>
            <li><b>Atelier</b><span>Cursos de torno en grupos chicos</span></li>
            <li><b>Barra y boutique</b><span>Abiertas a quien pase por el patio</span></li>
          </ul>
        </section>

        {/* EXPERIENCIAS */}
        <section id="experiencias" className="cm-sec">
          <div className="cm-head" data-r>
            <p className="cm-kicker">Experiencias</p>
            <h2>Barro en la mesa, <em>algo rico en la mano.</em></h2>
          </div>
          <div className="cm-exps">
            {EXPS.slice(0, 2).map((x, i) => (
              <article key={x.key} className="cm-exp" data-r>
                <div className="cm-exp__img"><Art k={x.img} w={160} h={110} /><span className="cm-exp__t">{x.moments.map((m) => m + " h").join(" · ")}</span></div>
                <div className="cm-exp__body">
                  <p className="cm-kicker">{i === 0 ? "De mañana" : "De tarde y de noche"}</p>
                  <h3>{x.name}</h3>
                  <p>{x.text}</p>
                  <ul>{x.incl.map((n) => <li key={n}>{n}</li>)}</ul>
                  <div className="cm-exp__f">
                    <span className="cm-note">Valor a confirmar</span>
                    <button type="button" className="cm-btn" onClick={() => open(x.key)}>Reservar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WORKSHOPS */}
        <section id="workshops" className="cm-sec cm-ws">
          <div className="cm-ws__img" data-r>
            {WORKSHOPS.map((w, i) => <Art key={w.t} k={w.a} w={100} h={120} className={`cm-ws__s s${i}`} />)}
          </div>
          <div className="cm-ws__txt">
            <div className="cm-head" data-r>
              <p className="cm-kicker">Workshops</p>
              <h2>Cada mes, <em>algo nuevo</em> para aprender.</h2>
              <p className="cm-head__lead">Encuentros de una tarde con todo incluido. Venís sin saber nada y te vas con algo hecho por vos.</p>
            </div>
            <ol className="cm-wslist">
              {WORKSHOPS.map((w, i) => (
                <li key={w.t} data-r style={{ "--c": w.c } as React.CSSProperties}>
                  <span className="cm-wslist__a"><Art k={w.a} w={100} h={100} /></span>
                  <div><b>{w.t}</b><p>{w.d}</p></div>
                </li>
              ))}
            </ol>
            <button type="button" className="cm-btn" onClick={() => open("workshop")} data-r>Ver fechas del workshop</button>
          </div>
        </section>

        {/* ATELIER */}
        <section id="atelier" className="cm-atelier">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/casa-materia/torno.webp" alt="Manos levantando una pieza de barro en el torno" className="cm-atelier__bg" loading="lazy" />
          <div className="cm-atelier__card" data-r>
            <p className="cm-kicker">Atelier de cerámica</p>
            <h2>Aprendé a tornear, <em>sin apuro.</em></h2>
            <p>Cursos mensuales en grupos chicos, para que cada persona tenga su torno y su tiempo. Del centrado al esmaltado, con tus piezas saliendo del horno de la casa.</p>
            <dl>
              <div><dt>Grupos</dt><dd>Chicos</dd></div>
              <div><dt>Formato</dt><dd>Mensual</dd></div>
              <div><dt>Nivel</dt><dd>Desde cero</dd></div>
            </dl>
            <button type="button" className="cm-btn cm-btn--light" onClick={() => open("torno")}>Quiero sumarme</button>
          </div>
        </section>

        {/* UN DÍA */}
        <section id="un-dia" className="cm-sec cm-day">
          <div className="cm-head" data-r>
            <p className="cm-kicker">Un día en la casa</p>
            <h2>De la primera taza <em>a la última copa.</em></h2>
          </div>
          <ol className="cm-day__row">
            {DAY.map((d) => (
              <li key={d.h} data-r>
                <div className="cm-day__art"><Art k={d.a} /></div>
                <p className="cm-kicker">{d.h}</p>
                <b>{d.t}</b>
                <span>{d.d}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* BARRA */}
        <section className="cm-bar">
          <div className="cm-bar__txt" data-r>
            <p className="cm-kicker">La barra</p>
            <h2>Café de día. <em>Vino cuando cae el sol.</em></h2>
            <p>La barra está en el corazón del patio y abre para todos, aunque no vengas a un taller: un café de especialidad a media mañana, una copa a la tarde con las luces prendidas.</p>
          </div>
          <div className="cm-bar__imgs">
            <div className="cm-bar__a" data-r><Scrap s="jug" paper="olive" seed={41} /></div>
            <div className="cm-bar__b" data-r><Scrap s="glass" paper="brown" w={100} h={133} seed={42} /></div>
          </div>
        </section>

        {/* BOUTIQUE */}
        <section id="boutique" className="cm-sec cm-shop">
          <div className="cm-head" data-r>
            <p className="cm-kicker">Boutique</p>
            <h2>Piezas de la casa, <em>hechas acá.</em></h2>
            <p className="cm-head__lead">Tazas, cuencos, jarrones y platos que salen del mismo horno que tus piezas. Muy pronto, también para comprar online.</p>
          </div>
          <div className="cm-shop__wall" data-r>
            <Land className="cm-shop__land" tone="dusk" />
            <div className="cm-shop__row">
              {PIECES.map(([k, t, m], i) => (
                <article key={t} className="cm-piece">
                  <Cut s={k} seed={i + 30} className="cm-cutcard" />
                  <b>{t}</b><span>{m}</span>
                </article>
              ))}
            </div>
          </div>
          <p className="cm-note cm-shop__note">Piezas y nombres de ejemplo.</p>
        </section>

        {/* RESERVA */}
        <section className="cm-cta">
          <Leaf className="cm-cta__leaf" />
          <div data-r>
            <p className="cm-kicker">Reservas</p>
            <h2>Elegí un plan, un día <em>y venite.</em></h2>
            <p>Reservás en un minuto desde el celular y te llega todo confirmado.</p>
            <button type="button" className="cm-btn cm-btn--light" onClick={() => open()}>Reservar ahora</button>
          </div>
        </section>

        {/* VISITANOS */}
        <section id="visitanos" className="cm-sec cm-visit">
          <div className="cm-head" data-r>
            <p className="cm-kicker">Visitanos</p>
            <h2>La puerta <em>está abierta.</em></h2>
          </div>
          <div className="cm-visit__grid" data-r>
            <div><dt>Dónde</dt><dd>Buenos Aires<small>Dirección a confirmar</small></dd></div>
            <div><dt>Cuándo</dt><dd>De martes a domingo<small>Horarios a confirmar</small></dd></div>
            <div><dt>Contacto</dt><dd>Por WhatsApp o Instagram<small>Canales a definir</small></dd></div>
          </div>
        </section>
      </main>

      <footer className="cm-foot">
        <span className="cm-logo">Casa <i>Materia</i></span>
        <p>Concepto de sitio web creado por NEXA. Casa Materia es un atelier ficticio: las ilustraciones son propias y los datos son de ejemplo.</p>
      </footer>

      {book.open && <Booking initial={book.k} onClose={() => setBook({ open: false })} />}
    </div>
  );
}
