import { FileText } from "lucide-react";
import type { SystemResource } from "@/lib/system-resource-catalog";

export default function ModelResourceCard({ resource }: { resource: SystemResource }) {
  return (
    <a
      href={`/api/systeme-kit/open/${resource.resourceSlug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[248px] flex-col overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6"
      aria-label={`Ouvrir ${resource.title}`}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
        {resource.formatLabel}
      </span>
      <span className="mt-1.5 text-lg font-semibold leading-snug text-brand-blue transition-colors group-hover:text-dema-forest sm:text-xl">
        {resource.title}
      </span>
      <span className="mt-2 text-[13px] leading-5 text-dema-muted sm:text-sm sm:leading-relaxed">
        {resource.description}
      </span>
    </a>
  );
}
