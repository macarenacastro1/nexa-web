"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useL } from "@/lib/i18n";
import type { Pick } from "./chaos/windows";

gsap.registerPlugin(ScrollTrigger);

const getServices = (L: Pick) => [
  {
    key: "web", name: L("Páginas web inteligentes", "Sites inteligentes"),
    pitch: L("Webs que no solo se ven bien: atienden, cotizan, agendan y venden solas, las 24 horas.", "Sites que não só são bonitos: atendem, orçam, agendam e vendem sozinhos, 24 horas por dia."),
    feats: L(
      ["Asistente con IA entrenado con tu negocio", "Turnos y reservas sincronizados con tu calendario", "Cotizador automático y pagos online", "Formularios que califican y te avisan"],
      ["Assistente com IA treinado no seu negócio", "Agendamentos sincronizados com sua agenda", "Orçamento automático e pagamento online", "Formulários que qualificam e avisam você"],
    ),
  },
  {
    key: "wa", name: L("Asistentes de atención en WhatsApp", "Assistentes de atendimento no WhatsApp"),
    pitch: L("Un asistente en tu WhatsApp que entiende, responde y toma pedidos. Deriva a una persona cuando hace falta.", "Um assistente no seu WhatsApp que entende, responde e recebe pedidos. Passa para uma pessoa quando precisa."),
    feats: L(
      ["Respuestas naturales en segundos", "Catálogo, precios y stock dentro del chat", "Pedidos, turnos y links de pago", "Integrado con tu CRM o planillas"],
      ["Respostas naturais em segundos", "Catálogo, preços e estoque dentro do chat", "Pedidos, agendamentos e links de pagamento", "Integrado ao seu CRM ou planilhas"],
    ),
  },
  {
    key: "sys", name: L("Sistemas a medida y automatizaciones", "Sistemas sob medida e automações"),
    pitch: L("Plataformas internas que conectan pedidos, stock, clientes, facturas y reportes en un solo lugar.", "Plataformas internas que conectam pedidos, estoque, clientes, notas e relatórios em um só lugar."),
    feats: L(
      ["Tableros en tiempo real", "Procesos que se ejecutan solos entre áreas", "Integración con ERP, tienda y herramientas actuales", "Roles, permisos y trazabilidad"],
      ["Painéis em tempo real", "Processos que rodam sozinhos entre áreas", "Integração com ERP, loja e ferramentas atuais", "Perfis, permissões e rastreabilidade"],
    ),
  },
  {
    key: "vis", name: L("Imágenes y recursos visuales con IA", "Imagens e recursos visuais com IA"),
    pitch: L("Contenido profesional para redes y anuncios con la identidad de tu marca, en una fracción del tiempo.", "Conteúdo profissional para redes e anúncios com a identidade da sua marca, em uma fração do tempo."),
    feats: L(
      ["Fotos de producto generadas con IA", "Posts, carruseles y piezas para anuncios", "Reels y videos cortos", "Calendario de publicación"],
      ["Fotos de produto geradas com IA", "Posts, carrosséis e peças para anúncios", "Reels e vídeos curtos", "Calendário de publicação"],
    ),
  },
];

