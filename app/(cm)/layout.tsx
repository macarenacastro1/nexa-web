import type { Viewport } from "next";
import "../globals.css";
import Doc from "@/components/Doc";

export const viewport: Viewport = { themeColor: "#1b1814" };

// Casa Materia es un atelier ficticio de Buenos Aires (concepto): el sitio va en español.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Doc lang="es">{children}</Doc>;
}
