import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { logOperationalError } from "@/lib/operational-log";

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();
const textEncoder = new TextEncoder();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function cleanupExpiredBuckets(now: number) {
  if (rateLimitBuckets.size < 5000) return;

  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function buildRateLimitResponse(resetAt: number, now: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));

  return NextResponse.json(
    { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export async function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
  keySuffix?: string
) {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const identity = keySuffix || getClientIp(request);
  const key = `${options.keyPrefix}:${identity}`;
  let current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    current = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitBuckets.set(key, current);
  } else {
    current.count += 1;
  }

  if (current.count > options.limit) {
    return buildRateLimitResponse(current.resetAt, now);
  }

  const windowNumber = Math.floor(now / options.windowMs);
  const resetAt = (windowNumber + 1) * options.windowMs;
  const salt = process.env.CRON_SECRET || process.env.FIREBASE_PROJECT_ID || "demaa";
  const durableKey = createHash("sha256")
    .update(`${salt}:${options.keyPrefix}:${identity}:${windowNumber}`)
    .digest("hex");

  try {
    const database = getAdminFirestore();
    const bucketRef = database.collection("api_rate_limits").doc(durableKey);
    const count = await database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(bucketRef);
      const previousCount = snapshot.exists
        ? Number(snapshot.data()?.count) || 0
        : 0;
      const nextCount = previousCount + 1;

      transaction.set(bucketRef, {
        count: nextCount,
        expires_at: new Date(resetAt + options.windowMs).toISOString(),
        key_prefix: options.keyPrefix,
        reset_at: new Date(resetAt).toISOString(),
        updated_at: new Date(now).toISOString(),
      });

      return nextCount;
    });

    return count > options.limit
      ? buildRateLimitResponse(resetAt, now)
      : null;
  } catch (error) {
    logOperationalError("rate_limit.durable_unavailable", error, {
      keyPrefix: options.keyPrefix,
    });
    return null;
  }
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes = 16 * 1024
): Promise<{ data: T | null; response: NextResponse | null }> {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      data: null,
      response: NextResponse.json(
        { error: "La requete est trop volumineuse." },
        { status: 413 }
      ),
    };
  }

  const rawBody = await request.text().catch(() => "");

  if (textEncoder.encode(rawBody).byteLength > maxBytes) {
    return {
      data: null,
      response: NextResponse.json(
        { error: "La requete est trop volumineuse." },
        { status: 413 }
      ),
    };
  }

  try {
    return { data: JSON.parse(rawBody) as T, response: null };
  } catch {
    return {
      data: null,
      response: NextResponse.json(
        { error: "Le format JSON est invalide." },
        { status: 400 }
      ),
    };
  }
}

export function normalizeText(
  value: unknown,
  maxLength: number,
  options: { multiline?: boolean } = {}
) {
  if (typeof value !== "string") return "";

  const normalized = options.multiline
    ? value.replace(/\r\n?/g, "\n").trim()
    : value.replace(/\s+/g, " ").trim();

  return normalized.slice(0, maxLength);
}

export function normalizeIdempotencyKey(value: unknown) {
  const key = normalizeText(value, 220);
  return /^[A-Za-z0-9:_-]{8,220}$/.test(key) ? key : null;
}

export function escapeSlackMrkdwn(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
