// Bolsa de café tipo "pouch": geometría con volumen de papel y diseño gráfico en canvas.
import * as THREE from "three";
import type { Product } from "./products";

export const POUCH = { w: 1, h: 1.52, seal: 0.11, depth: 0.16 };

/** cuerpo acolchado: frente y dorso se unen en los bordes; sello superior plano; pequeños pliegues de papel */
export function pouchGeometry() {
  const { w, h, seal, depth } = POUCH;
  const SX = 60, SY = 90;
  const front = new THREE.PlaneGeometry(w, h, SX, SY);
  const pos = front.getAttribute("position");
  const wr = (x: number, y: number) => 0.004 * Math.sin(x * 23 + y * 7) * Math.sin(y * 31) + 0.003 * Math.sin(x * 61 - y * 13);
  const zAt = (x: number, y: number) => {
    const nx = (2 * x) / w; // -1..1
    const top = h / 2 - seal;
    let sealK = 1;
    if (y > top) sealK = Math.max(0, 1 - (y - top) / 0.035); // transición hacia el sello
    const bottomBulge = y < -h / 2 + 0.25 ? 1 + (1 - (y + h / 2) / 0.25) * 0.25 : 1; // fuelle inferior
    const bodyX = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(nx), 4)), 0.55);
    const bodyY = Math.pow(Math.max(0, 1 - Math.pow(Math.max(0, (y - (top - 0.25)) / 0.25), 2)), 0.5);
    const bot = Math.pow(Math.max(0, 1 - Math.pow(Math.max(0, (-h / 2 + 0.06 - y) / 0.06), 2)), 0.5);
    return depth * bodyX * Math.min(bodyY, 1) * sealK * bot * bottomBulge + (sealK > 0 ? wr(x, y) * bodyX : 0.0015);
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, zAt(x, y) * 0.5 + 0.002);
  }
  front.computeVertexNormals();
  const back = front.clone();
  back.rotateY(Math.PI);
  return { front, back };
}

function grain(g: CanvasRenderingContext2D, W: number, H: number, amt = 10) {
  const img = g.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) { const n = (Math.random() - 0.5) * amt; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  g.putImageData(img, 0, 0);
}
const SERIF = '"Cormorant Garamond", serif';
const SANS = '"Manrope", sans-serif';

function mark(g: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) {
  g.save(); g.translate(x, y); g.fillStyle = fill;
  g.beginPath(); g.rect(0, 0, s, s);
  g.moveTo(s * 0.75, s * 0.34); g.arc(s * 0.5, s * 0.5, s * 0.24, -0.72, 0.72, true); g.lineTo(s * 0.5, s * 0.66); g.lineTo(s * 0.5, s * 0.34); g.closePath();
  g.fill("evenodd"); g.restore();
}

function spaced(g: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "center" | "right" = "left") {
  const chars = [...text];
  const total = chars.reduce((a, c) => a + g.measureText(c).width + spacing, -spacing);
  let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  for (const c of chars) { g.fillText(c, cx, y); cx += g.measureText(c).width + spacing; }
}

