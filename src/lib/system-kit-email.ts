import { createHash } from "node:crypto";
import { getPilotingSheetCopyUrl } from "@/lib/document-models";
import { getCanonicalOrigin } from "@/lib/site-url";

type SystemKitEmailButton = {
  href: string;
  label: string;
};

type SystemKitEmailBlock = {
  title: string;
  lines: string[];
};

type ResendEmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SystemKitFollowupKind = "usage" | "session";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSystemKitEmailLayout(input: {
  eyebrow: string;
  title: string;
  greeting?: string;
  paragraphs: string[];
  button: SystemKitEmailButton;
  linkNotice: string;
  secondaryBlock?: SystemKitEmailBlock | null;
  footerNote?: string | null;
}) {
  const safeButtonHref = escapeHtml(input.button.href);
  const paragraphsHtml = input.paragraphs
    .map(
      (paragraph) => `
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
          ${paragraph}
        </p>
      `,
    )
    .join("");

  const greetingHtml = input.greeting
    ? `
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
          ${input.greeting}
        </p>
      `
    : "";

  const secondaryBlockHtml = input.secondaryBlock
    ? `
        <div style="margin:0 0 20px;border-radius:20px;background-color:#f9faf8;padding:16px 18px;">
          <p style="margin:0 0 8px;font-size:13px;line-height:1.7;font-weight:700;color:#315f46;">
            ${input.secondaryBlock.title}
          </p>
          ${input.secondaryBlock.lines
            .map(
              (line) => `
                <p style="margin:0;font-size:13px;line-height:1.7;color:#52606d;">
                  ${line}
                </p>
              `,
            )
            .join("")}
        </div>
      `
    : "";

  const footerNoteHtml = input.footerNote
    ? `
        <p style="margin:0;font-size:13px;line-height:1.7;color:#7a847f;">
          ${input.footerNote}
        </p>
      `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${input.title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f9faf8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#f9faf8;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;max-width:560px;">
                <tr>
                  <td style="border:1px solid #e7ece6;border-radius:28px;background-color:#ffffff;padding:36px 32px;font-family:Arial,sans-serif;color:#17231d;">
                    <div style="font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#315f46;">
                      ${input.eyebrow}
                    </div>
                    <h1 style="margin:14px 0 14px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#17231d;">
                      ${input.title}
                    </h1>
                    ${greetingHtml}
                    ${paragraphsHtml}
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px;">
                      <tr>
                        <td align="center" bgcolor="#315f46" style="border-radius:999px;">
                          <a href="${safeButtonHref}" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
                            ${input.button.label}
                          </a>
                        </td>
                      </tr>
                    </table>
                    ${secondaryBlockHtml}
                    <div style="margin:0 0 4px;border-radius:20px;background-color:#f9faf8;padding:16px 18px;">
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#315f46;">
                        ${input.linkNotice}
                      </p>
                      <p style="margin:10px 0 0;font-size:13px;line-height:1.7;word-break:break-all;">
                        <a href="${safeButtonHref}" style="color:#315f46;text-decoration:underline;">
                          ${safeButtonHref}
                        </a>
                      </p>
                    </div>
                    ${footerNoteHtml}
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

function renderSystemKitInitialEmail(input: {
  firstName: string;
  systemName: string;
  copyUrl: string;
}) {
  const safeFirstName = escapeHtml(input.firstName);
  const safeSystemName = escapeHtml(input.systemName);

  return renderSystemKitEmailLayout({
    eyebrow: "Tableau de pilotage",
    title: "Votre tableau de pilotage est prêt",
    greeting: `Bonjour ${safeFirstName},`,
    paragraphs: [
      `Voici votre tableau de pilotage pour <strong style="color:#17231d;">${safeSystemName}</strong>.`,
      "Il regroupe dans un seul Google Sheet la synthèse, le prévisionnel financier, les actions, l’équipe, l’écosystème, le calendrier marketing et les process.",
      "Connectez-vous à Google puis créez votre copie personnelle : elle sera directement modifiable dans votre Drive.",
    ],
    button: {
      href: input.copyUrl,
      label: "Créer ma copie du tableau",
    },
    linkNotice: "Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
  });
}

function renderSystemKitFollowupEmail(input: {
  firstName: string;
  systemName: string;
  kitUrl: string;
  sessionUrl: string;
  kind: SystemKitFollowupKind;
}) {
  const safeFirstName = escapeHtml(input.firstName);
  const safeSystemName = escapeHtml(input.systemName);

  if (input.kind === "usage") {
    return renderSystemKitEmailLayout({
      eyebrow: "Tableau de pilotage",
      title: "Comment démarrer simplement",
      greeting: input.firstName ? `Bonjour ${safeFirstName},` : "Bonjour,",
      paragraphs: [
        `Voici la façon la plus simple de démarrer votre tableau de pilotage ${safeSystemName.toLowerCase()}.`,
        "Commencez par la Synthèse : choisissez le premier mois, votre unité d’activité et vos objectifs.",
        "Renseignez ensuite vos chiffres dans le Prévisionnel financier, puis choisissez une seule action et un seul process prioritaires.",
      ],
      secondaryBlock: {
        title: "Pour bien démarrer",
        lines: [
          "1. Configurez la Synthèse.",
          "2. Complétez le Prévisionnel financier mois par mois.",
          "3. Ajoutez une action prioritaire, puis adaptez un premier process.",
        ],
      },
      button: {
        href: input.kitUrl,
        label: "Ouvrir mon tableau",
      },
      linkNotice: "Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
    });
  }

  return renderSystemKitEmailLayout({
    eyebrow: "Structuration & pilotage",
    title: "Vous voulez adapter le tableau à votre entreprise ?",
    greeting: input.firstName ? `Bonjour ${safeFirstName},` : "Bonjour,",
    paragraphs: [
      "La mission Structuration & pilotage vous aide à configurer le tableau avec vos données, clarifier les rôles et remettre de l’ordre dans vos priorités et vos process.",
      "L’intervention dure un mois et coûte 980 € HT.",
      "La première session de cadrage est offerte et sans engagement.",
    ],
    button: {
      href: input.sessionUrl,
      label: "Réserver ma session de cadrage offerte",
    },
    linkNotice: "Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
  });
}

function renderSystemKitEmail(input: {
  firstName: string;
  systemName: string;
  copyUrl: string;
}) {
  return renderSystemKitInitialEmail(input);
}

function renderSystemKitText(input: {
  firstName: string;
  systemName: string;
  copyUrl: string;
}) {
  return [
    `Bonjour ${input.firstName},`,
    "",
    `Voici votre tableau de pilotage pour ${input.systemName} :`,
    input.copyUrl,
    "",
    "Ce Google Sheet regroupe la synthèse, le prévisionnel financier, les actions, l’équipe, l’écosystème, le calendrier marketing et les process.",
    "Connectez-vous à Google puis créez votre copie personnelle et modifiable dans votre Drive.",
  ].join("\n");
}

export async function sendSystemKitEmail(input: {
  email: string;
  firstName: string;
  idempotencyKey: string;
  systemSlug: string;
  systemName: string;
  request?: Request;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing_resend_config" as const };
  }

  const copyUrl = getPilotingSheetCopyUrl(input.systemSlug);

  if (!copyUrl) {
    return { sent: false, reason: "missing_sheet" as const };
  }

  return sendResendEmail({
    apiKey,
    idempotencyKey: input.idempotencyKey,
    payload: {
      from,
      to: input.email,
      subject: `Votre tableau de pilotage Demaa — ${input.systemName}`,
      html: renderSystemKitEmail({
        firstName: input.firstName,
        systemName: input.systemName,
        copyUrl,
      }),
      text: renderSystemKitText({
        firstName: input.firstName,
        systemName: input.systemName,
        copyUrl,
      }),
    },
  });
}

function renderSystemKitFollowupText(input: {
  kind: SystemKitFollowupKind;
  firstName: string;
  systemName: string;
  kitUrl: string;
  sessionUrl: string;
}) {
  if (input.kind === "usage") {
    return [
      `Bonjour ${input.firstName || ""}`.trim() + ",",
      "",
      `Voici la façon la plus simple de démarrer votre tableau de pilotage ${input.systemName}.`,
      "",
      "1. Configurez la Synthèse : premier mois, unité d’activité et objectifs.",
      "2. Complétez le Prévisionnel financier mois par mois.",
      "3. Ajoutez une action prioritaire, puis adaptez un premier process.",
      "",
      `Ouvrir mon tableau : ${input.kitUrl}`,
    ].join("\n");
  }

  return [
    `Bonjour ${input.firstName || ""}`.trim() + ",",
    "",
    "La mission Structuration & pilotage vous aide à configurer le tableau avec vos données, clarifier les rôles et remettre de l’ordre dans vos priorités et vos process.",
    "L’intervention dure un mois et coûte 980 € HT. La première session de cadrage est offerte et sans engagement.",
    "",
    `Réserver ma session de cadrage offerte : ${input.sessionUrl}`,
  ].join("\n");
}

async function sendResendEmail(input: {
  apiKey: string;
  idempotencyKey?: string;
  payload: ResendEmailPayload;
}) {
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey }
          : {}),
      },
      body: JSON.stringify(input.payload),
      cache: "no-store",
    });
  } catch (error) {
    return {
      sent: false as const,
      reason: "resend_error" as const,
      errorText: error instanceof Error ? error.message.slice(0, 300) : "network error",
      status: 0,
    };
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return {
      sent: false as const,
      reason: "resend_error" as const,
      errorText,
      status: response.status,
    };
  }

  return { sent: true as const, reason: null };
}

