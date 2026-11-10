"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Recalcula las posiciones de las animaciones cuando terminan de cargar tipografías, imágenes y escenas 3D. */
export default function ScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const timers = [600, 1800, 4000].map((ms) => setTimeout(refresh, ms));
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => null);
    const ro = new ResizeObserver(() => refresh());
    ro.observe(document.body);
    return () => { timers.forEach(clearTimeout); window.removeEventListener("load", refresh); ro.disconnect(); };
  }, []);
  return null;
}
