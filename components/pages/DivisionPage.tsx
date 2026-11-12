"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { track } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";
import ScrollRefresh from "@/components/ScrollRefresh";
import Nav, { DIVISIONS } from "@/components/Nav";
import Footer from "@/components/Footer";
import Contact, { type NeedKey } from "@/components/Contact";
import { ExperienceDemo, SystemsDemo } from "@/components/demos";
import Flow from "@/components/Flow";
import Simulator from "@/components/Simulator";
import Impact from "@/components/Impact";

gsap.registerPlugin(ScrollTrigger);

type Key = "experience" | "systems" | "intelligence";
type Item = [string, string];

function useContent(k: Key) {
  const L = useL();
  if (k === "experience")
    return {
      need: "web" as NeedKey,
      cat: L("Experiencias web y diseño digital", "Experiências web e design digital"),
      title: [L("Tu marca merece una", "Sua marca merece uma"), L("experiencia propia.", "experiência própria.")],
      lead: L(
        "Diseñamos sitios web, tiendas online e interfaces que combinan estética, interacción y facilidad de uso. Cada marca tiene su propio lenguaje: lo traducimos a una experiencia digital.",
        "Criamos sites, lojas online e interfaces que combinam estética, interação e facilidade de uso. Cada marca tem sua própria linguagem: nós a traduzimos em uma experiência digital.",
      ),
      items: L<Item[]>(
        [
          ["Sitios web premium", "Sitios a medida con dirección de arte, pensados para comunicar tu marca y convertir visitas en consultas."],
          ["E-commerce", "Tiendas online con catálogo, carrito y pagos, diseñadas para que comprar sea simple en cualquier pantalla."],
          ["Experiencias interactivas", "Movimiento, narrativa y microinteracciones cuando suman a la historia de la marca, no como adorno."],
          ["Diseño UI/UX", "Arquitectura de información, prototipos y sistema visual para productos e interfaces digitales."],
        ],
        [
          ["Sites premium", "Sites sob medida com direção de arte, pensados para comunicar sua marca e transformar visitas em contatos."],
          ["E-commerce", "Lojas online com catálogo, carrinho e pagamentos, desenhadas para que comprar seja simples em qualquer tela."],
          ["Experiências interativas", "Movimento, narrativa e microinterações quando somam à história da marca, não como enfeite."],
          ["Design UI/UX", "Arquitetura de informação, protótipos e sistema visual para produtos e interfaces digitais."],
        ],
      ),
      demoTitle: [L("Una marca,", "Uma marca,"), L("un lenguaje.", "uma linguagem.")],
      demoLead: L(
        "Café de especialidad, indumentaria de cuero y un estudio de cerámica: tres conceptos con identidades muy distintas. Elegí uno para verlo.",
        "Café especial, roupas de couro e um estúdio de cerâmica: três conceitos com identidades muito diferentes. Escolha um para ver.",
      ),
      blockTitle: [L("Proceso y", "Processo e"), L("entregables.", "entregáveis.")],
      block: L<Item[]>(
        [
          ["Estrategia y estructura", "Definimos objetivos, públicos y la arquitectura del sitio antes de diseñar."],
          ["Dirección de arte", "Proponemos el lenguaje visual, el uso de fotografía y el sistema de componentes."],
          ["Diseño y prototipo", "Diseñamos las pantallas clave para desktop y mobile y las validamos con vos."],
          ["Desarrollo y lanzamiento", "Construimos, optimizamos y publicamos. El detalle de entregables se define en cada propuesta."],
        ],
        [
          ["Estratégia e estrutura", "Definimos objetivos, públicos e a arquitetura do site antes de desenhar."],
          ["Direção de arte", "Propomos a linguagem visual, o uso de fotografia e o sistema de componentes."],
          ["Design e protótipo", "Desenhamos as telas principais para desktop e mobile e validamos com você."],
          ["Desenvolvimento e lançamento", "Construímos, otimizamos e publicamos. O detalhe dos entregáveis é definido em cada proposta."],
        ],
      ),
    };
  if (k === "systems")
    return {
      need: "sistema" as NeedKey,
      cat: L("Sistemas y plataformas a medida", "Sistemas e plataformas sob medida"),
      title: [L("Software pensado para", "Software pensado para"), L("tu manera de trabajar.", "o seu jeito de trabalhar.")],
      lead: L(
        "Desarrollamos herramientas digitales para centralizar información, organizar operaciones y facilitar el trabajo de equipos y clientes.",
        "Desenvolvemos ferramentas digitais para centralizar informações, organizar operações e facilitar o trabalho de equipes e clientes.",
      ),
      items: L<Item[]>(
        [
          ["Aplicaciones web", "Herramientas que se usan desde el navegador, en la computadora o el celular, sin instalar nada."],
          ["Plataformas y sistemas de gestión", "Pedidos, proyectos, stock o clientes organizados en un solo lugar, con estados y responsables."],
          ["Dashboards", "Tableros que muestran lo importante para decidir, sin gráficos de relleno."],
          ["Herramientas operativas", "Soluciones para tareas concretas del día a día: cargas, controles, seguimientos."],
          ["Portales para clientes", "Un espacio donde tus clientes consultan el estado de lo que te pidieron o descargan su información."],
        ],
        [
          ["Aplicações web", "Ferramentas usadas pelo navegador, no computador ou no celular, sem instalar nada."],
          ["Plataformas e sistemas de gestão", "Pedidos, projetos, estoque ou clientes organizados num só lugar, com status e responsáveis."],
          ["Dashboards", "Painéis que mostram o importante para decidir, sem gráficos de enfeite."],
          ["Ferramentas operacionais", "Soluções para tarefas concretas do dia a dia: lançamentos, controles, acompanhamentos."],
          ["Portais para clientes", "Um espaço onde seus clientes consultam o status do que pediram ou baixam suas informações."],
        ],
      ),
      demoTitle: [L("Orden que", "Ordem que"), L("se ve.", "se vê.")],
      demoLead: L(
        "Una vista conceptual de un sistema de operaciones: cada pedido con su estado, su responsable y su próximo paso.",
        "Uma visão conceitual de um sistema de operações: cada pedido com seu status, seu responsável e seu próximo passo.",
      ),
      blockTitle: [L("Diseño funcional,", "Design funcional,"), L("integraciones y mantenimiento.", "integrações e manutenção.")],
      block: L<Item[]>(
        [
          ["Diseño funcional", "Antes de programar, definimos con tu equipo los procesos, los roles y los permisos. Las funcionalidades quedan por escrito en la propuesta."],
          ["Integraciones", "Conectamos con las herramientas que ya usás cuando ofrecen una vía de integración (API, exportaciones o conectores)."],
          ["Pruebas y puesta en marcha", "Probamos con datos reales de ejemplo y acompañamos la carga inicial y la capacitación del equipo."],
          ["Mantenimiento y evolución", "Acordamos cómo se mantiene: soporte, respaldos, mejoras y nuevas funciones según lo que necesite tu operación."],
        ],
        [
          ["Design funcional", "Antes de programar, definimos com sua equipe os processos, os papéis e as permissões. As funcionalidades ficam por escrito na proposta."],
          ["Integrações", "Conectamos com as ferramentas que você já usa quando oferecem uma via de integração (API, exportações ou conectores)."],
          ["Testes e implantação", "Testamos com dados de exemplo reais e acompanhamos a carga inicial e o treinamento da equipe."],
          ["Manutenção e evolução", "Combinamos como será mantido: suporte, backups, melhorias e novas funções conforme o que sua operação precisar."],
        ],
      ),
    };
  return {
    need: "ia" as NeedKey,
    cat: L("Automatización e inteligencia artificial", "Automação e inteligência artificial"),
    title: [L("Menos tareas repetidas.", "Menos tarefas repetidas."), L("Más tiempo para lo importante.", "Mais tempo para o que importa.")],
    lead: L(
      "Conectamos herramientas y automatizamos procesos para reducir el trabajo manual y mejorar el control de la información, con revisión humana donde hace falta.",
      "Conectamos ferramentas e automatizamos processos para reduzir o trabalho manual e melhorar o controle das informações, com revisão humana onde for preciso.",
    ),
    items: L<Item[]>(
      [
        ["Automatización de procesos", "Tareas repetidas que hoy se hacen a mano —cargar, copiar, avisar— pasan a hacerse solas."],
        ["Integración de sistemas", "Tus herramientas comparten la información entre sí, sin planillas intermedias."],
        ["Asistentes inteligentes", "Asistentes que responden consultas frecuentes con la información de tu negocio y derivan a una persona."],
        ["Procesamiento de documentos", "Lectura de facturas, comprobantes o formularios para extraer datos y dejarlos listos para revisar."],
      ],
      [
        ["Automação de processos", "Tarefas repetidas feitas à mão —lançar, copiar, avisar— passam a acontecer sozinhas."],
        ["Integração de sistemas", "Suas ferramentas compartilham informações entre si, sem planilhas no meio."],
        ["Assistentes inteligentes", "Assistentes que respondem dúvidas frequentes com as informações do seu negócio e passam para uma pessoa."],
        ["Processamento de documentos", "Leitura de notas, comprovantes ou formulários para extrair dados e deixá-los prontos para revisão."],
      ],
    ),
    demoTitle: [L("", ""), L("", "")],
    demoLead: "",
    blockTitle: [L("Controles,", "Controles,"), L("revisión y validaciones.", "revisão e validações.")],
    block: L<Item[]>(
      [
        ["Revisión humana donde importa", "Pagos, respuestas a clientes o decisiones sensibles pasan por la aprobación de una persona."],
        ["Registro de cada paso", "Cada automatización deja un registro de qué hizo y cuándo, para poder revisarlo."],
        ["Datos y permisos", "Cada herramienta accede solo a la información que necesita. Las claves no quedan en el código."],
        ["Pruebas antes de activar", "Probamos con casos de ejemplo y activamos de a poco, controlando los resultados."],
      ],
      [
        ["Revisão humana onde importa", "Pagamentos, respostas a clientes ou decisões sensíveis passam pela aprovação de uma pessoa."],
        ["Registro de cada passo", "Cada automação deixa um registro do que fez e quando, para poder revisar."],
        ["Dados e permissões", "Cada ferramenta acessa só as informações de que precisa. As chaves não ficam no código."],
        ["Testes antes de ativar", "Testamos com casos de exemplo e ativamos aos poucos, controlando os resultados."],
      ],
    ),
  };
}

