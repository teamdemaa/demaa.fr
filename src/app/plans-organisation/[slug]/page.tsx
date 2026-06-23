import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SystemDocument from "@/components/SystemDocument";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getSystemProcessTemplates } from "@/lib/system-process-templates";

type StructuringDocumentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StructuringDocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const system = await getEnterpriseBySlug(slug);

  if (!system) {
    return {
      title: "Plan d'organisation introuvable - Demaa",
    };
  }

  return {
    title: `Plan d'organisation ${system.name} - Demaa`,
    description: `Plan d'organisation Demaa pour mieux organiser l'activité ${system.name}.`,
    alternates: {
      canonical: `/systemes/${system.slug}`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function StructuringDocumentPage({
  params,
}: StructuringDocumentPageProps) {
  const { slug } = await params;
  const [system, templates] = await Promise.all([
    getEnterpriseBySlug(slug),
    getSystemProcessTemplates(),
  ]);

  if (!system) {
    notFound();
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          body > footer {
            display: none !important;
          }
        }
      `}</style>
      <SystemDocument system={system} templates={templates} />
    </>
  );
}
