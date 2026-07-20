import { createHash } from "node:crypto";

export function buildLeadIdempotencyHash(
  requestType: string,
  idempotencyKey: string,
) {
  return createHash("sha256")
    .update(`${requestType}:${idempotencyKey}`)
    .digest("hex");
}
