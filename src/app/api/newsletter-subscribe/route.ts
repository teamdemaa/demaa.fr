import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { logOperationalError } from "@/lib/operational-log";
import { enforceSameOrigin } from "@/lib/request-guard";
import { syncResendNewsletterContact } from "@/lib/resend-audience";

type NewsletterSubscribeBody = {
  email?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  try {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "newsletter-subscribe",
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<NewsletterSubscribeBody>(request, 4 * 1024);
    if (response) return response;

    const honeypot = normalizeText(body?.website, 200);
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const email = normalizeEmail(normalizeText(body?.email, 160));
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Merci de saisir une adresse e-mail valide." },
        { status: 400 },
      );
    }

    await syncResendNewsletterContact({ email });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logOperationalError("newsletter.subscribe.failed", error);
    return NextResponse.json(
      {
        error:
          "L’inscription est momentanément indisponible. Merci de réessayer.",
      },
      { status: 500 },
    );
  }
}
