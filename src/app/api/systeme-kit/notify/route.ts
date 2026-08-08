import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getSystemResource } from "@/lib/system-resource-catalog";

export const runtime = "nodejs";
type Body = { attribution?: unknown; email?: unknown; resourceSlug?: unknown; systemSlug?: unknown; website?: unknown };
const ok = () => NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
export async function POST(request: Request) {
  const host = enforceAllowedHost(request); if (host) return host;
  const origin = enforceSameOrigin(request); if (origin) return origin;
  const ipLimit = await enforceRateLimit(request, { keyPrefix: "guide-notify-ip", limit: 8, windowMs: 10 * 60 * 1000 }); if (ipLimit) return ipLimit;
  const { data, response } = await readJsonBody<Body>(request, 4 * 1024); if (response) return response;
  if (normalizeText(data?.website, 200)) return ok();
  const email = normalizeEmail(normalizeText(data?.email, 160)); const resourceSlug = normalizeText(data?.resourceSlug, 120); const systemSlug = normalizeText(data?.systemSlug, 120);
  if (!email || !resourceSlug || !systemSlug || !isValidEmail(email)) return NextResponse.json({ error: "Merci d’indiquer une adresse e-mail valide." }, { status: 400 });
  const resource = getSystemResource(resourceSlug); if (!resource || resource.availability !== "coming-soon" || !resource.systemSlugs?.includes(systemSlug)) return NextResponse.json({ error: "Cette ressource n’est pas en liste d’attente." }, { status: 404 });
  const emailHash = createHash("sha256").update(email).digest("hex"); const emailLimit = await enforceRateLimit(request, { keyPrefix: "guide-notify-email", limit: 4, windowMs: 60 * 60 * 1000 }, emailHash); if (emailLimit) return emailLimit;
  const enterprise = await getEnterpriseBySlug(systemSlug); if (!enterprise) return NextResponse.json({ error: "Le métier sélectionné est introuvable." }, { status: 404 });
  const context = await resolveLeadContext({ systemSlug, source: `Notification de sortie - ${resource.title}`, sourceUrl: request.headers.get("referer") }); if (!context) return NextResponse.json({ error: "Contexte introuvable." }, { status: 400 });
  await submitLeadRequest({ attribution: resolveLeadAttribution(request, data?.attribution), channels: { email: false, resend: false, slack: false }, contact: { email, firstName: null }, context, emoji: "🔔", fields: [{ label: "Guide", value: resource.title }, { label: "Consentement", value: "Notification de sortie uniquement" }], idempotencyKey: `guide-notify:${resourceSlug}:${emailHash}`, marketingConsent: { capturedAt: new Date().toISOString(), granted: false, text: "Notification de sortie du guide uniquement.", version: "guide-notify-v1" }, requestType: "guide_release_notification", title: `Notification de sortie - ${resource.title} - ${enterpriseToSystem(enterprise).name}` });
  return ok();
}
