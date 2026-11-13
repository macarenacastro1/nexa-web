"use client";
import { useEffect, useRef, useState } from "react";
import { useL } from "@/lib/i18n";

/**
 * 04 · Cómo trabajamos. Cinco etapas que avanzan con el scroll (al ritmo de
 * quien lee, nunca solas): a la izquierda el texto de cada etapa, a la derecha
 * una pantalla que muestra qué pasa en esa etapa. En celular, cada etapa trae
 * su pantalla debajo.
 */

/* ------------------------------ pantallas ------------------------------ */
function Win({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pw">
      <div className="pw__bar" aria-hidden><i /><i /><i /><span>{title}</span></div>
      <div className="pw__body">{children}</div>
    </div>
  );
}

function Diagnose() {
  const L = useL();
  const people = L(
    [["SV", "Sofía · Ventas", "Paso los pedidos de WhatsApp a una planilla, uno por uno."], ["MA", "Martín · Administración", "Todos los días copio facturas al sistema contable."], ["JD", "Julia · Depósito", "Cuando falta algo, aviso por mensaje y alguien lo pide."]],
    [["SV", "Sofia · Vendas", "Passo os pedidos do WhatsApp para uma planilha, um por um."], ["MA", "Marcos · Financeiro", "Todo dia copio notas fiscais para o sistema contábil."], ["JD", "Julia · Estoque", "Quando falta algo, aviso por mensagem e alguém pede."]],
  );
  const tags = L(["Automatizable", "Automatizable", "Se puede conectar"], ["Automatizável", "Automatizável", "Dá para conectar"]);
  return (
    <Win title={L("Diagnóstico · entrevistas", "Diagnóstico · entrevistas")}>
      <div className="pd">
        {people.map(([av, who, said], i) => (
          <div key={who} className="pd-note" style={{ animationDelay: `${0.2 + i * 0.7}s` }}>
            <span className="pd-av">{av}</span>
            <div><b>{who}</b><p>“{said}”</p></div>
            <em style={{ animationDelay: `${0.8 + i * 0.7}s` }}>{tags[i]}</em>
          </div>
        ))}
        <div className="pd-sum" style={{ animationDelay: "2.8s" }}>
          <b>{L("Lo que encontramos", "O que encontramos")}</b>
          <div><span><strong>7</strong>{L("tareas repetitivas", "tarefas repetitivas")}</span><span><strong>4</strong>{L("se pueden automatizar", "dá para automatizar")}</span><span><strong>2</strong>{L("sistemas para conectar", "sistemas para conectar")}</span></div>
        </div>
      </div>
    </Win>
  );
}

function Design() {
  const L = useL();
  return (
    <Win title={L("Diseño · propuesta de pantallas", "Design · proposta de telas")}>
      <div className="pz">
        <div className="pz-frame pz-frame--a">
          <small>{L("Pedidos", "Pedidos")}</small>
          <i className="pz-h" /><div className="pz-kpis"><i /><i /><i /></div>
          <div className="pz-rows">{[0, 1, 2, 3].map((r) => <i key={r} style={{ animationDelay: `${0.9 + r * 0.18}s` }} />)}</div>
        </div>
        <div className="pz-frame pz-frame--b">
          <small>{L("Celular", "Celular")}</small>
          <i className="pz-h" />{[0, 1, 2].map((r) => <i key={r} className="pz-card" style={{ animationDelay: `${1.5 + r * 0.2}s` }} />)}
        </div>
        <div className="pz-flow">
          {L(["Llega el pedido", "Se descuenta el stock", "Se factura", "Se avisa al cliente"], ["Chega o pedido", "Baixa o estoque", "Emite a nota", "Avisa o cliente"]).map((s, i) => (
            <span key={s} style={{ animationDelay: `${2.1 + i * 0.3}s` }}>{s}</span>
          ))}
        </div>
        <span className="pz-cursor" aria-hidden />
      </div>
    </Win>
  );
}

function Approve() {
  const L = useL();
  return (
    <Win title={L("Revisión del diseño", "Revisão do design")}>
      <div className="pa">
        <div className="pa-c" style={{ animationDelay: ".2s" }}><span className="pd-av">LG</span><div><b>Laura · {L("Gerencia", "Gerência")}</b><p>{L("¿Podemos sumar el CUIT del cliente en el pedido?", "Dá para incluir o CNPJ do cliente no pedido?")}</p></div></div>
        <div className="pa-c pa-c--nx" style={{ animationDelay: "1s" }}><span className="pd-av nx">N</span><div><b>NEXA</b><p>{L("Listo, ya está en la pantalla de pedidos.", "Pronto, já está na tela de pedidos.")}</p></div></div>
        <ul className="pa-list">
          {L(["Pantallas principales", "Flujo de pedidos", "Permisos por rol", "Alcance y entregas"], ["Telas principais", "Fluxo de pedidos", "Permissões por perfil", "Escopo e entregas"]).map((t, i) => (
            <li key={t} style={{ animationDelay: `${1.8 + i * 0.25}s` }}><span aria-hidden>✓</span>{t}</li>
          ))}
        </ul>
        <div className="pa-ok" style={{ animationDelay: "3s" }}><span aria-hidden>✓</span>{L("Diseño aprobado por Laura", "Design aprovado pela Laura")}</div>
      </div>
    </Win>
  );
}

