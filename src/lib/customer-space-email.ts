import { createMagicLinkToken } from "@/lib/customer-space-auth";
import { parseCustomerAccessIntent } from "@/lib/customer-space-redirect";
import { getTrustedRequestOrigin } from "@/lib/site-url";

type MagicLinkEmailPresentation = {
  subject: string;
  headline: string;
  body: string;
  cta: string;
  textIntro: string;
};

export function getMagicLinkEmailPresentation(input: {
  actionPlanClaim?: unknown;
  returnTo?: string;
}): MagicLinkEmailPresentation {
  const isPlanAccess = Boolean(input.actionPlanClaim)
    || input.returnTo === "/plans"
    || input.returnTo?.startsWith("/plans/");

  if (isPlanAccess) {
    return {
      subject: "Ouvrez votre plan Demaa",
      headline: "Votre plan est prêt à être retrouvé",
      body: "Ouvrez Demaa pour retrouver votre plan, le modifier et suivre vos actions.",
      cta: "Ouvrir mon plan",
      textIntro: "Voici votre lien sécurisé pour ouvrir votre plan Demaa :",
    };
  }

  const intent = parseCustomerAccessIntent(input.returnTo);
  if (intent?.kind === "coaching") {
    return {
      subject: "Continuez votre échange dans Demaa",
      headline: "Continuez avec un spécialiste",
      body: "Ouvrez Demaa pour écrire à un spécialiste ou poursuivre votre échange.",
      cta: "Écrire à un spécialiste",
      textIntro: "Voici votre lien sécurisé pour continuer avec un spécialiste dans Demaa :",
    };
  }

  if (intent?.kind === "opportunity") {
    return {
      subject: "Continuez votre demande dans Demaa",
      headline: "Votre opportunité vous attend",
      body: "Ouvrez Demaa pour retrouver l’opportunité et continuer votre demande.",
      cta: "Continuer ma demande",
      textIntro: "Voici votre lien sécurisé pour continuer votre demande dans Demaa :",
    };
  }

  return {
    subject: "Votre lien sécurisé Demaa",
    headline: "Votre lien sécurisé est prêt",
    body: "Ouvrez Demaa pour reprendre exactement là où vous vous étiez arrêté.",
    cta: "Ouvrir Demaa",
    textIntro: "Voici votre lien sécurisé pour continuer dans Demaa :",
  };
}

function renderMagicLinkEmail(input: {
  magicLink: string;
  presentation: MagicLinkEmailPresentation;
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Votre lien d'accès Demaa</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f9faf8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#f9faf8;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;max-width:560px;">
                <tr>
                  <td style="border:1px solid #e7ece6;border-radius:28px;background-color:#ffffff;padding:36px 32px;font-family:Arial,sans-serif;color:#17231d;">
                    <div style="font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#315f46;">
                      Demaa
                    </div>
                    <h1 style="margin:14px 0 14px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#17231d;">
                      ${input.presentation.headline}
                    </h1>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      Bonjour,
                    </p>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      ${input.presentation.body}
                    </p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#52606d;">
                      Ce lien est personnel et expire dans <strong style="color:#17231d;">30 minutes</strong>.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px;">
                      <tr>
                        <td align="center" bgcolor="#315f46" style="border-radius:999px;">
                          <a href="${input.magicLink}" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
                            ${input.presentation.cta}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="margin:0 0 20px;border-radius:20px;background-color:#f9faf8;padding:16px 18px;">
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
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function renderMagicLinkText(input: {
  magicLink: string;
  presentation: MagicLinkEmailPresentation;
}) {
  return [
    "Bonjour,",
    "",
    input.presentation.textIntro,
    input.magicLink,
    "",
    "Ce lien expire dans 30 minutes.",
    "",
    "Si vous n'avez pas demandé cet accès, vous pouvez ignorer cet email.",
  ].join("\n");
}

export async function sendCustomerMagicLinkEmail(input: {
  actionPlanClaim?: {
    actionPlanId: string;
    claimSecret?: string | null;
    temporaryAccessToken?: string | null;
  } | null;
  email: string;
  request?: Request;
  returnTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing_resend_config" as const, magicLink: null };
  }

  const token = await createMagicLinkToken(input.email, input.actionPlanClaim);
  const magicLinkUrl = new URL(
    "/connexion",
    getTrustedRequestOrigin(input.request),
  );
  magicLinkUrl.searchParams.set("token", token);

  if (input.returnTo) {
    magicLinkUrl.searchParams.set("returnTo", input.returnTo);
  }

  const magicLink = magicLinkUrl.toString();
  const presentation = getMagicLinkEmailPresentation(input);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: presentation.subject,
      html: renderMagicLinkEmail({ magicLink, presentation }),
      text: renderMagicLinkText({ magicLink, presentation }),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("[customer-space] Resend error:", response.status, errorText);
    return { sent: false, reason: "resend_error" as const, magicLink };
  }

  return { sent: true, reason: null, magicLink };
}

export function getMagicLinkErrorMessage(
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
