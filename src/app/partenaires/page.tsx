import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PartnerSubmissionForm from "@/components/PartnerSubmissionForm";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";

const title = "Proposer votre solution | Demaa";
const description =
  "Faites connaître votre solution aux entreprises qui en ont réellement besoin, dans les systèmes métier où elle est pertinente.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partenaires" },
  openGraph: {
    title,
    description,
    url: "/partenaires",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const systemOptions = enterpriseCatalog
  .map(({ name, slug }) => ({ name, slug }))
  .sort((first, second) => first.name.localeCompare(second.name, "fr"));

export default function PartnerPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-light leading-[1.05] tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-[3.6rem]">
              Proposer votre solution
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-balance text-lg font-light leading-8 text-dema-muted sm:text-xl">
              Faites connaître votre solution aux entreprises qui en ont réellement besoin :
              Demaa l’étudie et peut la présenter dans les systèmes métier où elle est
              pertinente, pour vous donner de la visibilité auprès de dirigeants qui ont un
              besoin concret.
            </p>
          </header>

          <PartnerSubmissionForm systems={systemOptions} />
        </div>
      </main>
    </>
  );
}
