"use client";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Achica su contenido (sin cortarlo) para que entre entero en la pantalla:
 * alto máximo = alto de la ventana menos `reserve` px. Nunca agranda.
 */
export default function FitBox({ children, reserve = 150, min = 0.55 }: { children: React.ReactNode; reserve?: number; min?: number }) {
  const inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const fit = () => {
      const natural = el.offsetHeight;
      const room = window.innerWidth < 980 ? Infinity : window.innerHeight - reserve;
      const next = Math.max(min, Math.min(1, room / Math.max(1, natural)));
      setS(next);
      setH(natural * next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, [reserve, min]);
  return (
    <div className="fitbox" style={{ height: h ?? undefined }}>
      <div ref={inner} className="fitbox__in" style={{ transform: s < 1 ? `scale(${s})` : undefined }}>{children}</div>
    </div>
  );
}
