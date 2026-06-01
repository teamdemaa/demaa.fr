import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import NewsletterPrompt from "@/components/NewsletterPrompt";
import { getSystems } from "@/lib/api";
import { buildOperationalSystemDetail } from "@/lib/system-operations";
import {
  freeToolsDirectory,
  freeToolsDirectoryCategories,
  freeToolsDirectorySectors,
} from "@/lib/free-tools-directory";

export const metadata: Metadata = {
  title: "Automatiser mes tâches - Demaa",
  description:
    "Décrivez vos tâches répétitives et identifiez les systèmes utiles pour automatiser ce qui vous ralentit.",
};

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string | string[];
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialTab = getParamValue(params.tab);
  const initialCategory = getParamValue(params.categorie);
  const initialSector = getParamValue(params.secteur);
  const systems = await getSystems();
  const detailsBySlug = Object.fromEntries(
    await Promise.all(
      systems.map(async (system) => [system.slug, await buildOperationalSystemDetail(system)] as const)
    )
  ) as Record<string, Awaited<ReturnType<typeof buildOperationalSystemDetail>>>;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-white min-h-screen">
        <HomeTabsClient
          systems={systems}
          detailsBySlug={detailsBySlug}
          tools={freeToolsDirectory}
          toolSectors={freeToolsDirectorySectors}
          toolCategories={freeToolsDirectoryCategories}
          initialTab={initialTab}
          initialCategory={initialCategory}
          initialSector={initialSector}
        />
      </main>
      <NewsletterPrompt />
    </>
  );
}
