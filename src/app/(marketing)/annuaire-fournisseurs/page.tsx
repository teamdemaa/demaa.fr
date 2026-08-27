import Navbar from "@/components/Navbar";
import SupplierDirectoryClient from "@/components/SupplierDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaSuppliers, supplierFamilies } from "@/lib/supplier-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Annuaire fournisseurs TPE - Demaa",
  description:
    "Explorez les banques, assurances, mutuelles, achats, équipements et fournisseurs utiles aux TPE.",
  path: "/annuaire-fournisseurs",
});

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
        href: `/solutions/${encodeURIComponent(returnEnterprise.slug)}`,
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
