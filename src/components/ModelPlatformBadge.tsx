import type { CopyableModelPlatform } from "@/lib/copyable-model-catalog";

export default function ModelPlatformBadge({
  platform,
}: {
  platform: CopyableModelPlatform;
}) {
  const label = platform === "airtable"
    ? "Airtable"
    : platform === "google-drive"
      ? "Google Drive"
      : platform === "google-sheets"
        ? "Google Sheets"
        : "Notion";

  return (
    <span className="inline-flex items-center rounded-lg border border-dema-line bg-white/75 px-2.5 py-1.5 text-xs font-medium text-brand-blue/68">
      {label}
    </span>
  );
}
