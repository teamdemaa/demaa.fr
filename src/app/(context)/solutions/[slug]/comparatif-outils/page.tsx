import type { Metadata } from "next";
import ToolComparisonRoute from "@/components/ToolComparisonRoute";

export const metadata: Metadata = {
  title: "Comparatif des outils - Demaa",
  robots: { index: false, follow: false },
};

export default async function ToolComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolComparisonRoute slug={slug} closeWithBack={false} />;
}
