import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("es", "/privacidad/", "Privacidad y datos personales · The Nexa Company", "Cómo The Nexa Company usa y protege los datos que dejás en el formulario de contacto. Ley 25.326.");

export default function Page() {
  return <PrivacyPage />;
}
