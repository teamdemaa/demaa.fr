import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SystemDocument from "@/components/SystemDocument";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire";
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
      title: "Document de structuration introuvable - Demaa",
    };
  }

  return {
    title: `Structurer votre activité ${system.name} - Demaa`,
    description: `Document de structuration Demaa pour structurer une activité ${system.name}.`,
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
