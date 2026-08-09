import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { Firestore } from "firebase-admin/firestore";
import { OAuth2Client } from "google-auth-library";

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

const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
const target = argument("--target=") ?? "default";
if (!(["default", "preview", "production"] as const).includes(
  target as "default" | "preview" | "production",
)) {
  throw new Error("Snapshot export target must be default, preview or production.");
}
const explicitProjectId = target === "preview"
  ? process.env.FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID
  : target === "production"
    ? process.env.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID
    : undefined;
const explicitAccessToken = target === "preview"
  ? process.env.FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN
  : target === "production"
    ? process.env.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN
    : undefined;
if (target !== "default" && (!explicitProjectId || !explicitAccessToken)) {
  throw new Error(`Firebase ${target} snapshot export requires an explicit project and access token.`);
}
const explicitDatabase = explicitProjectId && explicitAccessToken
  ? (() => {
      const auth = new OAuth2Client();
      auth.setCredentials({ access_token: explicitAccessToken });
      return new Firestore({ auth, preferRest: true, projectId: explicitProjectId });
    })()
  : undefined;

const revision = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore(
  explicitDatabase,
);
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
console.log(JSON.stringify({ mode: "firebase-export", target, outputPath, summary }, null, 2));
