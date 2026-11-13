"use client";
import { useL } from "@/lib/i18n";

/**
 * Testimonios. IMPORTANTE: por ahora son textos de ejemplo para ver el diseño.
 * Antes de publicar hay que reemplazarlos por testimonios reales (con permiso
 * de cada persona) o quitar la sección. Mientras PLACEHOLDER sea true, la
 * sección lo dice en pantalla.
 */
export const PLACEHOLDER = true;

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
  const rows = [items.slice(0, 4), items.slice(4)];
  const Card = ({ t, hidden }: { t: T; hidden?: boolean }) => (
    <figure className="tm-card" aria-hidden={hidden || undefined}>
      <span className="tm-card__tag" style={{ color: t.c }}>Nexa {t.tag}</span>
      <blockquote>“{t.q}”</blockquote>
      <figcaption>
        <span className="tm-card__av" style={{ background: `linear-gradient(135deg, ${t.c}, #13161a)` }}>{t.n.replace("Dra. ", "").split(" ").map((w) => w[0]).join("")}</span>
        <span><b>{t.n}</b><small>{t.r}</small></span>
      </figcaption>
    </figure>
  );
  return (
    <section className="tm" id="testimonios" aria-labelledby="tm-title">
      <div className="container tm__head">
        <p className="label">{L("Testimonios", "Depoimentos")}</p>
        <h2 className="h2" id="tm-title">{L("Lo que dicen", "O que dizem")} <span className="serif ctrl">{L("quienes trabajan con nosotros.", "quem trabalha com a gente.")}</span></h2>
        {PLACEHOLDER && <p className="tm__note">{L("Textos de ejemplo para ver el diseño · se reemplazan por testimonios reales antes de publicar", "Textos de exemplo para ver o design · serão substituídos por depoimentos reais antes de publicar")}</p>}
      </div>
      <div className="tm__rows">
        {rows.map((r, ri) => (
          <div key={ri} className={`tm__row${ri ? " tm__row--rev" : ""}`}>
            <div className="tm__track">
              {r.map((t) => <Card key={t.n} t={t} />)}
              {r.map((t) => <Card key={`${t.n}-b`} t={t} hidden />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
