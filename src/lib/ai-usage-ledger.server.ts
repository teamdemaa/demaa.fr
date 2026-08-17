import "server-only";

import { createHmac } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getTrustedServiceRequestClientIp } from "@/lib/service-request-security.server";

export const AI_USAGE_EVENTS_COLLECTION = "ai_usage_events";

export type AiUsageOperation = "action_plan_generation";

export type AiUsageEvent = {
  operation: AiUsageOperation;
  subjectHash: string | null;
  model: string;
  durationMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  requestCount: number;
  repairCount: number;
};

type AiUsageLedgerDependencies = {
  database?: ReturnType<typeof getAdminFirestore>;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
};

function getLedgerHmacSecret(env: NodeJS.ProcessEnv) {
  const secret =
    env.AI_USAGE_LEDGER_HMAC_SECRET?.trim() ||
    env.SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function normalizeSubject(value: string) {
  return value.trim().toLowerCase();
}

export function createAiUsageSubjectHash(
  scope: "account" | "ip",
  identity: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const secret = getLedgerHmacSecret(env);
  const normalizedIdentity = normalizeSubject(identity);
  if (!secret || !normalizedIdentity) return null;

  return createHmac("sha256", secret)
    .update(`${scope}:${normalizedIdentity}`)
    .digest("hex");
}

export function getAiUsageSubjectHash(
  request: Request,
  accountEmail: string | null,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (accountEmail) {
    return createAiUsageSubjectHash("account", accountEmail, env);
  }

  const clientIp = getTrustedServiceRequestClientIp(request, env);
  return clientIp ? createAiUsageSubjectHash("ip", clientIp, env) : null;
}

function normalizeCount(value: number | null) {
  return Number.isInteger(value) && Number(value) >= 0 ? value : null;
}

export async function recordAiUsage(
  event: AiUsageEvent,
  dependencies: AiUsageLedgerDependencies = {},
) {
  const database = dependencies.database ?? getAdminFirestore();
  const createdAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const reference = database.collection(AI_USAGE_EVENTS_COLLECTION).doc();

  await reference.set({
    operation: event.operation,
    subject_hash: event.subjectHash,
    model: event.model.trim().slice(0, 120),
    duration_ms: normalizeCount(event.durationMs),
    input_tokens: normalizeCount(event.inputTokens),
    output_tokens: normalizeCount(event.outputTokens),
    total_tokens: normalizeCount(event.totalTokens),
    request_count: normalizeCount(event.requestCount),
    repair_count: normalizeCount(event.repairCount),
    created_at: createdAt,
  });
}
