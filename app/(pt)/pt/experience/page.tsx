import DivisionPage from "@/components/pages/DivisionPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("pt", "/experience/", "Nexa Experience · Sites, e-commerce e design UI/UX", "Criamos sites premium, lojas online, experiências interativas e interfaces que combinam estética, interação e facilidade de uso.");

export default function Page() {
  return <DivisionPage k="experience" />;
}
