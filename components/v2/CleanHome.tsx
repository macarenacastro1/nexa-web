"use client";
import { useEffect, useState } from "react";
import Contact from "@/components/Contact";
import { Logo, useVisitSetup } from "@/components/Nav";
import MateriaMini from "@/components/casa-materia/Mini";
import { track } from "@/lib/config";
import { useHref, useL, useLang } from "@/lib/i18n";
import Dashboard, { BarChart, Icon } from "./Dashboard";
import { BRANDS, BrandIcon, type BrandKey } from "./logos";

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
      <Work />
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
  const L = useL();
  const { lang, setLang } = useLang();
  useVisitSetup(lang);
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
        <a href="#main" className="v2-logo" aria-label={L("NEXA, inicio", "NEXA, início")}><Logo />NEXA</a>
        <nav aria-label="Principal">
          {[["#servicios", L("Servicios", "Serviços")], ["#casos", "Casos"], ["#proyectos", L("Proyectos", "Projetos")], ["#proceso", L("Cómo trabajamos", "Como trabalhamos")]].map(([h, t]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        </nav>
        <div className="v2-lang" role="group" aria-label={L("Idioma", "Idioma")}>
          {(["es", "pt"] as const).map((l) => <button key={l} type="button" className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
        </div>
        <a className="v2-btn v2-btn--line v2-btn--sm" href="#contacto" onClick={() => track("cta_click", { cta: "v2_nav" })}>{L("Hablemos", "Vamos conversar")} <Icon n="chev" size={14} /></a>
        <button type="button" className="v2-burger" aria-label={L("Menú", "Menu")} aria-expanded={open} onClick={() => setOpen((o) => !o)}><i /><i /></button>
      </div>
    </header>
  );
}

/* ------------------------------ hero ------------------------------ */
function Hero() {
  const L = useL();
  return (
    <section className="v2-hero">
      <div className="v2-grid" aria-hidden />
      <div className="v2-wrap">
        <a className="v2-badge" href="/casos/casa-materia/" data-r><b>{L("Nuevo", "Novo")}</b> {L("Conocé Casa Materia, nuestro nuevo concepto web", "Conheça a Casa Materia, nosso novo conceito de site")} <Icon n="chev" size={13} /></a>
        <h1 data-r>{L("Tu negocio puede", "Seu negócio pode")}<br />{L("funcionar", "funcionar")} <span className="v2-acc">{L("mejor.", "melhor.")}</span></h1>
        <p className="v2-hero__sub" data-r>{L("Diseñamos experiencias web, sistemas a medida y automatizaciones para que vendas más y trabajes con menos caos.", "Criamos experiências web, sistemas sob medida e automações para você vender mais e trabalhar com menos caos.")}</p>
        <div className="v2-hero__cta" data-r>
          <a className="v2-btn" href="#contacto" onClick={() => track("cta_click", { cta: "v2_hero" })}>{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")} <Icon n="chev" size={15} /></a>
          <a className="v2-btn v2-btn--line" href="#servicios">{L("Ver servicios", "Ver serviços")} <Icon n="chev" size={15} /></a>
        </div>
        <div className="v2-hero__dash" data-r><Dashboard /></div>
      </div>
    </section>
  );
}

const STACK: BrandKey[] = ["sap", "odoo", "tango", "shopify", "woo", "tiendanube", "mp", "stripe", "whatsapp", "gmail", "meta", "instagram", "sheets", "analytics", "hubspot", "supabase", "next", "openai"];
function Stack() {
  const L = useL();
  return (
    <section className="v2-stack" aria-label={L("Herramientas y sistemas con los que trabajamos", "Ferramentas e sistemas com os quais trabalhamos")}>
      <p data-r>{L("Nos conectamos con los sistemas y las herramientas que ya usa tu negocio", "Nos conectamos aos sistemas e às ferramentas que o seu negócio já usa")}</p>
      <ul className="v2-stack__groups" data-r>
        {["ERP", "E-commerce", L("Pagos", "Pagamentos"), L("Mensajería", "Mensagens"), L("Datos", "Dados"), "IA"].map((g) => <li key={g}>{g}</li>)}
      </ul>
      <div className="v2-stack__row" data-r>
        <div className="v2-stack__track">
          {[...STACK, ...STACK].map((k, i) => (
            <span key={i} aria-hidden={i >= STACK.length}><BrandIcon k={k} size={22} color="mono" />{BRANDS[k].title}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ tres especialidades ------------------------------ */
function Divisions() {
  const L = useL();
  const href = useHref();
  return (
    <section className="v2-sec" id="servicios">
      <div className="v2-wrap">
        <Head icon="spark" kicker={L("Servicios", "Serviços")} title={<>{L("Diseño, sistemas y automatización", "Design, sistemas e automação")}<br />{L("en un solo", "em uma só")} <span className="v2-acc">{L("equipo", "equipe")}</span></>} text={L("Tres especialidades que combinamos según lo que necesita cada negocio. Sin intermediarios y con un mismo criterio de punta a punta.", "Três especialidades que combinamos conforme o que cada negócio precisa. Sem intermediários e com o mesmo critério do início ao fim.")} />
        <div className="v2-tri">
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-mini">
                <div className="v2-mini__bar"><i /><i /><i /><span>{L("tumarca.com", "suamarca.com")}</span></div>
                <div className="v2-mini__hero"><b>{L("Hecho a mano,", "Feito à mão,")}<br />{L("una por una.", "uma por uma.")}</b><span className="v2-mini__btn">Comprar</span></div>
              </div>
              <div className="v2-chip v2-chip--float"><Icon n="globe" size={14} /> {L("Publicada · carga rápida en celular", "Publicado · carrega rápido no celular")}</div>
            </div>
            <h3>Nexa Experience</h3>
            <p>{L("Sitios web, tiendas online e interfaces que se ven bien, cargan rápido y venden.", "Sites, lojas online e interfaces bonitas, rápidas e que vendem.")}</p>
            <a href={href("/experience/")} className="v2-more">{L("Explorar Experience", "Explorar Experience")} <Icon n="chev" size={14} /></a>
          </article>
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-row-card"><Icon n="box" /><div><b>{L("Vaso térmico 240 cc", "Copo térmico 240 ml")}</b><small>{L("Quedan 72 u. · mínimo 90", "Restam 72 un. · mínimo 90")}</small></div><span className="v2-pill v2-pill--warn">{L("Reponer", "Repor")}</span></div>
              <div className="v2-row-card v2-row-card--2"><Icon n="layers" /><div><b>{L("Orden a Cartonera Sur", "Pedido à Cartonera Sur")}</b><small>{L("Preparada automáticamente", "Preparado automaticamente")}</small></div><span className="v2-toggle on" aria-hidden><i /></span></div>
            </div>
            <h3>Nexa Systems</h3>
            <p>{L("Sistemas de gestión, portales y paneles hechos a la medida de cómo trabaja tu equipo.", "Sistemas de gestão, portais e painéis feitos sob medida para o jeito que a sua equipe trabalha.")}</p>
            <a href={href("/systems/")} className="v2-more">{L("Explorar Systems", "Explorar Systems")} <Icon n="chev" size={14} /></a>
          </article>
          <article className="v2-tile" data-r>
            <div className="v2-tile__art">
              <div className="v2-msg"><span className="v2-av" style={{ background: "#3b6fe0" }}>L</span><div><b>Laura · WhatsApp</b><p>{L("¿Tienen 20 cajas del modelo B para el viernes?", "Vocês têm 20 caixas do modelo B para sexta?")}</p></div></div>
              <div className="v2-msg v2-msg--me"><div><b>{L("Respuesta automática · 6 s", "Resposta automática · 6 s")}</b><p>{L("¡Sí! Te reservo 20 y te paso el total por acá.", "Sim! Reservo 20 e te mando o total por aqui.")}</p></div></div>
              <span className="v2-cursor" aria-hidden>Nexa</span>
            </div>
            <h3>Nexa Intelligence</h3>
            <p>{L("Automatizaciones e IA que conectan tus herramientas y se ocupan de las tareas repetidas.", "Automações e IA que conectam suas ferramentas e cuidam das tarefas repetitivas.")}</p>
            <a href={href("/intelligence/")} className="v2-more">{L("Explorar Intelligence", "Explorar Intelligence")} <Icon n="chev" size={14} /></a>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ funciones ------------------------------ */
function Features() {
  const L = useL();
  const inner: BrandKey[] = ["whatsapp", "gmail", "sheets", "mp", "instagram"];
  const outer: BrandKey[] = ["sap", "shopify", "odoo", "hubspot", "tango", "calendar", "supabase"];
  return (
    <section className="v2-sec v2-sec--gray">
      <div className="v2-wrap">
        <Head icon="bolt" kicker={L("Lo que cambia", "O que muda")} title={<>{L("Menos tareas repetidas,", "Menos tarefas repetitivas,")}<br />{L("más", "mais")} <span className="v2-acc">{L("control", "controle")}</span> {L("del negocio", "do negócio")}</>} text={L("Lo que construimos se nota en el día a día: información ordenada, procesos que corren solos y decisiones con datos.", "O que construímos aparece no dia a dia: informação organizada, processos que rodam sozinhos e decisões com dados.")} />
        <div className="v2-feat">
          <article className="v2-card v2-card--lg" data-r>
            <div className="v2-card__inner"><p className="v2-card__h"><Icon n="chart" /> {L("Ventas de la semana", "Vendas da semana")} <span><Icon n="dots" /></span></p><BarChart /></div>
            <h3>{L("Datos para decidir", "Dados para decidir")}</h3>
            <p>{L("Paneles con lo importante a la vista: ventas, stock, consultas y campañas actualizados solos, sin planillas.", "Painéis com o que importa à vista: vendas, estoque, mensagens e campanhas atualizados sozinhos, sem planilhas.")}</p>
          </article>
          <article className="v2-card" data-r>
            <div className="v2-orbit" role="img" aria-label={L("Integraciones: WhatsApp, Gmail, Google Sheets, Mercado Pago, Instagram, SAP, Shopify, Odoo, HubSpot, Tango Gestión, Google Calendar y Supabase", "Integrações: WhatsApp, Gmail, Google Sheets, Mercado Pago, Instagram, SAP, Shopify, Odoo, HubSpot, Tango Gestión, Google Calendar e Supabase")}>
              <i className="v2-orbit__ring" /><i className="v2-orbit__ring v2-orbit__ring--2" />
              <span className="v2-orbit__core"><Logo glow={false} /></span>
              {inner.map((k, i) => <span key={k} className="v2-orbit__dot" style={{ ["--a" as string]: `${i * 72}deg`, ["--r" as string]: "86px" }} title={BRANDS[k].title}><BrandIcon k={k} size={20} /></span>)}
              {outer.map((k, i) => <span key={k} className="v2-orbit__dot v2-orbit__dot--out" style={{ ["--a" as string]: `${i * (360 / 7) + 20}deg`, ["--r" as string]: "142px" }} title={BRANDS[k].title}><BrandIcon k={k} size={18} /></span>)}
            </div>
            <h3>{L("Todo conectado", "Tudo conectado")}</h3>
            <p>{L("Tu ERP (SAP, Odoo, Tango), la tienda online, los pagos, WhatsApp, el mail y las planillas trabajando juntos, sin copiar y pegar.", "Seu ERP (SAP, Odoo, Tango), a loja online, os pagamentos, o WhatsApp, o e-mail e as planilhas trabalhando juntos, sem copiar e colar.")}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ casos por tipo de negocio ------------------------------ */
type T2 = [string, string];
const SCEN: { k: string; icon: string; color: string; tab: T2; title: T2; text: T2; quote: T2; who: T2; href: string }[] = [
  { k: "tiendas", icon: "box", color: "teal", href: "/systems/",
    tab: ["Tiendas y distribuidoras", "Lojas e distribuidoras"],
    title: ["Stock, pedidos y clientes en un mismo lugar", "Estoque, pedidos e clientes no mesmo lugar"],
    text: ["El stock se descuenta con cada venta, las consultas por WhatsApp se responden solas y el pedido al proveedor se prepara antes de quedarte sin mercadería.", "O estoque baixa a cada venda, as mensagens no WhatsApp são respondidas sozinhas e o pedido ao fornecedor fica pronto antes de faltar mercadoria."],
    quote: ["Página web, ecommerce y sistema de stock inteligente, ¡con un radar de posibles futuros clientes! Un éxito.", "Site, e-commerce e sistema de estoque inteligente, com um radar de possíveis futuros clientes! Um sucesso."],
    who: ["Gabriel M. · Productora de café, Brasil", "Gabriel M. · Produtora de café, Brasil"] },
  { k: "turnos", icon: "cal", color: "blue", href: "/systems/",
    tab: ["Turnos y servicios", "Agendamentos e serviços"],
    title: ["Una agenda que se llena y se ordena sola", "Uma agenda que se enche e se organiza sozinha"],
    text: ["Los clientes reservan, cambian y pagan su turno online. Los recordatorios salen solos y los huecos se ofrecen a la lista de espera.", "Os clientes marcam, remarcam e pagam o horário online. Os lembretes saem sozinhos e os horários vagos vão para a lista de espera."],
    quote: ["Mi agenda de turnos está 100% automatizada, desde agendar turnos hasta cambiarlos y pagarlos.", "Minha agenda está 100% automatizada, desde marcar horários até remarcar e pagar."],
    who: ["Lucas P. · Peluquería canina, Mendoza", "Lucas P. · Pet shop de banho e tosa, Mendoza"] },
  { k: "agencias", icon: "users", color: "violet", href: "/intelligence/",
    tab: ["Equipos comerciales", "Equipes comerciais"],
    title: ["Un radar de clientes para vender con estrategia", "Um radar de clientes para vender com estratégia"],
    text: ["Detectamos posibles clientes, sus puntos débiles y por dónde entrar, y ordenamos el seguimiento para que ninguna oportunidad se enfríe.", "Encontramos possíveis clientes, seus pontos fracos e por onde entrar, e organizamos o acompanhamento para nenhuma oportunidade esfriar."],
    quote: ["Desarrollaron un radar de posibles futuros clientes, con sus debilidades y por dónde teníamos que entrar. ¡Impecable!", "Desenvolveram um radar de possíveis futuros clientes, com os pontos fracos de cada um e por onde entrar. Impecável!"],
    who: ["Franchesca A. · Agencia de marketing, CABA", "Franchesca A. · Agência de marketing, Buenos Aires"] },
  { k: "marcas", icon: "globe", color: "teal", href: "/experience/",
    tab: ["Marcas que venden online", "Marcas que vendem online"],
    title: ["Una web que se recuerda y que vende", "Um site que fica na memória e vende"],
    text: ["Diseño propio, tienda online y automatizaciones de seguimiento para que cada visita tenga más chances de convertirse en venta.", "Design próprio, loja online e automações de acompanhamento para cada visita ter mais chance de virar venda."],
    quote: ["Organicé mi empresa, comparé precios de proveedores, automaticé mensajes ¡y todo el mundo me felicita por la página web!", "Organizei minha empresa, comparei preços de fornecedores, automatizei mensagens e todo mundo me elogia pelo site!"],
    who: ["Carola G. · Productos de cuero, Córdoba", "Carola G. · Produtos de couro, Córdoba"] },
];

function ScenArt({ k }: { k: string }) {
  const L = useL();
  if (k === "tiendas")
    return (
      <div className="v2-art-card">
        <div className="v2-donut" style={{ ["--p1" as string]: "62%", ["--p2" as string]: "84%" }}><b>1.248</b><small>{L("Pedidos del mes", "Pedidos do mês")}</small></div>
        <ul className="v2-legend">
          <li><i style={{ background: "#0f9f8f" }} />Web<b>62%</b><span className="up">↗ +19,8%</span></li>
          <li><i style={{ background: "#3b6fe0" }} />WhatsApp<b>22%</b><span className="up">↗ +31,0%</span></li>
          <li><i style={{ background: "#e8a33d" }} />{L("Local", "Loja física")}<b>16%</b><span className="down">↘ −6,2%</span></li>
        </ul>
      </div>
    );
  if (k === "turnos")
    return (
      <div className="v2-art-card">
        <p className="v2-card__h"><Icon n="cal" /> {L("Martes 18", "Terça 18")} <span>{L("8 turnos", "8 horários")}</span></p>
        <ul className="v2-slots">
          {[
            ["10:00", L("Paula D. · Baño y corte", "Paula D. · Banho e tosa"), L("Confirmado", "Confirmado"), "ok"],
            ["11:30", L("Sergio L. · Control", "Sergio L. · Consulta"), L("Pagado", "Pago"), "ok"],
            ["13:00", L("Libre → ofrecido a Marcos V.", "Livre → oferecido a Marcos V."), L("Lista de espera", "Lista de espera"), "wait"],
            ["15:30", L("Elena F. · Baño", "Elena F. · Banho"), L("Recordatorio enviado", "Lembrete enviado"), "info"],
          ].map(([h, t, st, c]) => (
            <li key={h}><b>{h}</b><span>{t}</span><em className={`v2-pill v2-pill--${c}`}>{st}</em></li>
          ))}
        </ul>
      </div>
    );
  if (k === "agencias")
    return (
      <div className="v2-art-card">
        <p className="v2-card__h"><Icon n="search" /> {L("Radar de clientes", "Radar de clientes")} <span>{L("32 oportunidades", "32 oportunidades")}</span></p>
        <ul className="v2-radar">
          {([["Estudio Lumen", L("Web lenta, sin tienda", "Site lento, sem loja"), 86], ["Bodega Alta", L("No responde consultas", "Não responde mensagens"), 74], ["Grupo Sur", L("Campañas sin medir", "Campanhas sem medição"), 61]] as const).map(([n, w, sc]) => (
            <li key={n}><div><b>{n}</b><small>{w}</small></div><span className="v2-score"><i style={{ width: `${sc}%` }} />{sc}</span></li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="v2-art-card">
      <p className="v2-card__h"><Icon n="chart" /> {L("Embudo de la web", "Funil do site")} <span>{L("Últimos 30 días", "Últimos 30 dias")}</span></p>
      <ul className="v2-funnel">
        {([[L("Visitas", "Visitas"), 100, "12.480"], [L("Vieron productos", "Viram produtos"), 58, "7.238"], [L("Agregaron al carrito", "Adicionaram ao carrinho"), 21, "2.620"], [L("Compraron", "Compraram"), 9, "1.123"]] as const).map(([l, w, v]) => (
          <li key={l}><span>{l}</span><i style={{ width: `${w}%` }} /><b>{v}</b></li>
        ))}
      </ul>
    </div>
  );
}

function Scenarios() {
  const L = useL();
  const href = useHref();
  const [k, setK] = useState<string>(SCEN[0]!.k);
  const s = SCEN.find((x) => x.k === k)!;
  const t = (x: T2) => L(x[0], x[1]);
  return (
    <section className="v2-sec" id="casos">
      <div className="v2-wrap">
        <Head icon="layers" kicker="Casos" title={L("Pensado para cada negocio", "Pensado para cada negócio")} text={L("Cada proyecto arranca por entender cómo trabajás. Estos son algunos de los problemas que ya resolvimos.", "Cada projeto começa entendendo como você trabalha. Estes são alguns dos problemas que já resolvemos.")} />
        <div className="v2-tabs" role="tablist" aria-label={L("Tipos de negocio", "Tipos de negócio")} data-r>
          {SCEN.map((x) => (
            <button key={x.k} type="button" role="tab" aria-selected={k === x.k} className={k === x.k ? "on" : ""} onClick={() => setK(x.k)}><Icon n={x.icon} /> {t(x.tab)}</button>
          ))}
        </div>
        <div className="v2-scen" key={k} role="tabpanel">
          <div className="v2-scen__txt">
            <p className={`v2-kick v2-kick--${s.color}`}><Icon n={s.icon} size={15} /> {t(s.tab)}</p>
            <h3>{t(s.title)}</h3>
            <p>{t(s.text)}</p>
            <figure className="v2-quote"><blockquote>“{t(s.quote)}”</blockquote><figcaption>{t(s.who)}</figcaption></figure>
            <a className="v2-btn v2-btn--line" href={href(s.href)}>{L("Ver cómo lo hacemos", "Ver como fazemos")} <Icon n="chev" size={14} /></a>
          </div>
          <div className="v2-scen__art"><ScenArt k={k} /></div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ proyectos ------------------------------ */
const WORK: { k: string; href: string; img: string; tag: T2; title: string; text: T2; chips: T2[] }[] = [
  { k: "criscuolo", href: "/casos/criscuolo/", img: "/criscuolo/recorrido-v3-poster.jpg", title: "Criscuolo Coffee",
    tag: ["Experiencia web · Café de especialidad", "Experiência web · Café especial"],
    text: ["Un recorrido narrativo del fruto a la taza: cada etapa del café es una escena y la colección aparece cuando ya sabés qué estás comprando.", "Um percurso narrativo da fruta à xícara: cada etapa do café é uma cena e a coleção aparece quando você já sabe o que está comprando."],
    chips: [["Storytelling", "Storytelling"], ["Dirección de arte", "Direção de arte"], ["Transiciones inmersivas", "Transições imersivas"]] },
  { k: "casa-materia", href: "/casos/casa-materia/", img: "", title: "Casa Materia",
    tag: ["Sitio web · Atelier de experiencias", "Site · Ateliê de experiências"],
    text: ["Cerámica, café, vino y workshops: una web de papel recortado con ilustraciones propias y reserva online paso a paso.", "Cerâmica, café, vinho e workshops: um site de papel recortado com ilustrações próprias e reserva online passo a passo."],
    chips: [["Dirección de arte", "Direção de arte"], ["Ilustración propia", "Ilustração própria"], ["Reservas", "Reservas"]] },
];
function Work() {
  const L = useL();
  const href = useHref();
  const t = (x: T2) => L(x[0], x[1]);
  return (
    <section className="v2-sec" id="proyectos">
      <div className="v2-wrap">
        <Head icon="globe" kicker={L("Proyectos", "Projetos")} title={<>{L("Lo que", "O que")} <span className="v2-acc">{L("construimos", "construímos")}</span></>} text={L("El sistema con el que trabajamos todos los días y dos conceptos web de Nexa Experience.", "O sistema que usamos todos os dias e dois conceitos de site da Nexa Experience.")} />
        <div className="v2-work">
          <a className="v2-work__card v2-work__card--os" href={href("/systems/")} data-r onClick={() => track("project_open", { project: "nexa-os", from: "home" })}>
            <div className="v2-work__img v2-work__img--os" aria-hidden><div className="v2-work__os" inert><Dashboard /></div><span className="v2-work__go">{L("Ver el sistema", "Ver o sistema")} <Icon n="arrow" size={14} /></span></div>
            <div className="v2-work__txt">
              <p className="v2-work__tag">{L("Sistema · Gestión comercial", "Sistema · Gestão comercial")}</p>
              <h3>Nexa OS</h3>
              <p>{L("El sistema con el que manejamos Nexa: radar de clientes, CRM, bandeja de entrada, publicidad, proyectos y finanzas en un solo lugar. La misma base que adaptamos para cada cliente.", "O sistema com que administramos a Nexa: radar de clientes, CRM, caixa de entrada, anúncios, projetos e finanças em um só lugar. A mesma base que adaptamos para cada cliente.")}</p>
              <ul>{[L("Radar de clientes", "Radar de clientes"), "CRM", L("Publicidad", "Anúncios"), L("Finanzas", "Finanças")].map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </a>
          {WORK.map((w) => (
            <a key={w.k} className="v2-work__card" href={w.href} data-r onClick={() => track("project_open", { project: w.k, from: "home" })}>
              <div className="v2-work__img">
                {w.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.img} alt={L(`Vista del concepto ${w.title}`, `Prévia do conceito ${w.title}`)} loading="lazy" />
                ) : (
                  <MateriaMini className="v2-work__mini" />
                )}
                <span className="v2-work__go">{L("Ver el concepto", "Ver o conceito")} <Icon n="arrow" size={14} /></span>
              </div>
              <div className="v2-work__txt">
                <p className="v2-work__tag">{t(w.tag)}</p>
                <h3>{w.title}</h3>
                <p>{t(w.text)}</p>
                <ul>{w.chips.map((c) => <li key={c[0]}>{t(c)}</li>)}</ul>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ todo en un lugar ------------------------------ */
function AllInOne() {
  const L = useL();
  const href = useHref();
  return (
    <section className="v2-sec v2-all">
      <div className="v2-wrap">
        <div className="v2-all__head" data-r>
          <div>
            <p className="v2-kick v2-kick--teal"><Icon n="spark" size={15} /> Nexa OS</p>
            <h2>{L("Todo lo que necesitás para crecer, en un solo", "Tudo o que você precisa para crescer, em um só")} <span className="v2-acc">{L("lugar", "lugar")}</span></h2>
            <p className="v2-lead">{L("Ventas, clientes, agenda, finanzas y automatizaciones conectadas. Simple de usar para todo el equipo, aunque nadie sea técnico.", "Vendas, clientes, agenda, finanças e automações conectadas. Simples para toda a equipe, mesmo sem ninguém técnico.")}</p>
          </div>
          <a className="v2-btn v2-btn--line" href={href("/systems/")}>{L("Conocé los sistemas", "Conheça os sistemas")} <Icon n="chev" size={14} /></a>
        </div>
        <div className="v2-all__stage" data-r><Dashboard tilt /></div>
      </div>
    </section>
  );
}

/* ------------------------------ testimonios ------------------------------ */
const VOICES: { q: T2; n: string; r: T2; c: string }[] = [
  { n: "Gabriel M.", c: "#3b6fe0", q: ["Página web, ecommerce y sistema de stock inteligente, ¡con un radar de posibles futuros clientes! Un éxito.", "Site, e-commerce e sistema de estoque inteligente, com um radar de possíveis futuros clientes! Um sucesso."], r: ["Productora de café · Brasil", "Produtora de café · Brasil"] },
  { n: "Carola G.", c: "#0f9f8f", q: ["Organicé mi empresa, comparé precios de proveedores, automaticé mensajes ¡y todo el mundo me felicita por la página web! Gracias, Nexa.", "Organizei minha empresa, comparei preços de fornecedores, automatizei mensagens e todo mundo me elogia pelo site! Obrigada, Nexa."], r: ["Productos de cuero · Córdoba", "Produtos de couro · Córdoba"] },
  { n: "Lucas P.", c: "#e8a33d", q: ["Destaco la calidez del equipo: todo el proceso fue súper personalizado y acompañado. Mi agenda de turnos está 100% automatizada, desde agendar turnos hasta cambiarlos y pagarlos.", "Destaco o carinho da equipe: todo o processo foi super personalizado e acompanhado. Minha agenda está 100% automatizada, desde marcar horários até remarcar e pagar."], r: ["Peluquería canina · Mendoza", "Pet shop de banho e tosa · Mendoza"] },
  { n: "Franchesca A.", c: "#7c5cff", q: ["El equipo de Nexa desarrolló un radar de posibles futuros clientes, con sus debilidades y por dónde teníamos que entrar. ¡Impecable! Seguimos cerrando más y más contratos.", "A equipe da Nexa desenvolveu um radar de possíveis futuros clientes, com os pontos fracos de cada um e por onde entrar. Impecável! Seguimos fechando cada vez mais contratos."], r: ["Agencia de marketing · CABA", "Agência de marketing · Buenos Aires"] },
  { n: "Rafael L.", c: "#dc6b4a", q: ["Ahorré tiempo y plata en el seguimiento de mis procesos. Ahora tengo un sistema completamente personalizado y modificable. Recomiendo a Nexa y a su equipo.", "Economizei tempo e dinheiro no acompanhamento dos meus processos. Agora tenho um sistema totalmente personalizado e ajustável. Recomendo a Nexa e sua equipe."], r: ["Importadora · Brasil", "Importadora · Brasil"] },
];
function Voices() {
  const L = useL();
  return (
    <section className="v2-sec v2-sec--gray">
      <div className="v2-wrap">
        <Head icon="users" kicker={L("Clientes", "Clientes")} title={L("Lo que dicen quienes ya trabajan con Nexa", "O que dizem os clientes da Nexa")} />
        <div className="v2-voices">
          {VOICES.map((v) => (
            <figure key={v.n} className="v2-voice" data-r>
              <blockquote>“{L(v.q[0], v.q[1])}”</blockquote>
              <figcaption><span className="v2-av" style={{ background: v.c }}>{v.n[0]}</span><div><b>{v.n}</b><small>{L(v.r[0], v.r[1])}</small></div></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ proceso ------------------------------ */
function Process() {
  const L = useL();
  const steps: [string, string][] = [
    [L("Conversamos", "Conversamos"), L("Entendemos tu negocio, cómo trabajás hoy y qué querés lograr.", "Entendemos o seu negócio, como você trabalha hoje e o que quer alcançar.")],
    [L("Diseñamos la solución", "Desenhamos a solução"), L("Te mostramos una propuesta clara, con alcance, tiempos y presupuesto.", "Mostramos uma proposta clara, com escopo, prazos e orçamento.")],
    [L("Construimos y probamos", "Construímos e testamos"), L("Avanzamos por etapas y ves el progreso en cada entrega.", "Avançamos por etapas e você acompanha o progresso a cada entrega.")],
    [L("Acompañamos", "Acompanhamos"), L("Publicamos, capacitamos al equipo y seguimos mejorando con datos.", "Publicamos, treinamos a equipe e seguimos melhorando com dados.")],
  ];
  return (
    <section className="v2-sec" id="proceso">
      <div className="v2-wrap">
        <Head icon="chev" kicker={L("Cómo trabajamos", "Como trabalhamos")} title={L("Del primer llamado a un negocio más ordenado", "Da primeira conversa a um negócio mais organizado")} />
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
  const L = useL();
  return (
    <section className="v2-sec v2-sec--tight">
      <div className="v2-wrap">
        <div className="v2-cta" data-r>
          <h2>{L("¿Hablamos de tu proyecto?", "Vamos falar do seu projeto?")}</h2>
          <p>{L("Contanos qué necesitás y te respondemos con una primera idea para tu negocio.", "Conte o que você precisa e respondemos com uma primeira ideia para o seu negócio.")}</p>
          <a className="v2-btn v2-btn--light" href="#contacto" onClick={() => track("cta_click", { cta: "home_final" })}>{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")} <Icon n="chev" size={15} /></a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const L = useL();
  const href = useHref();
  return (
    <footer className="v2-foot">
      <div className="v2-wrap v2-foot__in">
        <a href="#main" className="v2-logo"><Logo />NEXA</a>
        <nav aria-label={L("Pie", "Rodapé")}>
          <a href={href("/experience/")}>Experience</a><a href={href("/systems/")}>Systems</a><a href={href("/intelligence/")}>Intelligence</a><a href={href("/proyectos/")}>{L("Proyectos", "Projetos")}</a><a href={href("/privacidad/")}>{L("Privacidad", "Privacidade")}</a>
        </nav>
        <p>© 2026 NEXA · {L("Tecnología, diseño y transformación digital", "Tecnologia, design e transformação digital")}</p>
      </div>
    </footer>
  );
}
