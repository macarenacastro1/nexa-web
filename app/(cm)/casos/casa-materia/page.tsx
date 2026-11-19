import type { Metadata } from "next";
import CasaMateria from "@/components/casa-materia/CasaMateria";
import BackToNexa from "@/components/criscuolo/BackToNexa";
import "@/components/casa-materia/casa-materia.css";

export const metadata: Metadata = {
  title: "Casa Materia — Atelier de experiencias · Concepto por NEXA",
  description: "Concepto de sitio web para un atelier de experiencias creativas: cerámica, café, vino y workshops alrededor de un patio tropical, con reserva online. Proyecto de portfolio de NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500&family=Inter:wght@400;500&display=swap" />
      <BackToNexa />
      <CasaMateria />
    </>
  );
}
