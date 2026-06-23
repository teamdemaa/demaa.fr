import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProNetworkDirectoryClient from "@/components/ProNetworkDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaProNetworks, proNetworkCategories } from "@/lib/pro-network-catalog";

export const metadata: Metadata = {
  title: "Annuaire réseaux pro TPE - Demaa",
  description:
    "Explorez les réseaux, organisations, prescripteurs et événements utiles pour développer l’activité d’une TPE.",
  alternates: {
    canonical: "/annuaire-reseaux-pro",
  },
  openGraph: {
    title: "Annuaire réseaux pro TPE - Demaa",
    description:
      "Explorez les réseaux, organisations, prescripteurs et événements utiles pour développer l’activité d’une TPE.",
    url: "/annuaire-reseaux-pro",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire réseaux pro TPE - Demaa",
    description:
      "Explorez les réseaux, organisations, prescripteurs et événements utiles pour développer l’activité d’une TPE.",
  },
};

type AnnuaireReseauxProPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireReseauxProPage({
  searchParams,
}: AnnuaireReseauxProPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=reseaux-pro`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ProNetworkDirectoryClient
          networks={getDemaaProNetworks()}
          categories={proNetworkCategories}
          initialCategory={getParamValue(params.category)}
          initialSearch={getParamValue(params.q) ?? ""}
          backLink={backLink}
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
