// Bolsa de fondo plano (box pouch) con fuelles laterales, recreando el packaging real de Criscuolo.
import * as THREE from "three";
import { ORIGIN, type Product } from "./products";

export const POUCH = { w: 1, h: 1.62, d: 0.42 };

const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** caja deformada: frente y dorso levemente abombados, fuelles que se pliegan hacia arriba, sello superior plano */
export function pouchGeometry() {
  const { w, h, d } = POUCH;
  const geo = new THREE.BoxGeometry(w, h, d, 48, 96, 20);
  const pos = geo.getAttribute("position");
  const hw = w / 2, hh = h / 2, hd = d / 2;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    // el fuelle se cierra en la parte superior (la bolsa queda plana arriba)
    const k = 1 - smooth(hh - 0.42, hh - 0.08, y);
    const depth = Math.max(0.025, k);
    const nz = z / hd; // -1..1
    z = nz * hd * depth;
    // frente y dorso abombados por el café de adentro
    const bodyY = Math.max(0, 1 - Math.pow((y + 0.12) / (hh * 1.02), 4));
    const bulge = 0.035 * (1 - Math.pow(x / hw, 2)) * bodyY * k;
    if (Math.abs(nz) > 0.98) z += Math.sign(nz) * bulge;
    // pliegue en "V" de los fuelles laterales
    if (Math.abs(x) > hw * 0.98) x -= Math.sign(x) * 0.05 * (1 - Math.abs(nz)) * (0.35 + 0.65 * (1 - k));
    // pequeñas arrugas del material mate
    if (Math.abs(nz) > 0.98) z += Math.sign(nz) * (0.003 * Math.sin(x * 17 + y * 5) * Math.sin(y * 23) + 0.002 * Math.sin(x * 41 - y * 9)) * k;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

const SANS = '"Manrope", sans-serif';
function grain(g: CanvasRenderingContext2D, W: number, H: number, amt = 8) {
  const img = g.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) { const n = (Math.random() - 0.5) * amt; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  g.putImageData(img, 0, 0);
}
function mark(g: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, cut: string) {
  // la C de Criscuolo: bloque con un círculo recortado que se abre hacia la derecha
  g.save(); g.translate(x, y);
  g.fillStyle = fill; g.fillRect(0, 0, s * 1.2, s);
  g.fillStyle = cut; g.beginPath(); g.arc(s * 0.78, s * 0.5, s * 0.32, 0, Math.PI * 2); g.fill();
  g.fillRect(s * 0.78, s * 0.18, s * 0.45, s * 0.64);
  g.restore();
}
function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = t;
  }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}
/** etiqueta con borde de estampilla (festoneado) */
function stamp(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, cut: string) {
  g.fillStyle = fill; g.fillRect(x, y, w, h);
  const r = 15, step = 44;
  g.fillStyle = cut;
  const nx = Math.round(w / step), ny = Math.round(h / step);
  for (let i = 0; i <= nx; i++) { const cx = x + (i * w) / nx; g.beginPath(); g.arc(cx, y, r, 0, Math.PI * 2); g.arc(cx, y + h, r, 0, Math.PI * 2); g.fill(); }
  for (let j = 0; j <= ny; j++) { const cy = y + (j * h) / ny; g.beginPath(); g.arc(x, cy, r, 0, Math.PI * 2); g.arc(x + w, cy, r, 0, Math.PI * 2); g.fill(); }
}

function base(p: Product) {
  const W = 1024, H = Math.round((1024 * POUCH.h) / POUCH.w);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = p.bg; g.fillRect(0, 0, W, H);
  // sello superior con estrías finas
  g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, 0, W, H * 0.055);
  g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 2;
  for (let y = 8; y < H * 0.05; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  return { c, g, W, H };
}
const tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

