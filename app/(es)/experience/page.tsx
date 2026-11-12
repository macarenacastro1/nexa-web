import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("es", "/experience/", "Nexa Experience · Sitios web, e-commerce y diseño UI/UX", "Diseñamos sitios web premium, tiendas online, experiencias interactivas e interfaces que combinan estética, interacción y facilidad de uso.");

export default function Page() {
  return <DivisionPage k="experience" />;
}
