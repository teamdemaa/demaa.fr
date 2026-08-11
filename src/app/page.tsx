import type { Metadata } from "next";
import { cookies } from "next/headers";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

const title = "Un plan d’action concret pour votre entreprise | Demaa";
const description =
  "Décrivez la situation de votre entreprise et obtenez un plan d’action concret, accompagné du système métier adapté pour l’exécuter.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  return (
    <>
      <Navbar anonymousLanding isAuthenticated={Boolean(email)} minimal />
      <ActionPlanExperience
        initialEmail={email || ""}
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
