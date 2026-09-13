import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import OrganiserDiscoveryCta from "@/components/OrganiserDiscoveryCta";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import {
  enterpriseToSystem,
  type EnterpriseDefinition,
} from "@/lib/enterprise-annuaire";

export default function SystemsHubPage({
  enterprises,
}: {
  enterprises: readonly EnterpriseDefinition[];
}) {
  const systems = enterprises.map(enterpriseToSystem);
  const sectorLabelsBySlug = Object.fromEntries(
    enterprises.map((enterprise) => [enterprise.slug, enterprise.sectorLabel]),
  );

  return (
    <>
      <Navbar publicNavigationActiveView="resources" />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        <ResourcesNavigation activeView="tools" />
        <HomeTabsClient systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="pt-4">
            <OrganiserDiscoveryCta />
          </div>
        </div>
        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
