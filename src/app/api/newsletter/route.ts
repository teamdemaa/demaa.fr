import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import {
  saveNewsletterSubscriber,
  updateNewsletterResendSyncStatus,
} from "@/lib/generations-db";
import { resolveLeadContext, type LeadContext } from "@/lib/lead-context";
import { subscribeResendNewsletter } from "@/lib/resend-audience";
import { resolveSectorTaxonomyByLabel } from "@/lib/sector-taxonomy";

type NewsletterRequestBody = {
  email?: unknown;
  firstName?: unknown;
  newsletterOptIn?: unknown;
  sector?: unknown;
  source?: unknown;
  sourceUrl?: unknown;
  systemSlug?: unknown;
};

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    keyPrefix: "newsletter",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response } = await readJsonBody<NewsletterRequestBody>(request);
  if (response) return response;

  const firstName = normalizeText(body?.firstName, 80);
  const sectorLabel = normalizeText(body?.sector, 120);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const source = normalizeText(body?.source, 120) || "newsletter";
  const sourceUrl = normalizeText(body?.sourceUrl, 500) || request.headers.get("referer");
  const systemSlug = normalizeText(body?.systemSlug, 120);

  if (!firstName || !sectorLabel || !email) {
    return NextResponse.json(
      { error: "Merci de renseigner votre prénom, votre secteur et votre email." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse email valide." },
      { status: 400 },
    );
  }

  if (body?.newsletterOptIn !== true) {
    return NextResponse.json(
      { error: "Votre accord est nécessaire pour recevoir la newsletter Demaa." },
      { status: 400 },
    );
  }

  let context: LeadContext | null = null;
  if (systemSlug) {
    context = await resolveLeadContext({ systemSlug, source, sourceUrl });
    if (!context) {
      return NextResponse.json({ error: "Activité introuvable." }, { status: 400 });
    }
  } else {
    const sector = resolveSectorTaxonomyByLabel(sectorLabel);
    if (sector) {
      context = {
        systemSlug: null,
        systemName: null,
        sectorSlug: sector.publicSlug || sector.seoSlug,
        sectorLabel: sector.publicLabel,
        source,
        sourceUrl,
      };
    }
  }

  try {
    const subscriber = await saveNewsletterSubscriber({
      firstName,
      sector: context?.sectorLabel || sectorLabel,
      email,
      source,
    });

    if (!process.env.RESEND_API_KEY?.trim()) {
      await updateNewsletterResendSyncStatus({
        subscriberId: subscriber.subscriberId,
        status: "skipped",
        error: "RESEND_API_KEY manquante",
      });
      return NextResponse.json({ ok: true });
    }

    try {
      await subscribeResendNewsletter({ email, firstName, context });
      await updateNewsletterResendSyncStatus({
        subscriberId: subscriber.subscriberId,
        status: "sent",
      });
    } catch (error) {
      console.error("Newsletter Resend synchronization error:", error);
      await updateNewsletterResendSyncStatus({
        subscriberId: subscriber.subscriberId,
        status: "failed",
        error: error instanceof Error ? error.message : "Erreur Resend inconnue",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      {
        error:
          "Impossible de vous inscrire pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 },
    );
  }
}
