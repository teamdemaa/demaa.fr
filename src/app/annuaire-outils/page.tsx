import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  getToolDirectoryInitialFilters,
  type ToolDirectorySearchParams,
  withSoftwareDetailUrls,
} from "@/lib/tool-directory-page";
import { getUnifiedToolDirectoryMeta } from "@/lib/tool-directory-firestore";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire";

export const metadata: Metadata = {
  title: "Annuaire Outils - Demaa",
  description:
    "Explorez les outils utiles aux TPE pour organiser, automatiser, créer et piloter leur activité au quotidien.",
};

export const dynamic = "force-dynamic";

type AnnuaireOutilsPageProps = {
  searchParams: ToolDirectorySearchParams;
};

export default async function AnnuaireOutilsPage({
  searchParams,
}: AnnuaireOutilsPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const [{ initialCategory, initialSector }, toolDirectoryMeta, returnEnterprise] = await Promise.all([
    getToolDirectoryInitialFilters(Promise.resolve(params)),
    getUnifiedToolDirectoryMeta(),
    retourSysteme ? getEnterpriseBySlug(retourSysteme) : Promise.resolve(null),
  ]);
  const directoryTools = withSoftwareDetailUrls(toolDirectoryMeta.tools);
  const backLink = returnEnterprise
    ? {
        href: `/?system=${encodeURIComponent(returnEnterprise.slug)}&systemTab=outils`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Annuaire Outils"
          description="Les outils et logiciels utiles aux TPE pour organiser, automatiser, créer et piloter l'activité."
          searchPlaceholder="Rechercher un outil, un logiciel, un usage..."
          items={directoryTools}
          sectors={toolDirectoryMeta.sectors}
          categories={toolDirectoryMeta.categories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector={false}
          externalLinks={false}
          backLink={backLink}
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
