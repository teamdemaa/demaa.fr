import type { Metadata } from "next";
import ActionPlanHomeView from "@/components/ActionPlanHomeView";
import { loadActionPlanHomePage } from "@/lib/action-plan-pages.server";

const title = "Un plan d’action concret pour votre entreprise | Demaa";
const description =
  "Décrivez la situation de votre entreprise et obtenez un plan d’action concret, accompagné du système métier adapté pour l’exécuter.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    academy?: string | string[];
    new?: string | string[];
    opportunity?: string | string[];
    opportunityId?: string | string[];
    planTab?: string | string[];
    resource?: string | string[];
    resourceSlug?: string | string[];
    system?: string | string[];
    systemSlug?: string | string[];
    systemTab?: string | string[];
    view?: string | string[];
  }>;
}) {
  const query = await searchParams;
  return (
    <ActionPlanHomeView
      {...await loadActionPlanHomePage({ localeCode: "fr", searchParams: query })}
    />
  );
}
