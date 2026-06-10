import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ServiceDirectoryClient from "@/components/ServiceDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire";
import { getDemaaServices, serviceCategories } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Annuaire Services - Demaa",
  description:
    "Explorez les services Demaa pour créer, structurer, automatiser, déléguer et développer votre activité.",
};

type AnnuaireServicesPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireServicesPage({
  searchParams,
}: AnnuaireServicesPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/?system=${encodeURIComponent(returnEnterprise.slug)}&systemTab=services`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ServiceDirectoryClient
          services={getDemaaServices()}
          categories={serviceCategories}
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
