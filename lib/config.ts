// Cambiá estos datos en un solo lugar
export const CONFIG = {
  brand: "NEXA",
  brandFull: "NEXA",
  contactEmail: "hello@thenexacompany.com",
};

// El formulario de contacto guarda cada consulta en Nexa OS (CRM).
export const LEAD_ENDPOINT = "https://ufipxfhlcedbvnociutw.supabase.co/functions/v1/web-lead";

// Versión del texto de consentimiento que acepta el visitante (Ley 25.326).
export const CONSENT_VERSION = "web-2026-11";

// La calculadora deja acá su resumen para sumarlo a la consulta.
export const CALC_KEY = "nexa:calc";
export type CalcSummary = { tasks: number; mins: number; pct: number; hours_week: number };
