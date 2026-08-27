import Navbar from "@/components/Navbar";
import ProNetworkDirectoryClient from "@/components/ProNetworkDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaProNetworks, proNetworkCategories } from "@/lib/pro-network-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Annuaire réseaux pro TPE - Demaa",
  description:
    "Explorez les réseaux, organisations, prescripteurs et événements utiles pour développer l’activité d’une TPE.",
  path: "/annuaire-reseaux-pro",
});

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
        href: `/solutions/${encodeURIComponent(returnEnterprise.slug)}`,
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
