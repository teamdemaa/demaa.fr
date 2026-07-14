import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const keyMetrics = [
  {
    label: "Clients actifs",
    value: "47",
    detail: "Sociétés externes • cabinet lui-même exclu",
  },
  {
    label: "Socle mensuel",
    value: "9 000 €",
    detail: "Forfaits actifs documentés",
  },
  {
    label: "Socle annualisé",
    value: "108 k€",
    detail: "Hors missions ponctuelles et annuelles",
  },
  {
    label: "Panier mensuel moyen",
    value: "220 €",
    detail: "41 clients avec forfait renseigné",
  },
  {
    label: "Implantation clientèle",
    value: "89 %",
    detail: "42 clients sur 47 en Île-de-France",
  },
] as const;

const portfolioLegend = [
  { value: "44", label: "clients mensuels", color: "bg-dema-forest" },
  { value: "3", label: "clients annuels", color: "bg-dema-line" },
  { value: "41", label: "forfaits valorisés", color: "bg-dema-forest/55" },
] as const;

const services = [
  { value: "30", label: "Compta + paie" },
  { value: "9", label: "Comptabilité" },
  { value: "8", label: "Paie" },
] as const;

const sectors = [
  { label: "BTP", value: 23 },
  { label: "Transport", value: 17 },
  { label: "Formation", value: 13 },
  { label: "Commerce", value: 6 },
  { label: "Immobilier", value: 6 },
  { label: "Autres secteurs", value: 34 },
] as const;

const operations = [
  {
    value: "49,9k€",
    label: "forfaits marqués facturés de janvier à juin 2026",
  },
  {
    value: "476",
    label: "bulletins renseignés sur janvier–juin 2026",
  },
  {
    value: "30–33",
    label: "dossiers de paie suivis chaque mois",
  },
  {
    value: "79 %",
    label: "des 152 demandes suivies sont terminées",
  },
] as const;

const strengths = [
  "Revenus majoritairement récurrents",
  "Faible dépendance au premier client",
  "Offre comptabilité + paie",
  "Données et demandes structurées",
  "Ancrage francilien",
] as const;

const tools = [
  {
    name: "Pennylane",
    role: "Comptabilité et Finance",
    description: "Comptabilité, facturation et vision financière centralisées.",
    href: "/annuaire-outils/pennylane",
  },
  {
    name: "Tiimora",
    role: "Relation client",
    description: "Centralisation des clients, demandes, documents et suivis.",
    href: "/annuaire-outils/tiimora",
  },
  {
    name: "Silae",
    role: "Paie & social",
    description: "Production de la paie et gestion des obligations sociales.",
    href: "/annuaire-outils/silae",
  },
  {
    name: "Slack",
    role: "Communication d’équipe",
    description: "Messagerie collaborative, canaux et coordination rapide de l’équipe.",
    href: "/annuaire-outils/slack",
  },
  {
    name: "Google Workspace",
    role: "Bureautique & collaboration",
    description: "Messagerie, documents, stockage et agendas partagés.",
    href: "/annuaire-outils/google-workspace",
  },
] as const;

export const metadata: Metadata = {
  title: "Opportunités/0034 | Demaa",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-normal tracking-[-0.02em] text-brand-blue sm:text-xl">
      {children}
    </h2>
  );
}