export function pouchFront(p: Product) {
  const { c, g, W, H } = base(p);
  // muesca de apertura
  g.strokeStyle = p.ink; g.globalAlpha = 0.5; g.lineWidth = 3; g.beginPath(); g.moveTo(W * 0.9, H * 0.15); g.lineTo(W * 0.9, H * 0.19); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = p.ink;
  g.font = `400 40px ${SANS}`; g.globalAlpha = 0.85;
  g.fillText("Tradição familiar.", W * 0.1, H * 0.27); g.fillText("Excelência global.", W * 0.1, H * 0.27 + 50); g.globalAlpha = 1;
  mark(g, W * 0.1, H * 0.325, 62, p.ink, p.bg);
  g.textAlign = "right";
  g.font = `500 46px ${SANS}`; g.fillText("250g", W * 0.8, H * 0.325);
  g.font = `500 44px ${SANS}`; g.fillText("COFFEE", W * 0.8, H * 0.325 + 58);
  g.font = `500 26px ${SANS}`; g.fillText("100% Arábica", W * 0.8, H * 0.325 + 100);
  g.textAlign = "left";
  // estampilla
  const lx = W * 0.1, ly = H * 0.415, lw = W * 0.54, lh = H * 0.5;
  stamp(g, lx, ly, lw, lh, p.label, p.bg);
  const ix = lx + 52, iw = lw - 104;
  g.fillStyle = p.labelInk;
  g.font = `400 25px ${SANS}`; g.fillText("Variedade:", ix, ly + 78);
  g.font = `400 44px ${SANS}`;
  let yy = wrap(g, p.name.toUpperCase(), ix, ly + 160, iw, 52);
  g.strokeStyle = p.labelInk; g.lineWidth = 2; g.beginPath(); g.moveTo(ix, yy - 22); g.lineTo(ix + iw, yy - 22); g.stroke();
  g.font = `400 27px ${SANS}`; g.fillText("Perfil sensorial:", ix, yy + 40);
  g.font = `400 28px ${SANS}`;
  yy = wrap(g, p.notesText, ix, yy + 108, iw, 36);
  yy = wrap(g, p.body, ix, yy + 26, iw, 36);
  const by = ly + lh - 250;
  g.font = `400 23px ${SANS}`; g.fillText(ORIGIN.place, ix, by); g.fillText(ORIGIN.farm, ix, by + 32);
  g.beginPath(); g.moveTo(ix, by + 62); g.lineTo(ix + iw, by + 62); g.stroke();
  g.font = `300 46px ${SANS}`; g.globalAlpha = 0.85; g.fillText("Fazendas &", ix, by + 132); g.fillText("Cafés Especiais", ix, by + 186); g.globalAlpha = 1;
  // CRISCUOLO vertical
  g.save(); g.translate(W * 0.885, H * 0.915); g.rotate(-Math.PI / 2);
  g.fillStyle = p.ink; g.font = `400 168px ${SANS}`; g.textBaseline = "alphabetic";
  g.fillText("CRISCUOLO", 0, 0); g.restore();
  grain(g, W, H);
  return tex(c);
}

export function pouchBack(p: Product) {
  const { c, g, W, H } = base(p);
  mark(g, W / 2 - 42, H * 0.2, 70, p.ink, p.bg);
  g.fillStyle = p.ink; g.textAlign = "center";
  g.font = `400 40px ${SANS}`; g.fillText("Tradição familiar.", W / 2, H * 0.31); g.fillText("Excelência global.", W / 2, H * 0.31 + 52);
  const lx = W * 0.16, ly = H * 0.42, lw = W * 0.68, lh = H * 0.4;
  stamp(g, lx, ly, lw, lh, p.label, p.bg);
  g.fillStyle = p.labelInk;
  g.font = `400 26px ${SANS}`; g.fillText("Café especial · 100% Arábica", W / 2, ly + 100);
  g.font = `400 52px ${SANS}`; g.fillText(p.name.toUpperCase(), W / 2, ly + 190);
  g.font = `400 26px ${SANS}`; g.fillText(`${ORIGIN.place} · ${ORIGIN.farm}`, W / 2, ly + 250);
  g.font = `400 24px ${SANS}`; g.globalAlpha = 0.7; g.fillText(`${p.lat}  ·  ${p.lon}`, W / 2, ly + 300); g.globalAlpha = 1;
  for (let i = 0, x = W / 2 - 150; i < 44; i++) { const bw = 2 + ((i * 7) % 5); g.fillRect(x, ly + lh - 170, bw, 80); x += bw + 3 + ((i * 3) % 4); }
  g.font = `400 18px ${SANS}`; g.globalAlpha = 0.6; g.fillText("Conceito de portfólio · NEXA", W / 2, ly + lh - 50); g.globalAlpha = 1;
  g.fillStyle = p.ink; g.font = `300 44px ${SANS}`; g.fillText("Fazendas & Cafés Especiais", W / 2, H * 0.9);
  g.textAlign = "left";
  grain(g, W, H);
  return tex(c);
}

/** fuelle lateral: color liso, pliegue central y CRISCUOLO en vertical (como en la bolsa real) */
export function pouchSide(p: Product) {
  const W = Math.round((512 * POUCH.d) / POUCH.w) * 2, H = Math.round((512 * POUCH.h) / POUCH.w) * 2;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = p.bg; g.fillRect(0, 0, W, H);
  const sh = g.createLinearGradient(0, 0, W, 0);
  sh.addColorStop(0, "rgba(0,0,0,.12)"); sh.addColorStop(0.5, "rgba(0,0,0,0)"); sh.addColorStop(0.52, "rgba(255,255,255,.05)"); sh.addColorStop(1, "rgba(0,0,0,.12)");
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W * 0.6, H * 0.8); g.rotate(-Math.PI / 2);
  g.fillStyle = p.ink; g.globalAlpha = 0.85; g.font = `400 54px ${SANS}`; g.fillText("CRISCUOLO", 0, 0); g.restore();
  grain(g, W, H);
  return tex(c);
}

/** micro-relieve del film mate */
export function paperNormal() {
  const S = 512, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d")!; const img = g.createImageData(S, S);
  const h = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) h[i] = Math.random();
  const at = (x: number, y: number) => h[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 0.3, dy = (at(x, y + 1) - at(x, y - 1)) * 0.3;
    const l = Math.hypot(dx, dy, 1), i = (y * S + x) * 4;
    img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[i + 2] = 255 / l; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 4.5);
  return t;
}
