import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ServiceDirectoryClient from "@/components/ServiceDirectoryClient";
import { getDelegationServices } from "@/lib/delegation-services";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { ORGANISATION_AUDIT_MODAL_HREF } from "@/lib/organisation-audit";
import { serviceCategories } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Demaa | Plateforme de services clés en main pour dirigeants de petites entreprises",
  description:
    "Une plateforme de services transverse pour dirigeants de TPE qui veulent déléguer ce qui les ralentit, mieux organiser leur entreprise et libérer du temps.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Demaa | Plateforme de services clés en main pour dirigeants de petites entreprises",
    description:
      "Une plateforme de services transverse pour dirigeants de TPE qui veulent déléguer ce qui les ralentit, mieux organiser leur entreprise et libérer du temps.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demaa | Plateforme de services clés en main pour dirigeants de petites entreprises",
    description:
      "Une plateforme de services transverse pour dirigeants de TPE qui veulent déléguer ce qui les ralentit, mieux organiser leur entreprise et libérer du temps.",
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
            primary: "Structurez",
            secondary: "votre entreprise",
          }}
          invertHeroTitleStyles
          heroDescriptionLines={{
            primary: "Votre entreprise doit pouvoir grandir sans reposer uniquement sur vous.",
            secondary: "",
          }}
          heroActions={
            <Link
              href={ORGANISATION_AUDIT_MODAL_HREF}
              scroll={false}
              className="demaa-primary-button px-5 py-2.5"
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
