import HomePage from "@/components/pages/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "es",
  "/",
  "The Nexa Company · Tecnología, diseño y transformación digital",
  "Estudio de tecnología, diseño y transformación digital. Diseñamos experiencias web, sistemas a medida y automatizaciones para mejorar la forma en que vendés y trabajás.",
);

export default function Page() {
  return <HomePage />;
}
