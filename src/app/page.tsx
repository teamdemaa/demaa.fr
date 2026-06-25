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
          hideSearchControls
          backLink={backLink}
          heroTitleLines={{
            primary: "Déléguez",
            secondary: "ce qui vous ralentit",
          }}
          invertHeroTitleStyles
          heroDescriptionLines={{
            primary: "Votre entreprise ne devrait pas reposer que sur vous.",
            secondary: "",
          }}
          heroActions={
            <Link
              href={ORGANISATION_AUDIT_MODAL_HREF}
              scroll={false}
              className="demaa-primary-button px-5 py-3"
            >
              Diagnostic organisation offert
            </Link>
          }
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
