import ApplicationMetierLandingPage from "@/components/ApplicationMetierLandingPage";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";
import {
  buildServicePageJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Application métier sur mesure | Demaa";
const description =
  "Gagnez du temps et rendez votre entreprise plus autonome avec une application métier conçue autour de votre façon de travailler.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/application-metier",
});

function getApplicationService() {
  const service = getCanonicalServiceBySlug("application-metier");
  if (!service) throw new Error("Application métier must exist in the canonical catalog.");
  return service;
}

export default function ApplicationMetierPage() {
  const service = getApplicationService();
  const jsonLd = [
    ...buildServicePageJsonLd(service),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeServicesJsonLd(jsonLd),
        }}
      />
      <ApplicationMetierLandingPage />
    </>
  );
}
