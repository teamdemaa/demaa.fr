"use client";

import Image from "next/image";
import { useState } from "react";
import GuideNotifyModal from "@/components/GuideNotifyModal";
import GuideSlidesDialog from "@/components/GuideSlidesDialog";
import { getGuideSlides } from "@/lib/system-guide-slides";
import type { SystemResource } from "@/lib/system-resource-catalog";

export default function SystemGuidesRail({ resources, systemSlug }: { resources: readonly SystemResource[]; systemSlug: string }) {
  const [selected, setSelected] = useState<SystemResource | null>(null); const [notify, setNotify] = useState<SystemResource | null>(null);
  return <section aria-labelledby="system-guides-title"><h3 id="system-guides-title" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dema-muted">Guides</h3><div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[...resources].sort((a, b) => a.rank - b.rank).map((resource) => resource.availability === "available" ? <button key={resource.resourceSlug} type="button" data-system-guide-card data-guide-availability="available" onClick={() => setSelected(resource)} className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"><div className="relative aspect-[16/9] overflow-hidden rounded-xl"><Image src={resource.preview.src} alt={resource.preview.alt} fill className="object-cover transition group-hover:scale-[1.02]" /></div><p className="mt-3 font-medium text-brand-blue">{resource.title}</p><p className="mt-1 text-sm text-dema-muted">{resource.tagline}</p></button> : <article key={resource.resourceSlug} data-system-guide-card data-guide-availability="coming-soon" className="rounded-xl border border-dema-line bg-dema-line/35 p-5 text-dema-muted"><p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Bientôt disponible</p><p className="mt-3 font-medium">{resource.title}</p><p className="mt-1 text-sm">{resource.tagline}</p><button type="button" onClick={() => setNotify(resource)} className="mt-4 text-sm font-medium text-dema-forest underline underline-offset-4">Être informé</button></article>)}</div>{selected ? <GuideSlidesDialog title={selected.title} slides={getGuideSlides(selected.resourceSlug)} downloadHref={`/api/systeme-kit/open/${selected.resourceSlug}`} onClose={() => setSelected(null)} /> : null}{notify ? <GuideNotifyModal resource={notify} systemSlug={systemSlug} onClose={() => setNotify(null)} /> : null}</section>;
}
