"use client";

import SystemSearchHero from "@/components/SystemSearchHero";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  sectorLabelsBySlug: Record<string, string>;
  destinationBasePath?: string;
  heroTitle?: string;
  heroAccent?: string;
};

export default function HomeTabsClient({
  systems,
  sectorLabelsBySlug,
  destinationBasePath,
  heroTitle,
  heroAccent,
}: HomeTabsClientProps) {
  return (
    <SystemSearchHero
      systems={systems}
      sectorLabelsBySlug={sectorLabelsBySlug}
      destinationBasePath={destinationBasePath}
      heroTitle={heroTitle}
      heroAccent={heroAccent}
    />
  );
}