/** frente de la bolsa */
export function pouchFront(p: Product) {
  const W = 1024, H = Math.round(1024 * POUCH.h / POUCH.w);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const sealH = (POUCH.seal / POUCH.h) * H;
  g.fillStyle = p.bg; g.fillRect(0, 0, W, H);
  // forma orgánica abstracta
  g.fillStyle = p.shape;
  g.beginPath(); g.moveTo(W, H * 0.34);
  g.bezierCurveTo(W * 0.55, H * 0.38, W * 0.62, H * 0.62, W * 0.28, H * 0.7);
  g.bezierCurveTo(W * 0.05, H * 0.75, W * 0.1, H, 0, H); g.lineTo(W, H); g.closePath(); g.fill();
  // sello superior con estrías
  g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, 0, W, sealH);
  g.strokeStyle = "rgba(255,255,255,.06)"; g.lineWidth = 2;
  for (let y = 10; y < sealH - 6; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // marca
  mark(g, 70, sealH + 60, 64, p.ink);
  g.fillStyle = p.ink; g.font = `300 34px ${SANS}`;
  spaced(g, "CRISCUOLO", 160, sealH + 104, 14);
  g.font = `500 17px ${SANS}`; g.globalAlpha = 0.75;
  spaced(g, "FAZENDAS & CAFÉS ESPECIAIS", 162, sealH + 138, 5); g.globalAlpha = 1;
  // nombre del producto en vertical, gigante
  g.save(); g.translate(W - 70, sealH + 70); g.rotate(Math.PI / 2);
  g.fillStyle = p.accent; g.globalAlpha = p.bg === "#ece4d3" ? 0.9 : 0.92;
  g.font = `400 210px ${SERIF}`; g.textBaseline = "top";
  g.fillText(p.name.toUpperCase(), 0, 0);
  g.restore(); g.globalAlpha = 1;
  // coordenadas en el frente
  g.fillStyle = p.ink; g.font = `500 22px ${SANS}`; g.globalAlpha = 0.85;
  spaced(g, p.lat, 70, sealH + 250, 4); spaced(g, p.lon, 70, sealH + 284, 4); g.globalAlpha = 1;
  // sello circular de origen
  const sx = 210, sy = H * 0.57, R = 118;
  g.strokeStyle = p.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(sx, sy, R, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.arc(sx, sy, R - 14, 0, Math.PI * 2); g.stroke();
  g.fillStyle = p.ink; g.font = `600 16px ${SANS}`;
  const ring = "CERRADO MINEIRO · CAFÉ ESPECIAL · BRASIL · ";
  [...ring].forEach((ch, i) => {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(sx + Math.cos(a) * (R - 32), sy + Math.sin(a) * (R - 32)); g.rotate(a + Math.PI / 2); g.textAlign = "center"; g.fillText(ch, 0, 0); g.restore();
  });
  g.textAlign = "center"; g.font = `400 46px ${SERIF}`; g.fillText(p.altitude.replace(" m", ""), sx, sy + 8);
  g.font = `600 14px ${SANS}`; g.fillText("METROS", sx, sy + 34); g.textAlign = "left";
  // etiqueta crema
  const lx = 70, ly = H * 0.72, lw = W * 0.6, lh = H * 0.22;
  g.fillStyle = p.label; g.fillRect(lx, ly, lw, lh);
  g.fillStyle = "rgba(0,0,0,.05)"; g.fillRect(lx, ly + lh - 4, lw, 4);
  const ink = p.bg === "#ece4d3" ? p.ink : "#30251f";
  g.fillStyle = ink; g.font = `600 16px ${SANS}`; spaced(g, `Nº ${p.n} — CAFÉ ESPECIAL`, lx + 34, ly + 50, 4);
  g.font = `400 72px ${SERIF}`; g.fillText(p.name, lx + 32, ly + 128);
  g.font = `500 21px ${SANS}`; g.fillText(`${p.variety} · ${p.process}`, lx + 34, ly + 176);
  g.globalAlpha = 0.75; g.font = `italic 400 28px ${SERIF}`; g.fillText(p.notes.join(", ").toLowerCase(), lx + 34, ly + 222); g.globalAlpha = 1;
  g.font = `600 16px ${SANS}`; spaced(g, `TORRA ${p.roast.toUpperCase()}`, lx + 34, ly + lh - 34, 4);
  spaced(g, "250 G", lx + lw - 34, ly + lh - 34, 4, "right");
  grain(g, W, H, 12);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** dorso: ficha técnica */
export function pouchBack(p: Product) {
  const W = 1024, H = Math.round(1024 * POUCH.h / POUCH.w);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const sealH = (POUCH.seal / POUCH.h) * H;
  g.fillStyle = p.bg; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, 0, W, sealH);
  const ink = p.bg === "#ece4d3" ? p.ink : p.ink;
  mark(g, W / 2 - 34, sealH + 70, 68, ink);
  g.fillStyle = ink; g.textAlign = "center"; g.font = `italic 400 58px ${SERIF}`;
  g.fillText("Da fruta à xícara.", W / 2, sealH + 230);
  // panel crema con la ficha
  const px = 90, py = sealH + 300, pw = W - 180, ph = H * 0.5;
  g.fillStyle = p.label; g.fillRect(px, py, pw, ph);
  const dark = "#30251f";
  g.textAlign = "left"; g.fillStyle = dark;
  g.font = `600 17px ${SANS}`; spaced(g, "FICHA TÉCNICA", px + 50, py + 70, 5);
  const rows: [string, string][] = [["Variedade", p.variety], ["Processo", p.process], ["Altitude", p.altitude], ["Torra", p.roast], ["Notas", p.notes.join(", ")], ["Origem", `${p.lat} · ${p.lon}`]];
  rows.forEach(([k, v], i) => {
    const y = py + 140 + i * 78;
    g.strokeStyle = "rgba(48,37,31,.15)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px + 50, y + 26); g.lineTo(px + pw - 50, y + 26); g.stroke();
    g.font = `500 18px ${SANS}`; g.globalAlpha = 0.6; spaced(g, k.toUpperCase(), px + 50, y, 4); g.globalAlpha = 1;
    g.font = `400 32px ${SERIF}`; g.textAlign = "right"; g.fillText(v, px + pw - 50, y + 4); g.textAlign = "left";
  });
  // código de barras
  g.fillStyle = dark;
  for (let i = 0, x = px + 50; i < 46; i++) { const bw = 2 + ((i * 7) % 5); g.fillRect(x, py + ph - 110, bw, 70); x += bw + 3 + ((i * 3) % 4); }
  g.font = `500 14px ${SANS}`; g.globalAlpha = 0.6; spaced(g, "PRODUTO CONCEITUAL · PORTFÓLIO NEXA", px + pw - 50, py + ph - 52, 3, "right"); g.globalAlpha = 1;
  g.fillStyle = ink; g.textAlign = "center"; g.font = `500 18px ${SANS}`; spaced(g, "CERRADO MINEIRO · MINAS GERAIS · BRASIL", W / 2, H - 120, 5, "center");
  grain(g, W, H, 12);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** micro-relieve de papel mate */
export function paperNormal() {
  const S = 512, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d")!; const img = g.createImageData(S, S);
  const h = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) h[i] = Math.random();
  // suavizado simple para una fibra fina
  const at = (x: number, y: number) => h[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 0.35, dy = (at(x, y + 1) - at(x, y - 1)) * 0.35;
    const l = Math.hypot(dx, dy, 1), i = (y * S + x) * 4;
    img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[i + 2] = 255 / l; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 4.5);
  return t;
}