function Visual({ k, L }: { k: string; L: Pick }) {
  if (k === "web")
    return (
      <div className="sv-browser">
        <div className="sv-browser__bar"><i /><i /><i /><span>{L("tunegocio.com", "seunegocio.com.br")}</span></div>
        <div className="sv-browser__body">
          <div className="sv-hero"><b /><b /><span /></div>
          <div className="sv-cards"><span /><span /><span /></div>
          <div className="sv-chat">
            <div className="sv-chat__head"><i />{L("Asistente · en línea", "Assistente · online")}</div>
            <p className="in">{L("¿Tienen turno el jueves?", "Tem horário na quinta?")}</p>
            <p className="out">{L("Sí 🙌 Jueves 17:30 o 18:15. ¿Cuál te reservo?", "Sim 🙌 Quinta 17:30 ou 18:15. Qual eu reservo?")}</p>
            <p className="in">17:30</p>
            <p className="conf">{L("✓ Turno reservado · confirmación enviada", "✓ Horário reservado · confirmação enviada")}</p>
          </div>
        </div>
      </div>
    );
  if (k === "wa")
    return (
      <div className="sv-phone">
        <div className="sv-phone__head"><span className="av">N</span><div><b>{L("Tu negocio", "Seu negócio")}</b><small>{L("en línea", "online")}</small></div></div>
        <div className="sv-phone__body">
          <p className="in">{L("Hola! Tienen la campera negra en M?", "Oi! Tem a jaqueta preta no M?")}</p>
          <p className="out">{L("¡Hola! Sí, nos quedan 3 en talle M. Sale $64.900. ¿Te la separo?", "Oi! Sim, restam 3 no tamanho M. Sai por R$ 389. Separo pra você?")}</p>
          <p className="in">{L("Dale! Envío a Porto Alegre?", "Pode ser! Entrega em Porto Alegre?")}</p>
          <p className="out">{L("Claro, llega en 4 días hábiles. Te paso el link de pago 👇", "Claro, chega em 4 dias úteis. Te mando o link de pagamento 👇")}</p>
          <p className="out link">{L("pagar.tunegocio.com/4812", "pagar.seunegocio.com.br/4812")}</p>
        </div>
      </div>
    );
  if (k === "sys")
    return (
      <div className="sv-sys">
        <div className="sv-sys__kpis">
          <div><small>{L("Pedidos hoy", "Pedidos hoje")}</small><b>128</b></div>
          <div><small>{L("Stock crítico", "Estoque crítico")}</small><b>3</b></div>
          <div><small>{L("Facturas", "Notas")}</small><b>41</b></div>
        </div>
        <div className="sv-flow">
          {L(["Pedido", "Stock", "Factura", "Producción"], ["Pedido", "Estoque", "Nota", "Produção"]).map((s, i) => (
            <span key={s} style={{ display: "contents" }}>{i > 0 && <i />}<span>{s}</span></span>
          ))}
        </div>
        <div className="sv-rows">
          {L([["#2044", "Moda Norte", "En producción"], ["#2043", "Textil Andes", "Facturado"], ["#2042", "Loja Rio", "Entregado"]], [["#2044", "Moda Norte", "Em produção"], ["#2043", "Têxtil Andes", "Faturado"], ["#2042", "Loja Rio", "Entregue"]]).map((r) => (
            <div key={r[0]}><span>{r[0]}</span><span>{r[1]}</span><em>{r[2]}</em></div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="sv-gal">
      {["linear-gradient(160deg,#2de2d0,#0b3b3a)", "linear-gradient(160deg,#f2f3f5,#9aa3ad)", "linear-gradient(160deg,#1b1f24,#4c8dff)", "radial-gradient(circle at 30% 30%,#2bf59c,#0a2a1e)", "linear-gradient(160deg,#ff9a8b,#3a1512)", "linear-gradient(160deg,#13161a,#2de2d0)"].map((g, i) => (
        <span key={i} style={{ background: g, animationDelay: `${i * 0.08}s` }}><em>{L(["Post", "Producto", "Anuncio", "Reel", "Carrusel", "Story"], ["Post", "Produto", "Anúncio", "Reel", "Carrossel", "Story"])[i]}</em></span>
      ))}
    </div>
  );
}

export default function Services() {
  const L = useL();
  const SERVICES = getServices(L);
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="svc" id="servicios" ref={root} aria-label={L("Servicios", "Serviços")}>
      <div className="container">
        <div className="svc__head">
          <div>
            <p className="label rv">{L("Servicios", "Serviços")}</p>
            <h2 className="h2 rv">{L("Lo que construimos.", "O que construímos.")}<br /><span className="serif ctrl">{L("Cuatro formas de trabajar inteligente.", "Quatro formas de trabalhar com inteligência.")}</span></h2>
          </div>
          <p className="lead rv">{L("Cada proyecto se diseña a medida. Estos son los cuatro servicios con los que más empresas empiezan.", "Cada projeto é feito sob medida. Estes são os quatro serviços com que a maioria das empresas começa.")}</p>
        </div>

        <div className="svc__body rv">
          <ul className="svc__list">
            {SERVICES.map((s, i) => (
              <li key={s.key} className={`svc__item${open === i ? " on" : ""}`}>
                <button className="svc__btn" aria-expanded={open === i} onClick={() => setOpen(i)} onMouseEnter={() => setOpen(i)}>
                  <span className="svc__name">{s.name}</span>
                  <span className="svc__plus" aria-hidden>+</span>
                </button>
                <div className="svc__detail">
                  <div>
                    <p>{s.pitch}</p>
                    <ul>{s.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="svc__visual" aria-hidden>
            <div key={SERVICES[open].key} className="svc__stage"><Visual k={SERVICES[open].key} L={L} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
