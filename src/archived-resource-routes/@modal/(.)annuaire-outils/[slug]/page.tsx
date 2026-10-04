import { notFound } from "next/navigation";
import SoftwareDetailContent from "@/components/SoftwareDetailContent";
import SoftwareDetailModal from "@/components/SoftwareDetailModal";
import { findToolDirectoryItemBySlug } from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type ToolModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ToolModalPage({ params }: ToolModalPageProps) {
  const { slug } = await params;
  const tools = await getUnifiedToolDirectory();
  const tool = findToolDirectoryItemBySlug(tools, slug);

  if (!tool) {
    notFound();
  }

  return (
    <SoftwareDetailModal>
      <SoftwareDetailContent tool={tool} compact />
    </SoftwareDetailModal>
  );
}
