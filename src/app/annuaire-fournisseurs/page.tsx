import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SupplierDirectoryClient from "@/components/SupplierDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire";
import { getDemaaSuppliers, supplierCategories } from "@/lib/supplier-catalog";

export const metadata: Metadata = {
  title: "Annuaire Fournisseurs - Demaa",
  description:
    "Explorez les banques, assurances, mutuelles, matériaux, grossistes et fournisseurs utiles aux TPE.",
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
        href: `/?system=${encodeURIComponent(returnEnterprise.slug)}&systemTab=fournisseurs`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <SupplierDirectoryClient
          suppliers={getDemaaSuppliers()}
          categories={supplierCategories}
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
