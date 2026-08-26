import type { Metadata } from "next";
import OrganiserLandingPage from "@/components/OrganiserLandingPage";

const title = "Organiser son entreprise et gagner du temps | Demaa";
const description =
  "Un diagnostic gratuit puis une mise en place accompagnée pour simplifier votre organisation et rendre votre entreprise moins dépendante de vous.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/organiser" },
  openGraph: {
    title,
    description,
    url: "/organiser",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function OrganiserPage() {
  return <OrganiserLandingPage />;
}
