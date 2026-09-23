import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { coachProfiles } from "@/lib/coach-directory";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceSameOrigin } from "@/lib/request-guard";

type RequestBody = {
  attribution?: unknown;
  coachSlug?: unknown;
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
  idempotencyKey?: unknown;
  sourceUrl?: unknown;
};

export async function POST(request: Request) {
  try {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "coach-directory-contact",
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<RequestBody>(request, 8 * 1024);
    if (response) return response;
    if (normalizeText(body?.website, 200)) return NextResponse.json({ ok: true });

    const coachSlug = normalizeText(body?.coachSlug, 120);
    const coach = coachProfiles.find((profile) => profile.slug === coachSlug);
    const name = normalizeText(body?.name, 160);
    const company = normalizeText(body?.company, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const phone = normalizeText(body?.phone, 60);
    const message = normalizeText(body?.message, 2000, { multiline: true });
    const sourceUrl = normalizeText(body?.sourceUrl, 500);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);

    if (!coach || !name || !email || !message || !idempotencyKey) {
      return NextResponse.json({ error: "Merci de choisir un coach et de renseigner votre nom, votre email et votre besoin." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Merci de saisir un email valide." }, { status: 400 });
    }
    if (phone && (!/^\+?[0-9\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 8 || phone.replace(/\D/g, "").length > 15)) {
      return NextResponse.json({ error: "Merci de saisir un numéro de téléphone valide." }, { status: 400 });
    }

    const context = await resolveLeadContext({
      source: "Annuaire coachs - Demande de contact",
      sourceUrl: request.headers.get("referer") || sourceUrl,
    });
    if (!context) return NextResponse.json({ error: "Contexte de demande invalide." }, { status: 400 });

    const lead = await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { company, email, name, phone },
      context,
      emoji: "🧭",
      fields: [
        { label: "Coach demandé", value: coach.name },
        { label: "Profil public", value: coach.website },
        { label: "Ville(s)", value: coach.location },
        { label: "Besoin", value: message },
        { label: "Statut", value: "Profil public non vérifié ; mise en relation à confirmer" },
      ],
      idempotencyKey,
      requestType: "coach_directory_contact",
      title: "Demande annuaire coachs",
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId });
  } catch (error) {
    logOperationalError("lead.route.failed", error, { requestType: "coach_directory_contact" });
    return NextResponse.json({ error: "Une erreur est survenue pendant l’envoi. Merci de réessayer dans quelques minutes." }, { status: 500 });
  }
}
