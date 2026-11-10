"use client";
import { useState } from "react";
import { waUrl } from "@/lib/config";
import { sound } from "@/lib/sound";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
);

export default function Contact() {
  const [toast, setToast] = useState("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    let ok = true;
    form.querySelectorAll<HTMLInputElement>("input, select, textarea").forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== "";
      const fld = f.closest(".field")!;
      fld.classList.toggle("err", !valid);
      const s = fld.querySelector("small");
      if (s) s.textContent = valid ? "" : f.type === "email" ? "Ingresá un email válido" : "Completá este campo";
      if (!valid) ok = false;
    });
    if (!ok) return;
    form.reset();
    sound.chime();
    setToast("¡Gracias! Te escribimos en menos de 24 h para coordinar el diagnóstico.");
    setTimeout(() => setToast(""), 4000);
  };

  return (
    <section className="contact" id="contacto" aria-label="Contacto">
      <div className="container contact__grid">
        <div>
          <p className="label"><b>→</b> Diagnóstico gratis</p>
          <h2 className="h2">Let&apos;s find what<br /><span className="serif" style={{ color: "var(--mute)" }}>to automate first.</span></h2>
          <p className="lead">En una llamada de 30 minutos revisamos tus procesos y te decimos qué conviene automatizar primero, cuánto tiempo te ahorra y cuánto cuesta.</p>
          <ul className="trust">
            <li><Check /><div>Sin compromiso<small>Si no hay nada que valga la pena automatizar, te lo decimos.</small></div></li>
            <li><Check /><div>Respuesta en menos de 24 h<small>Hablás con personas, no con un formulario.</small></div></li>
            <li><Check /><div>Hecho en Argentina<small>Trabajamos con empresas de todo el país.</small></div></li>
            <li><Check /><div>Caso real: Tex Hub para Texbros<small>Un sistema a medida que centraliza toda su operación.</small></div></li>
          </ul>
          <a href={waUrl} target="_blank" rel="noopener" className="btn btn--line" style={{ marginTop: 30 }}>Prefiero escribir por WhatsApp <span className="arr">→</span></a>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <h3>Agendá tu diagnóstico<small>Completá tus datos y te contactamos.</small></h3>
          <div className="field"><label htmlFor="f-n">Nombre</label><input id="f-n" required autoComplete="name" /><small /></div>
          <div className="field"><label htmlFor="f-c">Empresa</label><input id="f-c" required autoComplete="organization" /><small /></div>
          <div className="field"><label htmlFor="f-e">Email</label><input id="f-e" type="email" required autoComplete="email" /><small /></div>
          <div className="field"><label htmlFor="f-w">WhatsApp</label><input id="f-w" type="tel" required placeholder="+54 9 11 …" autoComplete="tel" /><small /></div>
          <div className="field field--full"><label htmlFor="f-s">¿Qué te gustaría resolver?</label>
            <select id="f-s" required defaultValue="">
              <option value="" disabled>Elegí una opción</option>
              <option>Procesamiento de facturas</option>
              <option>Clientes y ventas</option>
              <option>Atención al cliente / WhatsApp</option>
              <option>Seguimiento de operaciones</option>
              <option>Integración entre sistemas</option>
              <option>Web inteligente</option>
              <option>Contenido visual con IA</option>
              <option>No sé, quiero asesoramiento</option>
            </select><small />
          </div>
          <div className="field field--full"><label htmlFor="f-m">Contanos brevemente</label><textarea id="f-m" rows={4} required /><small /></div>
          <button className="btn btn--solid field--full" type="submit">Agendar diagnóstico gratis <span className="arr">→</span></button>
        </form>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
    </section>
  );
}
