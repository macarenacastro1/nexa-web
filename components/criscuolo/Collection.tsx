"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCTS } from "./products";
import type { Ctl } from "./CollectionScene";

gsap.registerPlugin(ScrollTrigger);
const CollectionScene = dynamic(() => import("./CollectionScene"), { ssr: false });

const NOTE_HINT: Record<string, string> = {
  Chocolate: "Doçura profunda, final longo.", Caramelo: "Açúcares tostados, corpo sedoso.", Castanhas: "Textura amendoada e redonda.",
  Mel: "Doçura floral e delicada.", "Frutas maduras": "Acidez suave, frutas amarelas.", Flores: "Aroma leve e perfumado.",
  Cacau: "Amargor elegante, notas escuras.", "Frutas secas": "Uva-passa, ameixa, damasco.", "Açúcar mascavo": "Doçura rústica e quente.",
  Jasmim: "Floral intenso e limpo.", "Frutas cítricas": "Acidez brilhante, bergamota.", "Chá branco": "Corpo leve, final delicado.",
};

/** mapa editorial: curvas de nivel abstractas y los cuatro puntos de origen */
function OriginMap({ active, onClose }: { active: number; onClose: () => void }) {
  const lonMin = -46.32, lonMax = -46.08, latMin = -19.78, latMax = -19.56;
  const px = (lon: number) => ((lon - lonMin) / (lonMax - lonMin)) * 100;
  const py = (lat: number) => ((latMax - lat) / (latMax - latMin)) * 100;
  const lines = Array.from({ length: 16 }, (_, k) => {
    const r = 6 + k * 5.2;
    let d = "";
    for (let a = 0; a <= 360; a += 6) {
      const rad = (a * Math.PI) / 180;
      const wob = 1 + 0.12 * Math.sin(rad * 3 + k * 0.6) + 0.06 * Math.sin(rad * 7 - k);
      d += `${a ? "L" : "M"}${(46 + Math.cos(rad) * r * wob * 1.25).toFixed(2)},${(52 + Math.sin(rad) * r * wob).toFixed(2)}`;
    }
    return d + "Z";
  });
  const p = PRODUCTS[active];
  return (
    <div className="cc-map" role="dialog" aria-label={`Origem do café ${p.name}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cc-map__lines" aria-hidden>
        {lines.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {PRODUCTS.map((q, i) => (
        <div key={q.n} className={`cc-map__pt${i === active ? " on" : ""}`} style={{ left: `${px(q.lonN)}%`, top: `${py(q.latN)}%` }}>
          <i /><span>{q.n} · {q.name}</span>
        </div>
      ))}
      <div className="cc-map__cross" style={{ left: `${px(p.lonN)}%`, top: `${py(p.latN)}%` }} aria-hidden />
      <div className="cc-map__info">
        <span className="cc-tech">Campos Altos · Minas Gerais</span>
        <div className="cc-map__coords">{p.lat}<br />{p.lon}</div>
        <p className="cc-italic">Altitude {p.altitude} · Cerrado Mineiro</p>
        <span className="cc-note" style={{ color: "var(--bordo)" }}>Localização ilustrativa</span>
      </div>
      <button className="cc-map__close" onClick={onClose}>Fechar mapa ×</button>
    </div>
  );
}

export default function Collection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ctl = useRef<Ctl>({ selected: null, hover: null, dragY: 0, dragging: false });
  const [sel, setSel] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [map, setMap] = useState(false);
  const [mount, setMount] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 160%", once: true, onEnter: () => setMount(true) });
      gsap.from(".cc-col__head > *", { opacity: 0, y: 30, stagger: 0.12, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const pick = (i: number) => { ctl.current.selected = i; ctl.current.dragY = 0; setSel(i); setNote(null); };
  const back = () => { ctl.current.selected = null; setSel(null); setMap(false); };
  const onHover = (i: number | null) => { ctl.current.hover = i; setHover(i); };

  // arrastrar para girar la bolsa elegida
  const onDown = (e: React.PointerEvent) => {
    if (ctl.current.selected === null) return;
    const x0 = e.clientX, r0 = ctl.current.dragY;
    ctl.current.dragging = true;
    const mv = (ev: PointerEvent) => { ctl.current.dragY = r0 + (ev.clientX - x0) * 0.012; };
    const up = () => { ctl.current.dragging = false; window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  const flip = () => { ctl.current.dragY += Math.PI; };

  const p = sel !== null ? PRODUCTS[sel] : null;
  const toOrigin = () => {
    const j = document.querySelector(".cc-journey") as HTMLElement;
    if (j) window.scrollTo({ top: j.offsetTop + (j.offsetHeight - window.innerHeight) * 0.93, behavior: "smooth" });
  };

  return (
    <section className={`cc-col${sel !== null ? " is-open" : ""}`} id="cafes" ref={root} aria-label="Coleção de cafés">
      <div className="cc-col__head">
        <span className="cc-tech">Coleção</span>
        <h2 className="cc-display cc-display--md">Quatro cafés.<br />Quatro origens.</h2>
        <p className="cc-italic">Cada lote carrega suas próprias coordenadas.</p>
      </div>

      <div className="cc-col__stage" ref={stage} onPointerDown={onDown}>
        {mount && <CollectionScene ctl={ctl} onPick={pick} onHover={onHover} />}
        {/* nombres bajo cada bolsa (vista de colección) */}
        <ol className="cc-col__names" aria-label="Escolha um café">
          {PRODUCTS.map((q, i) => (
            <li key={q.n} className={hover === i ? "on" : ""}>
              <button onClick={() => pick(i)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
                <b>{q.n}</b>{q.name}<small>{q.notes.join(" · ")}</small>
              </button>
            </li>
          ))}
        </ol>
        <p className="cc-col__tip">{sel === null ? "Selecione um café" : "Arraste para girar"}</p>
      </div>

      {p && (
        <aside className="cc-spec" key={p.n} aria-live="polite">
          <button className="cc-spec__back" onClick={back}>← Ver coleção</button>
          <span className="cc-tech">Nº {p.n} · Café especial</span>
          <h3 className="cc-display cc-display--md">{p.name}</h3>
          <dl className="cc-spec__data">
            <div><dt>Variedade</dt><dd>{p.variety}</dd></div>
            <div><dt>Processo</dt><dd>{p.process}</dd></div>
            <div><dt>Altitude</dt><dd>{p.altitude}</dd></div>
            <div><dt>Torra</dt><dd>{p.roast}</dd></div>
          </dl>
          <div className="cc-spec__notes">
            <span className="cc-tech">Notas sensoriais</span>
            <ul>
              {p.notes.map((n) => (
                <li key={n} onMouseEnter={() => setNote(n)} onMouseLeave={() => setNote(null)} onClick={() => setNote(note === n ? null : n)} className={note === n ? "on" : ""}>{n}</li>
              ))}
            </ul>
            <p className="cc-spec__hint">{note ? NOTE_HINT[note] : "Passe o cursor sobre uma nota."}</p>
          </div>
          <button className="cc-spec__coords" onClick={() => setMap(true)}>
            <span>{p.lat}</span><span>{p.lon}</span><em>Ver no mapa ↗</em>
          </button>
          <div className="cc-spec__actions">
            <button className="cc-btn" onClick={flip}>Ver verso</button>
            <button className="cc-btn cc-btn--ghost" onClick={toOrigin}>Explorar a origem</button>
          </div>
          <p className="cc-note" style={{ color: "var(--bordo)" }}>Produto conceitual · dados ilustrativos</p>
        </aside>
      )}

      {map && sel !== null && <OriginMap active={sel} onClose={() => setMap(false)} />}
    </section>
  );
}
