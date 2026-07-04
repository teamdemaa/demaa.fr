"use client";

import SystemSearchHero from "@/components/SystemSearchHero";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
};

export default function HomeTabsClient({
  systems,
  detailsBySlug,
}: HomeTabsClientProps) {
  return <SystemSearchHero systems={systems} detailsBySlug={detailsBySlug} />;
}
