"use client";
import { useEffect, useState } from "react";
import Contact from "@/components/Contact";
import { track } from "@/lib/config";
import Dashboard, { BarChart, Icon } from "./Dashboard";

/* =====================================================================
   NEXA · propuesta de diseño claro (inspirada en la estructura de los
   sitios de producto: una idea por pantalla, mucho aire y el producto
   como protagonista). Contenido y testimonios reales de Nexa.
   ===================================================================== */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".v2 [data-r]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

const Head = ({ icon, kicker, title, text, align = "center", color = "teal" }: { icon: string; kicker: string; title: React.ReactNode; text?: string; align?: "center" | "left"; color?: "teal" | "blue" | "violet" }) => (
  <div className={`v2-head v2-head--${align}`} data-r>
    <p className={`v2-kick v2-kick--${color}`}><Icon n={icon} size={15} /> {kicker}</p>
    <h2>{title}</h2>
    {text && <p className="v2-lead">{text}</p>}
  </div>
);

/** variant "nx": la misma estructura con la identidad de Nexa (oscuro, turquesa/azul/verde y detalles futuristas). */
export default function CleanHome({ variant = "light" }: { variant?: "light" | "nx" }) {
  useReveal();
  return (
    <div className={`v2${variant === "nx" ? " v2--nx" : ""}`} id="main">
      <Nav />
      <Hero />
      <Stack />
      <Divisions />
      <Features />
      <Scenarios />
      <AllInOne />
      <Voices />
      <Process />
      <Cta />
      <div className="v2-contact"><Contact /></div>
      <Footer />
    </div>
  );
}

