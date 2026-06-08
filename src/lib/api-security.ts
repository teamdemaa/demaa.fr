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

export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
  keySuffix?: string
) {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const identity = keySuffix || getClientIp(request);
  const key = `${options.keyPrefix}:${identity}`;
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

  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

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
