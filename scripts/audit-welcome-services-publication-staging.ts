import { buildWelcomeServicesPublicationStaging } from "@/lib/welcome-services-publication-staging";

const entries = buildWelcomeServicesPublicationStaging();

console.table(entries);

if (entries.some((entry) => entry.auditErrors.length > 0)) {
  process.exitCode = 1;
}
