"use client";
import { useEffect, useRef, useState } from "react";
import { useL } from "@/lib/i18n";

/**
 * 04 · Cómo trabajamos. Cinco etapas: diagnóstico con el equipo, diseño,
 * aprobación, desarrollo y acompañamiento. Cada etapa tiene su visual; el
 * recorrido avanza solo mientras está en pantalla y se puede elegir a mano.
 */
const DUR = 5200;

function Diagnose() {
  const L = useL();
  const people = L(
    [["Ventas", "Cargo los pedidos de WhatsApp a mano en una planilla."], ["Administración", "Copio las facturas al sistema contable."], ["Depósito", "Aviso por mensaje cuando falta stock."]],
    [["Vendas", "Lanço os pedidos do WhatsApp à mão numa planilha."], ["Financeiro", "Copio as notas para o sistema contábil."], ["Estoque", "Aviso por mensagem quando falta produto."]],
  );
  const tags = L(["Automatizable", "Automatizable", "Se puede conectar"], ["Automatizável", "Automatizável", "Dá para conectar"]);
  return (
    <div className="pv pv--diag">
      <p className="pv__cap">{L("Entrevistas con tu equipo", "Entrevistas com sua equipe")}</p>
      {people.map(([who, said], i) => (
        <div key={who} className="pv-note" style={{ animationDelay: `${0.15 + i * 0.35}s` }}>
          <span className="pv-av">{who.slice(0, 2)}</span>
          <div><b>{who}</b><p>“{said}”</p></div>
          <em style={{ animationDelay: `${0.9 + i * 0.35}s` }}>{tags[i]}</em>
        </div>
      ))}
    </div>
  );
}

