import type { Metadata } from "next";
import AidDirectoryClient from "@/components/AidDirectoryClient";
import Navbar from "@/components/Navbar";
import {
  getAidFamilyDefinitions,
  getDemaaAidItems,
} from "@/lib/aid-catalog";

export const metadata: Metadata = {
  title: "Aides et subventions TPE - Demaa",
  description:
    "Repérez les aides et subventions les plus utiles pour créer, recruter, innover ou engager une transition plus concrète.",
  alternates: {
    canonical: "/aides-et-subventions",
  },
  openGraph: {
    title: "Aides et subventions TPE - Demaa",
    description:
      "Repérez les aides et subventions les plus utiles pour créer, recruter, innover ou engager une transition plus concrète.",
    url: "/aides-et-subventions",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aides et subventions TPE - Demaa",
    description:
      "Repérez les aides et subventions les plus utiles pour créer, recruter, innover ou engager une transition plus concrète.",
  },
};

type AidesEtSubventionsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AidesEtSubventionsPage({
  searchParams,
}: AidesEtSubventionsPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const backLink = retourSysteme
    ? {
        href: `/systemes/${encodeURIComponent(retourSysteme)}?tab=financement`,
        label: "Retour au système",
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <AidDirectoryClient
          items={getDemaaAidItems()}
          families={getAidFamilyDefinitions()}
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
