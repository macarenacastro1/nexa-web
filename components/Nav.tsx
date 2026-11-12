"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL, useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

/** Logo oficial de NEXA: la N dentro del cuadrado redondeado, con brillo neón. */
export const Logo = ({ glow = true }: { glow?: boolean }) => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden className={glow ? "logo-glow" : undefined}>
    <defs>
      <linearGradient id="nexa-lg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4c8dff" />
        <stop offset=".45" stopColor="#22d3ee" />
        <stop offset="1" stopColor="#2bf59c" />
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="38" height="38" rx="11" stroke="url(#nexa-lg)" strokeWidth="3.2" />
    <path d="M17 31V17l14 14V17" stroke="url(#nexa-lg)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DIVISIONS = [
  { key: "experience", path: "/experience/", name: "Experience", es: "Experiencias web y diseño digital", pt: "Experiências web e design digital" },
  { key: "systems", path: "/systems/", name: "Systems", es: "Sistemas y plataformas a medida", pt: "Sistemas e plataformas sob medida" },
  { key: "intelligence", path: "/intelligence/", name: "Intelligence", es: "Automatización e inteligencia artificial", pt: "Automação e inteligência artificial" },
] as const;

/**
 * Navegación del brief: Servicios · Proyectos · Cómo trabajamos · ES/PT · CTA.
 * En la home los enlaces van a las secciones; en las demás páginas, a la home.
 * Servicios abre el acceso a las tres páginas de división.
 */
export default function Nav({ home = false }: { home?: boolean }) {
  const { lang, setLang } = useLang();
  const L = useL();
  const href = useHref();
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);
  const base = home ? "" : href("/");
  const sec = (id: string) => `${base}#${id}`;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      ScrollTrigger.create({ start: 40, end: "max", onToggle: (s) => setScrolled(s.isActive) });
      if (home)
        ["servicios", "proyectos", "proceso"].forEach((id) =>
          ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setActive(id) }),
        );
    });
    return () => ctx.revert();
  }, [home]);

  // Primera visita desde un navegador en portugués: ofrecer la versión en portugués.
  useEffect(() => {
    try {
      if (lang === "es" && !localStorage.getItem("nexa:lang") && navigator.language?.toLowerCase().startsWith("pt") && location.pathname === "/") {
        localStorage.setItem("nexa:lang", "pt");
        location.replace("/pt/" + location.hash);
      }
    } catch {
      /* sin almacenamiento */
    }
  }, [lang]);

  // Escape cierra el menú y el desplegable.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setDrop(false);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const cta = () => track("cta_click", { cta: "nav_hablemos" });
  const close = () => setMenu(false);

  return (
    <header className={`nav${scrolled || menu ? " scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href={home ? "#caos" : href("/")} className="logo" aria-label="The Nexa Company · inicio">
          <Logo />NEXA
        </a>
        <nav className="chapters" aria-label={L("Principal", "Principal")}>
          <div className={`drop${drop ? " open" : ""}`} onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
            <a href={sec("servicios")} className={active === "servicios" ? "on" : ""} aria-haspopup="true" aria-expanded={drop}
              onFocus={() => setDrop(true)} onClick={() => setDrop(false)}>
              {L("Servicios", "Serviços")}
            </a>
            <div className="drop__panel" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrop(false); }}>
              {DIVISIONS.map((d) => (
                <a key={d.key} href={href(d.path)} onClick={() => setDrop(false)}>
                  <b>Nexa {d.name}</b>
                  <small>{L(d.es, d.pt)}</small>
                </a>
              ))}
            </div>
          </div>
          <a href={sec("proyectos")} className={active === "proyectos" ? "on" : ""}>{L("Proyectos", "Projetos")}</a>
          <a href={sec("proceso")} className={active === "proceso" ? "on" : ""}>{L("Cómo trabajamos", "Como trabalhamos")}</a>
        </nav>
        <div className="lang" role="group" aria-label={L("Idioma", "Idioma")}>
          {(["es", "pt"] as const).map((l) => (
            <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l === "es" ? "es" : "pt-BR"} title={l === "es" ? "Español" : "Português"}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a href={sec("contacto")} onClick={cta} className="btn btn--solid btn--sm nav__cta">{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")}</a>
        <button className="burger" aria-expanded={menu} aria-controls="mmenu" aria-label={menu ? L("Cerrar menú", "Fechar menu") : L("Abrir menú", "Abrir menu")} onClick={() => setMenu((m) => !m)}>
          <i /><i />
        </button>
      </div>
      <div className="nav__progress" ref={bar} />

      <div id="mmenu" className={`mmenu${menu ? " open" : ""}`} hidden={!menu}>
        <div className="container">
          <p className="mmenu__label">{L("Servicios", "Serviços")}</p>
          {DIVISIONS.map((d) => (
            <a key={d.key} href={href(d.path)} onClick={close} className="mmenu__div">
              <b>Nexa {d.name}</b>
              <small>{L(d.es, d.pt)}</small>
            </a>
          ))}
          <a href={sec("proyectos")} onClick={close}>{L("Proyectos", "Projetos")}</a>
          <a href={sec("proceso")} onClick={close}>{L("Cómo trabajamos", "Como trabalhamos")}</a>
          <a href={sec("contacto")} onClick={() => { cta(); close(); }} className="btn btn--solid">{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")}</a>
        </div>
      </div>
    </header>
  );
}
