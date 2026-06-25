import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ServiceDirectoryClient from "@/components/ServiceDirectoryClient";
import { getDelegationServices } from "@/lib/delegation-services";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { ORGANISATION_AUDIT_MODAL_HREF } from "@/lib/organisation-audit";
import { serviceCategories } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Services Demaa pour déléguer avec sérénité",
  description:
    "Découvrez les services Demaa pour déléguer l'administratif, structurer l'organisation et avancer avec plus de sérénité.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Services Demaa pour déléguer avec sérénité",
    description:
      "Découvrez les services Demaa pour déléguer l'administratif, structurer l'organisation et avancer avec plus de sérénité.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services Demaa pour déléguer avec sérénité",
    description:
      "Découvrez les services Demaa pour déléguer l'administratif, structurer l'organisation et avancer avec plus de sérénité.",
  },
};

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
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

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ServiceDirectoryClient
          services={getDelegationServices()}
          categories={serviceCategories}
          initialCategory={getParamValue(params.category)}
          initialSearch={getParamValue(params.q) ?? ""}
          backLink={backLink}
          heroTitleLines={{
            primary: "Votre entreprise",
            secondary: "ne devrait pas reposer que sur vous",
          }}
          invertHeroTitleStyles
          heroDescriptionLines={{
            primary: "Déléguez ce qui vous ralentit.",
            secondary: "",
          }}
          heroActions={
            <>
              <Link
                href={ORGANISATION_AUDIT_MODAL_HREF}
                scroll={false}
                className="demaa-primary-button px-5 py-3"
              >
                Audit organisation gratuit
              </Link>
              <Link
                href="/systemes"
                className="inline-flex items-center justify-center rounded-full border border-dema-forest/25 bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest hover:text-dema-forest"
              >
                Voir la boîte à outils du dirigeant
              </Link>
            </>
          }
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
