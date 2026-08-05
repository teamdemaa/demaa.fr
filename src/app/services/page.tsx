import type { Metadata } from "next";
import ServicesLandingPage from "@/components/ServicesLandingPage";

const title = "Services pour structurer et développer votre entreprise | Demaa";
const description =
  "Des services concrets pour structurer votre activité, la digitaliser et développer votre visibilité.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: {
    title,
    description,
    url: "/services",
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

export default function ServicesPage() {
  return <ServicesLandingPage />;
}
