import "server-only";

import { createHash } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { logOperationalError } from "@/lib/operational-log";
import { createServiceRequestRateLimiter } from "@/lib/service-request-security.server";

export const GUEST_AI_DAILY_BUDGETS_COLLECTION = "guest_ai_daily_budgets";
export const GUEST_AI_BUDGET_RESERVATIONS_COLLECTION = "guest_ai_budget_reservations";

type SecurityDependencies = {
  database?: ReturnType<typeof getAdminFirestore>;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
};

export type GuestAiBudgetReservation =
  | { allowed: true; alreadyReserved: boolean; remaining: number }
  | {
    allowed: false;
    reason: "circuit_open" | "limit_reached" | "misconfigured" | "unavailable";
  };

export function isGuestProductEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.DEMAA_GUEST_PRODUCT_ENABLED?.trim().toLowerCase() === "true";
}

export function readGuestAccessKey(request: Request) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const match = /^Bearer ([A-Za-z0-9_-]{43,86})$/.exec(authorization);
  return match?.[1] ?? null;
}

function readDailyLimit(env: NodeJS.ProcessEnv) {
  const value = Number(env.DEMAA_GUEST_AI_DAILY_LIMIT);
  return Number.isInteger(value) && value > 0 && value <= 10_000 ? value : null;
}

function reservationId(day: string, generationAttemptKey: string) {
  return createHash("sha256")
    .update(`guest-ai-budget:${day}:${generationAttemptKey}`)
    .digest("base64url");
}

export async function reserveGuestAiGenerationBudget(
  generationAttemptKey: string,
  dependencies: SecurityDependencies = {},
): Promise<GuestAiBudgetReservation> {
  const env = dependencies.env ?? process.env;
  if (env.DEMAA_GUEST_AI_CIRCUIT_OPEN?.trim().toLowerCase() === "true") {
    return { allowed: false, reason: "circuit_open" };
  }
  const limit = readDailyLimit(env);
  if (!limit) return { allowed: false, reason: "misconfigured" };

  const now = (dependencies.now ?? (() => new Date()))();
  const day = now.toISOString().slice(0, 10);
  const database = dependencies.database ?? getAdminFirestore();
  const budgetReference = database.collection(GUEST_AI_DAILY_BUDGETS_COLLECTION).doc(day);
  const reservationReference = database
    .collection(GUEST_AI_BUDGET_RESERVATIONS_COLLECTION)
    .doc(reservationId(day, generationAttemptKey));

  try {
    return await database.runTransaction(async (transaction) => {
      const [budgetSnapshot, reservationSnapshot] = await Promise.all([
        transaction.get(budgetReference),
        transaction.get(reservationReference),
      ]);
      const count = budgetSnapshot.exists ? Number(budgetSnapshot.data()?.count) || 0 : 0;
      if (reservationSnapshot.exists) {
        return { allowed: true, alreadyReserved: true, remaining: Math.max(0, limit - count) };
      }
      if (count >= limit) return { allowed: false, reason: "limit_reached" };

      const expiresAt = new Date(`${day}T00:00:00.000Z`);
      expiresAt.setUTCDate(expiresAt.getUTCDate() + 2);
      transaction.set(budgetReference, {
        count: count + 1,
        limit,
        day,
        updated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      transaction.set(reservationReference, {
        day,
        generation_attempt_hash: createHash("sha256")
          .update(generationAttemptKey)
          .digest("hex"),
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      return { allowed: true, alreadyReserved: false, remaining: limit - count - 1 };
    });
  } catch (error) {
    logOperationalError(
      "guest_action_plan.budget_unavailable",
      new Error("guest_ai_budget_unavailable"),
      { providerErrorName: error instanceof Error ? error.name : "unknown" },
    );
    return { allowed: false, reason: "unavailable" };
  }
}

export function createGuestActionPlanRateLimiter(dependencies: Parameters<
  typeof createServiceRequestRateLimiter
>[0] = {}) {
  const enforce = createServiceRequestRateLimiter(dependencies);
  return (request: Request) => enforce(request, {
    limit: 5,
    scope: "ip",
    windowMs: 10 * 60 * 1_000,
  });
}

export const enforceGuestActionPlanRateLimit = createGuestActionPlanRateLimiter();
