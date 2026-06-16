import { permanentRedirect } from "next/navigation";

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  permanentRedirect(`/annuaire-services/${slug}`);
}
