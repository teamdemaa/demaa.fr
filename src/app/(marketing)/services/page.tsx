import type { Metadata } from "next";
import ServicesLandingPage from "@/components/ServicesLandingPage";
import {
  buildServicesIndexJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";

const title = "Services pour organiser votre entreprise et gagner du temps | Demaa";
const description =
  "Des services concrets pour gagner du temps et faire en sorte que votre entreprise dépende moins de vous.";

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeServicesJsonLd(buildServicesIndexJsonLd()),
        }}
      />
      <ServicesLandingPage />
    </>
  );
}
