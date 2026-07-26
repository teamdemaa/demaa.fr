import { buildTextileCarePublicationStaging } from "@/lib/textile-care-publication-staging";

const entries = buildTextileCarePublicationStaging();

console.table(entries);

if (entries.some((entry) => entry.auditErrors.length > 0)) {
  process.exitCode = 1;
}
