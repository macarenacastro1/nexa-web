"use client";
import { useEffect, useRef, useState } from "react";
import { CALC_KEY, CONFIG, CONSENT_VERSION, LEAD_ENDPOINT, type CalcSummary } from "@/lib/config";
import { sound } from "@/lib/sound";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
);

function readCalc(): CalcSummary | null {
  try {
    const raw = sessionStorage.getItem(CALC_KEY);
    return raw ? (JSON.parse(raw) as CalcSummary) : null;
  } catch {
    return null;
  }
}

function utm() {
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "content", "term"]) {
    const v = q.get(`utm_${k}`);
    if (v) out[k] = v;
  }
  return out;
}

export default function Contact() {
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const msgRef = useRef<HTMLTextAreaElement>(null);

  // Si viene de la calculadora, sugerimos el mensaje con sus números
  useEffect(() => {
    const fill = (c: CalcSummary | null) => {
      const el = msgRef.current;
      if (!c || !el || el.value.trim()) return;
      el.value = `Usé la calculadora: ${c.tasks} tareas manuales por semana, ${c.mins} min cada una, ${c.pct}% automatizable. Me da unas ${c.hours_week} h por semana para recuperar.`;
    };
    fill(readCalc());
    const onCalc = (e: Event) => fill((e as CustomEvent<CalcSummary>).detail);
    window.addEventListener(CALC_KEY, onCalc);
    return () => window.removeEventListener(CALC_KEY, onCalc);
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    setError("");
    let ok = true;
    form.querySelectorAll<HTMLInputElement>("input[required], select[required], textarea[required]").forEach((f) => {
      const valid = f.type === "checkbox" ? f.checked : f.checkValidity() && f.value.trim() !== "";
      const fld = f.closest(".field")!;
      fld.classList.toggle("err", !valid);
      const s = fld.querySelector("small");
      if (s) s.textContent = valid ? "" : f.type === "email" ? "Ingresá un email válido" : f.type === "checkbox" ? "Necesitamos tu autorización para responderte" : "Completá este campo";
      if (!valid) ok = false;
    });
    if (!ok) return;

    const v = (id: string) => (form.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "").trim();
    setSending(true);
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: v("f-n"),
          company: v("f-c"),
          email: v("f-e"),
          phone: v("f-w"),
          need: v("f-s"),
          message: v("f-m"),
          consent: form.querySelector<HTMLInputElement>("#f-ok")?.checked === true,
          consent_version: CONSENT_VERSION,
          website: v("f-web"),
          page: window.location.pathname,
          utm: utm(),
          calculator: readCalc(),
        }),
      });
      if (res.status === 429) throw new Error("Recibimos varias consultas seguidas. Probá de nuevo en un rato o escribinos por mail.");
      if (!res.ok) throw new Error("No pudimos enviar tu consulta.");
      form.reset();
      try { sessionStorage.removeItem(CALC_KEY); } catch { /* nada */ }
      sound.chime();
      setToast("¡Listo! Recibimos tu consulta. Te escribimos en menos de 24 h para coordinar el diagnóstico.");
      setTimeout(() => setToast(""), 5000);
    } catch (err) {
      setError(err instanceof Error && err.message.startsWith("Recibimos") ? err.message : "No pudimos enviar tu consulta. Probá de nuevo o escribinos por mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact" id="contacto" aria-label="Contacto">
      <div className="container contact__grid">
        <div>
          <p className="label">Diagnóstico gratis</p>
          <h2 className="h2">Let&apos;s find what<br /><span className="serif" style={{ color: "var(--mute)" }}>to automate first.</span></h2>
          <p className="lead">En una llamada de 30 minutos revisamos tus procesos y te decimos qué conviene automatizar primero, cuánto tiempo te ahorra y cuánto cuesta.</p>
          <ul className="trust">
            <li><Check /><div>Sin compromiso<small>Si no hay nada que valga la pena automatizar, te lo decimos.</small></div></li>
            <li><Check /><div>Respuesta en menos de 24 h<small>Hablás con personas, no con un formulario.</small></div></li>
            <li><Check /><div>Argentina y Brasil<small>Trabajamos con empresas de Argentina y Brasil, en español y portugués.</small></div></li>
            <li><Check /><div>Caso real: Tex Hub para Texbros<small>Un sistema a medida que centraliza toda su operación.</small></div></li>
          </ul>
          <a href={`mailto:${CONFIG.contactEmail}`} className="btn btn--line" style={{ marginTop: 30 }}>Prefiero escribir por mail <span className="arr">→</span></a>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <h3>Agendá tu diagnóstico<small>Completá tus datos y te contactamos.</small></h3>
          <div className="field"><label htmlFor="f-n">Nombre</label><input id="f-n" required autoComplete="name" /><small /></div>
          <div className="field"><label htmlFor="f-c">Empresa</label><input id="f-c" required autoComplete="organization" /><small /></div>
          <div className="field"><label htmlFor="f-e">Email</label><input id="f-e" type="email" required autoComplete="email" /><small /></div>
          <div className="field"><label htmlFor="f-w">WhatsApp o teléfono <span style={{ opacity: .6 }}>(opcional)</span></label><input id="f-w" type="tel" placeholder="+54 9 11 …" autoComplete="tel" /><small /></div>
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
          <div className="field field--full"><label htmlFor="f-m">Contanos brevemente</label><textarea id="f-m" ref={msgRef} rows={4} required /><small /></div>
          <div className="field field--full" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="f-web">No completar</label><input id="f-web" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="field field--full">
            <label htmlFor="f-ok" style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", lineHeight: 1.45 }}>
              <input id="f-ok" type="checkbox" required style={{ width: 16, height: 16, marginTop: 2, flex: "none", accentColor: "var(--teal)" }} />
              <span>Acepto que NEXA guarde estos datos para responder mi consulta y coordinar el diagnóstico. Puedo pedir que los borren cuando quiera escribiendo a {CONFIG.contactEmail} (Ley 25.326).</span>
            </label>
            <small />
          </div>
          {error && <p className="field--full" role="alert" style={{ color: "var(--coral-2)", fontSize: 13.5, margin: 0 }}>{error}</p>}
          <button className="btn btn--solid field--full" type="submit" disabled={sending} aria-busy={sending}>{sending ? "Enviando…" : <>Agendar diagnóstico gratis <span className="arr">→</span></>}</button>
        </form>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
    </section>
  );
}
