import { notFound } from "next/navigation";
import CopyableModelDetails from "@/components/CopyableModelDetails";
import CopyableModelRouteDialog from "@/components/CopyableModelRouteDialog";
import {
  getPublishedCopyableModelBySlug,
  getPublishedCopyableModelRouteParams,
} from "@/lib/copyable-model-catalog";

type ModelModalPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedCopyableModelRouteParams();
}

export default async function ModelModalPage({ params }: ModelModalPageProps) {
  const { slug } = await params;
  const model = getPublishedCopyableModelBySlug(slug);
  if (!model) notFound();

  return (
    <CopyableModelRouteDialog ariaLabel={`Modèle ${model.title}`}>
      <CopyableModelDetails model={model} variant="modal" />
    </CopyableModelRouteDialog>
  );
}
