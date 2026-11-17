import type { Metadata } from "next";
import Cobalto from "@/components/cobalto/Cobalto";
import BackToNexa from "@/components/criscuolo/BackToNexa";
import "@/components/cobalto/cobalto.css";

export const metadata: Metadata = {
  title: "Cobalto — A little art. A lot of fun. · Concepto por NEXA",
  description: "Concepto de experiencia web para un estudio de cerámica con brunch: pintá tu propia pieza y reservá tu mesa. Proyecto de portfolio de NEXA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap" />
      <BackToNexa />
      <Cobalto />
    </>
  );
}
