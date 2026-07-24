import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Download, ExternalLink, LockKeyhole, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  isKitAnalyticsDashboardConfigured,
  isKitAnalyticsSessionValid,
  KIT_ANALYTICS_SESSION_COOKIE,
} from "@/lib/kit-analytics-auth.server";
import { getKitAnalyticsOverview } from "@/lib/kit-analytics.server";
import {
  KIT_ANALYTICS_PERIODS,
  normalizeKitAnalyticsPeriod,
} from "@/lib/kit-analytics-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suivi des kits - Demaa",
  robots: {
    follow: false,
    index: false,
  },
};

type KitAnalyticsPageProps = {
  searchParams: Promise<{
    erreur?: string | string[];
    periode?: string | string[];
  }>;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatLastOpenedAt(value: string | null) {
  if (!value) return "—";

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? dateFormatter.format(timestamp) : "—";
}

function LoginScreen({ error, configured }: { error: string | null; configured: boolean }) {
  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-md rounded-[1.5rem] border border-dema-line bg-dema-paper p-7 shadow-[0_20px_60px_rgba(23,35,29,0.08)] sm:p-9">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            Accès privé
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
            Suivi des kits
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Consultez les ouvertures des documents de pilotage, kit par kit.
          </p>

          {!configured ? (
            <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              Définissez la variable sécurisée{" "}
              <code className="font-mono text-xs">KIT_ANALYTICS_DASHBOARD_PASSWORD</code>{" "}
              dans l’environnement de production pour activer cet accès.
            </div>
          ) : (
            <form action="/suivi-kits/acces" method="post" className="mt-7">
              <label
                htmlFor="kit-analytics-password"
                className="text-sm font-semibold text-brand-blue"
              >
                Mot de passe
              </label>
              <input
                id="kit-analytics-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-dema-line bg-white px-4 py-3 text-sm text-brand-blue outline-none transition focus:border-dema-forest focus:ring-2 focus:ring-dema-forest/15"
              />
              {error === "acces" ? (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  Le mot de passe est incorrect.
                </p>
              ) : null}
              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue"
              >
                Accéder au suivi
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default async function KitAnalyticsPage({
  searchParams,
}: KitAnalyticsPageProps) {
  const [resolvedSearchParams, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);
  const configured = isKitAnalyticsDashboardConfigured();
  const sessionToken = cookieStore.get(KIT_ANALYTICS_SESSION_COOKIE)?.value;
  const authenticated = configured && isKitAnalyticsSessionValid(sessionToken);
  const errorValue = Array.isArray(resolvedSearchParams.erreur)
    ? resolvedSearchParams.erreur[0]
    : resolvedSearchParams.erreur;

  if (!authenticated) {
    return <LoginScreen error={errorValue ?? null} configured={configured} />;
  }

  const period = normalizeKitAnalyticsPeriod(resolvedSearchParams.periode);
  const overview = await getKitAnalyticsOverview(period);
  const activeKitCount = overview.rows.filter((row) => row.periodOpens > 0).length;
  const todayOpens = overview.rows.reduce((sum, row) => sum + row.todayOpens, 0);
  const chartSeries = overview.dailySeries.slice(-30);
  const chartPeak = Math.max(0, ...chartSeries.map((point) => point.opens));
  const chartScale = Math.max(1, chartPeak);

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Pilotage interne
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-brand-blue">
                Suivi des kits
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
                Les chiffres correspondent aux ouvertures de la page Google de copie.
                Aucun email ni identifiant visiteur n’est collecté.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/suivi-kits/export?periode=${period}`}
                className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2.5 text-sm font-semibold text-dema-forest transition hover:border-dema-forest/30"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export CSV
              </Link>
              <form action="/suivi-kits/deconnexion" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2.5 text-sm font-semibold text-dema-muted transition hover:text-brand-blue"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Quitter
                </button>
              </form>
            </div>
          </header>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Période d’analyse">
            {KIT_ANALYTICS_PERIODS.map((value) => (
              <Link
                key={value}
                href={`/suivi-kits?periode=${value}`}
                aria-current={period === value ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  period === value
                    ? "bg-dema-forest text-white"
                    : "border border-dema-line bg-dema-paper text-dema-muted hover:text-brand-blue"
                }`}
              >
                {value} jours
              </Link>
            ))}
          </nav>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicateurs clés">
            {[
              { label: "Ouvertures totales", value: overview.totalOpens },
              { label: `${period} derniers jours`, value: overview.periodOpens },
              { label: "Aujourd’hui", value: todayOpens },
              { label: "Kits actifs sur la période", value: activeKitCount },
            ].map((metric) => (
              <article
                key={metric.label}
                className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_10px_30px_rgba(23,35,29,0.035)]"
              >
                <p className="text-xs font-medium text-dema-muted">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-blue">
                  {formatCount(metric.value)}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.75fr)]">
            <article className="rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-blue">Évolution quotidienne</h2>
                  <p className="mt-1 text-xs text-dema-muted">30 derniers jours affichés</p>
                </div>
                <p className="text-xs text-dema-muted">
                  Pic : {formatCount(chartPeak)}
                </p>
              </div>
              <div className="mt-8 flex h-44 items-end gap-1" aria-label="Histogramme des ouvertures quotidiennes">
                {chartSeries.map((point) => (
                  <div
                    key={point.date}
                    className="group relative flex h-full min-w-0 flex-1 items-end"
                    title={`${point.date} : ${point.opens} ouverture${point.opens > 1 ? "s" : ""}`}
                  >
                    <span
                      className="w-full min-w-[2px] rounded-t bg-dema-forest/75 transition group-hover:bg-dema-forest"
                      style={{
                        height: point.opens
                          ? `${Math.max(6, (point.opens / chartScale) * 100)}%`
                          : "2px",
                      }}
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-brand-blue">Sources principales</h2>
              <p className="mt-1 text-xs text-dema-muted">Attribution UTM disponible</p>
              <div className="mt-5 space-y-4">
                {overview.topSources.length ? overview.topSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between gap-4">
                    <span className="truncate text-sm text-dema-muted">{source.source}</span>
                    <span className="shrink-0 text-sm font-semibold text-brand-blue">
                      {formatCount(source.opens)}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-dema-muted">Aucune ouverture sur la période.</p>
                )}
              </div>
            </article>
          </section>

          <section className="mt-6 overflow-hidden rounded-[1.35rem] border border-dema-line bg-dema-paper">
            <div className="border-b border-dema-line px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold text-brand-blue">Détail par kit</h2>
              <p className="mt-1 text-xs text-dema-muted">
                Classement selon les ouvertures de la période sélectionnée
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-dema-line text-[11px] uppercase tracking-[0.1em] text-dema-muted">
                    <th className="px-5 py-4 font-semibold sm:px-6">Kit</th>
                    <th className="px-4 py-4 text-right font-semibold">Période</th>
                    <th className="px-4 py-4 text-right font-semibold">7 jours</th>
                    <th className="px-4 py-4 text-right font-semibold">Total</th>
                    <th className="px-5 py-4 text-right font-semibold sm:px-6">Dernière ouverture</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.rows.length ? overview.rows.map((row) => (
                    <tr key={row.kitSlug} className="border-b border-dema-line/70 last:border-b-0">
                      <td className="px-5 py-4 sm:px-6">
                        <Link
                          href={`/kit-operationnel/${row.kitSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:text-dema-forest"
                        >
                          {row.kitName}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        <p className="mt-1 font-mono text-[11px] text-dema-muted">{row.kitSlug}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-dema-forest">
                        {formatCount(row.periodOpens)}
                      </td>
                      <td className="px-4 py-4 text-right text-dema-muted">
                        {formatCount(row.last7Days)}
                      </td>
                      <td className="px-4 py-4 text-right text-brand-blue">
                        {formatCount(row.totalOpens)}
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-dema-muted sm:px-6">
                        {formatLastOpenedAt(row.lastOpenedAt)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-sm text-dema-muted">
                        Les premières ouvertures apparaîtront ici automatiquement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
