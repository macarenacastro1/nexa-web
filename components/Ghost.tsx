"use client";
import type { ReactNode } from "react";
import { useL } from "@/lib/i18n";

/** Cursor fantasma de Nexa: recorre la demo, "toca" y dice "probá vos".
 *  Se repite en bucle y se esconde mientras la persona usa la demo. */
export default function Ghost({ children, ms = 8000 }: { children: ReactNode; ms?: number }) {
  const L = useL();
  const st = { animationDuration: `${ms}ms`, animationIterationCount: "infinite" };
  return (
    <div className="svc__ghosted">
      {children}
      <span className="svc__ghost" style={st} aria-hidden>
        <span className="svc__ghost-dot" style={st} />
        <em>{L("probá", "teste")} <span className="serif">{L("vos", "você")}</span></em>
      </span>
    </div>
  );
}
