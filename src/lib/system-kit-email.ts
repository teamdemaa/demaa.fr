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

type SystemKitFollowupKind = "usage" | "diagnostic";

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
                          <a href="${input.button.href}" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
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
                        <a href="${input.button.href}" style="color:#315f46;text-decoration:underline;">
                          ${input.button.href}
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
  return renderSystemKitEmailLayout({
    eyebrow: "Kit opérationnel",
    title: "Votre Google Sheet est prêt",
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [
      `Voici votre kit opérationnel pour <strong style="color:#17231d;">${input.systemName}</strong>.`,
      "Il regroupe dans un seul Google Sheet les catégories, les process, les tâches, les responsables et les récurrences.",
      "Connectez-vous à Google puis créez votre copie personnelle : elle sera directement modifiable dans votre Drive.",
    ],
    button: {
      href: input.copyUrl,
      label: "Créer ma copie du Google Sheet",
    },
    linkNotice: "Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
  });
}

function renderSystemKitFollowupEmail(input: {
  firstName: string;
  systemName: string;
  kitUrl: string;
  diagnosticUrl: string;
  kind: SystemKitFollowupKind;
}) {
  if (input.kind === "usage") {
    return renderSystemKitEmailLayout({
      eyebrow: "Kit opérationnel",
      title: "Comment utiliser votre kit concrètement",
      greeting: input.firstName ? `Bonjour ${input.firstName},` : "Bonjour,",
      paragraphs: [
        `Une semaine après l’envoi, voici la meilleure façon d’utiliser votre kit ${input.systemName.toLowerCase()} simplement.`,
        "Le bon réflexe n’est pas de compléter tous les process d’un coup.",
        "Commencez par le process qui vous fait perdre le plus de temps, ajustez ses tâches, désignez un responsable et fixez sa récurrence.",
      ],
      secondaryBlock: {
        title: "Pour bien démarrer",
        lines: [
          "1. Repérez ce qui repose encore trop sur vous.",
          "2. Choisissez un process à structurer en priorité.",
          "3. Complétez ses tâches, son responsable et sa récurrence.",
        ],
      },
      button: {
        href: input.kitUrl,
        label: "Revoir mon kit",
      },
      linkNotice: "Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
    });
  }

  return renderSystemKitEmailLayout({
    eyebrow: "Diagnostic offert",
    title: "On peut vous offrir un premier diagnostic",
    greeting: input.firstName ? `Bonjour ${input.firstName},` : "Bonjour,",
    paragraphs: [
      "Si vous avez parcouru le kit mais que vous ne savez pas encore par où commencer, on peut vous aider avec un diagnostic organisation offert.",
      "L’objectif est de repérer ce qui repose trop sur vous, ce qui freine l’activité, et ce qu’il faudrait clarifier ou déléguer en premier.",
      "Ce n’est pas un engagement. C’est un premier point simple pour vous aider à voir plus clair.",
    ],
    button: {
      href: input.diagnosticUrl,
      label: "Demander le diagnostic offert",
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
    `Voici votre kit opérationnel pour ${input.systemName} :`,
    input.copyUrl,
    "",
    "Ce Google Sheet regroupe les catégories, les process, les tâches, les responsables et les récurrences.",
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
      subject: `Votre kit opérationnel Demaa - ${input.systemName}`,
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
  diagnosticUrl: string;
}) {
  if (input.kind === "usage") {
    return [
      `Bonjour ${input.firstName || ""}`.trim() + ",",
      "",
      `Une semaine après l’envoi, voici la meilleure façon d’utiliser votre kit ${input.systemName} simplement.`,
      "",
      "1. Repérez ce qui vous fait perdre le plus de temps.",
      "2. Choisissez un seul process à structurer.",
      "3. Complétez ses tâches, son responsable et sa récurrence.",
      "",
      `Revoir mon kit : ${input.kitUrl}`,
    ].join("\n");
  }

  return [
    `Bonjour ${input.firstName || ""}`.trim() + ",",
    "",
    "Si vous avez parcouru le kit mais que vous ne savez pas encore par où commencer, on peut vous aider avec un diagnostic organisation offert.",
    "L’objectif est de repérer ce qui repose trop sur vous, ce qui freine l’activité, et ce qu’il faudrait clarifier ou déléguer en premier.",
    "",
    `Demander le diagnostic offert : ${input.diagnosticUrl}`,
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
  const diagnosticUrl =
    `${getCanonicalOrigin()}/annuaire-services/organisation?booking=1` +
    `&source=kit-followup&systemSlug=${encodeURIComponent(input.systemSlug)}`;
  const subject =
    input.kind === "usage"
      ? "Comment utiliser votre kit opérationnel concrètement"
      : "On peut vous offrir un premier diagnostic";

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
        diagnosticUrl,
        kind: input.kind,
      }),
      text: renderSystemKitFollowupText({
        firstName: input.firstName,
        systemName: input.systemName,
        kitUrl,
        diagnosticUrl,
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
    return "Impossible d'envoyer le kit pour le moment. Merci de réessayer dans quelques instants.";
  }

  if (reason === "missing_sheet") {
    return "Le Google Sheet de ce métier est introuvable.";
  }

  return "Impossible d'envoyer le kit.";
}
