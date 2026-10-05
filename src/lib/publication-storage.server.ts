import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { PublicationRecord } from "@/lib/publication-contract";
function key() {
  const value = process.env.STUDIO_PUBLICATIONS_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("Publication storage key is not configured.");
  return Buffer.from(value, "hex");
}
export function encodePublication(record: PublicationRecord) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(record.id));
  const body = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  return { format: "encrypted-v1", payload: Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64") };
}
export function decodePublication(id: string, stored: Record<string, unknown>): PublicationRecord {
  if (stored.format !== "encrypted-v1" || typeof stored.payload !== "string") throw new Error("Invalid publication storage format.");
  const payload = Buffer.from(stored.payload, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), payload.subarray(0, 12));
  decipher.setAAD(Buffer.from(id));
  decipher.setAuthTag(payload.subarray(12, 28));
  const text = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  const record = JSON.parse(text) as PublicationRecord;
  if (record.id !== id) throw new Error("Invalid publication identity.");
  return record;
}
