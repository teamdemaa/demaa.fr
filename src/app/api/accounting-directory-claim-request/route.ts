import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getAccountingFirmBySlug } from "@/lib/accounting-directory";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { enforceSameOrigin } from "@/lib/request-guard";
import { logOperationalError } from "@/lib/operational-log";

type ClaimRequestBody = {
  attribution?: unknown;
  firmSlug?: unknown;
  idempotencyKey?: unknown;
  sourceUrl?: unknown;
};

export async function POST(request: Request) {
  try {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "accounting-directory-claim",
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<ClaimRequestBody>(request, 4 * 1024);
    if (response) return response;

    const firmSlug = normalizeText(body?.firmSlug, 120);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const sourceUrl = normalizeText(body?.sourceUrl, 500);

    if (!firmSlug) {
      return NextResponse.json({ error: "Fiche cabinet invalide." }, { status: 400 });
    }

    const firm = await getAccountingFirmBySlug(firmSlug);
    if (!firm) {
      return NextResponse.json({ error: "Fiche cabinet invalide." }, { status: 400 });
    }

    if (!firm.email) {
      return NextResponse.json(
        { error: "Aucun email professionnel n'est disponible pour cette fiche." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      source: "Annuaire experts-comptables - Revendication de fiche",
      sourceUrl: request.headers.get("referer") || sourceUrl,
    });

    if (!context) {
      return NextResponse.json({ error: "Contexte de demande invalide." }, { status: 400 });
    }

    const lead = await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { company: firm.name, email: firm.email },
      context,
      emoji: "🏷️",
      fields: [
        { label: "Cabinet", value: firm.name },
        { label: "Fiche", value: `/annuaire-experts-comptables/cabinets/${firm.slug}` },
        { label: "Ville", value: firm.city },
      ],
      idempotencyKey,
      requestType: "accounting_directory_claim",
      title: "Revendication de fiche annuaire expert-comptable",
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId });
  } catch (error) {
    logOperationalError("lead.route.failed", error, {
      requestType: "accounting_directory_claim",
    });
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 },
    );
  }
}
