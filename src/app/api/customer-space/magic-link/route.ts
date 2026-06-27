import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { createMagicLinkToken } from "@/lib/customer-space-auth";

export const runtime = "nodejs";

type MagicLinkRequestBody = {
  email?: unknown;
};

function renderMagicLinkEmail(input: { magicLink: string }) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Votre lien d'accès Demaa</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f5f1e8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#f5f1e8;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;max-width:560px;">
                <tr>
                  <td style="padding-bottom:18px;font-family:Arial,sans-serif;font-size:28px;line-height:1;color:#213547;font-weight:700;letter-spacing:-0.03em;">
                    Demaa
                  </td>
                </tr>
                <tr>
                  <td style="border:1px solid #e3ddd0;border-radius:28px;background-color:#fffdf8;padding:36px 32px;font-family:Arial,sans-serif;color:#17231d;">
                    <div style="font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#315f46;">
                      Espace membre
                    </div>
                    <h1 style="margin:14px 0 14px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#17231d;">
                      Votre lien sécurisé est prêt
                    </h1>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      Bonjour,
                    </p>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      Voici votre accès pour retrouver vos demandes en cours, vos suivis et les éléments liés à votre espace membre Demaa.
                    </p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#52606d;">
                      Ce lien est personnel et expire dans <strong style="color:#17231d;">30 minutes</strong>.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px;">
                      <tr>
                        <td align="center" bgcolor="#315f46" style="border-radius:999px;">
                          <a href="${input.magicLink}" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
                            Accéder à mon espace Demaa
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="margin:0 0 20px;border-radius:20px;background-color:#eef4ef;padding:16px 18px;">
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#315f46;">
                        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                      </p>
                      <p style="margin:10px 0 0;font-size:13px;line-height:1.7;word-break:break-all;">
                        <a href="${input.magicLink}" style="color:#315f46;text-decoration:underline;">
                          ${input.magicLink}
                        </a>
                      </p>
                    </div>
                    <p style="margin:0;font-size:13px;line-height:1.7;color:#7a847f;">
                      Si vous n'avez pas demandé cet accès, vous pouvez simplement ignorer cet email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 8px 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:#7a847f;text-align:center;">
                    Demaa · Accès sécurisé à votre espace membre
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function renderMagicLinkText(input: { magicLink: string }) {
  return [
    "Bonjour,",
    "",
    "Voici votre lien sécurisé pour accéder à votre espace membre Demaa :",
    input.magicLink,
    "",
    "Ce lien expire dans 30 minutes.",
    "",
    "Si vous n'avez pas demandé cet accès, vous pouvez ignorer cet email.",
  ].join("\n");
}

function getBaseUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (siteUrl && !siteUrl.includes("vercel.app")) {
    return siteUrl;
  }

  return requestOrigin;
}

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
      html: renderMagicLinkEmail({ magicLink: input.magicLink }),
      text: renderMagicLinkText({ magicLink: input.magicLink }),
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

function getMagicLinkErrorMessage(
  reason: "missing_resend_config" | "resend_error" | null
) {
  if (reason === "missing_resend_config") {
    return "La configuration email n'est pas encore prête.";
  }

  if (reason === "resend_error") {
    return "Impossible d'envoyer le lien pour le moment. Merci de réessayer dans quelques instants.";
  }

  return "Impossible d'envoyer le lien.";
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

  const limited = enforceRateLimit(
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
  const magicLink = `${getBaseUrl(request)}/api/customer-space/consume?token=${encodeURIComponent(
    token
  )}`;
  const emailResult = await sendMagicLinkEmail({ email, magicLink });

  if (!emailResult.sent) {
    return NextResponse.json(
      {
        error: getMagicLinkErrorMessage(emailResult.reason),
        sent: false,
        devLink: process.env.NODE_ENV === "production" ? null : magicLink,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sent: emailResult.sent,
    devLink: process.env.NODE_ENV === "production" ? null : magicLink,
  });
}