function Build() {
  const L = useL();
  const mods = L([["Entrega 1", "Pedidos", 100], ["Entrega 2", "Stock y avisos", 100], ["Entrega 3", "Facturación", 64]], [["Entrega 1", "Pedidos", 100], ["Entrega 2", "Estoque e avisos", 100], ["Entrega 3", "Faturamento", 64]]) as [string, string, number][];
  return (
    <Win title={L("Desarrollo · avance", "Desenvolvimento · andamento")}>
      <div className="pb">
        {mods.map(([e, m, p], i) => (
          <div key={e} className="pb-row" style={{ animationDelay: `${0.2 + i * 0.5}s` }}>
            <div><small>{e}</small><b>{m}</b></div>
            <div className="pb-bar"><i style={{ width: `${p}%`, animationDelay: `${0.4 + i * 0.5}s` }} /></div>
            <em className={p === 100 ? "ok" : ""} style={{ animationDelay: `${1.4 + i * 0.5}s` }}>{p === 100 ? L("En uso", "Em uso") : L("En pruebas", "Em testes")}</em>
          </div>
        ))}
        <div className="pb-shot" style={{ animationDelay: "2.2s" }}>
          <b>{L("Ya lo está usando tu equipo", "Sua equipe já está usando")}</b>
          <span>{L("Cada entrega se prueba con datos reales antes de pasar a la siguiente.", "Cada entrega é testada com dados reais antes de passar para a próxima.")}</span>
        </div>
      </div>
    </Win>
  );
}

function Support() {
  const L = useL();
  return (
    <Win title={L("Acompañamiento", "Acompanhamento")}>
      <div className="ps">
        <div className="ps-chat">
          <p className="in" style={{ animationDelay: ".2s" }}>{L("Entró alguien nuevo a ventas, ¿cómo le doy acceso?", "Entrou alguém novo em vendas, como dou acesso?")}</p>
          <p className="out" style={{ animationDelay: "1.1s" }}>{L("Ya le creamos el usuario y le mandamos una guía de 2 minutos.", "Já criamos o usuário e mandamos um guia de 2 minutos.")}</p>
        </div>
        <div className="ps-grid">
          <div style={{ animationDelay: "1.8s" }}><small>{L("Capacitación", "Treinamento")}</small><b>{L("Equipo de ventas y depósito", "Equipe de vendas e estoque")}</b></div>
          <div style={{ animationDelay: "2.1s" }}><small>{L("Mejoras de este mes", "Melhorias deste mês")}</small><b>{L("Reporte semanal por mail", "Relatório semanal por e-mail")}</b></div>
        </div>
      </div>
    </Win>
  );
}

const VIS = [Diagnose, Design, Approve, Build, Support];

