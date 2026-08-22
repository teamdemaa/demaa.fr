import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { submitPendingOpportunityDraft } from "@/lib/opportunity-submission.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;
  const limited = await enforceRateLimit(request, {
    keyPrefix: "opportunity-submission",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;
  const { data, response } = await readJsonBody<{ draftToken?: unknown; email?: unknown }>(
    request,
    2 * 1024,
  );
  if (response) return response;
  const draftToken = normalizeText(data?.draftToken, 80);
  const email = normalizeEmail(normalizeText(data?.email, 160));
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Indiquez une adresse e-mail valide." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  const result = await submitPendingOpportunityDraft({
    draftToken,
    email,
  });
  if (!result) {
    return NextResponse.json(
      { error: "Ce brouillon n’est plus disponible." },
      { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  revalidateTag("provider-network-opportunities", { expire: 0 });
  return NextResponse.json(
    { ok: true, opportunityId: result.opportunityId },
    { status: result.alreadySubmitted ? 200 : 201, headers: PRIVATE_NO_STORE_HEADERS },
  );
}
