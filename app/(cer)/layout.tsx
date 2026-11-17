import type { Viewport } from "next";
import "../globals.css";
import Doc from "@/components/Doc";

export const viewport: Viewport = { themeColor: "#efe8dc" };

// Cobalto es un estudio de cerámica de Buenos Aires (concepto): el sitio va en español.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Doc lang="es">{children}</Doc>;
}
