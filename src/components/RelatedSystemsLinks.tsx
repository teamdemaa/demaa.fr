import Link from "next/link";
import type { System } from "@/lib/types";

type RelatedSystemsLinksProps = {
  systems: System[];
  title?: string;
  description?: string;
};

export default function RelatedSystemsLinks({
  systems,
  title = "Kits opérationnels liés",
  description = "Explorer les kits opérationnels les plus proches de ce sujet.",
}: RelatedSystemsLinksProps) {
  if (!systems.length) {
    return null;
  }

  return (
    <section className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5">
      <h2 className="text-lg font-semibold text-brand-blue">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {systems.map((system) => (
          <Link
            key={system.slug}
            href={`/kit-operationnel/${system.slug}`}
            className="inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            {system.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
