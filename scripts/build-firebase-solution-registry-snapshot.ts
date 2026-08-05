import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import {
  fetchActiveFirebaseSolutionRegistryRevisionFromFirestore,
} from "@/lib/firebase-solution-registry.server";

if (!process.argv.includes("--write")) {
  throw new Error("Export requires --write and reads only the active Firebase revision.");
}

const revision = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore();
const validationErrors = validateFirebaseSolutionRegistryRevision(revision, {
  expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
  requirePublishedRevision: true,
});
if (validationErrors.length > 0) {
  throw new Error(`Active Firebase Solutions revision is invalid:\n${validationErrors.join("\n")}`);
}
const outputPath = fileURLToPath(
  new URL(
    "../src/lib/firebase-solution-registry.snapshot.generated.json",
    import.meta.url,
  ),
);
const summary = {
  revisionId: revision.revisionId,
  revisionStatus: revision.revisionStatus,
  systems: revision.knownSystemSlugs.length,
  resources: revision.resources.length,
  placements: revision.placements.length,
  sourceFingerprint: revision.sourceFingerprint,
};

await writeFile(outputPath, `${JSON.stringify(revision, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ mode: "firebase-export", outputPath, summary }, null, 2));
