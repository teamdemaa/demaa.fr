import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

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
    system?: string | string[];
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
  const initialSystem = getParamValue(params.system);

  return (
    <HomeHubPage
      initialTab={initialTab}
      initialCategory={initialCategory}
      initialSector={initialSector}
      initialSystem={initialSystem}
    />
  );
}
