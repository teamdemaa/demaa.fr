import AidDirectoryClient from "@/components/AidDirectoryClient";
import Navbar from "@/components/Navbar";
import {
  getAidFamilyDefinitions,
  getDemaaAidItems,
} from "@/lib/aid-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Aides et subventions TPE - Demaa",
  description:
    "Repérez les aides et subventions les plus utiles pour créer, recruter, innover ou engager une transition plus concrète.",
  path: "/aides-et-subventions",
});

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
        href: `/solutions/${encodeURIComponent(retourSysteme)}`,
        label: "Retour au système métier",
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
