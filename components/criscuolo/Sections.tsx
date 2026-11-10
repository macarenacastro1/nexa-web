"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PHOTOS } from "./photos";
import { PRODUCTS } from "./products";
import Plate, { PLATES } from "./Plates";

gsap.registerPlugin(ScrollTrigger);
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Foto con marcador elegante mientras no exista la imagen real */
export function Photo({ k, alt, tone = "#d9cdb8", className = "" }: { k: string; alt: string; tone?: string; className?: string }) {
  const src = PHOTOS[k];
  return (
    <div className={`cc-photo ${className}`} style={{ ["--tone" as any]: tone }}>
      {src ? <img src={BASE + src} alt={alt} loading="lazy" decoding="async" /> : (
        <div className="cc-photo__ph" role="img" aria-label={alt}><span>Fotografia</span><b>{alt}</b></div>
      )}
    </div>
  );
}

/* ================= A JORNADA DO GRÃO · láminas que se dibujan ================= */
const STAGES = [
  { t: "Cultivo", d: "Tudo começa no cuidado com a terra." },
  { t: "Colheita", d: "O tempo certo faz a diferença." },
  { t: "Seleção", d: "Cada grão carrega uma escolha." },
  { t: "Torra", d: "Quando a técnica revela o potencial." },
  { t: "Xícara", d: "O resultado de tudo o que veio antes." },
];

