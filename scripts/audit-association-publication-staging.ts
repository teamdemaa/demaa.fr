import { buildAssociationPublicationStaging } from "@/lib/association-publication-staging";

const staging = buildAssociationPublicationStaging();

console.table([staging]);

if (staging.auditErrors.length > 0) {
  process.exitCode = 1;
}
