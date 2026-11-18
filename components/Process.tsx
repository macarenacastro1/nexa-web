"use client";
import { useRef, useState } from "react";
import { useL } from "@/lib/i18n";

/**
 * 03 · Cómo trabajamos. Cuatro etapas generales (sirven para Experience,
 * Systems e Intelligence) en una sola pantalla: una línea de pasos
 * seleccionables y una ilustración que cambia según la etapa.
 */

function Win({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pw">
      <div className="pw__bar" aria-hidden><i /><i /><i /><span>{title}</span></div>
      <div className="pw__body">{children}</div>
    </div>
  );
}

/* 01 · una conversación */
function Talk() {
  const L = useL();
  return (
    <Win title={L("Primera conversación", "Primeira conversa")}>
      <div className="p4-talk">
        <p className="p4-msg">{L("Queremos vender online y dejar de anotar los pedidos a mano.", "Queremos vender online e parar de anotar os pedidos à mão.")}</p>
        <p className="p4-msg p4-msg--nx">{L("Contanos cómo trabajan hoy y qué les gustaría lograr.", "Conte como vocês trabalham hoje e o que gostariam de alcançar.")}</p>
        <div className="p4-note">
          <b>{L("Lo que queremos lograr", "O que queremos alcançar")}</b>
          <span>{L("Vender por la web", "Vender pelo site")}</span>
          <span>{L("Pedidos en un solo lugar", "Pedidos em um só lugar")}</span>
          <span>{L("Responder más rápido", "Responder mais rápido")}</span>
        </div>
      </div>
    </Win>
  );
}

/* 02 · la propuesta: boceto + alcance */
function Plan() {
  const L = useL();
  return (
    <Win title={L("Propuesta", "Proposta")}>
      <div className="p4-plan">
        <div className="p4-sketch" aria-hidden>
          <i className="h" /><i className="hero" /><div className="row"><i /><i /><i /></div><i className="line" /><i className="line s" />
        </div>
        <ul className="p4-scope">
          <li><b>{L("Alcance", "Escopo")}</b>{L("Qué incluye y qué no", "O que inclui e o que não")}</li>
          <li><b>{L("Experiencia", "Experiência")}</b>{L("Cómo se va a ver y usar", "Como vai ficar e ser usado")}</li>
          <li><b>{L("Funcionamiento", "Funcionamento")}</b>{L("Qué pasa en cada paso", "O que acontece em cada passo")}</li>
          <li><b>{L("Plazos", "Prazos")}</b>{L("Etapas y fechas", "Etapas e datas")}</li>
        </ul>
      </div>
    </Win>
  );
}

/* 03 · la construcción: de boceto a terminado */
function Build() {
  const L = useL();
  return (
    <Win title={L("Desarrollo", "Desenvolvimento")}>
      <div className="p4-build">
        <div className="p4-screen" aria-hidden>
          <i className="h" /><i className="hero" /><div className="row"><i /><i /><i /></div>
        </div>
        <ul className="p4-checks">
          <li>{L("Desarrollo", "Desenvolvimento")}</li>
          <li>{L("Pruebas", "Testes")}</li>
          <li>{L("Ajustes de detalle", "Ajustes de detalhe")}</li>
        </ul>
      </div>
    </Win>
  );
}

/* 04 · puesta en marcha y soporte */
function Care() {
  const L = useL();
  return (
    <Win title={L("Puesta en marcha", "Lançamento")}>
      <div className="p4-care">
        <div className="p4-live"><span className="dot" />{L("Publicado y funcionando", "No ar e funcionando")}</div>
        <div className="p4-plan2">
          <b>{L("Soporte acordado", "Suporte combinado")}</b>
          <span>{L("Consultas y ajustes", "Dúvidas e ajustes")}</span>
          <span>{L("Mejoras cuando las necesites", "Melhorias quando precisar")}</span>
        </div>
      </div>
    </Win>
  );
}

const VIS = [Talk, Plan, Build, Care];

export default function Process() {
  const L = useL();
  const steps = L(
    [
      { t: "Nos contás tu idea", d: "Entendemos tu negocio, qué necesitás y qué querés lograr." },
      { t: "Diseñamos la propuesta", d: "Definimos el alcance, la experiencia y cómo va a funcionar la solución." },
      { t: "La hacemos realidad", d: "Desarrollamos el proyecto, lo probamos y ajustamos los detalles." },
      { t: "Te acompañamos", d: "Te ayudamos con la puesta en marcha y acordamos el soporte que necesites." },
    ],
    [
      { t: "Você conta sua ideia", d: "Entendemos seu negócio, o que você precisa e o que quer alcançar." },
      { t: "Desenhamos a proposta", d: "Definimos o escopo, a experiência e como a solução vai funcionar." },
      { t: "Tiramos do papel", d: "Desenvolvemos o projeto, testamos e ajustamos os detalhes." },
      { t: "Acompanhamos você", d: "Ajudamos no lançamento e combinamos o suporte que você precisar." },
    ],
  );
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const V = VIS[i]!;
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + steps.length) % steps.length;
    setI(n);
    tabs.current[n]?.focus();
  };
  return (
    <section className="proc4" id="proceso" aria-labelledby="proc-title">
      <div className="container">
        <div className="proc4__head">
          <p className="label">{L("Cómo trabajamos", "Como trabalhamos")}</p>
          <h2 className="h2" id="proc-title">{L("De la idea a la solución.", "Da ideia à solução.")}</h2>
          <p className="lead">{L("Primero entendemos lo que necesitás. Después diseñamos, desarrollamos y te acompañamos en cada etapa.", "Primeiro entendemos o que você precisa. Depois desenhamos, desenvolvemos e acompanhamos você em cada etapa.")}</p>
        </div>
        <div className="proc4__steps" role="tablist" aria-label={L("Etapas", "Etapas")} onKeyDown={onKey}>
          {steps.map((s, j) => (
            <button key={s.t} ref={(el) => { tabs.current[j] = el; }} type="button" role="tab" id={`p4-t${j}`} aria-selected={i === j} aria-controls="p4-panel" tabIndex={i === j ? 0 : -1}
              className={j === i ? "on" : j < i ? "done" : ""} onClick={() => setI(j)}>
              <span className="n">0{j + 1}</span><span className="t">{s.t}</span>
            </button>
          ))}
        </div>
        <div className="proc4__body" id="p4-panel" role="tabpanel" aria-labelledby={`p4-t${i}`}>
          <div className="proc4__copy" key={`c${i}`}>
            <span className="proc4__num" aria-hidden>0{i + 1}</span>
            <h3>{steps[i]!.t}</h3>
            <p>{steps[i]!.d}</p>
            <div className="proc4__nav">
              <button type="button" onClick={() => setI((i + steps.length - 1) % steps.length)} aria-label={L("Etapa anterior", "Etapa anterior")}>←</button>
              <button type="button" onClick={() => setI((i + 1) % steps.length)} aria-label={L("Etapa siguiente", "Próxima etapa")}>→</button>
            </div>
          </div>
          <div className="proc4__visual" aria-hidden>
            <div key={i} className="proc4__stage"><V /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
