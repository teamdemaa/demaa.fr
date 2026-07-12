import { notFound, permanentRedirect } from "next/navigation";

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const normalizedSlug =
    slug === "structuration-automatisation"
      ? "organisation"
      : slug;

  if (normalizedSlug === "organisation" || normalizedSlug === "organisation-automatisation") {
    notFound();
  }

  permanentRedirect(`/annuaire-services/${normalizedSlug}`);
}
