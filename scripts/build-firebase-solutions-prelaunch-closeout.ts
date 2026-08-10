import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import { buildPublishedPrelaunchCloseoutRevision } from "@/lib/firebase-solution-registry-prelaunch-closeout.server";

const candidate = buildPublishedPrelaunchCloseoutRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);

if (process.argv.includes("--write")) {
  await writeFile(
    resolve(process.cwd(), "src/lib/firebase-solution-registry.snapshot.generated.json"),
    `${JSON.stringify(candidate, null, 2)}\n`,
    "utf8",
  );
}

console.log(JSON.stringify({
  mode: process.argv.includes("--write") ? "generated-fallback-written" : "dry-run",
  revisionId: candidate.revisionId,
  revisionStatus: candidate.revisionStatus,
  resources: candidate.resources.length,
  placements: candidate.placements.length,
  investmentSoftware: candidate.placements.filter(
    ({ placement }) =>
      placement.systemSlug === "investissement-entreprise" &&
      placement.section === "software",
  ).map(({ placement }) => ({
    resourceSlug: placement.resourceSlug,
    rank: placement.rank,
  })),
  sourceFingerprint: candidate.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
  writes: plan.writes.length,
}, null, 2));
