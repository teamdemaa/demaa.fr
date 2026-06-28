import { createRawToken, hashToken } from "@/lib/customer-space-auth";
import {
  getAssistantAccessTokenSessionId,
  saveAssistantAccessToken,
} from "@/lib/generations-db";

const ASSISTANT_ACCESS_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export async function createAssistantAccessToken(stripeSessionId: string) {
  const token = createRawToken();
  const expiresAt = new Date(Date.now() + ASSISTANT_ACCESS_TOKEN_TTL_MS).toISOString();

  await saveAssistantAccessToken({
    stripeSessionId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return token;
}

export async function resolveAssistantAccessToken(token?: string | null) {
  if (!token) return null;

  return getAssistantAccessTokenSessionId(hashToken(token));
}
