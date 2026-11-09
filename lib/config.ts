// Cambiá estos datos en un solo lugar
export const CONFIG = {
  brand: "NEXA",
  brandFull: "NEXA Automations",
  whatsapp: "5491100000000", // código de país + número, sin + ni espacios
  whatsappText: "Hola! Quiero ordenar y automatizar mi negocio 🚀",
};
export const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappText)}`;
