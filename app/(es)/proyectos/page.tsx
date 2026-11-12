import ProjectsPage from "@/components/pages/ProjectsPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("es", "/proyectos/", "Proyectos · The Nexa Company", "Proyectos y conceptos de The Nexa Company, con el estado real de cada uno: concepto, prototipo, en desarrollo o publicado.");

export default function Page() {
  return <ProjectsPage />;
}
