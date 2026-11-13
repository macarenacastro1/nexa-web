"use client";
import { useEffect, useRef, useState } from "react";
import { useL } from "@/lib/i18n";

/**
 * Testimonios. IMPORTANTE: por ahora son textos de ejemplo para ver el diseño.
 * Antes de publicar hay que reemplazarlos por testimonios reales (con permiso
 * de cada persona) o quitar la sección. Mientras PLACEHOLDER sea true, la
 * sección lo dice en pantalla.
 */
export const PLACEHOLDER = true;
const DUR = 7000;

type T = { q: string; n: string; r: string; tag: "Experience" | "Systems" | "Intelligence"; c: string };

export default function Testimonials() {
  const L = useL();
  const items: T[] = L(
    [
      { q: "Antes respondíamos las consultas de stock a mano y se nos escapaban ventas. Ahora el WhatsApp contesta solo y nosotros nos ocupamos de despachar.", n: "Carolina M.", r: "Distribuidora de insumos · Córdoba", tag: "Intelligence", c: "#2de2d0" },
      { q: "Nos escucharon a todos: ventas, administración y depósito. El sistema quedó pensado para cómo trabajamos de verdad, no al revés.", n: "Martín R.", r: "Fábrica de muebles · Rosario", tag: "Systems", c: "#4c8dff" },
      { q: "La web nueva se siente como nuestra marca. La gente nos escribe diciendo que la recorrió entera antes de comprar.", n: "Lucía F.", r: "Marca de indumentaria · CABA", tag: "Experience", c: "#2bf59c" },
      { q: "Lo que más valoro es que vimos y aprobamos cada pantalla antes de que se programara. No hubo sorpresas.", n: "Diego A.", r: "Estudio contable · Mendoza", tag: "Systems", c: "#4c8dff" },
      { q: "Los turnos se confirman solos y cuando alguien cancela, el lugar se ocupa con la lista de espera. Recuperamos horas que antes perdíamos.", n: "Dra. Paula S.", r: "Consultorio odontológico · La Plata", tag: "Systems", c: "#4c8dff" },
      { q: "Conectaron la tienda, el sistema de facturación y las planillas. Dejamos de copiar datos de un lado a otro todos los días.", n: "Federico G.", r: "E-commerce de electrónica · Montevideo", tag: "Intelligence", c: "#2de2d0" },
      { q: "Después de lanzar siguieron con nosotros: capacitaron al equipo y cada mes sumamos alguna mejora.", n: "Valeria T.", r: "Cadena de cafeterías · Santiago", tag: "Systems", c: "#4c8dff" },
      { q: "Teníamos una idea bastante desordenada y la convirtieron en algo claro, lindo y fácil de usar.", n: "Joaquín P.", r: "Startup de servicios · Bogotá", tag: "Experience", c: "#2bf59c" },
    ],
    [
      { q: "Antes respondíamos as consultas de estoque à mão e perdíamos vendas. Agora o WhatsApp responde sozinho e nós cuidamos do despacho.", n: "Carolina M.", r: "Distribuidora de insumos · Córdoba", tag: "Intelligence", c: "#2de2d0" },
      { q: "Ouviram todo mundo: vendas, financeiro e estoque. O sistema ficou pensado para como trabalhamos de verdade, não o contrário.", n: "Martín R.", r: "Fábrica de móveis · Rosário", tag: "Systems", c: "#4c8dff" },
      { q: "O site novo tem a cara da nossa marca. As pessoas escrevem dizendo que percorreram tudo antes de comprar.", n: "Lucía F.", r: "Marca de roupas · Buenos Aires", tag: "Experience", c: "#2bf59c" },
      { q: "O que mais valorizo é que vimos e aprovamos cada tela antes de ser programada. Não houve surpresas.", n: "Diego A.", r: "Escritório contábil · Mendoza", tag: "Systems", c: "#4c8dff" },
      { q: "Os horários se confirmam sozinhos e, quando alguém cancela, a vaga vai para a lista de espera. Recuperamos horas que perdíamos.", n: "Dra. Paula S.", r: "Consultório odontológico · La Plata", tag: "Systems", c: "#4c8dff" },
      { q: "Conectaram a loja, o sistema de faturamento e as planilhas. Paramos de copiar dados de um lado para o outro todo dia.", n: "Federico G.", r: "E-commerce de eletrônicos · Montevidéu", tag: "Intelligence", c: "#2de2d0" },
      { q: "Depois do lançamento continuaram com a gente: treinaram a equipe e todo mês incluímos alguma melhoria.", n: "Valeria T.", r: "Rede de cafeterias · Santiago", tag: "Systems", c: "#4c8dff" },
      { q: "Tínhamos uma ideia bem desorganizada e eles transformaram em algo claro, bonito e fácil de usar.", n: "Joaquín P.", r: "Startup de serviços · Bogotá", tag: "Experience", c: "#2bf59c" },
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
  useEffect(() => {
    if (paused || reduce.current) return;
    const t = setTimeout(() => {
      if (seen.current && !document.hidden) setI((x) => (x + 1) % items.length);
      setRun((r) => r + 1);
    }, DUR);
    return () => clearTimeout(t);
  }, [i, paused, run, items.length]);
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
                  {j === i && !paused && <span className="tm2__bar" aria-hidden><i key={`${i}-${run}`} style={{ animationDuration: `${DUR}ms` }} /></span>}
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
