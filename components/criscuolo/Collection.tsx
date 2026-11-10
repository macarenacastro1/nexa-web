"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCTS } from "./products";
import type { Ctl } from "./CollectionScene";
import { useInView } from "./useInView";
import OriginMap from "./OriginMap";

gsap.registerPlugin(ScrollTrigger);
const CollectionScene = dynamic(() => import("./CollectionScene"), { ssr: false });

const NOTE_HINT: Record<string, string> = {
  Chocolate: "Doçura profunda, final longo.", Caramelo: "Açúcares tostados, corpo sedoso.", Castanhas: "Textura amendoada e redonda.",
  Mel: "Doçura floral e delicada.", "Frutas maduras": "Acidez suave, frutas amarelas.", Flores: "Aroma leve e perfumado.",
  Cacau: "Amargor elegante, notas escuras.", "Frutas secas": "Uva-passa, ameixa, damasco.", "Açúcar mascavo": "Doçura rústica e quente.",
  Jasmim: "Floral intenso e limpo.", "Frutas cítricas": "Acidez brilhante, bergamota.", "Chá branco": "Corpo leve, final delicado.",
};

/** mapa editorial a pantalla completa: se cierra con el botón, con Esc o tocando fuera de la información */
function MapOverlay({ active, onClose, onPick }: { active: number; onClose: () => void; onPick: (i: number) => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  const p = PRODUCTS[active];
  return (
    <div className="cc-map" role="dialog" aria-modal="true" aria-label={`Origem do café ${p.name}`}>
      <div className="cc-map__bg"><OriginMap active={active} cross onPick={onPick} /></div>
      <div className="cc-map__info">
        <span className="cc-tech">Campos Altos · Minas Gerais</span>
        <div className="cc-map__coords">{p.lat}<br />{p.lon}</div>
        <p className="cc-italic">Nº {p.n} {p.name} · Altitude {p.altitude}</p>
        <span className="cc-note" style={{ color: "var(--bordo)" }}>Localização ilustrativa · toque em outro lote</span>
      </div>
      <button className="cc-map__close" onClick={onClose} autoFocus>Voltar ao café ×</button>
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
  const active = useInView(root, "100px");

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
        {mount && <CollectionScene ctl={ctl} onPick={pick} onHover={onHover} active={active} />}
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

      {map && sel !== null && <MapOverlay active={sel} onClose={() => setMap(false)} onPick={pick} />}
    </section>
  );
}
