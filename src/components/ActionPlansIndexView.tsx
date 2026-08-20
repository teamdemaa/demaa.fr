import Link from "next/link";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import {
  formatActionPlanUpdatedAt,
  getActionPlanPageConfig,
} from "@/lib/action-plan-page-config";
import type { ActionPlanIndexEntry } from "@/lib/action-plan-storage.server";

type ActionPlanPageConfig = ReturnType<typeof getActionPlanPageConfig>;

export default function ActionPlansIndexView({
  config,
  plans,
}: {
  config: ActionPlanPageConfig;
  plans: readonly ActionPlanIndexEntry[];
}) {
  const { copy } = config;
  return (
    <div className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar
        anonymousLanding
        isAuthenticated
        localeCode={config.localeCode}
        minimal
      />
      <ActionPlanNavbar
        activeView="plan"
        localeCode={config.localeCode}
        routeNavigation
        visibleViews={config.visibleViews}
      />
      <main className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                {copy.spaceLabel}
              </p>
              <h1 className="mt-2 text-4xl font-light tracking-[-0.045em] sm:text-5xl">
                {copy.plansHeading}
              </h1>
            </div>
            {plans.length ? (
              <Link
                href={config.paths.new}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue"
              >
                {copy.newPlan}
              </Link>
            ) : null}
          </div>

          {plans.length ? (
            <ul className="mt-8 grid gap-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={config.paths.plan(plan.id)}
                    className="group flex min-h-24 items-center justify-between gap-5 rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-4 transition hover:border-dema-forest/25 hover:shadow-[0_14px_38px_rgba(23,35,29,0.055)] sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="flex items-start gap-2">
                        <span className="line-clamp-2 block text-lg font-medium tracking-[-0.02em] text-brand-blue group-hover:text-dema-forest">
                          {plan.title}
                        </span>
                        <span className="mt-0.5 shrink-0 rounded-md bg-dema-sage px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-dema-forest">
                          {plan.contentLocaleCode}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-dema-muted">
                        {plan.status === "generating"
                          ? copy.generating
                          : plan.status === "failed"
                            ? copy.failed
                            : `${copy.updated} ${formatActionPlanUpdatedAt({
                                localeCode: config.localeCode,
                                value: plan.updatedAt,
                              })}`}
                      </span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-xl text-dema-forest">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-[1.3rem] border border-dema-line bg-dema-paper px-6 py-12 text-center sm:py-16">
              <h2 className="text-2xl font-light tracking-[-0.035em]">
                {copy.noPlansHeading}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dema-muted">
                {copy.noPlansDescription}
              </p>
              <Link
                href={config.paths.new}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue"
              >
                {copy.createFirstPlan}
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
