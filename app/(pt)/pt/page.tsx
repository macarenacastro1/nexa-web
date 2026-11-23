import CleanHome from "@/components/v2/CleanHome";
import "@/components/v2/v2.css";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "pt",
  "/",
  "The Nexa Company · Tecnologia, design e transformação digital",
  "Estúdio de tecnologia, design e transformação digital. Criamos experiências web, sistemas sob medida e automações para melhorar a forma como você vende e trabalha.",
);

export default function Page() {
  return <CleanHome variant="nx" />;
}
