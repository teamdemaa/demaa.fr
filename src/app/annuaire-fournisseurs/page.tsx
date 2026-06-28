import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SupplierDirectoryClient from "@/components/SupplierDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaSuppliers, supplierFamilies } from "@/lib/supplier-catalog";

export const metadata: Metadata = {
  title: "Annuaire fournisseurs TPE - Demaa",
  description:
    "Explorez les banques, assurances, mutuelles, achats, équipements et fournisseurs utiles aux TPE.",
  alternates: {
    canonical: "/annuaire-fournisseurs",
  },
  openGraph: {
    title: "Annuaire fournisseurs TPE - Demaa",
    description:
      "Explorez les banques, assurances, mutuelles, achats, équipements et fournisseurs utiles aux TPE.",
    url: "/annuaire-fournisseurs",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire fournisseurs TPE - Demaa",
    description:
      "Explorez les banques, assurances, mutuelles, achats, équipements et fournisseurs utiles aux TPE.",
  },
};

type AnnuaireFournisseursPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireFournisseursPage({
  searchParams,
}: AnnuaireFournisseursPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=fournisseurs`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <SupplierDirectoryClient
          suppliers={getDemaaSuppliers()}
          families={supplierFamilies}
          initialCategory={getParamValue(params.category)}
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
