import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";
import OrganisationAutonomyDiscovery from "@/components/OrganisationAutonomyDiscovery";

export const metadata: Metadata = {
  title: "Organisation pour TPE - Demaa",
  description:
    "Organisez votre entreprise avec les bons systèmes, process et automatisations pour mieux piloter l'activité, déléguer plus sereinement et soutenir une croissance durable.",
  alternates: {
    canonical: "/organisation-automatisation",
  },
  openGraph: {
    title: "Organisation pour TPE - Demaa",
    description:
      "Organisez votre entreprise avec les bons systèmes, process et automatisations pour mieux piloter l'activité, déléguer plus sereinement et soutenir une croissance durable.",
    url: "/organisation-automatisation",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organisation : systèmes, process et automatisations - Demaa",
    description:
      "Organisez votre entreprise avec les bons systèmes, process et automatisations pour mieux piloter l'activité, déléguer plus sereinement et soutenir une croissance durable.",
  },
};

type OrganisationAutomatisationPageProps = {
  searchParams: Promise<{
    retour?: string | string[];
  }>;
};

export default async function OrganisationAutomatisationPage({
  searchParams,
}: OrganisationAutomatisationPageProps) {
  const params = await searchParams;
  const retour = getParamValue(params.retour);
  const backLink =
    retour === "annuaire-services"
      ? {
          href: "/annuaire-services",
          label: "Retour à Déléguer",
        }
      : {
          href: "/",
          label: "Retour à l'accueil",
        };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 md:px-8 md:pt-8">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue/50 transition hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLink.label}
          </Link>
        </section>
        <OrganisationAutonomyDiscovery />
        <AssistantsCatalogClient />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
