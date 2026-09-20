import type { Metadata } from "next";
import BusinessSaleLandingPage from "@/components/BusinessSaleLandingPage";

const title = "Vendre son entreprise | sini";
const description =
  "Présentez gratuitement votre entreprise à des repreneurs dont le projet peut correspondre et organisez les premières mises en relation avec sini.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: "/transmettre",
    siteName: "sini",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary", title, description },
};

export default function TransmettrePage() {
  return <BusinessSaleLandingPage />;
}
