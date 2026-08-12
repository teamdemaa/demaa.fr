import "server-only";

import { z } from "zod";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import {
  compatibleActionPlanWorkspaceStateSchema,
} from "@/lib/action-plan-workspace";
import { getCurrentCustomerEmailFromSession } from "@/lib/customer-space-session.server";

const nullableTokenCount = z.number().int().nonnegative().nullable().optional();
const actionPlanGenerationMetadataSchema = z
  .object({
    model: z.string().trim().min(1).max(120).nullable().optional(),
    inputTokens: nullableTokenCount,
    outputTokens: nullableTokenCount,
    totalTokens: nullableTokenCount,
  })
  .strict()
  .nullable();

export const actionPlanWriteRequestSchema = z
  .object({
    plan: compatibleActionPlanSchema,
    title: z.string().trim().min(1).max(120).optional(),
    workspaceState: compatibleActionPlanWorkspaceStateSchema.optional(),
    sourceText: z.string().trim().max(12_000).nullable().optional(),
    generation: actionPlanGenerationMetadataSchema.optional(),
  })
  .strict();

export const actionPlanUpdateRequestSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
    plan: compatibleActionPlanSchema.optional(),
    title: z.string().trim().min(1).max(120).optional(),
    sourceText: z.string().trim().max(12_000).nullable().optional(),
    generation: actionPlanGenerationMetadataSchema.optional(),
    workspaceState: compatibleActionPlanWorkspaceStateSchema,
  })
  .strict();

export const actionPlanDeleteRequestSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
  })
  .strict();

export async function getCurrentCustomerEmail() {
  return getCurrentCustomerEmailFromSession();
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
