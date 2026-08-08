import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { getPublishedB2BOpportunity } from "@/lib/b2b-opportunities.server";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
type Body = { attribution?: unknown; email?: unknown; fullName?: unknown; idempotencyKey?: unknown; opportunitySlug?: unknown; website?: unknown };
const success = () => NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request); if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request); if (blockedOrigin) return blockedOrigin;
    const ipLimit = await enforceRateLimit(request, { keyPrefix: "b2b-opportunity-interest-ip", limit: 8, windowMs: 10 * 60 * 1000 }); if (ipLimit) return ipLimit;
    const { data: body, response } = await readJsonBody<Body>(request, 4 * 1024); if (response) return response;
    if (normalizeText(body?.website, 200)) return success();
    const fullName = normalizeText(body?.fullName, 140); const email = normalizeEmail(normalizeText(body?.email, 160)); const opportunitySlug = normalizeText(body?.opportunitySlug, 120);
    if (!fullName || !email || !opportunitySlug || !isValidEmail(email)) return NextResponse.json({ error: "Merci d’indiquer votre nom et une adresse e-mail valide." }, { status: 400 });
    const opportunity = await getPublishedB2BOpportunity(opportunitySlug);
    if (!opportunity) return NextResponse.json({ error: "Cette opportunité est introuvable." }, { status: 404 });
    const emailLimit = await enforceRateLimit(request, { keyPrefix: "b2b-opportunity-interest-email", limit: 4, windowMs: 60 * 60 * 1000 }, digest(email)); if (emailLimit) return emailLimit;
    const context = await resolveLeadContext({ source: `Opportunité B2B - ${opportunity.title}`, sourceUrl: request.headers.get("referer") });
    if (!context) return NextResponse.json({ error: "Impossible d’enregistrer votre intérêt pour le moment." }, { status: 400 });
    const clientKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const idempotencyKey = `b2b-opportunity-interest:${digest(`${opportunitySlug}:${clientKey ?? new Date().toISOString().slice(0, 10)}:${email}`)}`;
    await submitLeadRequest({ attribution: resolveLeadAttribution(request, body?.attribution), channels: { email: false, resend: false, slack: true }, contact: { email, name: fullName }, context, emoji: "🤝", fields: [{ label: "Opportunité", value: opportunity.title }, { label: "Catégorie", value: opportunity.category }], idempotencyKey, requestType: "b2b_opportunity_interest", title: `Intérêt opportunité B2B - ${opportunity.title}` });
    return success();
  } catch (error) {
    logOperationalError("b2b_opportunity_interest.route.failed", error, { requestType: "b2b_opportunity_interest" });
    return NextResponse.json({ error: "Impossible d’enregistrer votre intérêt pour le moment." }, { status: 500 });
  }
}
