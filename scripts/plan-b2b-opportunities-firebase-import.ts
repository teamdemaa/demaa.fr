import { createHash } from "node:crypto";
import { INITIAL_B2B_OPPORTUNITIES } from "@/lib/b2b-opportunities-contract";
import { B2B_OPPORTUNITIES_COLLECTION } from "@/lib/b2b-opportunities.server";

const fingerprint = createHash("sha256")
  .update(JSON.stringify(INITIAL_B2B_OPPORTUNITIES))
  .digest("hex");

console.log(JSON.stringify({
  collection: B2B_OPPORTUNITIES_COLLECTION,
  documents: INITIAL_B2B_OPPORTUNITIES.map(({ slug, status, title }) => ({ slug, status, title })),
  fingerprint,
  writeCount: INITIAL_B2B_OPPORTUNITIES.length,
}, null, 2));
