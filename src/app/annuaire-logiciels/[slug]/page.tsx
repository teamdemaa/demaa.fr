import { permanentRedirect } from "next/navigation";

type LegacyLogicielDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyLogicielDetailPage({
  params,
}: LegacyLogicielDetailPageProps) {
  const { slug } = await params;
  permanentRedirect(`/annuaire-logiciel/${slug}`);
}
