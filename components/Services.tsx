"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    key: "web", name: "Páginas web inteligentes",
    pitch: "Webs que no solo se ven bien: atienden, cotizan, agendan y venden solas, las 24 horas.",
    feats: ["Asistente con IA entrenado con tu negocio", "Turnos y reservas sincronizados con tu calendario", "Cotizador automático y pagos online", "Formularios que califican y te avisan por WhatsApp"],
  },
  {
    key: "wa", name: "Bots de atención en WhatsApp",
    pitch: "Un asistente en tu WhatsApp que entiende, responde y toma pedidos. Deriva a una persona cuando hace falta.",
    feats: ["Respuestas naturales en segundos", "Catálogo, precios y stock dentro del chat", "Pedidos, turnos y links de pago", "Integrado con tu CRM o planillas"],
  },
  {
    key: "sys", name: "Sistemas a medida y automatizaciones",
    pitch: "Plataformas internas que conectan pedidos, stock, clientes, facturas y reportes en un solo lugar.",
    feats: ["Dashboards en tiempo real", "Procesos que se ejecutan solos entre áreas", "Integración con ERP, tienda y herramientas actuales", "Roles, permisos y trazabilidad"],
  },
  {
    key: "vis", name: "Imágenes y recursos visuales con IA",
    pitch: "Contenido profesional para redes y anuncios con la identidad de tu marca, en una fracción del tiempo.",
    feats: ["Fotos de producto generadas con IA", "Posts, carruseles y piezas para anuncios", "Reels y videos cortos", "Calendario de publicación"],
  },
];

function Visual({ k }: { k: string }) {
  if (k === "web")
    return (
      <div className="sv-browser">
        <div className="sv-browser__bar"><i /><i /><i /><span>tunegocio.com</span></div>
        <div className="sv-browser__body">
          <div className="sv-hero"><b /><b /><span /></div>
          <div className="sv-cards"><span /><span /><span /></div>
          <div className="sv-chat">
            <div className="sv-chat__head"><i />Asistente · en línea</div>
            <p className="in">¿Tienen turno el jueves?</p>
            <p className="out">Sí 🙌 Jueves 17:30 o 18:15. ¿Cuál te reservo?</p>
            <p className="in">17:30</p>
            <p className="conf">✓ Turno reservado · confirmación enviada</p>
          </div>
        </div>
      </div>
    );
  if (k === "wa")
    return (
      <div className="sv-phone">
        <div className="sv-phone__head"><span className="av">N</span><div><b>Tu negocio</b><small>en línea</small></div></div>
        <div className="sv-phone__body">
          <p className="in">Hola! Tienen la campera negra en M?</p>
          <p className="out">¡Hola! Sí, nos quedan 3 en talle M. Sale $64.900. ¿Te la separo?</p>
          <p className="in">Dale! Envío a Porto Alegre?</p>
          <p className="out">Claro, llega en 4 días hábiles. Te paso el link de pago 👇</p>
          <p className="out link">pagar.tunegocio.com/4812</p>
        </div>
      </div>
    );
  if (k === "sys")
    return (
      <div className="sv-sys">
        <div className="sv-sys__kpis">
          <div><small>Pedidos hoy</small><b>128</b></div>
          <div><small>Stock crítico</small><b>3</b></div>
          <div><small>Facturas</small><b>41</b></div>
        </div>
        <div className="sv-flow">
          {["Pedido", "Stock", "Factura", "Producción"].map((s, i) => (
            <span key={s} style={{ display: "contents" }}>{i > 0 && <i />}<span>{s}</span></span>
          ))}
        </div>
        <div className="sv-rows">
          {[["#2044", "Moda Norte", "En producción"], ["#2043", "Textil Andes", "Facturado"], ["#2042", "Loja Rio", "Entregado"]].map((r) => (
            <div key={r[0]}><span>{r[0]}</span><span>{r[1]}</span><em>{r[2]}</em></div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="sv-gal">
      {["linear-gradient(160deg,#2de2d0,#0b3b3a)", "linear-gradient(160deg,#f2f3f5,#9aa3ad)", "linear-gradient(160deg,#1b1f24,#4c8dff)", "radial-gradient(circle at 30% 30%,#2bf59c,#0a2a1e)", "linear-gradient(160deg,#ff9a8b,#3a1512)", "linear-gradient(160deg,#13161a,#2de2d0)"].map((g, i) => (
        <span key={i} style={{ background: g, animationDelay: `${i * 0.08}s` }}><em>{["Post", "Producto", "Anuncio", "Reel", "Carrusel", "Story"][i]}</em></span>
      ))}
    </div>
  );
}

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc .rv", { opacity: 0, y: 30, stagger: 0.08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="svc" id="servicios" ref={root} aria-label="Servicios">
      <div className="container">
        <div className="svc__head">
          <div>
            <p className="label rv">Servicios</p>
            <h2 className="h2 rv">What we build.<br /><span className="serif" style={{ color: "var(--mute)" }}>Four ways to work smart.</span></h2>
          </div>
          <p className="lead rv">Cada proyecto se diseña a medida. Estos son los cuatro servicios con los que más empresas empiezan.</p>
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
            <div key={SERVICES[open].key} className="svc__stage"><Visual k={SERVICES[open].key} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
