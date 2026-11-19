import {
  siGmail, siGoogleanalytics, siGooglecalendar, siGooglesheets, siHubspot, siInstagram, siMercadopago, siMeta,
  siNextdotjs, siOdoo, siOpenai, siSap, siShopify, siStripe, siSupabase, siWhatsapp, siWoocommerce,
} from "simple-icons";

/* Logos de herramientas e integraciones (Simple Icons, CC0). Las marcas que no tienen
   ícono libre (Tango Gestión, Tiendanube) se muestran como texto. */
type Brand = { title: string; path?: string; hex: string; group: string };
const B = (i: { title: string; path: string; hex: string }, group: string): Brand => ({ title: i.title, path: i.path, hex: `#${i.hex}`, group });

export const BRANDS = {
  sap: B(siSap, "ERP"),
  odoo: B(siOdoo, "ERP"),
  tango: { title: "Tango Gestión", hex: "#e2231a", group: "ERP" } as Brand,
  shopify: B(siShopify, "E-commerce"),
  woo: B(siWoocommerce, "E-commerce"),
  tiendanube: { title: "Tiendanube", hex: "#2c3357", group: "E-commerce" } as Brand,
  mp: B(siMercadopago, "Pagos"),
  stripe: B(siStripe, "Pagos"),
  whatsapp: B(siWhatsapp, "Mensajería"),
  gmail: B(siGmail, "Mensajería"),
  instagram: B(siInstagram, "Redes"),
  meta: B(siMeta, "Publicidad"),
  sheets: B(siGooglesheets, "Datos"),
  calendar: B(siGooglecalendar, "Agenda"),
  analytics: B(siGoogleanalytics, "Datos"),
  hubspot: B(siHubspot, "CRM"),
  supabase: B(siSupabase, "Base de datos"),
  next: B(siNextdotjs, "Web"),
  openai: B(siOpenai, "IA"),
} satisfies Record<string, Brand>;
export type BrandKey = keyof typeof BRANDS;

/** Ícono de la marca. color: "brand" (su color), "mono" (color del texto) o un color fijo. */
export function BrandIcon({ k, size = 20, color = "brand" }: { k: BrandKey; size?: number; color?: "brand" | "mono" | string }) {
  const b = BRANDS[k];
  const fill = color === "brand" ? (b.hex === "#000000" ? "currentColor" : b.hex) : color === "mono" ? "currentColor" : color;
  if (!b.path) {
    const initials = b.title.split(" ").map((w) => w[0]).join("").slice(0, 2);
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={b.title}>
        <rect width="24" height="24" rx="6" fill={fill} />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">{initials}</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={b.title}>
      <path d={b.path} fill={fill} />
    </svg>
  );
}
