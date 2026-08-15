import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { createPendingOpportunitySubmissionDraft } from "@/lib/opportunity-submission.server";
import { parseOpportunitySubmissionFields } from "@/lib/opportunity-submission";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;
  const limited = await enforceRateLimit(request, {
    keyPrefix: "opportunity-submission-draft",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data, response } = await readJsonBody<Record<string, unknown>>(
    request,
    16 * 1024,
  );
  if (response) return response;
  const fields = parseOpportunitySubmissionFields(data);
  if (!fields) {
    return NextResponse.json(
      { error: "Complétez le titre, la description et la catégorie." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  const draft = await createPendingOpportunitySubmissionDraft(fields);
  return NextResponse.json(draft, {
    status: 201,
    headers: PRIVATE_NO_STORE_HEADERS,
  });
}
