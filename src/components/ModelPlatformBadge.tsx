import type { CopyableModelPlatform } from "@/lib/copyable-model-catalog";

export default function ModelPlatformBadge({
  platform,
  compact = false,
}: {
  platform: CopyableModelPlatform;
  compact?: boolean;
}) {
  const label = platform === "airtable" ? "Airtable" : "Google Sheets";

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-dema-line bg-white/75 px-2.5 py-1.5 text-xs font-medium text-brand-blue/68">
      {platform === "airtable" ? (
        <svg viewBox="0 0 24 20" className="h-4 w-4" aria-hidden="true">
          <path fill="#fcb400" d="M10.9.7 2.2 4.3c-.5.2-.5.9 0 1.1l8.7 3.5c.7.3 1.4.3 2.1 0l8.7-3.5c.5-.2.5-.9 0-1.1L13 .7a2.8 2.8 0 0 0-2.1 0Z" />
          <path fill="#18bfff" d="m13.5 10.3 8.2-3.2c.4-.2.9.1.9.6v7.7c0 .3-.2.5-.4.6l-8.2 3.2c-.4.2-.9-.1-.9-.6v-7.7c0-.3.2-.5.4-.6Z" />
          <path fill="#f82b60" d="M10.4 10.7 2 7.4a.6.6 0 0 0-.8.6v7.1c0 .3.2.5.4.6l8.4 3.3c.4.2.8-.1.8-.6v-7.1c0-.3-.2-.5-.4-.6Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#0f9d58" d="M5 2h9l5 5v15H5z" />
          <path fill="#87ceac" d="M14 2v5h5z" />
          <path fill="white" d="M8 10h8v1.5H8zm0 3h8v1.5H8zm0 3h8v1.5H8z" />
        </svg>
      )}
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
