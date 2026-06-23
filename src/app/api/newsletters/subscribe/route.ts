import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getNewsletterBySlug } from "@/lib/newsletter-content";
import { saveNewsletterSubscriber } from "@/lib/generations-db";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type NewsletterSubscribeRequestBody = {
  email?: unknown;
  firstName?: unknown;
  newsletterSlug?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "newsletter_subscribe",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<NewsletterSubscribeRequestBody>(request);
    if (response) return response;

    const normalizedFirstName = normalizeText(body?.firstName, 80);
    const normalizedEmail = normalizeEmail(normalizeText(body?.email, 160));
    const normalizedNewsletterSlug = normalizeText(body?.newsletterSlug, 120);
    const newsletter = normalizedNewsletterSlug
      ? getNewsletterBySlug(normalizedNewsletterSlug)
      : null;

    if (!normalizedFirstName || !normalizedEmail || !newsletter) {
      return NextResponse.json(
        { error: "Merci de renseigner votre prénom, votre email et une newsletter valide." },
        { status: 400 },
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse email valide." },
        { status: 400 },
      );
    }

    await saveNewsletterSubscriber({
      firstName: normalizedFirstName,
      email: normalizedEmail,
      newsletterSlug: normalizedNewsletterSlug,
    });

    await sendSlackMessage({
      text: "Nouvelle inscription newsletter Demaa",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Inscription newsletter Demaa*\n` +
              `*Prénom* : ${escapeSlackMrkdwn(normalizedFirstName)}\n` +
              `*Email* : ${escapeSlackMrkdwn(normalizedEmail)}\n` +
              `*Newsletter* : ${escapeSlackMrkdwn(newsletter.title)}\n` +
              `*Secteur* : ${escapeSlackMrkdwn(newsletter.sectorLabel)}`,
          },
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de vous inscrire pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 },
    );
  }
}
