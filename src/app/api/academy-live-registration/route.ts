import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { getPublicLiveSessionSlot } from "@/lib/live-session-catalog";
import { formatLiveSessionDate } from "@/lib/live-session-format";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PERSONAL_EMAIL_DOMAINS = new Set([
  "aol.com",
  "free.fr",
  "gmail.com",
  "hotmail.com",
  "hotmail.fr",
  "icloud.com",
  "laposte.net",
  "live.com",
  "orange.fr",
  "outlook.com",
  "outlook.fr",
  "proton.me",
  "protonmail.com",
  "wanadoo.fr",
  "yahoo.com",
  "yahoo.fr",
]);

type RegistrationBody = {
  attribution?: unknown;
  company?: unknown;
  email?: unknown;
  fullName?: unknown;
  idempotencyKey?: unknown;
  slotId?: unknown;
  trainingSlug?: unknown;
  website?: unknown;
};

function isProfessionalEmail(email: string) {
  const domain = email.split("@").at(-1);
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.has(domain));
}

function buildIdempotencyKey(input: {
  clientKey: string | null;
  email: string;
  slotId: string;
  trainingSlug: string;
}) {
  const clientKey = input.clientKey ?? new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${input.trainingSlug}:${input.slotId}:${input.email}:${clientKey}`)
    .digest("hex");
  return `academy-live:${digest}`;
}

function successResponse() {
  const response = NextResponse.json({ ok: true }, { status: 202 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limitedByIp = await enforceRateLimit(request, {
    keyPrefix: "academy-live-registration-ip",
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<RegistrationBody>(request, 6 * 1024);
  if (response) return response;
  if (normalizeText(body?.website, 200)) return successResponse();

  const fullName = normalizeText(body?.fullName, 140);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const company = normalizeText(body?.company, 160);
  const trainingSlug = normalizeText(body?.trainingSlug, 120);
  const slotId = normalizeText(body?.slotId, 80);

  if (!fullName || !email || !company || !trainingSlug || !slotId) {
    return NextResponse.json(
      { error: "Merci de compléter votre nom, votre e-mail professionnel, votre entreprise et le créneau." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email) || !isProfessionalEmail(email)) {
    return NextResponse.json(
      { error: "Merci d’utiliser votre adresse e-mail professionnelle." },
      { status: 400 },
    );
  }

  const selection = getPublicLiveSessionSlot(trainingSlug, slotId);
  if (!selection) {
    return NextResponse.json(
      { error: "Cette formation ou ce créneau n’est plus disponible." },
      { status: 404 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "academy-live-registration-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    createHash("sha256").update(email).digest("hex"),
  );
  if (limitedByEmail) return limitedByEmail;

  const source = `Académie - Formation en direct - ${selection.training.title}`;
  const context = await resolveLeadContext({
    source,
    sourceUrl: request.headers.get("referer"),
  });
  if (!context) {
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre demande pour le moment." },
      { status: 400 },
    );
  }

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: { email: true, resend: false, slack: true },
    contact: { company, email, name: fullName },
    context,
    emoji: "🗓️",
    fields: [
      { label: "Formation", value: selection.training.title },
      { label: "Training slug", value: selection.training.slug },
      { label: "Créneau", value: formatLiveSessionDate(selection.slot.startsAt) },
      { label: "Slot ID", value: selection.slot.id },
      { label: "Durée", value: selection.training.duration },
      { label: "Prix", value: "250 € HT" },
      { label: "Version du catalogue", value: selection.training.catalogVersion },
      { label: "Coordination et facturation", value: "Demaa" },
    ],
    idempotencyKey: buildIdempotencyKey({
      clientKey: normalizeIdempotencyKey(body?.idempotencyKey),
      email,
      slotId,
      trainingSlug,
    }),
    requestType: "academy_live_registration",
    title: `Inscription formation en direct - ${selection.training.title}`,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("academy_live_registration.route.failed", error, {
      requestType: "academy_live_registration",
    });
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre demande pour le moment." },
      { status: 500 },
    );
  }
}
