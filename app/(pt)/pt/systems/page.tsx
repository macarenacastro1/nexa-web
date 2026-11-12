import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("pt", "/systems/", "Nexa Systems · Software, sistemas de gestão e dashboards sob medida", "Desenvolvemos aplicações web, sistemas de gestão, dashboards e portais para centralizar informações e organizar operações.");

export default function Page() {
  return <DivisionPage k="systems" />;
}
