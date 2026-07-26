import { buildCrechePublicationStaging } from "@/lib/creche-publication-staging";

const staging = buildCrechePublicationStaging();

console.table([staging]);

if (staging.auditErrors.length > 0) {
  process.exitCode = 1;
}
