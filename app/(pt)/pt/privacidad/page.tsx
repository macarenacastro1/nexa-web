import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("pt", "/privacidad/", "Privacidade e dados pessoais · The Nexa Company", "Como a The Nexa Company usa e protege os dados que você deixa no formulário de contato. LGPD.");

export default function Page() {
  return <PrivacyPage />;
}
