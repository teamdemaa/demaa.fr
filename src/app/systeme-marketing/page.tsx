import type { Metadata } from "next";
import EthicalMarketingLandingPage from "@/components/EthicalMarketingLandingPage";

const title = "Votre développement ne devrait pas dépendre uniquement de vous | Demaa";
const description =
  "Demaa construit le système qui aide les bonnes personnes à découvrir votre entreprise, à comprendre votre offre et à rester en lien avec vous.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/systeme-marketing",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title,
    description,
    url: "/systeme-marketing",
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

export default function MarketingSystemPage() {
  return <EthicalMarketingLandingPage />;
}
