import type { Metadata } from "next";
import Journey, { Mark } from "@/components/criscuolo/Journey";
import Collection from "@/components/criscuolo/Collection";
import "@/components/criscuolo/criscuolo.css";

export const metadata: Metadata = {
  title: "Criscuolo Coffee — Da fruta à xícara · Conceito por NEXA",
  description: "Conceito de experiência web interativa para uma marca de cafés especiais do Cerrado Mineiro. Projeto de portfólio da NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="cc">
      {/* tipografía propia de la marca */}
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600&display=swap" />
      <Journey />
      <Collection />
      <section className="cc-next">
        <div>
          <span className="cc-tech" style={{ color: "var(--bordo)" }}>Próxima cena</span>
          <h2 className="cc-display cc-display--md" style={{ marginTop: 18 }}>A jornada do grão.</h2>
          <p className="cc-italic" style={{ marginTop: 14 }}>Cultivo, colheita, seleção, torra e xícara. Em desenvolvimento.</p>
        </div>
        <Mark className="cc-next__mark" />
      </section>
      <footer className="cc-foot" id="contato">
        <span>Conceito de portfólio desenvolvido pela NEXA · Não é o site oficial da Criscuolo Coffee</span>
        <a href="../../">← Voltar para NEXA</a>
      </footer>
    </div>
  );
}
