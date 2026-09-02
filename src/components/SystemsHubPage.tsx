import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import OrganiserDiscoveryCta from "@/components/OrganiserDiscoveryCta";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";

export default async function SystemsHubPage() {
  const enterprises = await getEnterpriseCatalog();
  const systems = enterprises.map(enterpriseToSystem);
  const sectorLabelsBySlug = Object.fromEntries(
    enterprises.map((enterprise) => [enterprise.slug, enterprise.sectorLabel]),
  );

  return (
    <>
      <Navbar publicNavigationActiveView="solutions" />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        <HomeTabsClient systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <OrganiserDiscoveryCta />
        </div>
        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
