import { permanentRedirect } from "next/navigation";

export default async function LegacySystemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/solutions/${encodeURIComponent(slug)}`);
}
