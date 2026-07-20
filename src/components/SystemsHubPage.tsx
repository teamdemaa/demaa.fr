import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
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
      <Navbar />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        <HomeTabsClient systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} />
      </main>
    </>
  );
}
