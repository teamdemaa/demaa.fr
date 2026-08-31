import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { sendSystemProcessesPdfEmail } from "@/lib/system-processes-email.server";
import { buildSystemProcessesPdf } from "@/lib/system-processes-pdf.server";

export const runtime = "nodejs";

type SystemProcessesEmailBody = {
  email?: unknown;
  idempotencyKey?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

function successResponse() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

function hashEmail(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limitedByIp = await enforceRateLimit(request, {
    keyPrefix: "system-processes-pdf-ip",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<SystemProcessesEmailBody>(
    request,
    4 * 1024,
  );
  if (response) return response;

  if (normalizeText(body?.website, 200)) return successResponse();

  const email = normalizeEmail(normalizeText(body?.email, 160));
  const systemSlug = normalizeText(body?.systemSlug, 120);
  const requestKey = normalizeIdempotencyKey(body?.idempotencyKey);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse e-mail valide." },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9-]{2,120}$/.test(systemSlug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
      { status: 400 },
    );
  }
  if (!requestKey) {
    return NextResponse.json(
      { error: "La demande d’envoi est invalide. Rechargez la page et réessayez." },
      { status: 400 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "system-processes-pdf-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    hashEmail(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const data = await getSystemDetailPageData(systemSlug);
  if (!data) {
    return NextResponse.json(
      { error: "Les processus de ce métier sont introuvables." },
      { status: 404 },
    );
  }

  const routines = data.detail.systeme?.routines ?? [];
  if (routines.length === 0) {
    return NextResponse.json(
      { error: "La checklist de ce métier n’est pas encore disponible." },
      { status: 404 },
    );
  }

  const pdfBytes = await buildSystemProcessesPdf({
    routines,
    systemName: data.system.name,
  });
  const delivery = await sendSystemProcessesPdfEmail({
    email,
    pdfBytes,
    requestKey,
    systemName: data.system.name,
    systemSlug,
  });

  if (!delivery.sent) {
    return NextResponse.json(
      { error: "Impossible d’envoyer le PDF pour le moment. Merci de réessayer dans quelques instants." },
      { status: 502 },
    );
  }

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("system_processes_pdf.route.failed", error, {
      requestType: "system_processes_pdf_email",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer le PDF pour le moment." },
      { status: 500 },
    );
  }
}
