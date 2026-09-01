import ToolComparisonRoute from "@/components/ToolComparisonRoute";

export default async function ToolComparisonModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolComparisonRoute slug={slug} closeWithBack />;
}
