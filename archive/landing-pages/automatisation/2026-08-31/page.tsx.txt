import MentoratAutomationLandingPage from "@/components/MentoratAutomationLandingPage";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";
import {
  AUTOMATION_ACCOMPANIMENT_PATH,
  mentoratAutomationContent as content,
} from "@/lib/mentorat-automation-content";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { buildServicePageJsonLd, serializeServicesJsonLd } from "@/lib/services-seo";

const title = "Accompagnement à l’automatisation pour TPE et PME | Demaa";
const description =
  "Aidez votre équipe à gagner du temps, automatiser les tâches réellement utiles et maîtriser ses outils au quotidien.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: AUTOMATION_ACCOMPANIMENT_PATH,
});

function getAutomationService() {
  const service = getCanonicalServiceBySlug("automatisation-processus");
  if (!service) throw new Error("Automation accompaniment service must exist in the canonical catalog.");
  return service;
}

export default function AutomationPage() {
  const service = getAutomationService();
  const jsonLd = [
    ...buildServicePageJsonLd(service),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: serializeServicesJsonLd(jsonLd) }}
      />
      <MentoratAutomationLandingPage />
    </>
  );
}
