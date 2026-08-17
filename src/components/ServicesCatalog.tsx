import Link from "next/link";
import {
  Calculator,
  ClipboardList,
  Compass,
  FileCheck2,
  PanelsTopLeft,
  Megaphone,
  MessagesSquare,
  SearchCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CanonicalService } from "@/lib/canonical-service-catalog";

const ICONS: Record<CanonicalService["slug"], LucideIcon> = {
  "coach-business": Compass,
  "automatisation-processus": Workflow,
  "application-metier": PanelsTopLeft,
  "assistance-administrative": ClipboardList,
  "expert-comptable": Calculator,
  "formalites-entreprise": FileCheck2,
  "gestion-reseaux-sociaux": MessagesSquare,
  "publicite-en-ligne": Megaphone,
  "prospection-ciblee": SearchCheck,
};

function ServiceCard({ service }: { service: CanonicalService }) {
  const Icon = ICONS[service.slug];

  return (
    <article className="h-[19rem] min-w-0">
      <Link href={service.detailHref} className="group flex h-full min-w-0 flex-col rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_8px_24px_rgba(23,35,29,0.025)] transition hover:border-dema-forest/30 hover:shadow-[0_10px_28px_rgba(23,35,29,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 line-clamp-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">{service.eyebrow}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue">{service.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-dema-muted">{service.summary}</p>
      </Link>
    </article>
  );
}

export default function ServicesCatalog({
  services,
}: {
  services: readonly CanonicalService[];
}) {
  return (
    <section aria-labelledby="services-catalog-title">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
        Catalogue Demaa
      </p>
      <h2
        id="services-catalog-title"
        className="mt-1.5 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-3xl"
      >
        L’accompagnement utile, au bon moment
      </h2>
      <div className="mt-7 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </section>
  );
}
