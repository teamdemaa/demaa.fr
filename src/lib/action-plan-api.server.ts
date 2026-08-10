import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";
import { actionPlanSchema } from "@/lib/action-plan-contract";
import { actionPlanWorkspaceStateSchema } from "@/lib/action-plan-workspace";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

const nullableTokenCount = z.number().int().nonnegative().nullable().optional();

export const actionPlanWriteRequestSchema = z
  .object({
    plan: actionPlanSchema,
    workspaceState: actionPlanWorkspaceStateSchema.optional(),
    sourceText: z.string().trim().max(12_000).nullable().optional(),
    generation: z
      .object({
        model: z.string().trim().min(1).max(120).nullable().optional(),
        inputTokens: nullableTokenCount,
        outputTokens: nullableTokenCount,
        totalTokens: nullableTokenCount,
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict();

export const actionPlanUpdateRequestSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
    workspaceState: actionPlanWorkspaceStateSchema,
  })
  .strict();

export async function getCurrentCustomerEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  return getEmailFromCustomerSessionToken(token);
}

export function noStoreHeaders() {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Cookie",
  };
}

export function withNoStore<T extends Response>(response: T) {
  for (const [name, value] of Object.entries(noStoreHeaders())) {
    response.headers.set(name, value);
  }
  return response;
}
