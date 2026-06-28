import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TrainingDirectoryClient from "@/components/TrainingDirectoryClient";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaTrainings, trainingFamilies } from "@/lib/training-catalog";

export const metadata: Metadata = {
  title: "Annuaire formations - Demaa",
  description:
    "Explorez des formations utiles selon l'activité de l'entreprise, avec une selection de parcours externes et de formations Demaa.",
  alternates: {
    canonical: "/annuaire-formations",
  },
  openGraph: {
    title: "Annuaire formations - Demaa",
    description:
      "Explorez des formations utiles selon l'activité de l'entreprise, avec une selection de parcours externes et de formations Demaa.",
    url: "/annuaire-formations",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire formations - Demaa",
    description:
      "Explorez des formations utiles selon l'activité de l'entreprise, avec une selection de parcours externes et de formations Demaa.",
  },
};

type AnnuaireFormationsPageProps = {
  searchParams: Promise<{
    family?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireFormationsPage({
  searchParams,
}: AnnuaireFormationsPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=formation`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <TrainingDirectoryClient
          trainings={getDemaaTrainings()}
          families={trainingFamilies}
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
