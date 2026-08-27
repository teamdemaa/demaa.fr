import Navbar from "@/components/Navbar";
import AccountingDirectoryClient from "@/components/AccountingDirectoryClient";
import {
  getAccountingDirectoryFacets,
  getAccountingFirms,
} from "@/lib/accounting-directory";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Annuaire experts-comptables - Demaa",
  description:
    "Trouvez un expert-comptable selon votre ville, votre activité, vos besoins en création, paie, fiscalité ou pilotage.",
  path: "/annuaire-experts-comptables",
});

export default async function AccountingDirectoryPage() {
  const [firms, facets] = await Promise.all([
    getAccountingFirms(),
    getAccountingDirectoryFacets(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <AccountingDirectoryClient
          firms={firms}
          facets={facets}
          title="Annuaire experts-comptables"
          description="Un annuaire pensé pour aider les dirigeants à trouver un cabinet selon leur contexte, leur activité et leur besoin réel, sans se perdre dans des listes trop génériques."
        />
      </main>
    </>
  );
}
