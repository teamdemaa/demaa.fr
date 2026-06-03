import { notFound } from "next/navigation";
import SoftwareDetailContent from "@/components/SoftwareDetailContent";
import SoftwareDetailModal from "@/components/SoftwareDetailModal";
import { getToolDirectorySlug } from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type SoftwareModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SoftwareModalPage({ params }: SoftwareModalPageProps) {
  const { slug } = await params;
  const tools = await getUnifiedToolDirectory();
  const tool = tools.find((item) => getToolDirectorySlug(item) === slug);

  if (!tool) {
    notFound();
  }

  return (
    <SoftwareDetailModal>
      <SoftwareDetailContent tool={tool} compact />
    </SoftwareDetailModal>
  );
}
