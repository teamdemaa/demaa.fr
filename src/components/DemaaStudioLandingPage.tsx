import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DEMAA_STUDIO_PROJECTS } from "@/lib/demaa-studio-projects";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const advantagePoints = [
  {
    title: "Observer le travail réel",
    description:
      "Nous partons des processus, des outils et des tâches qui ralentissent réellement les équipes.",
  },
  {
    title: "Concevoir autour du métier",
    description:
      "Chaque produit répond à une situation précise, au lieu d’ajouter un logiciel généraliste de plus.",
  },
  {
    title: "Tester avec les usages",
    description:
      "Les retours du terrain permettent de simplifier le produit avant d’élargir son périmètre.",
  },
] as const;

export default function DemaaStudioLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="none" />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 pb-20 pt-14 text-center sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium text-dema-forest">Demaa Studio</p>
            <h1
              aria-label="Des logiciels conçus à partir de problèmes métier réels."
              className={`${satoshiHeroTitleClassName} mx-auto mt-5 max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">Des logiciels conçus à partir de</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  problèmes métier réels.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-dema-muted sm:text-lg">
              Nous concevons des logiciels spécialisés à partir de problèmes observés auprès de dirigeants et de leurs équipes.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="studio-advantage-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h2
                id="studio-advantage-heading"
                className="demaa-marketing-section-title"
              >
                Notre avantage terrain
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
                Notre travail d’organisation nous rapproche du fonctionnement réel des entreprises. Il fait apparaître des besoins récurrents encore mal couverts par les outils existants.
              </p>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
              {advantagePoints.map((point) => (
                <article key={point.title}>
                  <CheckCircle2
                    className="h-5 w-5 text-dema-forest"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 text-lg font-medium tracking-[-0.025em]">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {point.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="studio-projects-heading"
          className="border-y border-dema-line bg-dema-sage/35 px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h2
                id="studio-projects-heading"
                className="demaa-marketing-section-title"
              >
                Les projets
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
                Trois applications actuellement accessibles, chacune construite autour d’un usage métier précis.
              </p>
            </div>

            <div className="mt-11 divide-y divide-dema-line border-y border-dema-line">
              {DEMAA_STUDIO_PROJECTS.map((project) => (
                <article
                  key={project.name}
                  className="grid gap-6 py-8 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-8"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={project.logo}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                    />
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.03em]">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs text-dema-muted">
                        {project.sector}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-brand-blue/82">
                      {project.problem}
                    </p>
                    <p className="mt-2 text-xs font-medium text-dema-forest">
                      {project.status}
                    </p>
                  </div>
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dema-forest/24 px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                    aria-label={`Découvrir ${project.name}, nouvelle fenêtre`}
                  >
                    Découvrir
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="demaa-marketing-section-title text-balance">
              Rejoindre Demaa Studio
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-dema-muted">
              Mettez votre expérience au service de logiciels construits à partir de problèmes métier réels.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/opportunites?intent=team-demaa-profile"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
              >
                Rejoindre Team Demaa
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
