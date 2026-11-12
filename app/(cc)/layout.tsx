import type { Viewport } from "next";
import "../globals.css";
import Doc from "@/components/Doc";

export const viewport: Viewport = { themeColor: "#f4efe5" };

// El concepto de Criscuolo Coffee es una marca de Brasil: está en portugués.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Doc lang="pt">{children}</Doc>;
}
