import type { Viewport } from "next";
import "../globals.css";
import Doc from "@/components/Doc";

export const viewport: Viewport = { themeColor: "#07080a" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Doc lang="es">{children}</Doc>;
}
