import type { Metadata } from "next";
import Journey from "@/components/criscuolo/Journey";
import Collection from "@/components/criscuolo/Collection";
import { GrainJourney, Sensorial, Brand, Finale } from "@/components/criscuolo/Sections";
import "@/components/criscuolo/criscuolo.css";
import ScrollRefresh from "@/components/ScrollRefresh";

export const metadata: Metadata = {
  title: "Criscuolo Coffee — Da fruta à xícara · Conceito por NEXA",
  description: "Conceito de experiência web interativa para uma marca de cafés especiais do Cerrado Mineiro. Projeto de portfólio da NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="cc" id="main">
      {/* tipografía propia de la marca */}
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600&display=swap" />
      <ScrollRefresh />
      <Journey />
      <GrainJourney />
      <Collection />
      <Sensorial />
      <Brand />
      <Finale />
      <footer className="cc-foot" id="contato">
        <span>Conceito de portfólio desenvolvido pela NEXA · Não é o site oficial da Criscuolo Coffee</span>
        <a href="/pt/">← Voltar para NEXA</a>
      </footer>
    </div>
  );
}