function useExamples() {
  const L = useL();
  return L<Item[]>(
    [
      ["Consultas que se ordenan solas", "Lo que llega por la web, el mail o WhatsApp se clasifica y se carga en el CRM con sus datos."],
      ["Documentos que se leen", "Facturas y comprobantes: se extraen los datos y quedan listos para que alguien los revise."],
      ["Reportes que se arman solos", "Información de varias herramientas reunida en un reporte periódico."],
      ["Avisos a tiempo", "Una alerta cuando algo necesita atención: un pedido demorado, un stock bajo, un pago por vencer."],
    ],
    [
      ["Contatos que se organizam sozinhos", "O que chega pelo site, e-mail ou WhatsApp é classificado e cadastrado no CRM com seus dados."],
      ["Documentos que são lidos", "Notas e comprovantes: os dados são extraídos e ficam prontos para alguém revisar."],
      ["Relatórios que se montam sozinhos", "Informações de várias ferramentas reunidas em um relatório periódico."],
      ["Avisos na hora certa", "Um alerta quando algo precisa de atenção: um pedido atrasado, um estoque baixo, um pagamento a vencer."],
    ],
  );
}

function List({ items, cols = 2 }: { items: Item[]; cols?: number }) {
  return (
    <ul className={`dp-list dp-list--${cols}`}>
      {items.map(([t, d], i) => (
        <li key={t}>
          <span className="dp-list__n" aria-hidden>0{i + 1}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </li>
      ))}
    </ul>
  );
}

