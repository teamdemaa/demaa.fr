import ApplicationMetierLandingPage from "@/components/ApplicationMetierLandingPage";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildServicePageJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

const title = "Logiciel métier sur mesure | Demaa";
const description =
  "Demaa crée un logiciel métier sur mesure autour de votre façon de travailler, à partir de 4 500 € HT.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/sur-mesure",
});

function getApplicationService() {
  const service = getCanonicalServiceBySlug("application-metier");
  if (!service) throw new Error("Application métier must exist in the canonical catalog.");
  return service;
}

export default function SurMesurePage() {
  const service = getApplicationService();
  const offer = service.packages[0];
  if (!offer) throw new Error("Application métier must expose a public package.");

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
      <ApplicationMetierLandingPage offer={offer} />
    </>
  );
}
