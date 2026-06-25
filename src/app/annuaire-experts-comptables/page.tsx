import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AccountingDirectoryClient from "@/components/AccountingDirectoryClient";
import {
  getAccountingDirectoryFacets,
  getAccountingFirms,
} from "@/lib/accounting-directory";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";

export const metadata: Metadata = {
  title: "Annuaire experts-comptables - Demaa",
  description:
    "Trouvez un expert-comptable selon votre ville, votre activité, vos besoins en création, paie, fiscalité ou pilotage.",
  alternates: {
    canonical: "/annuaire-experts-comptables",
  },
  openGraph: {
    title: "Annuaire experts-comptables - Demaa",
    description:
      "Trouvez un expert-comptable selon votre ville, votre activité, vos besoins en création, paie, fiscalité ou pilotage.",
    url: "/annuaire-experts-comptables",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire experts-comptables - Demaa",
    description:
      "Trouvez un expert-comptable selon votre ville, votre activité, vos besoins en création, paie, fiscalité ou pilotage.",
  },
};

type AccountingDirectoryPageProps = {
  searchParams: Promise<{
    retourSysteme?: string | string[];
  }>;
};

export default async function AccountingDirectoryPage({
  searchParams,
}: AccountingDirectoryPageProps) {
  const params = await searchParams;
  const retourSysteme = getParamValue(params.retourSysteme);
  const [firms, facets] = await Promise.all([
    getAccountingFirms(),
    getAccountingDirectoryFacets(),
  ]);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}?tab=expert-comptable`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <AccountingDirectoryClient
          firms={firms}
          facets={facets}
          title="Annuaire experts-comptables"
          description="Un annuaire pensé pour aider les dirigeants à trouver un cabinet selon leur contexte, leur activité et leur besoin réel, sans se perdre dans des listes trop génériques."
          backLink={backLink}
        />
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
