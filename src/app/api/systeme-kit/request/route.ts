import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { savePartnerOffersSubscriber } from "@/lib/generations-db";
import { enforceAllowedHost } from "@/lib/request-guard";
import {
  getSystemKitEmailErrorMessage,
  sendSystemKitEmail,
} from "@/lib/system-kit-email";

export const runtime = "nodejs";

type SystemKitRequestBody = {
  email?: unknown;
  firstName?: unknown;
  sectorName?: unknown;
  sectorSlug?: unknown;
};

function isValidSectorSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = enforceRateLimit(request, {
    keyPrefix: "systeme-kit-request",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response } = await readJsonBody<SystemKitRequestBody>(request, 8 * 1024);
  if (response) return response;

  const firstName = normalizeText(body?.firstName, 80);
  const sectorSlug = normalizeText(body?.sectorSlug, 120);
  const requestedSectorName = normalizeText(body?.sectorName, 160);
  const email = normalizeEmail(normalizeText(body?.email, 160));

  if (!firstName || !sectorSlug || !email) {
    return NextResponse.json(
      { error: "Merci de renseigner votre prénom et votre email." },
      { status: 400 }
    );
  }

  if (!isValidSectorSlug(sectorSlug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse email valide." },
      { status: 400 }
    );
  }

  const enterprise = await getEnterpriseBySlug(sectorSlug);

  if (!enterprise) {
    return NextResponse.json(
      { error: "Le métier sélectionné est introuvable." },
      { status: 404 }
    );
  }

  const resolvedSystemName = enterpriseToSystem(enterprise).name || requestedSectorName || sectorSlug;

  await savePartnerOffersSubscriber({
    firstName,
    sector: resolvedSystemName,
    email,
    source: `systeme_kit_${sectorSlug}`,
  });

  const emailResult = await sendSystemKitEmail({
    email,
    firstName,
    systemSlug: sectorSlug,
    systemName: resolvedSystemName,
    request,
  });

  if (!emailResult.sent) {
    return NextResponse.json(
      { error: getSystemKitEmailErrorMessage(emailResult.reason) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
