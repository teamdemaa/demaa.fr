import { buildHospitalityEventsPublicationStaging } from "@/lib/hospitality-events-publication-staging";

const staging = buildHospitalityEventsPublicationStaging();

console.table(staging);

if (staging.some((entry) => entry.auditErrors.length > 0)) {
  process.exitCode = 1;
}
