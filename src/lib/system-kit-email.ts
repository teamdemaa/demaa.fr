import { getCanonicalBaseUrl } from "@/lib/site-url";

function renderSystemKitEmail(input: {
  firstName: string;
  systemName: string;
  downloadUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Votre kit système Demaa</title>
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
                      Kit système
                    </div>
                    <h1 style="margin:14px 0 14px;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#17231d;">
                      Votre kit est prêt
                    </h1>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      Bonjour ${input.firstName},
                    </p>
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#52606d;">
                      Voici votre accès au kit système pour <strong style="color:#17231d;">${input.systemName}</strong>.
                    </p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#52606d;">
                      Vous y retrouverez les documents associés au système, regroupés sur une page simple à consulter et à télécharger.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px;">
                      <tr>
                        <td align="center" bgcolor="#315f46" style="border-radius:999px;">
                          <a href="${input.downloadUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">
                            Accéder au kit système
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="margin:0 0 20px;border-radius:20px;background-color:#eef4ef;padding:16px 18px;">
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#315f46;">
                        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                      </p>
                      <p style="margin:10px 0 0;font-size:13px;line-height:1.7;word-break:break-all;">
                        <a href="${input.downloadUrl}" style="color:#315f46;text-decoration:underline;">
                          ${input.downloadUrl}
                        </a>
                      </p>
                    </div>
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

function renderSystemKitText(input: {
  firstName: string;
  systemName: string;
  downloadUrl: string;
}) {
  return [
    `Bonjour ${input.firstName},`,
    "",
    `Voici votre accès au kit système pour ${input.systemName} :`,
    input.downloadUrl,
    "",
    "Vous y retrouverez les documents associés au système, regroupés sur une page simple à consulter et à télécharger.",
  ].join("\n");
}

export async function sendSystemKitEmail(input: {
  email: string;
  firstName: string;
  systemSlug: string;
  systemName: string;
  request?: Request;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing_resend_config" as const };
  }

  const downloadUrl = `${getCanonicalBaseUrl(input.request)}/kit-systeme/${encodeURIComponent(
    input.systemSlug
  )}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: `Votre kit système Demaa - ${input.systemName}`,
      html: renderSystemKitEmail({
        firstName: input.firstName,
        systemName: input.systemName,
        downloadUrl,
      }),
      text: renderSystemKitText({
        firstName: input.firstName,
        systemName: input.systemName,
        downloadUrl,
      }),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("[system-kit] Resend error:", response.status, errorText);
    return { sent: false, reason: "resend_error" as const };
  }

  return { sent: true, reason: null };
}

export function getSystemKitEmailErrorMessage(
  reason: "missing_resend_config" | "resend_error" | null
) {
  if (reason === "missing_resend_config") {
    return "La configuration email n'est pas encore prête.";
  }

  if (reason === "resend_error") {
    return "Impossible d'envoyer le kit pour le moment. Merci de réessayer dans quelques instants.";
  }

  return "Impossible d'envoyer le kit.";
}