function buildEmailIdempotencyKey(value: string) {
  return `demaa-${createHash("sha256").update(value).digest("hex")}`;
}

export async function sendSystemKitFollowupEmail(input: {
  email: string;
  firstName: string;
  systemName: string;
  systemSlug: string;
  kind: SystemKitFollowupKind;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing_resend_config" as const };
  }

  const kitUrl =
    getPilotingSheetCopyUrl(input.systemSlug) ??
    `${getCanonicalOrigin()}/kit-operationnel/${encodeURIComponent(input.systemSlug)}`;
  const sessionUrl =
    `${getCanonicalOrigin()}/annuaire-services/organisation?booking=1` +
    `&source=kit-followup&systemSlug=${encodeURIComponent(input.systemSlug)}`;
  const subject =
    input.kind === "usage"
      ? "Comment démarrer votre tableau de pilotage"
      : "Besoin d’aide pour adapter votre tableau ?";

  return sendResendEmail({
    apiKey,
    idempotencyKey: buildEmailIdempotencyKey(
      `system-kit-followup:${input.kind}:${input.systemSlug}:${input.email}`,
    ),
    payload: {
      from,
      to: input.email,
      subject,
      html: renderSystemKitFollowupEmail({
        firstName: input.firstName,
        systemName: input.systemName,
        kitUrl,
        sessionUrl,
        kind: input.kind,
      }),
      text: renderSystemKitFollowupText({
        firstName: input.firstName,
        systemName: input.systemName,
        kitUrl,
        sessionUrl,
        kind: input.kind,
      }),
    },
  });
}

export function getSystemKitEmailErrorMessage(
  reason: "missing_resend_config" | "missing_sheet" | "resend_error" | null
) {
  if (reason === "missing_resend_config") {
    return "La configuration email n'est pas encore prête.";
  }

  if (reason === "resend_error") {
    return "Impossible d'envoyer le tableau pour le moment. Merci de réessayer dans quelques instants.";
  }

  if (reason === "missing_sheet") {
    return "Le Google Sheet de ce métier est introuvable.";
  }

  return "Impossible d'envoyer le tableau.";
}