export default function Opportunity0034Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream px-3 py-4 text-brand-blue sm:px-5 sm:py-7 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        <article className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-4 shadow-[0_16px_45px_rgba(23,35,29,0.035)] sm:p-7 lg:p-10">
          <header className="border-b border-dema-line pb-7 sm:pb-9">
            <p className="text-[13.2px] font-semibold uppercase tracking-[0.2em] text-dema-forest/85 sm:text-[14.4px]">
              Opportunité d’acquisition
            </p>
            <h1 className="mt-4 max-w-5xl font-sans text-[2.45rem] font-light leading-[1.02] tracking-[-0.04em] text-brand-blue sm:text-6xl lg:text-7xl">
              Cabinet d’expertise comptable
            </h1>
            <p className="mt-4 text-sm font-light text-dema-muted sm:text-lg">
              Portefeuille récurrent • clientèle diversifiée • organisation déjà digitalisée
            </p>
          </header>

          <section
            aria-label="Indicateurs clés"
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.2rem] border border-dema-line bg-dema-paper px-5 py-5"
              >
                <p className="text-[10px] font-normal uppercase tracking-[0.15em] text-dema-forest/70 sm:text-[11px]">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-normal tabular-nums tracking-[-0.035em] text-brand-blue sm:text-[2rem]">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs font-light leading-relaxed text-dema-muted">
                  {metric.detail}
                </p>
              </div>
            ))}
          </section>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.08fr_1fr]">
            <section className="rounded-[1.35rem] border border-dema-line p-5 sm:p-6">
              <PanelTitle>Portefeuille & récurrence</PanelTitle>

              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                <div
                  role="img"
                  aria-label="94 % des clients sont mensuels"
                  className="relative mx-auto size-40 rounded-full sm:size-44"
                  style={{
                    background:
                      "conic-gradient(#315f46 0 94%, #eceeed 94% 100%)",
                  }}
                >
                  <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-dema-paper">
                    <span className="text-3xl font-normal tabular-nums tracking-[-0.04em]">
                      94 %
                    </span>
                    <span className="mt-1 text-xs font-light text-dema-muted">
                      mensuels
                    </span>
                  </div>
                </div>

                <ul className="space-y-4">
                  {portfolioLegend.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`size-2.5 shrink-0 rounded-full ${item.color}`}
                      />
                      <span className="text-lg font-normal tabular-nums">
                        {item.value}
                      </span>
                      <span className="text-sm font-light text-dema-muted">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-dema-line pt-5">
                {services.map((service) => (
                  <div
                    key={service.label}
                    className="rounded-[1rem] bg-dema-sage px-2 py-4 text-center"
                  >
                    <p className="text-2xl font-normal tabular-nums">
                      {service.value}
                    </p>
                    <p className="mt-1 text-[11px] font-light leading-tight text-dema-muted sm:text-xs">
                      {service.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-dema-line p-5 sm:p-6">
              <PanelTitle>Répartition des clients par secteur</PanelTitle>

              <div className="mt-7 space-y-4">
                {sectors.map((sector) => (
                  <div
                    key={sector.label}
                    className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3"
                  >
                    <span className="text-sm font-light text-brand-blue/80">
                      {sector.label}
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-dema-sage">
                      <span
                        className="block h-full rounded-full bg-dema-forest/70"
                        style={{ width: `${(sector.value / 34) * 100}%` }}
                      />
                    </span>
                    <span className="text-right text-sm font-normal tabular-nums">
                      {sector.value} %
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-7 rounded-[1rem] bg-dema-sage px-4 py-4 text-xs font-light leading-relaxed text-dema-muted sm:text-sm">
                18 secteurs représentés. Les deux premiers regroupent 40 % des clients : concentration maîtrisée et portefeuille lisible.
              </p>
            </section>

            <section className="rounded-[1.35rem] border border-dema-line p-5 sm:p-6">
              <PanelTitle>Risque & capacité opérationnelle</PanelTitle>

              <div className="mt-5 rounded-[1rem] border border-dema-forest/10 bg-dema-sage px-5 py-5">
                <p className="text-[10px] font-normal uppercase tracking-[0.16em] text-dema-forest/70 sm:text-[11px]">
                  Concentration du socle mensuel
                </p>
                <p className="mt-3 text-2xl font-normal tabular-nums tracking-[-0.03em] text-dema-forest sm:text-3xl">
                  Top 10 : 34,8 %
                </p>
                <p className="mt-2 text-xs font-light text-dema-muted sm:text-sm">
                  Top 5 : 19,3 % • 1er client : 5,3 %
                </p>
              </div>

              <dl className="mt-4 divide-y divide-dema-line">
                {operations.map((operation) => (
                  <div
                    key={operation.value}
                    className="grid grid-cols-[5.2rem_1fr] items-baseline gap-3 py-3.5 sm:grid-cols-[6rem_1fr]"
                  >
                    <dt className="text-xl font-normal tabular-nums tracking-[-0.03em] sm:text-2xl">
                      {operation.value}
                    </dt>
                    <dd className="text-xs font-light leading-relaxed text-dema-muted sm:text-sm">
                      {operation.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section
            aria-labelledby="strengths-title"
            className="mt-5 rounded-[1.35rem] border border-dema-line px-5 py-5 sm:px-6"
          >
            <h2
              id="strengths-title"
              className="text-[11px] font-normal uppercase tracking-[0.15em] text-dema-forest/75"
            >
              Atouts immédiatement visibles
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {strengths.map((strength) => (
                <li
                  key={strength}
                  className="rounded-full bg-dema-sage px-3.5 py-2 text-xs font-light text-dema-forest sm:text-sm"
                >
                  <span aria-hidden="true">✓ </span>
                  {strength}
                </li>
              ))}
            </ul>
          </section>

        </article>

        <section
          aria-labelledby="opportunity-tools-title"
          className="rounded-[1.75rem] border border-dema-line bg-dema-paper px-5 py-7 sm:px-8 sm:py-9 lg:px-10"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-dema-forest/70">
              Environnement opérationnel
            </p>
            <h2
              id="opportunity-tools-title"
              className="demaa-section-title mt-2 text-3xl text-brand-blue sm:text-4xl"
            >
              Outils utilisés
            </h2>
            <p className="mt-2 text-sm font-light leading-relaxed text-dema-muted sm:text-base">
              Une stack cohérente pour centraliser la production, la comptabilité et la paie.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                aria-label={`Voir la fiche ${tool.name} dans l’annuaire Demaa`}
                className="group rounded-[1.25rem] border border-dema-line bg-dema-sage/60 p-5 transition hover:-translate-y-px hover:border-dema-forest/20 hover:bg-dema-sage focus-visible:outline-none sm:p-6"
              >
                <p className="text-[11px] font-normal uppercase tracking-[0.14em] text-dema-forest/65">
                  {tool.role}
                </p>
                <h3 className="mt-5 text-xl font-normal text-brand-blue">
                  {tool.name}
                </h3>
                <p className="mt-2 min-h-10 text-sm font-light leading-relaxed text-dema-muted">
                  {tool.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-normal text-dema-forest">
                  Voir la fiche
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      </main>
    </>
  );
}
