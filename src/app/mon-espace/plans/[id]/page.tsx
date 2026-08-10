import { redirect } from "next/navigation";

export default async function SavedActionPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/plans/${encodeURIComponent(id)}`);
}
