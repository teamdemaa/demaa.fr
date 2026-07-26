import { buildInvestmentPublicationStaging } from "@/lib/investment-publication-staging";

const entries = buildInvestmentPublicationStaging();

console.table(entries);

if (entries.some((entry) => entry.auditErrors.length > 0)) {
  process.exitCode = 1;
}
