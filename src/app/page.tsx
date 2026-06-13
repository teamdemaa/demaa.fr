import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Analysez votre organisation - Demaa",
  description:
    "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Analysez votre organisation - Demaa",
    description:
      "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analysez votre organisation - Demaa",
    description:
      "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
  },
};

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    system?: string | string[];
    systemTab?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialSystem = getParamValue(params.system);
  const initialSystemTab = getParamValue(params.systemTab);

  return <HomeHubPage initialSystem={initialSystem} initialSystemTab={initialSystemTab} />;
}
