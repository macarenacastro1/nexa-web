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
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&display=swap" />
      <BackToNexa />
      <CasaMateria />
    </>
  );
}
