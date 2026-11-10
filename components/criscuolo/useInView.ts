"use client";
import { useEffect, useState, type RefObject } from "react";

/** true mientras el elemento está (o casi está) en pantalla: sirve para pausar el 3D fuera de vista */
export function useInView(ref: RefObject<HTMLElement | null>, margin = "200px") {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return v;
}
