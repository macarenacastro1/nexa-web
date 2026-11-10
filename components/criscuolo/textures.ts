// Texturas procedurales (canvas) para la cereza, la pulpa y la semilla.
import * as THREE from "three";

// ruido de valor suave, determinístico y "tileable" en X
function makeNoise(seed = 1) {
  const p = new Uint8Array(512);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const perm = Array.from({ length: 256 }, (_, i) => i).sort(() => rnd() - 0.5);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return (x: number, y: number, period = 256) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const h = (i: number, j: number) => p[(p[((i % period) + period) % period & 255] + (j & 255)) & 511] / 255;
    const u = fade(xf), v = fade(yf);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  };
}
function fbm(n: ReturnType<typeof makeNoise>, x: number, y: number, oct: number, period: number) {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * n(x * f, y * f, period * f); norm += a; a *= 0.5; f *= 2; }
  return sum / norm;
}

function toTexture(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// normal map a partir de un mapa de altura
function heightToNormal(h: Float32Array, w: number, hh: number, strength: number) {
  const c = document.createElement("canvas"); c.width = w; c.height = hh;
  const g = c.getContext("2d")!; const img = g.createImageData(w, hh);
  const at = (x: number, y: number) => h[((y + hh) % hh) * w + ((x + w) % w)];
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const len = Math.hypot(dx, dy, 1);
    const i = (y * w + x) * 4;
    img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255; img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / len) * 0.5 * 255 + 127; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return toTexture(c, false);
}

/** Piel de la cereza: carmín profundo con manchas, lenticelas y zona del pedúnculo/corona */
export function cherrySkin() {
  const W = 1024, H = 512;
  const n = makeNoise(7), n2 = makeNoise(13);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!; const img = g.createImageData(W, H);
  const height = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const v = y / H; // 0 arriba (pedúnculo) → 1 abajo (corona)
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const big = fbm(n, u * 6, v * 3, 4, 6);
      const fine = fbm(n2, u * 48, v * 24, 3, 48);
      // base carmín → bordó; más claro/anaranjado en el ecuador lateral
      let r = 92 + big * 58, gg = 4 + big * 10, b = 14 + big * 10;
      r -= fine * 16;
      // hombros cerca del pedúnculo: más oscuros y marrones
      const top = Math.max(0, 1 - v / 0.12);
      r = r * (1 - top * 0.45) + 70 * top * 0.45; gg += top * 14; b += top * 4;
      // corona (cicatriz de la flor) en la base
      const bot = Math.max(0, (v - 0.93) / 0.07);
      r = r * (1 - bot * 0.7) + 48 * bot * 0.7; gg = gg * (1 - bot * 0.5) + 26 * bot * 0.5; b = b * (1 - bot * 0.5) + 18 * bot * 0.5;
      const i = (y * W + x) * 4;
      img.data[i] = Math.min(255, r); img.data[i + 1] = Math.min(255, gg); img.data[i + 2] = Math.min(255, b); img.data[i + 3] = 255;
      height[y * W + x] = fine * 0.6 + big * 0.4;
    }
  }
  g.putImageData(img, 0, 0);
  // lenticelas: puntitos claros diminutos
  for (let k = 0; k < 1400; k++) {
    const x = Math.random() * W, y = 40 + Math.random() * (H - 90);
    g.fillStyle = `rgba(255,${170 + Math.random() * 60},${140 + Math.random() * 40},${0.08 + Math.random() * 0.12})`;
    g.beginPath(); g.ellipse(x, y, 0.8 + Math.random() * 1.2, 0.6 + Math.random() * 0.8, 0, 0, Math.PI * 2); g.fill();
  }
  return { map: toTexture(c), normal: heightToNormal(height, W, H, 2.2) };
}

/** Cara del corte: piel fina, pulpa (mesocarpo) cremosa y translúcida con fibras, hueco de la semilla */
export function pulpFace() {
  const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d")!, n = makeNoise(21);
  const cx = S / 2, cy = S / 2, R = S / 2;
  // piel
  g.fillStyle = "#6d0b14"; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  // pulpa con degradé radial (rosada junto a la piel, crema hacia adentro)
  const rg = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 0.975);
  rg.addColorStop(0, "#f3e6bd"); rg.addColorStop(0.62, "#eedca6"); rg.addColorStop(0.86, "#e7c58f"); rg.addColorStop(0.95, "#d99a7c"); rg.addColorStop(1, "#b2383a");
  g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, R * 0.975, 0, Math.PI * 2); g.fill();
  // fibras radiales y textura húmeda
  const img = g.getImageData(0, 0, S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) / R;
    if (d > 0.975) continue;
    const a = Math.atan2(dy, dx);
    const fib = fbm(n, (a / (Math.PI * 2)) * 220, d * 6, 3, 220);
    const blot = fbm(n, x / 60, y / 60, 3, 1024);
    const k = (fib - 0.5) * 26 + (blot - 0.5) * 14;
    const i = (y * S + x) * 4;
    img.data[i] += k; img.data[i + 1] += k * 0.9; img.data[i + 2] += k * 0.6;
  }
  g.putImageData(img, 0, 0);
  // película plateada alrededor del hueco de la semilla
  g.save(); g.translate(cx, cy);
  g.strokeStyle = "rgba(240,232,210,.85)"; g.lineWidth = 7;
  g.beginPath(); g.ellipse(0, 0, R * 0.47, R * 0.66, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "rgba(196,170,120,.55)"; g.beginPath(); g.ellipse(0, 0, R * 0.45, R * 0.64, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  const t = toTexture(c); t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

/** Pergamino de la semilla: crema pálido, fibroso, levemente brillante */
export function parchment() {
  const W = 512, H = 512, n = makeNoise(33), n2 = makeNoise(41);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!; const img = g.createImageData(W, H);
  const height = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H;
    const streak = fbm(n, u * 70, v * 6, 3, 70);
    const mott = fbm(n2, u * 8, v * 8, 4, 8);
    const base = 0.82 + (mott - 0.5) * 0.14 + (streak - 0.5) * 0.08;
    const i = (y * W + x) * 4;
    img.data[i] = 236 * base + 10; img.data[i + 1] = 222 * base + 6; img.data[i + 2] = 186 * base; img.data[i + 3] = 255;
    height[y * W + x] = streak * 0.7 + mott * 0.3;
  }
  g.putImageData(img, 0, 0);
  return { map: toTexture(c), normal: heightToNormal(height, W, H, 3) };
}
