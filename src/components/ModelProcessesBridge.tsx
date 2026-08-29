import { ArrowRight } from "lucide-react";
import Link from "next/link";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import { SOLUTION_RAIL_CLASS_NAME } from "@/components/SolutionRailCard";
import { getAllAcademyContent } from "@/lib/academy-course-content";

export default function ModelProcessesBridge() {
  const processes = getAllAcademyContent()
    .filter((content) => Boolean(content.processGuide))
    .slice(0, 5);

  return (
    <section aria-labelledby="model-processes-heading" className="bg-dema-sage/35 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 id="model-processes-heading" className="demaa-catalog-section-title text-brand-blue">
              Voyez comment le travail s’organise, étape par étape
            </h2>
          </div>
          <Link href="/organiser/processus" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-dema-forest">
            Voir tous les cas concrets
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className={SOLUTION_RAIL_CLASS_NAME}>
          {processes.map((content) => {
            const guide = content.processGuide!;
            return (
              <Link
                key={content.identity.slug}
                href={`/organiser/${content.identity.slug}`}
                className="group block w-full min-w-0 snap-start rounded-[1.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
              >
                <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                  <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-[#F0F4F1] transition-colors duration-200">
                    <OrganiserProcessMap steps={guide.steps} compact />
                  </div>
                  <div className="px-0.5 pb-1 pt-3.5">
                    <h3 className="line-clamp-2 text-[0.84rem] font-normal leading-[1.3] text-brand-blue opacity-80 transition-colors group-hover:text-dema-forest sm:text-[0.9rem]">
                      {content.identity.card.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-dema-muted opacity-75">
                      Process · {guide.system.label} · {content.identity.durationMinutes} min
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
