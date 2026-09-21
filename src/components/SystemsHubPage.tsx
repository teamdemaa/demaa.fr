import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import LeaderDailyRail from "@/components/LeaderDailyRail";
import OrganiserDiscoveryCta from "@/components/OrganiserDiscoveryCta";
import {
  enterpriseToSystem,
  type EnterpriseDefinition,
} from "@/lib/enterprise-annuaire";
import { TOOLS_HUB_SECTOR_ORDER, toolsHubSectorLabels } from "@/lib/public-sectors";

export default function SystemsHubPage({
  enterprises,
}: {
  enterprises: readonly EnterpriseDefinition[];
}) {
  const sectorRank = new Map<string, number>(TOOLS_HUB_SECTOR_ORDER.map((label, index) => [label, index]));
  const visibleEnterprises = enterprises
    .filter((enterprise) => toolsHubSectorLabels.has(enterprise.sectorLabel))
    .toSorted((left, right) => (sectorRank.get(left.sectorLabel) ?? 99) - (sectorRank.get(right.sectorLabel) ?? 99));
  const systems = visibleEnterprises.map(enterpriseToSystem);
  const sectorLabelsBySlug = Object.fromEntries(
    visibleEnterprises.map((enterprise) => [enterprise.slug, enterprise.sectorLabel]),
  );

  return (
    <>
      <Navbar publicNavigationActiveView="solutions" />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        <HomeTabsClient systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} />
        <div className="mx-auto w-full max-w-7xl space-y-12 px-4 pb-16 sm:px-6 lg:px-8">
          <LeaderDailyRail />
          <div>
            <OrganiserDiscoveryCta />
          </div>
        </div>
      </main>
    </>
  );
}
