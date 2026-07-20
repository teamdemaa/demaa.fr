"use client";

import SystemSearchHero from "@/components/SystemSearchHero";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  sectorLabelsBySlug: Record<string, string>;
};

export default function HomeTabsClient({
  systems,
  sectorLabelsBySlug,
}: HomeTabsClientProps) {
  return <SystemSearchHero systems={systems} sectorLabelsBySlug={sectorLabelsBySlug} />;
}
