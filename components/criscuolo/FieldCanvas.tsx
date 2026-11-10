"use client";
import { useEffect, useRef } from "react";

/**
 * MARCADOR TEMPORAL del paisaje del Cerrado Mineiro (vista aérea de hileras de café al atardecer).
 * Se reemplaza por una fotografía real en /public/criscuolo/campo.jpg (ver FIELD_PHOTO en Journey.tsx).
 */
export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const W = 1600, H = 1000;
    c.width = W; c.height = H;
    const g = c.getContext("2d")!;
    let s = 12345;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    // cielo cálido
    const sky = g.createLinearGradient(0, 0, 0, H * 0.32);
    sky.addColorStop(0, "#c9d3cf"); sky.addColorStop(0.6, "#e9dcc2"); sky.addColorStop(1, "#f0d9b0");
    g.fillStyle = sky; g.fillRect(0, 0, W, H * 0.34);
    // colinas lejanas
    for (let k = 0; k < 3; k++) {
      g.fillStyle = ["#9aa58c", "#7f8b66", "#6a7652"][k];
      g.beginPath(); g.moveTo(0, H * 0.3);
      for (let x = 0; x <= W; x += 20) g.lineTo(x, H * (0.27 + k * 0.025) + Math.sin(x / (260 - k * 50) + k) * 14 + Math.sin(x / 90) * 4);
      g.lineTo(W, H); g.lineTo(0, H); g.fill();
    }
    // suelo rojo del cerrado
    const soil = g.createLinearGradient(0, H * 0.33, 0, H);
    soil.addColorStop(0, "#8c6a4a"); soil.addColorStop(1, "#7a3f26");
    g.fillStyle = soil; g.fillRect(0, H * 0.33, W, H);
    // hileras curvas en perspectiva
    const rows = 70;
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const y0 = H * 0.335 + Math.pow(t, 1.9) * H * 0.72;
      const thick = 2 + Math.pow(t, 2) * 46;
      const curve = 40 + t * 160;
      for (let x = -40; x < W + 40; x += Math.max(3, thick * 0.32)) {
        const y = y0 + Math.sin((x / W) * Math.PI * 1.2 + 0.6) * curve * (0.35 + t * 0.3);
        const v = rnd();
        g.fillStyle = `rgb(${38 + v * 30},${66 + v * 40},${32 + v * 18})`;
        g.beginPath(); g.ellipse(x, y, thick * (0.55 + rnd() * 0.4), thick * (0.42 + rnd() * 0.25), 0, 0, Math.PI * 2); g.fill();
        if (rnd() > 0.7) { g.fillStyle = `rgba(180,200,120,${0.18 + rnd() * 0.2})`; g.beginPath(); g.ellipse(x - thick * 0.2, y - thick * 0.2, thick * 0.25, thick * 0.18, 0, 0, Math.PI * 2); g.fill(); }
      }
    }
    // luz rasante y bruma
    const sun = g.createRadialGradient(W * 0.78, H * 0.22, 0, W * 0.78, H * 0.22, W * 0.7);
    sun.addColorStop(0, "rgba(255,226,170,.5)"); sun.addColorStop(1, "rgba(255,226,170,0)");
    g.fillStyle = sun; g.fillRect(0, 0, W, H);
    const haze = g.createLinearGradient(0, H * 0.25, 0, H * 0.5);
    haze.addColorStop(0, "rgba(240,225,200,.55)"); haze.addColorStop(1, "rgba(240,225,200,0)");
    g.fillStyle = haze; g.fillRect(0, H * 0.25, W, H * 0.25);
    // grano fotográfico
    const img = g.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) { const n = (rnd() - 0.5) * 14; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
    g.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} className="cc-field__img" aria-hidden />;
}
