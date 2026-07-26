import { buildSportFitnessPublicationStaging } from "@/lib/sport-fitness-publication-staging";

const entries = buildSportFitnessPublicationStaging();

console.table(entries);

if (entries.some((entry) => entry.auditErrors.length > 0)) {
  process.exitCode = 1;
}
