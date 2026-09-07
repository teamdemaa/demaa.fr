import type { CopyableModelPlatform } from "@/lib/copyable-model-catalog";

export default function ModelPlatformBadge({
  platform,
  compact = false,
}: {
  platform: CopyableModelPlatform;
  compact?: boolean;
}) {
  const label = platform === "airtable"
    ? "Airtable"
    : platform === "google-drive"
      ? "Google Drive"
      : platform === "google-sheets"
        ? "Google Sheets"
        : "Notion";

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-dema-line bg-white/75 px-2.5 py-1.5 text-xs font-medium text-brand-blue/68">
      {platform === "airtable" ? (
        <svg viewBox="0 0 24 20" className="h-4 w-4" aria-hidden="true">
          <path fill="#fcb400" d="M10.9.7 2.2 4.3c-.5.2-.5.9 0 1.1l8.7 3.5c.7.3 1.4.3 2.1 0l8.7-3.5c.5-.2.5-.9 0-1.1L13 .7a2.8 2.8 0 0 0-2.1 0Z" />
          <path fill="#18bfff" d="m13.5 10.3 8.2-3.2c.4-.2.9.1.9.6v7.7c0 .3-.2.5-.4.6l-8.2 3.2c-.4.2-.9-.1-.9-.6v-7.7c0-.3.2-.5.4-.6Z" />
          <path fill="#f82b60" d="M10.4 10.7 2 7.4a.6.6 0 0 0-.8.6v7.1c0 .3.2.5.4.6l8.4 3.3c.4.2.8-.1.8-.6v-7.1c0-.3-.2-.5-.4-.6Z" />
        </svg>
      ) : platform === "google-drive" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#0F9D58" d="M8.2 3h5.1l7.2 12.5h-5.1z" />
          <path fill="#F4B400" d="M8.2 3 1 15.5h5.1L13.3 3z" />
          <path fill="#4285F4" d="M6.1 15.5h14.4L18 20H3.5z" />
        </svg>
      ) : platform === "google-sheets" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#0f9d58" d="M5 2h9l5 5v15H5z" />
          <path fill="#87ceac" d="M14 2v5h5z" />
          <path fill="white" d="M8 10h8v1.5H8zm0 3h8v1.5H8zm0 3h8v1.5H8z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <rect x="3" y="2.5" width="18" height="19" rx="2.5" fill="#fff" stroke="#111" strokeWidth="1.5" />
          <path fill="#111" d="M7.2 7.1c.1.7.8.8 1.5.7l.7-.1v8.2l-1.1.2c-.7.1-.9.8-.2.9h4.4c.8 0 .8-.7.1-.9l-1.1-.2V9.2l5.1 7.9c.3.5.6.7 1 .7.5 0 .7-.3.7-.8V7.6l.9-.2c.6-.1.6-.8-.1-.8h-3.7c-.7 0-.8.7-.1.8l1.1.2v6.3L12 7.1c-.3-.4-.5-.5-.9-.5H8c-.6 0-.9.2-.8.5Z" />
        </svg>
      )}
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
