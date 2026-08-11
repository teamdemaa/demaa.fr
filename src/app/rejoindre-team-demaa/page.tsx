import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import ExpertiseCatalogClient from "@/components/ExpertiseCatalogClient";
import Navbar from "@/components/Navbar";
import { getPublicExpertises } from "@/lib/provider-network.server";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

const title = "Rejoindre Team Demaa | Demaa";
const description =
  "Présentez votre profil professionnel à Demaa et soyez contacté lorsqu’un besoin correspond à votre expertise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/rejoindre-team-demaa" },
  openGraph: {
    title,
    description,
    url: "/rejoindre-team-demaa",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function JoinTeamDemaaPage() {
  await connection();
  const cookieStore = await cookies();
  const [expertises, email] = await Promise.all([
    getPublicExpertises(),
    getEmailFromCustomerSessionToken(
      cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value ?? null,
    ),
  ]);

  return (
    <>
      <Navbar anonymousLanding isAuthenticated={Boolean(email)} minimal />
      <main data-action-plan-workspace className="min-h-screen flex-1 bg-dema-cream px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <ActionPlanNavbar activeView="opportunities" routeNavigation />
        <div className="mx-auto max-w-[68rem] pt-1">
          <section className="mx-auto max-w-6xl pt-2 sm:pt-4">
            <h1 className="sr-only">Rejoindre Team Demaa</h1>
            <div className="mx-auto max-w-xl">
              <Link
                href="/?view=opportunities"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Retour aux opportunités</span>
              </Link>
            </div>
            <ExpertiseCatalogClient
              compact
              expertises={expertises}
              initialEmail={email ?? ""}
            />
          </section>
        </div>
      </main>
    </>
  );
}
