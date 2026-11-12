import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("es", "/systems/", "Nexa Systems · Software, sistemas de gestión y dashboards a medida", "Desarrollamos aplicaciones web, sistemas de gestión, dashboards y portales para centralizar información y organizar operaciones.");

export default function Page() {
  return <DivisionPage k="systems" />;
}
