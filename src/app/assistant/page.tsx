import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantCreditsClient from "@/components/AssistantCreditsClient";

const assistantFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Est-ce un abonnement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Vous achetez des crédits, sans abonnement. Vous les utilisez selon vos besoins.",
      },
    },
    {
      "@type": "Question",
      name: "Dois-je choisir les tâches maintenant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Vous choisissez seulement vos crédits. Les premières tâches sont définies au démarrage, selon ce qui vous fait perdre le plus de temps.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je mélanger plusieurs besoins ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Vous pouvez utiliser vos crédits pour une seule mission ou les répartir entre facturation, contenu, prospection, subventions ou appels d'offres.",
      },
    },
    {
      "@type": "Question",
      name: "Comment sont consommés les crédits ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les crédits sont consommés selon le temps réellement passé sur les tâches validées.",
      },
    },
    {
      "@type": "Question",
      name: "Que se passe-t-il si je n'utilise pas tout ou si une tâche dépasse ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les crédits non utilisés restent disponibles pour d'autres tâches. Si une tâche demande plus de temps que prévu, on vous prévient avant de continuer.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je commencer petit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Vous pouvez commencer avec 250 crédits pour tester sur une première série de tâches.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Assistant à la demande pour TPE - Demaa",
  description:
    "Déléguez vos tâches opérationnelles depuis WhatsApp avec des crédits assistant : facturation, contenu, prospection, subventions et suivi administratif.",
  alternates: {
    canonical: "/assistant",
  },
  openGraph: {
    title: "Assistant à la demande pour TPE - Demaa",
    description:
      "Déléguez vos tâches opérationnelles depuis WhatsApp avec des crédits assistant : facturation, contenu, prospection, subventions et suivi administratif.",
    url: "/assistant",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default function AssistantPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(assistantFaqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <AssistantCreditsClient />
      </main>
    </>
  );
}