export function GrainJourney() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [st, setSt] = useState({ i: 0, t: 0 });
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5,
        onUpdate: (s) => {
          const x = s.progress * STAGES.length;
          const i = Math.min(STAGES.length - 1, Math.floor(x * 0.9999));
          setSt({ i, t: Math.min(1, (x - i) * 1.35) });
          if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);
  const { i, t } = st;
  return (
    <section className="cc-grain" ref={root} id="jornada-grao" aria-label="A jornada do grão">
      <div className="cc-grain__sticky">
        <div className="cc-grain__media">
          <div className="cc-grain__frame">
            <span className="cc-grain__fig">{PLATES[i].fig}</span>
            <span className="cc-grain__coord">19°41′S · 46°10′W</span>
            {PLATES.map((_, j) => (
              <div key={j} className={`cc-grain__plate${j === i ? " on" : ""}`}><Plate i={j} t={j === i ? t : j < i ? 1 : 0} /></div>
            ))}
            <span className="cc-grain__cap">{PLATES[i].cap}</span>
          </div>
        </div>
        <div className="cc-grain__text">
          <span className="cc-tech">A jornada do grão</span>
          <div className="cc-grain__num" aria-hidden>
            {STAGES.map((s, j) => <span key={s.t} className={j === i ? "on" : j < i ? "past" : ""}>0{j + 1}</span>)}
          </div>
          <div className="cc-grain__copy">
            {STAGES.map((s, j) => (
              <div key={s.t} className={`cc-grain__item${j === i ? " on" : ""}`}>
                <h3 className="cc-display cc-display--md">{s.t}</h3>
                <p className="cc-italic">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="cc-grain__progress"><span ref={bar} /></div>
          <ol className="cc-grain__list">{STAGES.map((s, j) => <li key={s.t} className={j === i ? "on" : ""}>{s.t}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}

/* ================= O SABOR TEM ORIGEM · rueda de sabores ================= */
const FAMILIES = [
  { f: "Achocolatado", notes: ["Chocolate ao leite", "Chocolate amargo", "Cacau"] },
  { f: "Doce", notes: ["Caramelo", "Mel", "Açúcar mascavo"] },
  { f: "Frutado", notes: ["Frutas cítricas"] },
  { f: "Oleaginosas", notes: ["Castanhas", "Amêndoas"] },
];
const ALL = FAMILIES.flatMap((fam) => fam.notes.map((n) => ({ n, f: fam.f })));
// lectura cualitativa de las descripciones del rótulo (1–5)
const PROFILE: Record<string, { corpo: [number, string]; docura: [number, string]; acidez: [number, string] }> = {
  "01": { corpo: [4.2, "Cremoso"], docura: [4.3, "Marcante"], acidez: [3, "Equilibrada"] },
  "02": { corpo: [3.6, "Aveludado"], docura: [4.6, "Intensa"], acidez: [4.6, "Vibrante"] },
  "03": { corpo: [3, "Médio"], docura: [3.2, "Equilibrada"], acidez: [2.2, "Suave"] },
  "04": { corpo: [3.4, "Sedoso"], docura: [4.6, "Intensa"], acidez: [2.6, "Delicada"] },
};
const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1), [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z`;
}

export function Sensorial() {
  const root = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const p = PRODUCTS[sel], prof = PROFILE[p.n];
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cc-wheel__seg", { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  const cx = 250, cy = 250, step = (Math.PI * 2) / ALL.length;
  let famStart = -Math.PI / 2;
  return (
    <section className="cc-sens" ref={root} aria-label="Experiência sensorial">
      <div className="cc-sens__head">
        <span className="cc-tech">Experiência sensorial</span>
        <h2 className="cc-display cc-display--md">O sabor<br />tem origem.</h2>
        <p className="cc-italic">Cada nota revela parte da jornada. Escolha um café.</p>
        <div className="cc-sens__tabs" role="tablist">
          {PRODUCTS.map((q, j) => (
            <button key={q.n} role="tab" aria-selected={j === sel} className={j === sel ? "on" : ""} onClick={() => setSel(j)}>
              <i style={{ background: q.bg }} />{q.name}
            </button>
          ))}
        </div>
      </div>

      <div className="cc-wheel">
        <svg viewBox="0 0 500 500" aria-label={`Notas do café ${p.name}`}>
          {[70, 130, 205].map((r) => <circle key={r} cx={cx} cy={cy} r={r} className="cc-wheel__ring" />)}
          {FAMILIES.map((fam) => {
            const a0 = famStart, a1 = famStart + fam.notes.length * step; famStart = a1;
            const active = fam.notes.some((n) => p.notes.includes(n));
            const [lx, ly] = polar(cx, cy, 100, (a0 + a1) / 2);
            return (
              <g key={fam.f}>
                <path d={arc(cx, cy, 70, 130, a0 + 0.01, a1 - 0.01)} className={`cc-wheel__seg fam${active ? " on" : ""}`} />
                <text x={lx} y={ly} className="cc-wheel__fam" textAnchor="middle" dominantBaseline="middle">{fam.f}</text>
              </g>
            );
          })}
          {ALL.map((note, j) => {
            const a0 = -Math.PI / 2 + j * step, a1 = a0 + step;
            const on = p.notes.includes(note.n), hv = hover === note.n;
            const mid = (a0 + a1) / 2, [tx, ty] = polar(cx, cy, 228, mid);
            const deg = (mid * 180) / Math.PI, flip = deg > 90 || deg < -90;
            return (
              <g key={note.n} onMouseEnter={() => setHover(note.n)} onMouseLeave={() => setHover(null)}>
                <path d={arc(cx, cy, 134, 205, a0 + 0.012, a1 - 0.012)} className={`cc-wheel__seg${on ? " on" : ""}${hv ? " hv" : ""}`} />
                <text x={tx} y={ty} className={`cc-wheel__note${on ? " on" : ""}`} textAnchor={flip ? "end" : "start"} dominantBaseline="middle"
                  transform={`rotate(${flip ? deg + 180 : deg} ${tx} ${ty})`}>{note.n}</text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="62" className="cc-wheel__core" />
          <text x={cx} y={cy - 6} textAnchor="middle" className="cc-wheel__name">{p.name}</text>
          <text x={cx} y={cy + 18} textAnchor="middle" className="cc-wheel__sub">{hover ?? "Fazenda Granno"}</text>
        </svg>
      </div>

      <div className="cc-sens__meters">
        <p className="cc-italic">{p.notesText}</p>
        {([["Corpo", prof.corpo], ["Doçura", prof.docura], ["Acidez", prof.acidez]] as const).map(([k, [v, label]]) => (
          <div key={k} className="cc-meter">
            <div className="cc-meter__top"><span className="cc-tech">{k}</span><b>{label}</b></div>
            <div className="cc-meter__track">{[1, 2, 3, 4, 5].map((d) => <i key={d} className={v >= d - 0.5 ? "on" : ""} style={{ transitionDelay: `${d * 60}ms` }} />)}</div>
          </div>
        ))}
        <p className="cc-note">Leitura baseada na descrição do rótulo</p>
      </div>
    </section>
  );
}

/* ================= A MARCA · estampillas postales ================= */
const STAMPS = [
  { w: "Terra", s: "Cerrado Mineiro", v: "Campos Altos · MG", icon: "M10,70 C30,40 50,52 70,30 S110,20 130,40 M10,82 C40,60 70,70 100,52 S125,48 130,56 M10,94 C50,80 80,88 130,72" },
  { w: "Tempo", s: "O ponto certo", v: "Da fruta à xícara", icon: "M70,90 a35,35 0 1,1 0.1,0 M70,55 L70,72 L84,80 M70,10 L70,18 M70,122 L70,130 M10,70 L18,70 M122,70 L130,70" },
  { w: "Cuidado", s: "Em cada detalhe", v: "Fazenda Granno", icon: "M40,110 C30,80 40,60 55,55 L95,48 C108,46 110,62 98,64 L72,68 M55,55 C60,40 80,36 90,40 M70,84 a10,7 30 1,0 0.1,0 M90,92 a10,7 -20 1,0 0.1,0" },
];
/** contorno de estampilla con bordes festoneados (perforado) */
function stampPath(w: number, h: number, step = 8, r = 2.6) {
  const nx = Math.round(w / step), ny = Math.round(h / step), sx = w / nx, sy = h / ny;
  let d = "M0,0";
  for (let i = 0; i < nx; i++) d += ` L${i * sx + sx / 2 - r},0 A${r},${r} 0 0 0 ${i * sx + sx / 2 + r},0 L${(i + 1) * sx},0`;
  for (let j = 0; j < ny; j++) d += ` L${w},${j * sy + sy / 2 - r} A${r},${r} 0 0 0 ${w},${j * sy + sy / 2 + r} L${w},${(j + 1) * sy}`;
  for (let i = nx; i > 0; i--) d += ` L${i * sx - sx / 2 + r},${h} A${r},${r} 0 0 0 ${i * sx - sx / 2 - r},${h} L${(i - 1) * sx},${h}`;
  for (let j = ny; j > 0; j--) d += ` L0,${j * sy - sy / 2 + r} A${r},${r} 0 0 0 0,${j * sy - sy / 2 - r} L0,${(j - 1) * sy}`;
  return d + "Z";
}
const STAMP_D = stampPath(100, 125);

function Postmark() {
  return (
    <svg className="cc-postmark" viewBox="0 0 160 160" aria-hidden>
      <defs><path id="pm" d="M80,80 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0" /></defs>
      <circle cx="80" cy="80" r="66" pathLength={1} />
      <circle cx="80" cy="80" r="44" pathLength={1} />
      <text><textPath href="#pm">CAMPOS ALTOS · MG · BRASIL ·</textPath></text>
      <text x="80" y="76" textAnchor="middle" className="big">CAFÉ</text>
      <text x="80" y="94" textAnchor="middle">2026</text>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M150,${48 + i * 16} C170,${40 + i * 16} 190,${56 + i * 16} 220,${48 + i * 16}`} pathLength={1} />)}
    </svg>
  );
}
export function Brand() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cc-stamp", { opacity: 0, y: 80, rotate: (i) => [-14, 10, -6][i] }, {
        opacity: 1, y: 0, rotate: (i) => [-5, 3, -2][i], stagger: 0.15, duration: 1.2, ease: "power3.out",
        scrollTrigger: { trigger: ".cc-brand__stamps", start: "top 75%" },
      });
      gsap.fromTo(".cc-postcard", { opacity: 0, y: 60, rotate: 6 }, { opacity: 1, y: 0, rotate: 2.5, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".cc-brand__stamps", start: "top 70%" } });
      gsap.fromTo(".cc-brand__copy > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.12, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cc-brand__copy", start: "top 75%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-brand" ref={root} aria-label="A marca">
      <div className="cc-brand__copy">
        <span className="cc-tech">A marca</span>
        <h2 className="cc-display cc-display--md">Mais do que café.<br />Uma história de origem.</h2>
        <p className="cc-italic">Entre a terra, o tempo e o cuidado, cada grão carrega uma história que merece ser conhecida.</p>
        <p className="cc-brand__sig">Tradição familiar. Excelência global.</p>
      </div>
      <div className="cc-brand__stamps">
        <figure className="cc-postcard">
          <Photo k="marcaPack" alt="A linha Criscuolo" tone="#501f26" />
          <figcaption>Do Cerrado Mineiro para o mundo.</figcaption>
          <Postmark />
        </figure>
        {STAMPS.map((s, j) => (
          <div key={s.w} className={`cc-stamp s${j}`} tabIndex={0}>
            <svg className="cc-stamp__shape" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden><path d={STAMP_D} /></svg>
            <div className="cc-stamp__in">
              <svg viewBox="0 0 140 140" aria-hidden><path d={s.icon} /></svg>
              <b>{s.w}</b>
              <span>{s.s}</span>
              <em>{s.v}</em>
            </div>
            <Postmark />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= FINAL ================= */
export function Finale() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cc-final__copy > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.14, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 55%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cc-final" ref={root} aria-label="Toda xícara carrega uma origem">
      <div className="cc-final__media">
        <Photo k="final" alt="Xícara de café sobre pedra" tone="#2e241e" />
        <svg className="cc-steam" viewBox="0 0 200 300" aria-hidden>
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M${80 + j * 20},290 C${60 + j * 25},230 ${120 + j * 10},190 ${90 + j * 18},130 S${70 + j * 22},40 ${100 + j * 12},0`} style={{ animationDelay: `${j * 1.6}s` }} />
          ))}
        </svg>
      </div>
      <div className="cc-final__copy">
        <h2 className="cc-display cc-display--md">Toda xícara<br />carrega uma origem.</h2>
        <p className="cc-italic">Descubra Criscuolo Coffee.</p>
        <div className="cc-final__ctas">
          <a href="#cafes" className="cc-btn cc-btn--light">Conheça nossos cafés</a>
          <a href="#contato" className="cc-btn cc-btn--ghost cc-btn--light-ghost">Entre em contato</a>
        </div>
      </div>
    </section>
  );
}
