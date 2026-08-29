import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import { getAllAcademyContent } from "@/lib/academy-course-content";

export default function ModelProcessesBridge() {
  const processes = getAllAcademyContent()
    .filter((content) => Boolean(content.processGuide))
    .slice(0, 3);

  return (
    <section aria-labelledby="model-processes-heading" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-[1.5rem] border border-dema-forest/15 bg-dema-sage/45 px-6 py-8 sm:px-8 md:px-10 md:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <BookOpen className="h-5 w-5 text-dema-forest" aria-hidden="true" />
            <h2 id="model-processes-heading" className="mt-3 text-2xl font-light tracking-[-0.03em] text-brand-blue sm:text-3xl">
              Les processus derrière les modèles
            </h2>
            <p className="mt-3 text-sm leading-6 text-dema-muted sm:text-base">
              Retrouvez les étapes, les responsabilités et les points de contrôle nécessaires pour mettre ces modèles en place.
            </p>
          </div>
          <Link href="/organiser" className="hidden shrink-0 items-center gap-2 text-sm font-medium text-dema-forest sm:inline-flex">
            Voir tous les processus
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {processes.map((content) => {
            const guide = content.processGuide!;
            return (
              <Link
                key={content.identity.slug}
                href={`/organiser/${content.identity.slug}`}
                className="group block rounded-[1.15rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
              >
                <div className="aspect-video overflow-hidden rounded-[1.15rem] bg-dema-paper">
                  <OrganiserProcessMap steps={guide.steps} compact />
                </div>
                <h3 className="mt-3 text-sm font-medium leading-5 text-brand-blue transition group-hover:text-dema-forest">
                  {content.identity.card.title}
                </h3>
                <p className="mt-1 text-xs text-dema-muted">
                  {guide.system.label} · {content.identity.durationMinutes} min
                </p>
              </Link>
            );
          })}
        </div>

        <Link href="/organiser" className="demaa-secondary-button mt-8 inline-flex min-h-11 items-center justify-center gap-2 sm:hidden">
          Voir tous les processus
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
