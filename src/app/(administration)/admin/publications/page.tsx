import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import PublicationAdminClient from "@/components/PublicationAdminClient";
import { requireAdminIdentity } from "@/lib/admin-auth.server";
import { listPublications } from "@/lib/publications.server";
import { newsletterReady } from "@/lib/publication-newsletter.server";
export const metadata = { title: "Publications | DEMAA", robots: { index: false, follow: false } };
export default async function PublicationsPage() {
  await connection();
  await requireAdminIdentity("/admin/publications");
  const publications = await listPublications();
  return <><Navbar adminControls minimal /><main className="mx-auto w-full max-w-6xl px-5 py-12"><h1 className="demaa-section-title text-4xl">Publications</h1><p className="mt-3 text-dema-muted">Écrire, publier et partager les apprentissages du Studio.</p><PublicationAdminClient initial={publications} newsletterConfigured={newsletterReady()} /></main></>;
}
