import type { Metadata } from "next";
import CleanHome from "@/components/v2/CleanHome";
import "@/components/v2/v2.css";

export const metadata: Metadata = {
  title: "NEXA — Tecnología, diseño y automatización (propuesta clara)",
  description: "Propuesta de diseño claro para la web de Nexa: experiencias web, sistemas a medida y automatizaciones.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CleanHome />;
}
