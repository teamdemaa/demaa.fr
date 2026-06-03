import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Outils - Demaa",
  description:
    "Accédez aux outils Demaa pour gagner du temps sur les tâches du quotidien.",
  alternates: {
    canonical: "/outils",
  },
};

export const dynamic = "force-dynamic";

type OutilsPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OutilsPage({ searchParams }: OutilsPageProps) {
  const params = await searchParams;

  return (
    <HomeHubPage
      initialTab="outils"
      initialCategory={getParamValue(params.categorie)}
      initialSector={getParamValue(params.secteur)}
    />
  );
}
