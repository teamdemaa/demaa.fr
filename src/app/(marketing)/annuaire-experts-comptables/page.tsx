import Link from "next/link";
import Navbar from "@/components/Navbar";
import AccountingDirectoryClient from "@/components/AccountingDirectoryClient";
import {
  getAccountingDirectoryFacets,
  getAccountingFirms,
} from "@/lib/accounting-directory";
import { accountingDirectorySeoPages } from "@/lib/accounting-directory-seo-pages";
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
        <nav
          aria-label="Parcourir l'annuaire par ville ou région"
          className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-10"
        >
          {accountingDirectorySeoPages.map((seoPage) => (
            <Link
              key={seoPage.slug}
              href={`/annuaire-experts-comptables/${seoPage.slug}`}
              className="rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-xs font-medium text-brand-blue/75 transition hover:border-dema-forest/30 hover:text-dema-forest"
            >
              {seoPage.title}
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
