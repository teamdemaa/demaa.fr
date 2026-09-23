import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import OrganiserDiscoveryCta from "@/components/OrganiserDiscoveryCta";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import {
  enterpriseToSystem,
  type EnterpriseDefinition,
} from "@/lib/enterprise-annuaire";
import { TOOLS_HUB_SECTOR_ORDER, toolsHubSectorLabels } from "@/lib/public-sectors";

export default function SystemsHubPage({
  enterprises,
  variant = "legacy",
}: {
  enterprises: readonly EnterpriseDefinition[];
  variant?: "legacy" | "demaa";
}) {
  const sectorRank = new Map<string, number>(TOOLS_HUB_SECTOR_ORDER.map((label, index) => [label, index]));
  const visibleEnterprises = enterprises
    .filter((enterprise) => variant === "demaa" || toolsHubSectorLabels.has(enterprise.sectorLabel))
    .toSorted((left, right) => (sectorRank.get(left.sectorLabel) ?? 99) - (sectorRank.get(right.sectorLabel) ?? 99));
  const systems = visibleEnterprises.map(enterpriseToSystem);
  const sectorLabelsBySlug = Object.fromEntries(
    visibleEnterprises.map((enterprise) => [enterprise.slug, enterprise.sectorLabel]),
  );

  return (
    <>
      <Navbar publicNavigationActiveView={variant === "demaa" ? "solutions" : "resources"} publicNavigationVariant={variant} />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        {variant === "legacy" ? <ResourcesNavigation activeView="tools" /> : null}
        <HomeTabsClient systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} heroTitle={variant === "demaa" ? "Des solutions adaptées" : undefined} heroAccent={variant === "demaa" ? "à votre activité" : undefined} />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {variant === "legacy" ? <div className="pt-4"><OrganiserDiscoveryCta /></div> : null}
        </div>
      </main>
    </>
  );
}
