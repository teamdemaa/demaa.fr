import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import RecruitmentDirectoryClient from "@/components/RecruitmentDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaRecruitmentItems, recruitmentFamilies } from "@/lib/recruitment-catalog";

export const metadata: Metadata = {
  title: "Annuaire recrutement - Demaa",
  description:
    "Explorez des solutions utiles pour recruter, diffuser une offre, recruter en alternance ou trouver un renfort rapidement.",
  alternates: {
    canonical: "/annuaire-recrutement",
  },
  openGraph: {
    title: "Annuaire recrutement - Demaa",
    description:
      "Explorez des solutions utiles pour recruter, diffuser une offre, recruter en alternance ou trouver un renfort rapidement.",
    url: "/annuaire-recrutement",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire recrutement - Demaa",
    description:
      "Explorez des solutions utiles pour recruter, diffuser une offre, recruter en alternance ou trouver un renfort rapidement.",
  },
};

type AnnuaireRecrutementPageProps = {
  searchParams: Promise<{
    family?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireRecrutementPage({
  searchParams,
}: AnnuaireRecrutementPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=recrutement`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <RecruitmentDirectoryClient
          items={getDemaaRecruitmentItems()}
          families={recruitmentFamilies}
          initialFamily={getParamValue(params.family)}
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
