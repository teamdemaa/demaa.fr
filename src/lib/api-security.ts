import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

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
let distributedRateLimitWarningShown = false;

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

function createRateLimitResponse(resetAt: number, now: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));

  return NextResponse.json(
    { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

function enforceInMemoryRateLimit(key: string, options: RateLimitOptions, now: number) {
  cleanupExpiredBuckets(now);
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  current.count += 1;

  if (current.count <= options.limit) {
    return null;
  }

  return createRateLimitResponse(current.resetAt, now);
}

function getRateLimitDocId(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

async function enforceDistributedRateLimit(
  key: string,
  options: RateLimitOptions,
  now: number
) {
  try {
    const { getAdminFirestore } = await import("@/lib/firebase-admin");
    const database = getAdminFirestore();
    const bucketRef = database.collection("rate_limits").doc(getRateLimitDocId(key));
    const nextResetAt = now + options.windowMs;

    let count = 0;
    let resetAt = nextResetAt;

    await database.runTransaction(async (transaction) => {
      const bucketDoc = await transaction.get(bucketRef);
      const bucket = bucketDoc.data() as Partial<RateLimitBucket> | undefined;
      const storedResetAt =
        typeof bucket?.resetAt === "number" ? bucket.resetAt : nextResetAt;

      if (!bucketDoc.exists || storedResetAt <= now) {
        count = 1;
        resetAt = nextResetAt;
      } else {
        count = typeof bucket?.count === "number" ? bucket.count + 1 : 1;
        resetAt = storedResetAt;
      }

      transaction.set(
        bucketRef,
        {
          count,
          keyPrefix: options.keyPrefix,
          resetAt,
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );
    });

    if (count <= options.limit) {
      return null;
    }

    return createRateLimitResponse(resetAt, now);
  } catch (error) {
    if (!distributedRateLimitWarningShown) {
      distributedRateLimitWarningShown = true;
      console.warn(
        "[rate-limit] Shared rate limit unavailable, falling back to in-memory buckets.",
        error
      );
    }

    return null;
  }
}

export async function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
  keySuffix?: string
) {
  const now = Date.now();
  const identity = keySuffix || getClientIp(request);
  const key = `${options.keyPrefix}:${identity}`;
  const distributedResult = await enforceDistributedRateLimit(key, options, now);

  if (distributedResult) {
    return distributedResult;
  }

  return enforceInMemoryRateLimit(key, options, now);
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

export function isValidStripeSessionId(value: string) {
  return /^cs_(test|live)_[A-Za-z0-9_]+$/.test(value);
}

export function escapeSlackMrkdwn(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
