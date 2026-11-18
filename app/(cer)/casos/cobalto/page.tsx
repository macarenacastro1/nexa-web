import type { Metadata } from "next";
import Cobalto from "@/components/cobalto/Cobalto";
import BackToNexa from "@/components/criscuolo/BackToNexa";
import "@/components/cobalto/cobalto.css";

export const metadata: Metadata = {
  title: "Cobalto — Ceramic café · Concepto por NEXA",
  description: "Concepto de sitio web para un ceramic café de Palermo: pintá tu taza, tomá el café en ella, comprá piezas y reservá tu mesa. Proyecto de portfolio de NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" />
      <BackToNexa />
      <Cobalto />
    </>
  );
}
