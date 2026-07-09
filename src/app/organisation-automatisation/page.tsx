import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  alternates: {
    canonical: "/organisation",
  },
};

type OrganisationAutomatisationRedirectPageProps = {
  searchParams: Promise<{
    retour?: string | string[];
  }>;
};

export default async function OrganisationAutomatisationRedirectPage({
  searchParams,
}: OrganisationAutomatisationRedirectPageProps) {
  const params = await searchParams;
  const retour = getParamValue(params.retour);
  permanentRedirect(
    retour
      ? `/annuaire-services/organisation?retour=${encodeURIComponent(retour)}`
      : "/annuaire-services/organisation",
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
