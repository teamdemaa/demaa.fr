import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";
import OrganisationAutonomyDiscovery from "@/components/OrganisationAutonomyDiscovery";

export const metadata: Metadata = {
  title: "Diagnostic organisation pour TPE - Demaa",
  description:
    "Demandez un diagnostic organisation pour identifier les blocages, clarifier les priorités et repérer les besoins les plus utiles pour la suite.",
  alternates: {
    canonical: "/organisation",
  },
  openGraph: {
    title: "Diagnostic organisation pour TPE - Demaa",
    description:
      "Demandez un diagnostic organisation pour identifier les blocages, clarifier les priorités et repérer les besoins les plus utiles pour la suite.",
    url: "/organisation",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnostic organisation pour TPE - Demaa",
    description:
      "Demandez un diagnostic organisation pour identifier les blocages, clarifier les priorités et repérer les besoins les plus utiles pour la suite.",
  },
};

type OrganisationPageProps = {
  searchParams: Promise<{
    retour?: string | string[];
  }>;
};

export default async function OrganisationPage({
  searchParams,
}: OrganisationPageProps) {
  const params = await searchParams;
  const retour = getParamValue(params.retour);
  const backLink =
    retour === "annuaire-services"
      ? {
          href: "/",
          label: "Retour à Déléguer",
        }
      : {
          href: "/systemes",
          label: "Retour aux systèmes",
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
