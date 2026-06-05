import type { Metadata } from "next";
import SocialCarouselStudio from "@/components/social/SocialCarouselStudio";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";
import type { SocialStudioSector } from "@/lib/social-carousels";

export const metadata: Metadata = {
  title: "Studio contenu - Demaa",
  description: "Générer des carrousels sociaux Demaa à partir des systèmes opérationnels.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const dynamic = "force-dynamic";

export default async function SocialStudioPage() {
  const [enterprises, toolDirectory] = await Promise.all([
    getEnterpriseCatalog(),
    getUnifiedToolDirectory(),
  ]);
  const systems = enterprises.map(enterpriseToSystem);
  const detailsBySlug = await buildOperationalSystemDetails(systems, enterprises, toolDirectory);

  const sectors: SocialStudioSector[] = systems.map((system) => {
    const detail = detailsBySlug[system.slug];

    return {
      slug: system.slug,
      name: system.name,
      description: system.description,
      sectorLabel: detail.sectorLabel,
      processes: detail.processes.map((process) => ({
        pillar: process.pillar,
        title: process.title,
        description: process.description,
        examples: process.examples,
      })),
      tools: detail.tools.map((tool) => ({
        name: tool.name,
        type: tool.type,
        usage: tool.usage,
      })),
    };
  });

  return <SocialCarouselStudio sectors={sectors} />;
}