export default function Process() {
  const L = useL();
  const steps = L(
    [
      { t: "Diagnóstico", d: "Nos sentamos con vos y con tu equipo. Entrevistamos a quienes hacen cada tarea, o trabajamos juntos, para entender todas las funciones, dónde se pierde tiempo y qué se puede automatizar.", you: "Contarnos cómo trabajan hoy y presentarnos a quienes hacen cada tarea.", get: "Un mapa de tus procesos con lo que conviene automatizar primero." },
      { t: "Diseño", d: "Proponemos la solución: pantallas, flujos y qué hace cada parte. La ves y la entendés antes de que se programe una sola línea.", you: "Mirar la propuesta y decirnos qué cambiarías.", get: "Las pantallas y el recorrido de cada tarea, listos para revisar." },
      { t: "Aprobación", d: "Revisás el diseño con tu equipo, hacemos los ajustes necesarios y lo aprobás. Recién ahí empezamos a construir.", you: "Aprobar el diseño y el alcance.", get: "Un plan claro de entregas: qué se hace, en qué orden y qué incluye." },
      { t: "Desarrollo", d: "Construimos por etapas. Cada entrega se prueba con datos reales y tu equipo la puede empezar a usar antes de pasar a la siguiente.", you: "Probar cada entrega y contarnos cómo les va.", get: "Partes del sistema funcionando desde las primeras entregas." },
      { t: "Acompañamiento", d: "Te acompañamos en la puesta en marcha: capacitamos al equipo, ajustamos lo que haga falta y damos soporte para que funcione en el día a día.", you: "Usarlo y pedirnos lo que necesites.", get: "Capacitación, soporte y mejoras a medida que el negocio cambia." },
    ],
    [
      { t: "Diagnóstico", d: "Sentamos com você e sua equipe. Entrevistamos quem faz cada tarefa, ou trabalhamos juntos, para entender todas as funções, onde se perde tempo e o que dá para automatizar.", you: "Contar como vocês trabalham hoje e apresentar quem faz cada tarefa.", get: "Um mapa dos seus processos com o que vale automatizar primeiro." },
      { t: "Design", d: "Propomos a solução: telas, fluxos e o que cada parte faz. Você vê e entende antes de programarmos uma única linha.", you: "Olhar a proposta e dizer o que mudaria.", get: "As telas e o percurso de cada tarefa, prontos para revisar." },
      { t: "Aprovação", d: "Você revisa o design com sua equipe, fazemos os ajustes e você aprova. Só então começamos a construir.", you: "Aprovar o design e o escopo.", get: "Um plano claro de entregas: o que será feito, em que ordem e o que inclui." },
      { t: "Desenvolvimento", d: "Construímos por etapas. Cada entrega é testada com dados reais e sua equipe já pode começar a usar antes de passarmos à próxima.", you: "Testar cada entrega e contar como está indo.", get: "Partes do sistema funcionando desde as primeiras entregas." },
      { t: "Acompanhamento", d: "Acompanhamos a implantação: treinamos a equipe, ajustamos o que for preciso e damos suporte para funcionar no dia a dia.", you: "Usar e pedir o que precisar.", get: "Treinamento, suporte e melhorias conforme o negócio muda." },
    ],
  );
  const [i, setI] = useState(0);
  const [wide, setWide] = useState(true);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const up = () => setWide(mq.matches);
    up();
    mq.addEventListener("change", up);
    // la etapa activa es la que cruza el centro de la pantalla
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setI(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    panels.current.forEach((p) => p && io.observe(p));
    return () => { io.disconnect(); mq.removeEventListener("change", up); };
  }, []);

  const go = (j: number) => panels.current[j]?.scrollIntoView({ behavior: "smooth", block: "center" });
  const V = VIS[i]!;
  return (
    <section className="proc3" id="proceso" aria-labelledby="proc-title">
      <div className="container">
        <div className="proc3__head">
          <p className="label">{L("Cómo trabajamos", "Como trabalhamos")}</p>
          <h2 className="h2" id="proc-title">{L("De la idea", "Da ideia")} <span className="serif ctrl">{L("a la solución.", "à solução.")}</span></h2>
          <p className="lead">{L("Antes de diseñar o programar, entendemos cómo funciona tu negocio. Son cinco etapas y cada una termina con algo que podés ver y aprobar.", "Antes de desenhar ou programar, entendemos como seu negócio funciona. São cinco etapas e cada uma termina com algo que você pode ver e aprovar.")}</p>
        </div>
        <div className="proc3__body">
          <nav className="proc3__rail" aria-label={L("Etapas", "Etapas")}>
            {steps.map((s, j) => (
              <button key={s.t} type="button" className={j === i ? "on" : j < i ? "done" : ""} onClick={() => go(j)} aria-current={j === i ? "step" : undefined}>
                <span className="n">0{j + 1}</span><span className="t">{s.t}</span>
              </button>
            ))}
          </nav>
          <ol className="proc3__steps">
            {steps.map((s, j) => {
              const Vj = VIS[j]!;
              return (
                <li key={s.t} ref={(el) => { panels.current[j] = el; }} data-i={j} className={`proc3__step${j === i ? " on" : ""}`}>
                  <span className="proc3__num" aria-hidden>0{j + 1}</span>
                  <h3>{s.t}</h3>
                  <p className="proc3__d">{s.d}</p>
                  <dl className="proc3__meta">
                    <div><dt>{L("Qué hacés vos", "O que você faz")}</dt><dd>{s.you}</dd></div>
                    <div><dt>{L("Qué te llevás", "O que você recebe")}</dt><dd>{s.get}</dd></div>
                  </dl>
                  {!wide && <div className="proc3__inline">{j === i ? <Vj /> : <div className="proc3__ph" />}</div>}
                </li>
              );
            })}
          </ol>
          {wide && (
            <div className="proc3__sticky">
              <div className="proc3__visual" aria-hidden>
                <div key={i} className="proc3__stage"><V /></div>
                <div className="proc3__dots">{steps.map((s, j) => <i key={s.t} className={j === i ? "on" : j < i ? "done" : ""} />)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
