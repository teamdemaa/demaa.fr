import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PartnerKeyDirectoryClient from "@/components/PartnerKeyDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaPartnerKeys, partnerKeyCategories } from "@/lib/partner-key-catalog";

export const metadata: Metadata = {
  title: "Annuaire partenaires clés TPE - Demaa",
  description:
    "Explorez les partenaires clés utiles pour structurer une TPE, piloter les chiffres et sécuriser les décisions importantes.",
  alternates: {
    canonical: "/annuaire-partenaires-cles",
  },
  openGraph: {
    title: "Annuaire partenaires clés TPE - Demaa",
    description:
      "Explorez les partenaires clés utiles pour structurer une TPE, piloter les chiffres et sécuriser les décisions importantes.",
    url: "/annuaire-partenaires-cles",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire partenaires clés TPE - Demaa",
    description:
      "Explorez les partenaires clés utiles pour structurer une TPE, piloter les chiffres et sécuriser les décisions importantes.",
  },
};

type AnnuairePartenairesClesPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuairePartenairesClesPage({
  searchParams,
}: AnnuairePartenairesClesPageProps) {
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
        <PartnerKeyDirectoryClient
          partners={getDemaaPartnerKeys()}
          categories={partnerKeyCategories}
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
