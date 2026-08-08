import { createHash } from "node:crypto";
import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import { parseExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import { parseOpportunity } from "@/lib/opportunity-contract";

if (process.argv.some((argument) => argument.startsWith("--apply"))) {
  throw new Error(
    "Cette commande est uniquement un dry-run. Toute écriture Firebase nécessite un jalon Preview séparé et explicitement autorisé.",
  );
}

const expertises = expertiseSnapshot.map((entry, index) =>
  parseExpertiseCatalogEntry(entry, `expertise[${index}]`)
);
const opportunities = opportunitySnapshot.map((entry, index) =>
  parseOpportunity(entry, `opportunity[${index}]`)
);
const writes = [
  ...expertises.map((entry) => ({
    data: entry,
    path: `expertise_catalog/${entry.expertiseId}`,
  })),
  ...opportunities.map((entry) => ({
    data: entry,
    path: `opportunities/${entry.opportunityId}`,
  })),
];
const fingerprint = createHash("sha256")
  .update(JSON.stringify(writes))
  .digest("hex");

console.log(JSON.stringify({
  expertiseCount: expertises.length,
  mode: "dry-run",
  opportunityCount: opportunities.length,
  planFingerprint: fingerprint,
  writeCount: writes.length,
}, null, 2));
