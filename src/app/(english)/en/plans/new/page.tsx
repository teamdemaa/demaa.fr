import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import DocumentLocale from "@/components/DocumentLocale";
import Navbar from "@/components/Navbar";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { englishActionPlanSystemOptions } from "@/lib/action-plan-localization";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New action plan | Demaa",
  robots: { index: false, follow: false },
};

export default async function NewEnglishActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  const [identity, params] = await Promise.all([
    getCurrentCustomerAppIdentityFromSession(),
    searchParams,
  ]);
  if (!identity) redirect("/connexion?returnTo=%2Fen%2Fplans%2Fnew");
  const plans = await getActionPlanIndexForIdentity(identity);

  return (
    <>
      <DocumentLocale localeCode="en" />
      <Navbar anonymousLanding isAuthenticated localeCode="en" minimal />
      {plans.length ? (
        <div className="mx-auto w-full max-w-[68rem] px-4 pt-3 sm:px-6 lg:px-8">
          <Link href="/en/plans" className="inline-flex min-h-11 items-center text-sm text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:underline">← Back to my plans</Link>
        </div>
      ) : null}
      <ActionPlanExperience
        contentLocaleCode="en"
        initialEmail={identity.email}
        initialGenerationIntent={(Array.isArray(params.resume) ? params.resume[0] : params.resume) === "generation"}
        initialIsAuthenticated
        marketCodeAtCreation="global-en-beta"
        showCoaching
        systemOptions={englishActionPlanSystemOptions}
        visibleViews={["plan", "solutions"]}
      />
    </>
  );
}
