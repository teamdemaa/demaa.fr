import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { createPendingCoachingMessageDraft } from "@/lib/coaching-message-draft.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

type CoachingDraftBody = {
  message?: unknown;
};

function withNoStore<T extends Response>(response: T) {
  response.headers.set("Cache-Control", PRIVATE_NO_STORE_HEADERS["Cache-Control"]);
  response.headers.set("Pragma", PRIVATE_NO_STORE_HEADERS.Pragma);
  return response;
}
export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "coaching-message-draft",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return withNoStore(limited);

  const { data, response } = await readJsonBody<CoachingDraftBody>(
    request,
    8 * 1024,
  );
  if (response) return withNoStore(response);

  const message = normalizeText(data?.message, 2_000, { multiline: true });
  if (message.length < 2) {
    return NextResponse.json(
      { error: "Écrivez au moins deux caractères avant de continuer." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const draft = await createPendingCoachingMessageDraft({ body: message });
  return NextResponse.json(
    draft,
    { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
  );
}
