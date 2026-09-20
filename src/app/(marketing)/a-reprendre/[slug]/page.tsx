import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RepriseOpportunityDetail from "@/components/RepriseOpportunityDetail";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildRepriseOpportunityJsonLd,
  getRepriseOpportunityDescription,
  getRepriseOpportunityPath,
  serializeRepriseJsonLd,
} from "@/lib/reprise-opportunity-seo";
import { getRepriseOpportunity, repriseOpportunities } from "@/lib/reprise-opportunities";

type RepriseOpportunityPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return repriseOpportunities.map((opportunity) => ({ slug: opportunity.id }));
}

export async function generateMetadata({ params }: RepriseOpportunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getRepriseOpportunity(slug);

  if (!opportunity) notFound();

  return buildPublicPageMetadata({
    title: `${opportunity.activity} à reprendre | Demaa`,
    description: getRepriseOpportunityDescription(opportunity),
    path: getRepriseOpportunityPath(opportunity),
  });
}

export default async function RepriseOpportunityPage({ params }: RepriseOpportunityPageProps) {
  const { slug } = await params;
  const opportunity = getRepriseOpportunity(slug);

  if (!opportunity) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeRepriseJsonLd(buildRepriseOpportunityJsonLd(opportunity)),
        }}
      />
      <Navbar minimal publicNavigationActiveView="none" />
      <main className="bg-dema-cream px-5 py-12 text-brand-blue sm:px-8 sm:py-16">
        <article className="mx-auto max-w-3xl rounded-[2rem] border border-dema-line bg-dema-paper p-6 sm:p-10">
          <RepriseOpportunityDetail headingLevel="h1" opportunity={opportunity} />
        </article>
      </main>
    </>
  );
}
