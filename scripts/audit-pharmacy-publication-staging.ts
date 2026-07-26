import { buildPharmacyPublicationStaging } from "@/lib/pharmacy-publication-staging";

const staging = buildPharmacyPublicationStaging();

console.table([staging]);

if (staging.auditErrors.length > 0) {
  process.exitCode = 1;
}