/* ------------------------------ navegación ------------------------------ */
function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`v2-nav${solid ? " solid" : ""}${open ? " open" : ""}`}>
      <div className="v2-wrap v2-nav__in">
        <a href="#main" className="v2-logo" aria-label="NEXA, inicio"><span className="v2-logo__mark">N</span>NEXA</a>
        <nav aria-label="Principal">
          {[["#servicios", "Servicios"], ["#casos", "Casos"], ["#proceso", "Cómo trabajamos"], ["/proyectos/", "Proyectos"]].map(([h, t]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        </nav>
        <a className="v2-btn v2-btn--line v2-btn--sm" href="#contacto" onClick={() => track("cta_click", { cta: "v2_nav" })}>Hablemos <Icon n="chev" size={14} /></a>
        <button type="button" className="v2-burger" aria-label="Menú" aria-expanded={open} onClick={() => setOpen((o) => !o)}><i /><i /></button>
      </div>
    </header>
  );
}

/* ------------------------------ hero ------------------------------ */
function Hero() {
  return (
    <section className="v2-hero">
      <div className="v2-grid" aria-hidden />
      <div className="v2-wrap">
        <a className="v2-badge" href="/casos/casa-materia/" data-r><b>Nuevo</b> Conocé Casa Materia, nuestra experiencia 3D <Icon n="chev" size={13} /></a>
        <h1 data-r>Tu negocio puede<br />funcionar <span className="v2-acc">mejor.</span></h1>
        <p className="v2-hero__sub" data-r>Diseñamos experiencias web, sistemas a medida y automatizaciones para que vendas más y trabajes con menos caos.</p>
        <div className="v2-hero__cta" data-r>
          <a className="v2-btn" href="#contacto" onClick={() => track("cta_click", { cta: "v2_hero" })}>Hablemos de tu proyecto <Icon n="chev" size={15} /></a>
          <a className="v2-btn v2-btn--line" href="#servicios">Ver servicios <Icon n="chev" size={15} /></a>
        </div>
        <div className="v2-hero__dash" data-r><Dashboard /></div>
      </div>
    </section>
  );
}

function Stack() {
  const items = ["Next.js", "Supabase", "Shopify", "WhatsApp Business", "Mercado Pago", "Google Analytics", "Meta Ads", "Gmail"];
  return (
    <section className="v2-stack" aria-label="Herramientas con las que trabajamos">
      <p data-r>Construimos con las herramientas que ya usa tu negocio</p>
      <div className="v2-stack__row" data-r>
        <div className="v2-stack__track">{[...items, ...items].map((t, i) => <span key={i}><i />{t}</span>)}</div>
      </div>
    </section>
  );
}

/* ------------------------------ tres especialidades ------------------------------ */
function Divisions() {
  return (
    <section className="v2-sec" id="servicios">
      <div className="v2-wrap">
        <Head icon="spark" kicker="Servicios" title={<>Diseño, sistemas y automatización<br />en un solo <span className="v2-acc">equipo</span></>} text="Tres especialidades que combinamos según lo que necesita cada negocio. Sin intermediarios y con un mismo criterio de punta a punta." />
        <div className="v2-tri">
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-mini">
                <div className="v2-mini__bar"><i /><i /><i /><span>tumarca.com</span></div>
                <div className="v2-mini__hero"><b>Hecho a mano,<br />una por una.</b><span className="v2-mini__btn">Comprar</span></div>
              </div>
              <div className="v2-chip v2-chip--float"><Icon n="globe" size={14} /> Publicada · carga rápida en celular</div>
            </div>
            <h3>Nexa Experience</h3>
            <p>Sitios web, tiendas online e interfaces que se ven bien, cargan rápido y venden.</p>
            <a href="/experience/" className="v2-more">Explorar Experience <Icon n="chev" size={14} /></a>
          </article>
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-row-card"><Icon n="box" /><div><b>Vaso térmico 240 cc</b><small>Quedan 72 u. · mínimo 90</small></div><span className="v2-pill v2-pill--warn">Reponer</span></div>
              <div className="v2-row-card v2-row-card--2"><Icon n="layers" /><div><b>Orden a Cartonera Sur</b><small>Preparada automáticamente</small></div><span className="v2-toggle on" aria-hidden><i /></span></div>
            </div>
            <h3>Nexa Systems</h3>
            <p>Sistemas de gestión, portales y paneles hechos a la medida de cómo trabaja tu equipo.</p>
            <a href="/systems/" className="v2-more">Explorar Systems <Icon n="chev" size={14} /></a>
          </article>
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-msg"><span className="v2-av" style={{ background: "#3b6fe0" }}>L</span><div><b>Laura · WhatsApp</b><p>¿Tienen 20 cajas del modelo B para el viernes?</p></div></div>
              <div className="v2-msg v2-msg--me"><div><b>Respuesta automática · 6 s</b><p>¡Sí! Te reservo 20 y te paso el total por acá.</p></div></div>
              <span className="v2-cursor" aria-hidden>Nexa</span>
            </div>
            <h3>Nexa Intelligence</h3>
            <p>Automatizaciones e IA que conectan tus herramientas y se ocupan de las tareas repetidas.</p>
            <a href="/intelligence/" className="v2-more">Explorar Intelligence <Icon n="chev" size={14} /></a>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ funciones ------------------------------ */
function Features() {
  const tools = [["W", "#25d366"], ["G", "#ea4335"], ["S", "#0f9d58"], ["MP", "#00b1ea"], ["IG", "#e1306c"]] as const;
  return (
    <section className="v2-sec v2-sec--gray">
      <div className="v2-wrap">
        <Head icon="bolt" kicker="Lo que cambia" title={<>Menos tareas repetidas,<br />más <span className="v2-acc">control</span> del negocio</>} text="Lo que construimos se nota en el día a día: información ordenada, procesos que corren solos y decisiones con datos." />
        <div className="v2-feat">
          <article className="v2-card v2-card--lg" data-r>
            <div className="v2-card__inner"><p className="v2-card__h"><Icon n="chart" /> Ventas de la semana <span><Icon n="dots" /></span></p><BarChart /></div>
            <h3>Datos para decidir</h3>
            <p>Paneles con lo importante a la vista: ventas, stock, consultas y campañas actualizados solos, sin planillas.</p>
          </article>
          <article className="v2-card" data-r>
            <div className="v2-orbit" aria-hidden>
              <i className="v2-orbit__ring" /><i className="v2-orbit__ring v2-orbit__ring--2" />
              <span className="v2-orbit__core">N</span>
              {tools.map(([t, c], i) => <span key={t} className="v2-orbit__dot" style={{ ["--a" as string]: `${i * 72}deg`, background: c }}>{t}</span>)}
            </div>
            <h3>Todo conectado</h3>
            <p>WhatsApp, Gmail, planillas, pagos y redes trabajando juntos, sin copiar y pegar.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ casos por tipo de negocio ------------------------------ */
const SCEN = [
  { k: "tiendas", tab: "Tiendas y distribuidoras", icon: "box", color: "teal", title: "Stock, pedidos y clientes en un mismo lugar", text: "El stock se descuenta con cada venta, las consultas por WhatsApp se responden solas y el pedido al proveedor se prepara antes de quedarte sin mercadería.", quote: "Página web, ecommerce y sistema de stock inteligente, ¡con un radar de posibles futuros clientes! Un éxito.", who: "Gabriel M. · Productora de café, Brasil", href: "/systems/" },
  { k: "turnos", tab: "Turnos y servicios", icon: "cal", color: "blue", title: "Una agenda que se llena y se ordena sola", text: "Los clientes reservan, cambian y pagan su turno online. Los recordatorios salen solos y los huecos se ofrecen a la lista de espera.", quote: "Mi agenda de turnos está 100% automatizada, desde agendar turnos hasta cambiarlos y pagarlos.", who: "Lucas P. · Peluquería canina, Mendoza", href: "/systems/" },
  { k: "agencias", tab: "Equipos comerciales", icon: "users", color: "violet", title: "Un radar de clientes para vender con estrategia", text: "Detectamos posibles clientes, sus puntos débiles y por dónde entrar, y ordenamos el seguimiento para que ninguna oportunidad se enfríe.", quote: "Desarrollaron un radar de posibles futuros clientes, con sus debilidades y por dónde teníamos que entrar. ¡Impecable!", who: "Franchesca A. · Agencia de marketing, CABA", href: "/intelligence/" },
  { k: "marcas", tab: "Marcas que venden online", icon: "globe", color: "teal", title: "Una web que se recuerda y que vende", text: "Diseño propio, tienda online y automatizaciones de seguimiento para que cada visita tenga más chances de convertirse en venta.", quote: "Organicé mi empresa, comparé precios de proveedores, automaticé mensajes ¡y todo el mundo me felicita por la página web!", who: "Carola G. · Productos de cuero, Córdoba", href: "/experience/" },
] as const;

function ScenArt({ k }: { k: string }) {
  if (k === "tiendas")
    return (
      <div className="v2-art-card">
        <div className="v2-donut" style={{ ["--p1" as string]: "62%", ["--p2" as string]: "84%" }}><b>1.248</b><small>Pedidos del mes</small></div>
        <ul className="v2-legend">
          <li><i style={{ background: "#0f9f8f" }} />Web<b>62%</b><span className="up">↗ +19,8%</span></li>
          <li><i style={{ background: "#3b6fe0" }} />WhatsApp<b>22%</b><span className="up">↗ +31,0%</span></li>
          <li><i style={{ background: "#e8a33d" }} />Local<b>16%</b><span className="down">↘ −6,2%</span></li>
        </ul>
      </div>
    );
  if (k === "turnos")
    return (
      <div className="v2-art-card">
        <p className="v2-card__h"><Icon n="cal" /> Martes 18 <span>8 turnos</span></p>
        <ul className="v2-slots">
          {[["10:00", "Paula D. · Baño y corte", "Confirmado", "ok"], ["11:30", "Sergio L. · Control", "Pagado", "ok"], ["13:00", "Libre → ofrecido a Marcos V.", "Lista de espera", "wait"], ["15:30", "Elena F. · Baño", "Recordatorio enviado", "info"]].map(([h, t, s, c]) => (
            <li key={h}><b>{h}</b><span>{t}</span><em className={`v2-pill v2-pill--${c}`}>{s}</em></li>
          ))}
        </ul>
      </div>
    );
  if (k === "agencias")
    return (
      <div className="v2-art-card">
        <p className="v2-card__h"><Icon n="search" /> Radar de clientes <span>32 oportunidades</span></p>
        <ul className="v2-radar">
          {[["Estudio Lumen", "Web lenta, sin tienda", 86], ["Bodega Alta", "No responde consultas", 74], ["Grupo Sur", "Campañas sin medir", 61]].map(([n, w, s]) => (
            <li key={n as string}><div><b>{n}</b><small>{w}</small></div><span className="v2-score"><i style={{ width: `${s}%` }} />{s}</span></li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="v2-art-card">
      <p className="v2-card__h"><Icon n="chart" /> Embudo de la web <span>Últimos 30 días</span></p>
      <ul className="v2-funnel">
        {[["Visitas", 100, "12.480"], ["Vieron productos", 58, "7.238"], ["Agregaron al carrito", 21, "2.620"], ["Compraron", 9, "1.123"]].map(([l, w, v]) => (
          <li key={l as string}><span>{l}</span><i style={{ width: `${w}%` }} /><b>{v}</b></li>
        ))}
      </ul>
    </div>
  );
}

function Scenarios() {
  const [k, setK] = useState<string>(SCEN[0].k);
  const s = SCEN.find((x) => x.k === k)!;
  return (
    <section className="v2-sec" id="casos">
      <div className="v2-wrap">
        <Head icon="layers" kicker="Casos" title="Pensado para cada negocio" text="Cada proyecto arranca por entender cómo trabajás. Estos son algunos de los problemas que ya resolvimos." />
        <div className="v2-tabs" role="tablist" aria-label="Tipos de negocio" data-r>
          {SCEN.map((x) => (
            <button key={x.k} type="button" role="tab" aria-selected={k === x.k} className={k === x.k ? "on" : ""} onClick={() => setK(x.k)}><Icon n={x.icon} /> {x.tab}</button>
          ))}
        </div>
        <div className="v2-scen" key={k} role="tabpanel">
          <div className="v2-scen__txt">
            <p className={`v2-kick v2-kick--${s.color}`}><Icon n={s.icon} size={15} /> {s.tab}</p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <figure className="v2-quote"><blockquote>“{s.quote}”</blockquote><figcaption>{s.who}</figcaption></figure>
            <a className="v2-btn v2-btn--line" href={s.href}>Ver cómo lo hacemos <Icon n="chev" size={14} /></a>
          </div>
          <div className="v2-scen__art"><ScenArt k={k} /></div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ todo en un lugar ------------------------------ */
function AllInOne() {
  return (
    <section className="v2-sec v2-all">
      <div className="v2-wrap">
        <div className="v2-all__head" data-r>
          <div>
            <p className="v2-kick v2-kick--teal"><Icon n="spark" size={15} /> Nexa OS</p>
            <h2>Todo lo que necesitás para crecer, en un solo <span className="v2-acc">lugar</span></h2>
            <p className="v2-lead">Ventas, clientes, agenda, finanzas y automatizaciones conectadas. Simple de usar para todo el equipo, aunque nadie sea técnico.</p>
          </div>
          <a className="v2-btn v2-btn--line" href="/systems/">Conocé los sistemas <Icon n="chev" size={14} /></a>
        </div>
        <div className="v2-all__stage" data-r><Dashboard tilt /></div>
      </div>
    </section>
  );
}

/* ------------------------------ testimonios ------------------------------ */
const VOICES = [
  { q: "Página web, ecommerce y sistema de stock inteligente, ¡con un radar de posibles futuros clientes! Un éxito.", n: "Gabriel M.", r: "Productora de café · Brasil", c: "#3b6fe0" },
  { q: "Organicé mi empresa, comparé precios de proveedores, automaticé mensajes ¡y todo el mundo me felicita por la página web! Gracias, Nexa.", n: "Carola G.", r: "Productos de cuero · Córdoba", c: "#0f9f8f" },
  { q: "Destaco la calidez del equipo: todo el proceso fue súper personalizado y acompañado. Mi agenda de turnos está 100% automatizada, desde agendar turnos hasta cambiarlos y pagarlos.", n: "Lucas P.", r: "Peluquería canina · Mendoza", c: "#e8a33d" },
  { q: "El equipo de Nexa desarrolló un radar de posibles futuros clientes, con sus debilidades y por dónde teníamos que entrar. ¡Impecable! Seguimos cerrando más y más contratos.", n: "Franchesca A.", r: "Agencia de marketing · CABA", c: "#7c5cff" },
  { q: "Ahorré tiempo y plata en el seguimiento de mis procesos. Ahora tengo un sistema completamente personalizado y modificable. Recomiendo a Nexa y a su equipo.", n: "Rafael L.", r: "Importadora · Brasil", c: "#dc6b4a" },
];
function Voices() {
  return (
    <section className="v2-sec v2-sec--gray">
      <div className="v2-wrap">
        <Head icon="users" kicker="Clientes" title="Lo que dicen quienes ya trabajan con Nexa" />
        <div className="v2-voices">
          {VOICES.map((v) => (
            <figure key={v.n} className="v2-voice" data-r>
              <blockquote>“{v.q}”</blockquote>
              <figcaption><span className="v2-av" style={{ background: v.c }}>{v.n[0]}</span><div><b>{v.n}</b><small>{v.r}</small></div></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ proceso ------------------------------ */
function Process() {
  const steps = [
    ["Conversamos", "Entendemos tu negocio, cómo trabajás hoy y qué querés lograr."],
    ["Diseñamos la solución", "Te mostramos una propuesta clara, con alcance, tiempos y presupuesto."],
    ["Construimos y probamos", "Avanzamos por etapas y ves el progreso en cada entrega."],
    ["Acompañamos", "Publicamos, capacitamos al equipo y seguimos mejorando con datos."],
  ];
  return (
    <section className="v2-sec" id="proceso">
      <div className="v2-wrap">
        <Head icon="chev" kicker="Cómo trabajamos" title="Del primer llamado a un negocio más ordenado" />
        <ol className="v2-steps">
          {steps.map(([t, d], i) => (
            <li key={t} data-r><span>0{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="v2-sec v2-sec--tight">
      <div className="v2-wrap">
        <div className="v2-cta" data-r>
          <h2>¿Hablamos de tu proyecto?</h2>
          <p>Contanos qué necesitás y te respondemos con una primera idea para tu negocio.</p>
          <a className="v2-btn v2-btn--light" href="#contacto" onClick={() => track("cta_click", { cta: "v2_final" })}>Hablemos de tu proyecto <Icon n="chev" size={15} /></a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="v2-foot">
      <div className="v2-wrap v2-foot__in">
        <a href="#main" className="v2-logo"><span className="v2-logo__mark">N</span>NEXA</a>
        <nav aria-label="Pie">
          <a href="/experience/">Experience</a><a href="/systems/">Systems</a><a href="/intelligence/">Intelligence</a><a href="/proyectos/">Proyectos</a><a href="/privacidad/">Privacidad</a>
        </nav>
        <p>© 2026 NEXA · Tecnología, diseño y transformación digital</p>
      </div>
    </footer>
  );
}
