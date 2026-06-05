import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Structurer votre activité - Demaa",
  description:
    "Explorez les systèmes essentiels pour structurer votre activité, clarifier vos process et mieux piloter votre entreprise.",
  openGraph: {
    title: "Structurer votre activité - Demaa",
    description:
      "Explorez les systèmes essentiels pour structurer votre activité, clarifier vos process et mieux piloter votre entreprise.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structurer votre activité - Demaa",
    description:
      "Explorez les systèmes essentiels pour structurer votre activité, clarifier vos process et mieux piloter votre entreprise.",
  },
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
