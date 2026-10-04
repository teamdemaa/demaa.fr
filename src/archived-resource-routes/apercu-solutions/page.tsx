import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";

export const metadata: Metadata = {
  title: "Solutions | Demaa",
  description: "Choisissez un métier pour voir les solutions vérifiées et disponibles.",
  robots: { index: false, follow: false },
};

export default async function SolutionsPreviewPage() {
  // The existing public tools hub hides whole sectors. The Solutions preview
  // restores the complete métier selector, including restaurants and retail.
  const enterprises = await getEnterpriseCatalog();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="solutions" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-dema-cream">
        <HomeTabsClient
          systems={enterprises.map(enterpriseToSystem)}
          sectorLabelsBySlug={Object.fromEntries(enterprises.map(({ slug, sectorLabel }) => [slug, sectorLabel]))}
          destinationBasePath="/apercu-solutions"
          heroTitle="Des solutions adaptées"
          heroAccent="à votre activité"
        />
      </main>
    </>
  );
}
