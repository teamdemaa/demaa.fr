import { buildProviderNetworkImportPlan } from "@/lib/provider-network-import-plan";

if (process.argv.some((argument) => argument.startsWith("--apply"))) {
  throw new Error(
    "Cette commande est uniquement un dry-run. Toute écriture Firebase nécessite un jalon Preview séparé et explicitement autorisé.",
  );
}

const {
  expertises,
  expertisePlacements,
  opportunities,
  planFingerprint,
  writes,
} = buildProviderNetworkImportPlan();

console.log(JSON.stringify({
  expertiseCount: expertises.length,
  expertisePlacementCount: expertisePlacements.length,
  mode: "dry-run",
  opportunityCount: opportunities.length,
  planFingerprint,
  writeCount: writes.length,
}, null, 2));
