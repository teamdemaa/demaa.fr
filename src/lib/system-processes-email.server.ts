import "server-only";

import { createHash } from "node:crypto";
import { buildSystemProcessesPdfFilename } from "@/lib/system-processes-pdf.server";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildResendIdempotencyKey(input: {
  email: string;
  requestKey: string;
  systemSlug: string;
}) {
  const digest = createHash("sha256")
    .update(`${input.email}:${input.systemSlug}:${input.requestKey}`)
    .digest("hex");
  return `demaa-processes-${digest}`;
}

export async function sendSystemProcessesPdfEmail(input: {
  email: string;
  pdfBytes: Uint8Array;
  requestKey: string;
  systemName: string;
  systemSlug: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { reason: "missing_resend_config" as const, sent: false as const };
  }

  const safeSystemName = escapeHtml(input.systemName);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": buildResendIdempotencyKey(input),
    },
    body: JSON.stringify({
      attachments: [
        {
          content: Buffer.from(input.pdfBytes).toString("base64"),
          filename: buildSystemProcessesPdfFilename(input.systemSlug),
        },
      ],
      from,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <body style="margin:0;padding:32px 16px;background:#f9faf8;font-family:Arial,sans-serif;color:#17231d;">
            <div style="max-width:560px;margin:0 auto;border:1px solid #e7ece6;border-radius:24px;background:#ffffff;padding:32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#315f46;">Processus métier</p>
              <h1 style="margin:14px 0;font-size:28px;line-height:1.2;">Votre document est prêt</h1>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#52606d;">Vous trouverez en pièce jointe le document complet des processus métier pour <strong>${safeSystemName}</strong>.</p>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#52606d;">Vous pouvez la conserver, l’imprimer et cocher les étapes au fil de votre organisation.</p>
            </div>
          </body>
        </html>
      `,
      subject: `Vos processus métier - ${input.systemName}`,
      text: [
        "Bonjour,",
        "",
        `Vous trouverez en pièce jointe le document complet des processus métier pour ${input.systemName}.`,
        "",
        "Vous pouvez la conserver, l’imprimer et cocher les étapes au fil de votre organisation.",
      ].join("\n"),
      to: input.email,
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return { reason: "resend_error" as const, sent: false as const };
  }

  return { reason: null, sent: true as const };
}
