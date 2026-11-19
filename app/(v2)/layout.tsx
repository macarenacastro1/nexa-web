import type { Viewport } from "next";
import "../globals.css";
import Doc from "@/components/Doc";

export const viewport: Viewport = { themeColor: "#ffffff" };

// Versión clara de la web de Nexa (propuesta en prueba, solo en español por ahora).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Doc lang="es">{children}</Doc>;
}
