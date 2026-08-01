import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { logOperationalError } from "@/lib/operational-log";

type RateLimitScope = "email" | "ip";
type RateLimitOptions = Readonly<{
  identity?: string;
  limit: number;
  scope: RateLimitScope;
  windowMs: number;
}>;
type SecurityDependencies = Readonly<{
  database?: ReturnType<typeof getAdminFirestore>;
  env?: NodeJS.ProcessEnv;
  now?: () => number;
  testClientIp?: (request: Request) => string | null;
}>;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function unavailable() {
  return NextResponse.json(
    { error: "La demande ne peut pas être sécurisée pour le moment." },
    { status: 503, headers: { "Retry-After": "60" } },
  );
}

function limited(resetAt: number, now: number) {
  return NextResponse.json(
    { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil((resetAt - now) / 1000))) },
    },
  );
}

function firstValidIp(value: string | null) {
  const candidate = value?.split(",")[0]?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
}

export function getTrustedServiceRequestClientIp(
  request: Request,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (env.VERCEL === "1" || env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production") {
    return firstValidIp(request.headers.get("x-vercel-forwarded-for"));
  }
  if (env.SERVICE_REQUEST_TRUSTED_PROXY === "cloudflare") {
    return firstValidIp(request.headers.get("cf-connecting-ip"));
  }
  return null;
}

function getPepper(env: NodeJS.ProcessEnv) {
  const pepper = env.SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET?.trim();
  if (pepper && pepper.length >= 32) return pepper;
  return null;
}

function hashIdentity(pepper: string, scope: string, identity: string, window: number) {
  return createHmac("sha256", pepper)
    .update(`${scope}:${identity}:${window}`)
    .digest("hex");
}

function incrementMemory(key: string, limit: number, resetAt: number, now: number) {
  const existing = memoryBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 1, resetAt }
    : { count: existing.count + 1, resetAt: existing.resetAt };
  memoryBuckets.set(key, bucket);
  return bucket.count > limit ? limited(bucket.resetAt, now) : null;
}

export function createServiceRequestRateLimiter(dependencies: SecurityDependencies = {}) {
  return async function enforce(
    request: Request,
    options: RateLimitOptions,
  ) {
    const env = dependencies.env ?? process.env;
    const pepper = getPepper(env);
    if (!pepper) return unavailable();
    const identity = options.identity?.trim().toLowerCase()
      || dependencies.testClientIp?.(request)
      || getTrustedServiceRequestClientIp(request, env);
    if (!identity) return unavailable();

    const now = (dependencies.now ?? Date.now)();
    const window = Math.floor(now / options.windowMs);
    const resetAt = (window + 1) * options.windowMs;
    const key = hashIdentity(pepper, options.scope, identity, window);
    const memoryResponse = incrementMemory(key, options.limit, resetAt, now);
    if (memoryResponse) return memoryResponse;

    try {
      const database = dependencies.database ?? getAdminFirestore();
      const reference = database.collection("service_request_rate_limits").doc(key);
      const count = await database.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);
        const previous = snapshot.exists ? Number(snapshot.data()?.count) || 0 : 0;
        const next = previous + 1;
        transaction.set(reference, {
          count: next,
          expires_at: new Date(resetAt + options.windowMs).toISOString(),
          reset_at: new Date(resetAt).toISOString(),
          scope: options.scope,
          updated_at: new Date(now).toISOString(),
        });
        return next;
      });
      return count > options.limit ? limited(resetAt, now) : null;
    } catch {
      logOperationalError("service_request.rate_limit_unavailable", new Error("durable_rate_limit_unavailable"), {
        failureMode: env.SERVICE_REQUEST_RATE_LIMIT_FAILURE_MODE === "bounded-memory"
          ? "bounded-memory"
          : "closed",
        scope: options.scope,
      });
      if (env.SERVICE_REQUEST_RATE_LIMIT_FAILURE_MODE === "bounded-memory") {
        return incrementMemory(`${key}:degraded`, 1, resetAt, now);
      }
      return unavailable();
    }
  };
}

export const enforceServiceRequestRateLimit = createServiceRequestRateLimiter();

export function resetServiceRequestMemoryRateLimitsForTests() {
  if (process.env.NODE_ENV !== "test") throw new Error("Test helper is unavailable.");
  memoryBuckets.clear();
}