function Design() {
  const L = useL();
  return (
    <div className="pv pv--design">
      <p className="pv__cap">{L("Propuesta de pantallas y flujos", "Proposta de telas e fluxos")}</p>
      <div className="wf">
        <div className="wf__side">{[0, 1, 2, 3].map((i) => <i key={i} style={{ animationDelay: `${0.2 + i * 0.12}s` }} />)}</div>
        <div className="wf__main">
          <i className="wf__h" />
          <div className="wf__cards">{[0, 1, 2].map((i) => <i key={i} style={{ animationDelay: `${0.6 + i * 0.15}s` }} />)}</div>
          <div className="wf__rows">{[0, 1, 2, 3].map((i) => <i key={i} style={{ animationDelay: `${1.1 + i * 0.12}s` }} />)}</div>
        </div>
      </div>
      <div className="wf__flow">
        {L(["Pedido", "Stock", "Factura", "Aviso"], ["Pedido", "Estoque", "Nota", "Aviso"]).map((s, i) => (
          <span key={s} style={{ animationDelay: `${1.6 + i * 0.2}s` }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function Approve() {
  const L = useL();
  const items = L(["Pantallas principales", "Flujo de pedidos", "Permisos por rol", "Alcance y etapas"], ["Telas principais", "Fluxo de pedidos", "Permissões por perfil", "Escopo e etapas"]);
  return (
    <div className="pv pv--ok">
      <p className="pv__cap">{L("Revisión con tu equipo", "Revisão com sua equipe")}</p>
      <ul className="ok-list">
        {items.map((t, i) => (
          <li key={t} style={{ animationDelay: `${0.2 + i * 0.4}s` }}><span aria-hidden>✓</span>{t}</li>
        ))}
      </ul>
      <div className="ok-stamp" aria-hidden>{L("Diseño aprobado", "Design aprovado")}</div>
    </div>
  );
}

function Build() {
  const L = useL();
  const mods = L(["Pedidos", "Stock", "Facturación", "Avisos"], ["Pedidos", "Estoque", "Faturamento", "Avisos"]);
  return (
    <div className="pv pv--build">
      <p className="pv__cap">{L("Construcción por etapas, con pruebas", "Construção por etapas, com testes")}</p>
      {mods.map((m, i) => (
        <div key={m} className="bd-row">
          <span>{m}</span>
          <div className="bd-bar"><i style={{ animationDelay: `${0.2 + i * 0.5}s` }} /></div>
          <em style={{ animationDelay: `${1.3 + i * 0.5}s` }}>{L("probado", "testado")}</em>
        </div>
      ))}
    </div>
  );
}

function Support() {
  const L = useL();
  return (
    <div className="pv pv--sup">
      <p className="pv__cap">{L("Puesta en marcha y soporte", "Implantação e suporte")}</p>
      <div className="sup-chat">
        <p className="in" style={{ animationDelay: ".2s" }}>{L("¿Cómo sumo a una persona nueva al sistema?", "Como adiciono uma pessoa nova ao sistema?")}</p>
        <p className="out" style={{ animationDelay: "1s" }}>{L("Te lo dejamos listo y te mandamos una guía de 2 minutos.", "Deixamos pronto e mandamos um guia de 2 minutos.")}</p>
      </div>
      <div className="sup-list">
        <small>{L("Mejoras del mes", "Melhorias do mês")}</small>
        {L(["Nuevo reporte de ventas", "Aviso de stock bajo por mail"], ["Novo relatório de vendas", "Aviso de estoque baixo por e-mail"]).map((t, i) => (
          <span key={t} style={{ animationDelay: `${1.7 + i * 0.35}s` }}>+ {t}</span>
        ))}
      </div>
    </div>
  );
}

const VIS = [Diagnose, Design, Approve, Build, Support];

export default function Process() {
  const L = useL();
  const steps = L(
    [
      ["Diagnóstico", "Nos sentamos con vos y con tu equipo: entrevistamos a quienes hacen cada tarea o trabajamos juntos para entender todas las funciones, dónde se pierde tiempo y qué se puede automatizar."],
      ["Diseño", "Proponemos la solución: pantallas, flujos y qué hace cada parte. La ves antes de que se programe una sola línea."],
      ["Aprobación", "Revisás el diseño con tu equipo, hacemos los ajustes necesarios y lo aprobás. Recién ahí empezamos a construir."],
      ["Desarrollo", "Construimos por etapas, con pruebas en cada una y avances que podés ver y usar."],
      ["Acompañamiento", "Te acompañamos en la puesta en marcha: capacitación, ajustes y soporte para que funcione en el día a día."],
    ],
    [
      ["Diagnóstico", "Sentamos com você e sua equipe: entrevistamos quem faz cada tarefa ou trabalhamos juntos para entender todas as funções, onde se perde tempo e o que dá para automatizar."],
      ["Design", "Propomos a solução: telas, fluxos e o que cada parte faz. Você vê antes de programarmos uma única linha."],
      ["Aprovação", "Você revisa o design com sua equipe, fazemos os ajustes e você aprova. Só então começamos a construir."],
      ["Desenvolvimento", "Construímos por etapas, com testes em cada uma e avanços que você pode ver e usar."],
      ["Acompanhamento", "Acompanhamos a implantação: treinamento, ajustes e suporte para funcionar no dia a dia."],
    ],
  );
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLElement>(null);
  const seen = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) setAuto(false);
    const io = new IntersectionObserver(([e]) => { seen.current = !!e?.isIntersecting; }, { threshold: 0.35 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      if (seen.current && !document.hidden) setI((x) => (x + 1) % steps.length);
      setRun((r) => r + 1);
    }, DUR);
    return () => clearTimeout(t);
  }, [auto, i, run, steps.length]);

  const V = VIS[i]!;
  return (
    <section className="proc2" id="proceso" ref={root} aria-labelledby="proc-title">
      <div className="container">
        <div className="proc2__head">
          <p className="label">{L("Cómo trabajamos", "Como trabalhamos")}</p>
          <h2 className="h2" id="proc-title">{L("De la idea", "Da ideia")} <span className="serif ctrl">{L("a la solución.", "à solução.")}</span></h2>
          <p className="lead">{L("Antes de diseñar o programar, entendemos cómo funciona tu negocio. Cada etapa termina con algo que podés ver y aprobar.", "Antes de desenhar ou programar, entendemos como seu negócio funciona. Cada etapa termina com algo que você pode ver e aprovar.")}</p>
        </div>
        <div className="proc2__body">
          <ol className="proc2__steps">
            {steps.map(([t, d], j) => (
              <li key={t} className={j === i ? "on" : j < i ? "done" : ""}>
                <button onClick={() => { setI(j); setAuto(false); }} aria-current={j === i ? "step" : undefined} aria-controls="proc-visual">
                  <span className="n">0{j + 1}</span>
                  <span className="t">{t}</span>
                  {j === i && auto && <span className="bar" aria-hidden><i key={`${i}-${run}`} style={{ animationDuration: `${DUR}ms` }} /></span>}
                </button>
                {j === i && <p>{d}</p>}
              </li>
            ))}
          </ol>
          <div className="proc2__visual" id="proc-visual" aria-live="polite">
            <div key={i} className="proc2__stage"><V /></div>
            <span className="proc2__step">{L("Etapa", "Etapa")} 0{i + 1} / 05</span>
          </div>
        </div>
        {!auto && !reduce.current && (
          <button className="linkish proc2__resume" onClick={() => setAuto(true)}>{L("Reanudar el recorrido", "Retomar o percurso")}</button>
        )}
      </div>
    </section>
  );
}
