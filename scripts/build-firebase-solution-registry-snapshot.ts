import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { buildFirebaseSolutionRegistryMigrationRevision } from "@/lib/firebase-solution-registry-migration.server";

const revision = buildFirebaseSolutionRegistryMigrationRevision();
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

if (process.argv.includes("--write")) {
  await writeFile(outputPath, `${JSON.stringify(revision, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ mode: "write", outputPath, summary }, null, 2));
} else {
  console.log(JSON.stringify({ mode: "dry-run", summary }, null, 2));
}
