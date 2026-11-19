import type { Metadata } from "next";
import CleanHome from "@/components/v2/CleanHome";
import "@/components/v2/v2.css";

export const metadata: Metadata = {
  title: "NEXA — Tecnología, diseño y automatización (propuesta Nexa)",
  description: "Propuesta de diseño para la web de Nexa: estructura clara con la identidad de la marca.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CleanHome variant="nx" />;
}
