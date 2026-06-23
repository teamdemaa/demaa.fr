import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { createMagicLinkToken } from "@/lib/customer-space-auth";
import { getCanonicalSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type MagicLinkRequestBody = {
  email?: unknown;
};

async function sendMagicLinkEmail(input: {
  email: string;
  magicLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing_resend_config" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: "Votre lien d'accès à l'espace membre Demaa",
      html: `
        <div style="font-family:Arial,sans-serif;color:#17231d;line-height:1.6">
          <p>Bonjour,</p>
          <p>Voici votre lien sécurisé pour retrouver le suivi de vos demandes et les tarifs négociés Demaa.</p>
          <p>
            <a href="${input.magicLink}" style="display:inline-block;border-radius:999px;background:#315f46;color:#ffffff;padding:12px 18px;text-decoration:none">
              Accéder à mon espace membre Demaa
            </a>
          </p>
          <p>Ce lien expire dans 30 minutes.</p>
        </div>
      `,
      text: `Votre lien d'accès à l'espace membre Demaa : ${input.magicLink}\n\nCe lien expire dans 30 minutes.`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("[customer-space] Resend error:", response.status, errorText);
    return { sent: false, reason: "resend_error" as const };
  }

  return { sent: true, reason: null };
}

export async function POST(request: Request) {
  const { data: body, response } =
    await readJsonBody<MagicLinkRequestBody>(request, 4 * 1024);
  if (response) return response;

  const email = normalizeEmail(normalizeText(body?.email, 160));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci d'indiquer une adresse email valide." },
      { status: 400 }
    );
  }

  const limited = await enforceRateLimit(
    request,
    {
      keyPrefix: "customer-magic-link",
      limit: 3,
      windowMs: 15 * 60 * 1000,
    },
    email
  );
  if (limited) return limited;

  const token = await createMagicLinkToken(email);
  const magicLink = `${getCanonicalSiteUrl()}/api/customer-space/consume?token=${encodeURIComponent(
    token
  )}`;
  const emailResult = await sendMagicLinkEmail({ email, magicLink });

  if (!emailResult.sent) {
    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer le lien pour le moment. Merci de réessayer dans quelques minutes.",
        devLink: process.env.NODE_ENV === "production" ? null : magicLink,
        sent: false,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    sent: true,
    devLink: process.env.NODE_ENV === "production" ? null : magicLink,
  });
}
