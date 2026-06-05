import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "S'équiper - Outils et ressources | Demaa",
  description:
    "Retrouvez les outils du quotidien et les ressources pratiques pour mieux gérer votre activité et structurer vos process.",
  openGraph: {
    title: "S'équiper - Outils et ressources | Demaa",
    description:
      "Retrouvez les outils du quotidien et les ressources pratiques pour mieux gérer votre activité et structurer vos process.",
  },
  twitter: {
    card: "summary_large_image",
    title: "S'équiper - Outils et ressources | Demaa",
    description:
      "Retrouvez les outils du quotidien et les ressources pratiques pour mieux gérer votre activité et structurer vos process.",
  },
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
