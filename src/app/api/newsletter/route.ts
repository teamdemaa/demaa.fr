import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { saveNewsletterSubscriber } from "@/lib/generations-db";

type NewsletterRequestBody = {
  email?: unknown;
  firstName?: unknown;
  sector?: unknown;
  source?: unknown;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "newsletter",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<NewsletterRequestBody>(request);
    if (response) return response;

    const normalizedFirstName = normalizeText(body?.firstName, 80);
    const normalizedSector = normalizeText(body?.sector, 120);
    const normalizedEmail = normalizeText(body?.email, 160).toLowerCase();
    const normalizedSource = normalizeText(body?.source, 120) || "newsletter_page";

    if (!normalizedFirstName || !normalizedSector || !normalizedEmail) {
      return NextResponse.json(
        { error: "Merci de renseigner votre prénom, votre secteur et votre email." },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse email valide." },
        { status: 400 }
      );
    }

    await saveNewsletterSubscriber({
      firstName: normalizedFirstName,
      sector: normalizedSector,
      email: normalizedEmail,
      source: normalizedSource,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de vous inscrire pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
