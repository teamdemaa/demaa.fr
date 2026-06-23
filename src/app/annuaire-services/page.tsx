import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ServiceDirectoryClient from "@/components/ServiceDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaServices, serviceCategories } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Déléguez pour libérer du temps - Demaa",
  description:
    "Explorez les services Demaa pour déléguer les sujets juridiques, finance, acquisition, contenu, systèmes et support opérationnel.",
  alternates: {
    canonical: "/annuaire-services",
  },
  openGraph: {
    title: "Déléguez pour libérer du temps - Demaa",
    description:
      "Explorez les services Demaa pour déléguer les sujets juridiques, finance, acquisition, contenu, systèmes et support opérationnel.",
    url: "/annuaire-services",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Déléguez pour libérer du temps - Demaa",
    description:
      "Explorez les services Demaa pour déléguer les sujets juridiques, finance, acquisition, contenu, systèmes et support opérationnel.",
  },
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
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=services`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;
  const services = getDelegationServices();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ServiceDirectoryClient
          services={services}
          categories={serviceCategories}
          initialCategory={getParamValue(params.category)}
          initialSearch={getParamValue(params.q) ?? ""}
          backLink={backLink}
          title="Déléguez avec Sérénité"
          description="Confiez-nous ce qui prend du temps, on exécute comme si c'était notre entreprise."
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getDelegationServices() {
  const hiddenSlugs = new Set([
    "organisation-automatisation",
    "creation-societe",
    "modification-societe",
    "fermeture-societe",
    "expert-comptable",
    "marketing-vente",
    "publicite-google",
    "publicite-facebook-instagram",
    "publicite-tiktok",
    "montage-video",
  ]);
  const pinnedOrder = [
    "assistant-polyvalent",
    "site-web",
    "previsionnel-financier",
  ];
  const services = getDemaaServices().filter((service) => !hiddenSlugs.has(service.slug));

  return services.sort((left, right) => {
    const leftIndex = pinnedOrder.indexOf(left.slug);
    const rightIndex = pinnedOrder.indexOf(right.slug);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}
