import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

const title = "Systèmes opérationnels par métier | Demaa";
const description =
  "Trouvez le système opérationnel de votre activité avec des process concrets, des outils recommandés et un tableau Google Sheets prêt à utiliser.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/kits-operationnels",
  },
  openGraph: {
    title,
    description,
    url: "/kits-operationnels",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function OperationalKitsPage() {
  return <SystemsHubPage />;
}
