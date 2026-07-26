import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

const title =
  "Trouvez le système opérationnel de votre entreprise | Demaa";
const description =
  "Choisissez votre activité et découvrez les process, outils, modèles et services utiles pour faire fonctionner votre entreprise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
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

export default async function HomePage() {
  return <SystemsHubPage />;
}
