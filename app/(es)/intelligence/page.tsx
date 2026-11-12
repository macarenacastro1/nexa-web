import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("es", "/intelligence/", "Nexa Intelligence · Automatización de procesos e inteligencia artificial", "Automatizamos procesos, integramos herramientas y creamos asistentes inteligentes, con revisión humana donde hace falta.");

export default function Page() {
  return <DivisionPage k="intelligence" />;
}