export default function DivisionPage({ k }: { k: Key }) {
  const L = useL();
  const href = useHref();
  const c = useContent(k);
  const examples = useExamples();
  const d = DIVISIONS.find((x) => x.key === k)!;
  const others = DIVISIONS.filter((x) => x.key !== k);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dp-hero .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", delay: 0.1 });
      gsap.utils.toArray<HTMLElement>(".dp-sec").forEach((el) =>
        gsap.from(el, { opacity: 0, y: 30, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } }),
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <ScrollRefresh />
      <Nav />
      <main id="main" ref={root} className={`dp dp--${k}`}>
        <section className="dp-hero" aria-labelledby="dp-title">
          <div className="container">
            <p className="label rv">Nexa {d.name}</p>
            <p className="dp-hero__cat rv">{c.cat}</p>
            <h1 className="dp-hero__title rv" id="dp-title">{c.title[0]} <span className="serif ctrl">{c.title[1]}</span></h1>
            <p className="lead rv">{c.lead}</p>
            <div className="dp-hero__cta rv">
              <a href="#contacto" className="btn btn--solid" onClick={() => track("cta_click", { cta: `${k}_hero` })}>{L("Hablemos de tu proyecto", "Vamos falar do seu projeto")} <span className="arr">→</span></a>
              <a href="#que-hacemos" className="btn btn--line">{L("Qué hacemos", "O que fazemos")}</a>
            </div>
          </div>
        </section>

        <section className="dp-sec" id="que-hacemos" aria-labelledby="dp-what">
          <div className="container">
            <h2 className="h2 dp-h2" id="dp-what">{L("Qué", "O que")} <span className="serif ctrl">{L("hacemos.", "fazemos.")}</span></h2>
            <List items={c.items} cols={c.items.length > 4 ? 3 : 2} />
          </div>
        </section>

        {k === "experience" && (
          <section className="dp-sec dp-demo" aria-labelledby="dp-demo">
            <div className="container dp-demo__grid">
              <div>
                <h2 className="h2 dp-h2" id="dp-demo">{c.demoTitle[0]} <span className="serif ctrl">{c.demoTitle[1]}</span></h2>
                <p className="lead">{c.demoLead}</p>
              </div>
              <ExperienceDemo />
            </div>
          </section>
        )}
        {k === "systems" && (
          <section className="dp-sec dp-demo" aria-labelledby="dp-demo">
            <div className="container dp-demo__grid">
              <div>
                <h2 className="h2 dp-h2" id="dp-demo">{c.demoTitle[0]} <span className="serif ctrl">{c.demoTitle[1]}</span></h2>
                <p className="lead">{c.demoLead}</p>
              </div>
              <SystemsDemo />
            </div>
          </section>
        )}

        {k === "intelligence" && <Flow />}

        <section className="dp-sec" aria-labelledby="dp-block">
          <div className="container">
            <h2 className="h2 dp-h2" id="dp-block">{c.blockTitle[0]} <span className="serif ctrl">{c.blockTitle[1]}</span></h2>
            <List items={c.block} cols={2} />
          </div>
        </section>

        {k === "intelligence" && (
          <>
            <Simulator />
            <section className="dp-sec" aria-labelledby="dp-examples">
              <div className="container">
                <h2 className="h2 dp-h2" id="dp-examples">{L("Ejemplos", "Exemplos")} <span className="serif ctrl">{L("prácticos.", "práticos.")}</span></h2>
                <p className="lead">{L("Situaciones habituales donde la automatización suele ayudar. Cada caso se evalúa antes de proponer una solución.", "Situações comuns em que a automação costuma ajudar. Cada caso é avaliado antes de propor uma solução.")}</p>
                <List items={examples} cols={2} />
              </div>
            </section>
            <Impact />
          </>
        )}

        <section className="dp-sec dp-others" aria-label={L("Otras especialidades", "Outras especialidades")}>
          <div className="container">
            <p className="dp-others__label">{L("Las tres especialidades se pueden combinar en un mismo proyecto.", "As três especialidades podem ser combinadas no mesmo projeto.")}</p>
            <div className="dp-others__grid">
              {others.map((o) => (
                <a key={o.key} href={href(o.path)}>
                  <b>Nexa {o.name}</b>
                  <small>{L(o.es, o.pt)}</small>
                  <span aria-hidden>→</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <Contact need={c.need} />
      </main>
      <Footer />
    </>
  );
}
