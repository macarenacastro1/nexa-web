"use client";
import { useEffect, useRef } from "react";

/**
 * MARCADOR TEMPORAL del paisaje: vista de dron de hileras de café en curvas de nivel,
 * al atardecer (inspirada en la foto de referencia de la marca).
 * Se reemplaza por una fotografía real configurando FIELD_PHOTO en Journey.tsx.
 */
export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // se dibuja cuando el navegador está libre, para no trabar la carga de la página
    const ric = (window as any).requestIdleCallback || ((fn: () => void) => setTimeout(fn, 1200));
    const id = ric(() => draw(), { timeout: 4000 });
    return () => { ((window as any).cancelIdleCallback || clearTimeout)(id); };
  }, []);
  const draw = () => {
    const c = ref.current;
    if (!c) return;
    const W = 1920, H = 1200;
    c.width = W; c.height = H;
    const g = c.getContext("2d")!;
    let s = 98765;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const HOR = H * 0.2; // horizonte alto: cámara de dron inclinada

    // cielo: celeste lavado a crema cálida junto al horizonte
    const sky = g.createLinearGradient(0, 0, 0, HOR);
    sky.addColorStop(0, "#c7d2d6"); sky.addColorStop(0.7, "#e6dcc8"); sky.addColorStop(1, "#efd9b4");
    g.fillStyle = sky; g.fillRect(0, 0, W, HOR + 2);

    // suelo base: tierra rojiza y pasto seco
    const ground = g.createLinearGradient(0, HOR, 0, H);
    ground.addColorStop(0, "#a88f6a"); ground.addColorStop(0.25, "#8a6a45"); ground.addColorStop(1, "#5e3c24");
    g.fillStyle = ground; g.fillRect(0, HOR, W, H - HOR);

    // línea de árboles y lomas en el horizonte
    g.fillStyle = "#9aa18a"; g.fillRect(0, HOR - 6, W, 10);
    for (let x = 0; x < W; x += 3) {
      if (Math.sin(x * 0.006) + Math.sin(x * 0.017 + 2) < -0.4) continue;
      const r = 3 + rnd() * 9;
      g.fillStyle = rnd() > 0.5 ? "#6d7556" : "#5a6347";
      g.beginPath(); g.arc(x, HOR - r * 0.6, r, 0, Math.PI * 2); g.fill();
    }

    // proyección de un plano de suelo a pantalla
    const f = 900, camH = 1;
    const proj = (X: number, Z: number) => ({ x: W / 2 + (X * f) / Z, y: HOR + (camH * f) / Z, sc: f / Z });

    // hileras: arcos concéntricos (curvas de nivel) con centro a la derecha y atrás
    const Cx = 9, Cz = 9;
    const rows = 230;
    for (let k = rows; k >= 0; k--) {
      const r = 2.2 + k * 0.105;
      const pts: { x: number; y: number; sc: number }[] = [];
      for (let a = Math.PI * 0.62; a < Math.PI * 1.55; a += 0.004) {
        const X = Cx + Math.cos(a) * r * 1.35, Z = Cz + Math.sin(a) * r;
        if (Z < 0.55) continue;
        const p = proj(X, Z);
        if (p.x < -80 || p.x > W + 80 || p.y < HOR - 4 || p.y > H + 120) continue;
        pts.push(p);
      }
      // arbustos a lo largo de la hilera
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        const bw = 0.045 * p.sc * (0.85 + rnd() * 0.3), bh = 0.03 * p.sc * (0.85 + rnd() * 0.3);
        if (bw < 0.6) continue;
        if (i % Math.max(1, Math.round(4 / Math.max(0.6, bw))) !== 0 && bw < 3) continue;
        const v = rnd();
        // sombra
        g.fillStyle = `rgba(28,40,20,${0.55})`;
        g.beginPath(); g.ellipse(p.x + bw * 0.25, p.y + bh * 0.55, bw * 1.05, bh * 0.75, 0, 0, Math.PI * 2); g.fill();
        // cuerpo verde
        g.fillStyle = `rgb(${46 + v * 22},${70 + v * 26},${32 + v * 12})`;
        for (let j = 0; j < 3; j++) {
          g.beginPath(); g.ellipse(p.x + (j - 1) * bw * 0.45 + (rnd() - 0.5) * bw * 0.2, p.y + (rnd() - 0.5) * bh * 0.4, bw * (0.55 + rnd() * 0.25), bh * (0.75 + rnd() * 0.3), rnd() * 0.6 - 0.3, 0, Math.PI * 2); g.fill();
        }
        // borde iluminado por el sol rasante (desde atrás a la izquierda)
        g.fillStyle = `rgba(${214 + v * 30},${190 + v * 30},${110 + v * 20},${0.35 + v * 0.3})`;
        g.beginPath(); g.ellipse(p.x - bw * 0.25, p.y - bh * 0.35, bw * 0.62, bh * 0.42, 0, 0, Math.PI * 2); g.fill();
        if (bw > 6 && rnd() > 0.6) {
          g.fillStyle = "rgba(230,214,150,.35)";
          for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(p.x - bw * 0.5 + rnd() * bw, p.y - bh * 0.6 + rnd() * bh * 0.6, bw * 0.06, 0, Math.PI * 2); g.fill(); }
        }
      }
    }

    // luz dorada del atardecer y bruma atmosférica
    const sun = g.createRadialGradient(W * 0.12, HOR * 0.6, 0, W * 0.12, HOR * 0.6, W * 0.9);
    sun.addColorStop(0, "rgba(255,214,150,.55)"); sun.addColorStop(0.45, "rgba(255,200,130,.18)"); sun.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = sun; g.fillRect(0, 0, W, H);
    const haze = g.createLinearGradient(0, HOR - 20, 0, HOR + H * 0.22);
    haze.addColorStop(0, "rgba(236,222,196,.6)"); haze.addColorStop(1, "rgba(236,222,196,0)");
    g.fillStyle = haze; g.fillRect(0, HOR - 20, W, H * 0.24);
    const vig = g.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, H * 1.05);
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(20,12,6,.45)");
    g.fillStyle = vig; g.fillRect(0, 0, W, H);

    // grano fotográfico
    const img = g.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) { const n = (rnd() - 0.5) * 12; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
    g.putImageData(img, 0, 0);
  };
  return <canvas ref={ref} className="cc-field__img" aria-hidden />;
}
