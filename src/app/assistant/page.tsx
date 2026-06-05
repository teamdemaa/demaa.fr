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
        text: "Non. Vous achetez un ou plusieurs packs assistant, sans abonnement.",
      },
    },
    {
      "@type": "Question",
      name: "Dois-je choisir les tâches maintenant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Vous choisissez le pack adapté, puis les premières tâches sont précisées après paiement.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je mélanger plusieurs packs ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Vous pouvez ajouter plusieurs packs dans le même panier, par exemple structuration, facturation et administratif.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionnent les packs ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les packs horaires incluent un volume d'heures. Les packs subvention et appel d'offre incluent un nombre de dossiers ou réponses simples.",
      },
    },
    {
      "@type": "Question",
      name: "Que se passe-t-il si je n'utilise pas tout ou si une tâche dépasse ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si une tâche demande plus de temps ou sort du cadre du pack, Demaa vous prévient avant de continuer.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je commencer avec un petit pack ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Vous pouvez commencer avec un pack administratif à 250 € ou un pack structuration à 300 €.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Assistant à la demande pour TPE - Demaa",
  description:
    "Déléguez vos tâches opérationnelles depuis WhatsApp avec des packs assistant : structuration, automatisation, facturation, administratif, subventions et appels d'offres.",
  alternates: {
    canonical: "/assistant",
  },
  openGraph: {
    title: "Assistant à la demande pour TPE - Demaa",
    description:
      "Déléguez vos tâches opérationnelles depuis WhatsApp avec des packs assistant : structuration, automatisation, facturation, administratif, subventions et appels d'offres.",
    url: "/assistant",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistant à la demande pour TPE - Demaa",
    description:
      "Déléguez vos tâches opérationnelles depuis WhatsApp avec des packs assistant : structuration, automatisation, facturation, administratif, subventions et appels d'offres.",
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
