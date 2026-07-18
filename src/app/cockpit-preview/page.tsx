import type { Metadata } from "next";
import { cookies } from "next/headers";
import CockpitPreviewApp from "@/components/cockpit/CockpitPreviewApp";
import { buildCockpitActivities } from "@/lib/cockpit-catalog";
import { getCockpitStateByEmail } from "@/lib/cockpit-db";
import { CUSTOMER_SPACE_COOKIE, getEmailFromCustomerSessionToken } from "@/lib/customer-space-auth";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import { demaaServices } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Aperçu du cockpit Demaa",
  description: "Prévisualisation privée de la nouvelle expérience Demaa.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function CockpitPreviewPage() {
  const [enterprises, cookieStore] = await Promise.all([
    getEnterpriseCatalog(),
    cookies(),
  ]);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value ?? null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);
  const remoteState = email ? await getCockpitStateByEmail(email) : null;
  const activities = buildCockpitActivities(enterprises);
  const services = demaaServices.map((service) => ({
    slug: service.slug,
    name: service.name,
    category: service.category,
    shortDescription: service.shortDescription,
  }));

  return (
    <CockpitPreviewApp
      activities={activities}
      initialEmail={email}
      initialRemoteState={remoteState}
      services={services}
    />
  );
}
