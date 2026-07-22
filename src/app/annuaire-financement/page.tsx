import type { Metadata } from "next";
import FinanceDirectoryClient from "@/components/FinanceDirectoryClient";
import Navbar from "@/components/Navbar";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import {
  financeFamilies,
  getDemaaFinanceItems,
} from "@/lib/finance-catalog";

export const metadata: Metadata = {
  title: "Annuaire financement TPE - Demaa",
  description:
    "Explorez les solutions de compte pro avec crédit, d'affacturage, de BFR et de leasing utiles aux TPE.",
  alternates: {
    canonical: "/annuaire-financement",
  },
  openGraph: {
    title: "Annuaire financement TPE - Demaa",
    description:
      "Explorez les solutions de compte pro avec crédit, d'affacturage, de BFR et de leasing utiles aux TPE.",
    url: "/annuaire-financement",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire financement TPE - Demaa",
    description:
      "Explorez les solutions de compte pro avec crédit, d'affacturage, de BFR et de leasing utiles aux TPE.",
  },
};

type AnnuaireFinancementPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireFinancementPage({
  searchParams,
}: AnnuaireFinancementPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/kit-operationnel/${encodeURIComponent(returnEnterprise.slug)}`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <FinanceDirectoryClient
          items={getDemaaFinanceItems()}
          families={financeFamilies}
          initialSearch={getParamValue(params.q) ?? ""}
          returnSystemSlug={retourSysteme ?? undefined}
          backLink={backLink}
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
