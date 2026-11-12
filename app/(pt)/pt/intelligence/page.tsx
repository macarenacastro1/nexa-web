import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("pt", "/intelligence/", "Nexa Intelligence · Automação de processos e inteligência artificial", "Automatizamos processos, integramos ferramentas e criamos assistentes inteligentes, com revisão humana onde for preciso.");

export default function Page() {
  return <DivisionPage k="intelligence" />;
}
