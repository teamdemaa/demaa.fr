import type { Metadata } from "next";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import { requireAdminIdentity } from "@/lib/admin-auth.server";
import {
  loadAdminToolRegistryReadModel,
  type AdminToolPlacement,
} from "@/lib/admin-tool-registry.server";

export const metadata: Metadata = {
  title: "Curation des outils | Demaa",
  robots: { follow: false, index: false },
};

type PageProps = Readonly<{
  searchParams: Promise<{ q?: string | string[] }>;
}>;

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatDate(value: string | null) {
  return value ? DATE_FORMATTER.format(new Date(value)) : "Non renseignée";
}

function ToolList({ tools }: Readonly<{ tools: readonly AdminToolPlacement[] }>) {
  if (tools.length === 0) {
    return <p className="mt-3 text-sm text-dema-muted">Aucun outil sélectionné.</p>;
  }

  return (
    <ol className="mt-4 space-y-3">
      {tools.map((tool) => (
        <li key={tool.placementId} className="rounded-xl border border-dema-border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-brand-blue">
                {tool.rank}. {tool.name}
              </p>
              <p className="mt-1 text-xs text-dema-muted">{tool.resourceSlug}</p>
            </div>
            <span className="rounded-full bg-dema-cream px-2.5 py-1 text-xs text-dema-forest">
              {tool.placementStatus} / {tool.resourceStatus}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-brand-blue">{tool.usage}</p>
          <p className="mt-2 text-sm leading-relaxed text-dema-muted">
            {tool.fitRationale}
          </p>
          {tool.fitConstraints.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-dema-muted">
              {tool.fitConstraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          ) : null}
          <dl className="mt-3 grid gap-2 text-xs text-dema-muted sm:grid-cols-3">
            <div>
              <dt className="font-medium text-brand-blue">Revue</dt>
              <dd>{formatDate(tool.reviewedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-brand-blue">Expiration</dt>
              <dd>{formatDate(tool.expiresAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-brand-blue">Preuves</dt>
              <dd>{tool.evidenceSources.length}</dd>
            </div>
          </dl>
          {tool.evidenceSources.length > 0 ? (
            <details className="mt-3 text-xs text-dema-muted">
              <summary className="cursor-pointer text-dema-forest">
                Voir les sources de preuve
              </summary>
              <ul className="mt-2 space-y-1">
                {tool.evidenceSources.map((source) => (
                  <li key={source} className="break-all">{source}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function normalizeQuery(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim().slice(0, 100) ?? "";
}

export default async function AdminToolsPage({ searchParams }: PageProps) {
  await connection();
  await requireAdminIdentity("/admin/outils");
  const [params, registry] = await Promise.all([
    searchParams,
    loadAdminToolRegistryReadModel(),
  ]);
  const query = normalizeQuery(params.q);
  const normalizedQuery = query.toLocaleLowerCase("fr-FR");
  const displayedSystems = registry.status === "ready"
    ? normalizedQuery
      ? registry.systems.filter(({ name, slug }) =>
          `${name} ${slug}`.toLocaleLowerCase("fr-FR").includes(normalizedQuery)
        )
      : registry.systems.slice(0, 20)
    : [];

  return (
    <>
      <Navbar adminControls minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Curation des outils
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-dema-muted">
            Vue Team en lecture seule. Cette page ne modifie ni les sélections,
            ni les révisions Firebase, ni le pointeur actif.
          </p>

          {registry.status === "unavailable" ? (
            <div role="alert" className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-800">
              {registry.error}
            </div>
          ) : (
            <>
              <section aria-label="Révisions" className="mt-10 grid gap-4 md:grid-cols-2">
                <div className="demaa-card rounded-2xl p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-dema-forest">
                    Révision active
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-brand-blue">
                    {registry.active.revisionId}
                  </p>
                  <p className="mt-2 text-xs text-dema-muted">
                    {registry.active.revisionStatus} · {formatDate(registry.active.createdAt)}
                  </p>
                </div>
                <div className="demaa-card rounded-2xl p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-dema-forest">
                    Révision candidate
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-brand-blue">
                    {registry.candidate?.revisionId
                      ?? registry.candidateRevisionId
                      ?? "Aucune candidate Firebase configurée"}
                  </p>
                  <p className="mt-2 text-xs text-dema-muted">
                    {registry.candidate
                      ? `${registry.candidate.revisionStatus} · ${formatDate(registry.candidate.createdAt)}`
                      : registry.candidateError ?? "La candidate locale D-091 reste hors Production."}
                  </p>
                </div>
              </section>

              <form action="/admin/outils" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="admin-tool-system-search" className="sr-only">
                  Rechercher un métier
                </label>
                <input
                  id="admin-tool-system-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Rechercher parmi les 115 métiers"
                  className="min-h-11 flex-1 rounded-xl border border-dema-border bg-white px-4 text-sm text-brand-blue outline-none focus:border-dema-forest"
                />
                <button type="submit" className="demaa-button-primary min-h-11 px-5 text-sm">
                  Rechercher
                </button>
              </form>

              <section aria-label="Sélections par métier" className="mt-8 space-y-3">
                <p className="text-sm text-dema-muted">
                  {displayedSystems.length} métier{displayedSystems.length > 1 ? "s" : ""} affiché{displayedSystems.length > 1 ? "s" : ""}
                  {normalizedQuery ? "" : " sur 115. Utilisez la recherche pour les autres."}
                </p>
                {displayedSystems.map((system) => (
                  <details key={system.slug} className="demaa-card rounded-2xl px-5 py-4 [content-visibility:auto]">
                    <summary className="cursor-pointer list-none text-base font-medium text-brand-blue">
                      <span>{system.name}</span>
                      <span className="ml-2 text-sm font-normal text-dema-muted">
                        {system.activeTools.length} outil{system.activeTools.length > 1 ? "s" : ""}
                      </span>
                    </summary>
                    <p className="mt-2 text-xs text-dema-muted">{system.slug}</p>
                    {system.candidateTools ? (
                      <p className="mt-3 text-xs text-dema-muted">
                        Candidate : +{system.addedResourceSlugs.length} / -{system.removedResourceSlugs.length}
                      </p>
                    ) : null}
                    <ToolList tools={system.candidateTools ?? system.activeTools} />
                  </details>
                ))}
                {displayedSystems.length === 0 ? (
                  <p className="rounded-2xl border border-dema-border bg-white p-5 text-sm text-dema-muted">
                    Aucun métier ne correspond à cette recherche.
                  </p>
                ) : null}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
