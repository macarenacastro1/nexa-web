import ProjectsPage from "@/components/pages/ProjectsPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("pt", "/proyectos/", "Projetos · The Nexa Company", "Projetos e conceitos da The Nexa Company, com o status real de cada um: conceito, protótipo, em desenvolvimento ou publicado.");

export default function Page() {
  return <ProjectsPage />;
}
