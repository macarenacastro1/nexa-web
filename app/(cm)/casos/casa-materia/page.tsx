import type { Metadata } from "next";
import CasaMateria from "@/components/casa-materia/CasaMateria";
import BackToNexa from "@/components/criscuolo/BackToNexa";
import "@/components/casa-materia/casa-materia.css";

export const metadata: Metadata = {
  title: "Casa Materia — Atelier de experiencias · Concepto por NEXA",
  description: "Concepto de experiencia web 3D para un atelier de experiencias creativas: recorré la casa, el patio y las salas. Proyecto de portfolio de NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500&display=swap" />
      <BackToNexa />
      <CasaMateria />
    </>
  );
}
