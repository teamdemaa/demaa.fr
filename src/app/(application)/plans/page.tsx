import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans d’action | Demaa",
  robots: { index: false, follow: false },
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Paris",
      }).format(date);
}

export default async function ActionPlansPage() {
  const identity = await getCurrentCustomerAppIdentityFromSession();

  if (!identity) redirect("/connexion?returnTo=%2Fplans");

  const plans = await getActionPlanIndexForIdentity(identity);
  return (
    <div className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar anonymousLanding isAuthenticated minimal />
      <ActionPlanNavbar activeView="plan" routeNavigation />
      <main className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                Votre espace
              </p>
              <h1 className="mt-2 text-4xl font-light tracking-[-0.045em] sm:text-5xl">
                Mes plans
              </h1>
            </div>
            <Link
              href="/plans/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue"
            >
              Nouveau plan
            </Link>
          </div>

          {plans.length ? (
            <ul className="mt-8 grid gap-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={`/plans/${plan.id}`}
                    className="group flex min-h-24 items-center justify-between gap-5 rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-4 transition hover:border-dema-forest/25 hover:shadow-[0_14px_38px_rgba(23,35,29,0.055)] sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-lg font-medium tracking-[-0.02em] text-brand-blue group-hover:text-dema-forest">
                        {plan.title}
                      </span>
                      <span className="mt-1 block text-xs text-dema-muted">
                        {plan.status === "generating"
                          ? "Génération en cours"
                          : plan.status === "failed"
                            ? "Génération à reprendre"
                            : `Modifié le ${formatUpdatedAt(plan.updatedAt)}`}
                      </span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-xl text-dema-forest">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-[1.3rem] border border-dema-line bg-dema-paper px-6 py-12 text-center sm:py-16">
              <h2 className="text-2xl font-light tracking-[-0.035em]">
                Aucun plan pour le moment
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dema-muted">
                Décrivez votre situation pour créer votre premier plan d’action enregistré.
              </p>
              <Link
                href="/plans/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue"
              >
                Créer mon premier plan
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
