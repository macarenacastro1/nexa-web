"use client";
import { useEffect, useRef, useState } from "react";
import { useL } from "@/lib/i18n";

/**
 * Testimonios reales de clientes (pasados por la owner el 16/11/2026).
 * Si se vuelve a poner un texto de ejemplo, marcar PLACEHOLDER = true:
 * la sección lo avisa en pantalla.
 */
export const PLACEHOLDER = false;
const DUR = 7000;

type T = { q: string; n: string; r: string; tag: "Experience" | "Systems" | "Intelligence"; c: string };

export default function Testimonials() {
  const L = useL();
  const items: T[] = L(
    [
      { q: "Página web, ecommerce y sistema de stock inteligente, ¡con un radar de posibles futuros clientes! Un éxito.", n: "Gabriel M.", r: "Productora de café · Brasil", tag: "Systems", c: "#4c8dff" },
      { q: "Organicé mi empresa, comparé precios de proveedores, automaticé mensajes ¡y todo el mundo me felicita por la página web! Gracias, Nexa.", n: "Carola G.", r: "Empresa de productos de cuero · Córdoba", tag: "Intelligence", c: "#2de2d0" },
      { q: "Destaco la calidez del equipo: todo el proceso fue súper personalizado y acompañado. Mi agenda de turnos está 100% automatizada, desde agendar turnos hasta cambiarlos y pagarlos. ¡Muchas gracias al Nexa team! 🚀🚀", n: "Lucas P.", r: "Peluquería canina · Mendoza", tag: "Systems", c: "#4c8dff" },
      { q: "El equipo de Nexa se encargó de desarrollar un radar de posibles futuros clientes, con sus debilidades y por dónde teníamos que entrar. ¡Impecable! Seguimos cerrando más y más contratos. Muchas gracias.", n: "Franchesca A.", r: "Agencia de marketing · CABA", tag: "Intelligence", c: "#2de2d0" },
      { q: "Ahorré tiempo y plata en el seguimiento de mis procesos. Ahora tengo un sistema completamente personalizado y modificable. Recomiendo a Nexa y a su equipo. Gracias.", n: "Rafael L.", r: "Importadora · Brasil", tag: "Systems", c: "#4c8dff" },
    ],
    [
      { q: "Site, e-commerce e sistema de estoque inteligente, com um radar de possíveis futuros clientes! Um sucesso.", n: "Gabriel M.", r: "Produtora de café · Brasil", tag: "Systems", c: "#4c8dff" },
      { q: "Organizei minha empresa, comparei preços de fornecedores, automatizei mensagens e todo mundo me elogia pelo site! Obrigada, Nexa.", n: "Carola G.", r: "Empresa de produtos de couro · Córdoba", tag: "Intelligence", c: "#2de2d0" },
      { q: "Destaco o carinho da equipe: todo o processo foi super personalizado e acompanhado. Minha agenda está 100% automatizada, desde marcar horários até remarcar e pagar. Muito obrigado ao Nexa team! 🚀🚀", n: "Lucas P.", r: "Pet shop de banho e tosa · Mendoza", tag: "Systems", c: "#4c8dff" },
      { q: "A equipe da Nexa desenvolveu um radar de possíveis futuros clientes, com os pontos fracos de cada um e por onde entrar. Impecável! Seguimos fechando cada vez mais contratos. Muito obrigada.", n: "Franchesca A.", r: "Agência de marketing · Buenos Aires", tag: "Intelligence", c: "#2de2d0" },
      { q: "Economizei tempo e dinheiro no acompanhamento dos meus processos. Agora tenho um sistema totalmente personalizado e ajustável. Recomendo a Nexa e sua equipe. Obrigado.", n: "Rafael L.", r: "Importadora · Brasil", tag: "Systems", c: "#4c8dff" },
    ],
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);
  const reduce = useRef(false);
  const root = useRef<HTMLElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { seen.current = !!e?.isIntersecting; }, { threshold: 0.3 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  // los textos largos quedan más tiempo en pantalla (~0,28 s por palabra)
  const dur = Math.max(DUR, (items[i]?.q.split(" ").length ?? 0) * 280);
  useEffect(() => {
    if (paused || reduce.current) return;
    const t = setTimeout(() => {
      if (seen.current && !document.hidden) setI((x) => (x + 1) % items.length);
      setRun((r) => r + 1);
    }, dur);
    return () => clearTimeout(t);
  }, [i, paused, run, items.length, dur]);
  // en celular, la persona activa queda a la vista dentro de la fila
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = list.current;
    const b = ul?.querySelectorAll("button")[i] as HTMLElement | undefined;
    if (ul && b && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: b.offsetLeft - 16, behavior: "smooth" });
  }, [i]);
  const t = items[i]!;
  const initials = (n: string) => n.replace("Dra. ", "").split(" ").map((w) => w[0]).join("");
  return (
    <section className="tm2" id="testimonios" ref={root} aria-labelledby="tm-title" style={{ ["--tc" as string]: t.c }}>
      <div className="container">
        <div className="tm2__head">
          <p className="label">{L("Testimonios", "Depoimentos")}</p>
          <h2 className="h2" id="tm-title">{L("Lo que dicen", "O que dizem")} <span className="serif ctrl">{L("quienes trabajan con nosotros.", "quem trabalha com a gente.")}</span></h2>
          {PLACEHOLDER && <p className="tm__note">{L("Textos de ejemplo para ver el diseño · se reemplazan por testimonios reales antes de publicar", "Textos de exemplo para ver o design · serão substituídos por depoimentos reais antes de publicar")}</p>}
        </div>
        <div className="tm2__body" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <ul className="tm2__people" ref={list} role="tablist" aria-label={L("Personas", "Pessoas")}>
            {items.map((p, j) => (
              <li key={p.n} role="presentation">
                <button type="button" role="tab" aria-selected={j === i} aria-controls="tm-quote" className={j === i ? "on" : ""} onClick={() => { setI(j); setRun((r) => r + 1); }} style={{ ["--pc" as string]: p.c }}>
                  <span className="tm2__av">{initials(p.n)}</span>
                  <span className="tm2__who"><b>{p.n}</b><small>{p.r}</small></span>
                  {j === i && !paused && <span className="tm2__bar" aria-hidden><i key={`${i}-${run}`} style={{ animationDuration: `${dur}ms` }} /></span>}
                </button>
              </li>
            ))}
          </ul>
          <figure className="tm2__quote" id="tm-quote" role="tabpanel" aria-live="polite">
            <span className="tm2__glow" aria-hidden />
            <svg className="tm2__mark" viewBox="0 0 64 48" aria-hidden><defs><linearGradient id="tmq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2bf59c" /><stop offset=".5" stopColor="#2de2d0" /><stop offset="1" stopColor="#4c8dff" /></linearGradient></defs><path fill="url(#tmq)" d="M0 48V28C0 12 8 2 24 0l3 7C18 10 14 16 14 24h12v24zm36 0V28C36 12 44 2 60 0l3 7c-9 3-13 9-13 17h12v24z" /></svg>
            <blockquote key={i}>
              {t.q.split(" ").map((w, k) => <span key={k} style={{ animationDelay: `${k * 0.025}s` }}>{w} </span>)}
            </blockquote>
            <figcaption key={`c-${i}`}>
              <span className="tm2__av tm2__av--lg">{initials(t.n)}</span>
              <span><b>{t.n}</b><small>{t.r}</small></span>
              <span className="tm2__tag">Nexa {t.tag}</span>
            </figcaption>
            <span className="tm2__count" aria-hidden>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          </figure>
        </div>
      </div>
    </section>
  );
}
