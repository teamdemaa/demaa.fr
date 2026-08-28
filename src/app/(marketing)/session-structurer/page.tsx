import Navbar from "@/components/Navbar";
import StructureProblemSubmissionForm from "@/components/StructureProblemSubmissionForm";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Session de travail offerte | Structurer avec Demaa",
  description:
    "Proposez un problème concret de votre entreprise pour une session de travail offerte de 45 minutes avec Demaa.",
  path: "/session-structurer",
});

export default function StructureWorkSessionPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-dema-line bg-dema-paper p-6 shadow-sm sm:p-9">
          <StructureProblemSubmissionForm />
        </section>
      </main>
    </>
  );
}
