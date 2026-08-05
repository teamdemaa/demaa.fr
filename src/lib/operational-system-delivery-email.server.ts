import "server-only";

import { createHash } from "node:crypto";
import { getEditableOperationalSystemCopyUrl } from "@/lib/editable-operational-system-assets.server";
import {
  LEVIER_ASSET_REVISION,
  LEVIER_LEGACY_ATTACHMENT_REVISION,
} from "@/lib/levier-asset.server";
import type { LeadAssetSnapshot } from "@/lib/lead-storage";
import { resolveSystemResourceDelivery } from "@/lib/system-resource-assets.server";
import { getSystemResource } from "@/lib/system-resource-catalog";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildIdempotencyKey(deliveryId: string) {
  return `demaa-system-${createHash("sha256").update(deliveryId).digest("hex")}`;
}

export async function sendOperationalSystemDeliveryEmail(input: {
  assetSnapshot: LeadAssetSnapshot;
  deliveryId: string;
  email: string;
  firstName?: string | null;
  systemName: string;
  systemSlug: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return { sent: false as const, reason: "missing_resend_config" as const };
  }

  const resourceDelivery = resolveSystemResourceDelivery(input.assetSnapshot);
  if (resourceDelivery) {
    return sendSystemResourceDeliveryEmail({
      ...input,
      apiKey,
      destination: resourceDelivery.destination,
      from,
      resourceSlug: resourceDelivery.resourceSlug,
    });
  }
  if (input.assetSnapshot.assetRevision === LEVIER_ASSET_REVISION) {
    return { sent: false as const, reason: "missing_asset" as const };
  }
  if (
    input.assetSnapshot.assetRevision === LEVIER_LEGACY_ATTACHMENT_REVISION
  ) {
    return { sent: false as const, reason: "missing_asset" as const };
  }

  const copyUrl = getEditableOperationalSystemCopyUrl(
    input.systemSlug,
    input.assetSnapshot.assetRevision,
  );
  if (!copyUrl) {
    return { sent: false as const, reason: "missing_asset" as const };
  }

  const safeCopyUrl = escapeHtml(copyUrl);
  const firstName = input.firstName?.trim() ?? "";
  const greeting = firstName ? `Bonjour ${escapeHtml(firstName)},` : "Bonjour,";
  const safeSystemName = escapeHtml(input.systemName);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": buildIdempotencyKey(input.deliveryId),
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: `Votre copie modifiable - ${input.systemName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <body style="margin:0;padding:32px 16px;background:#f9faf8;font-family:Arial,sans-serif;color:#17231d;">
            <div style="max-width:560px;margin:0 auto;border:1px solid #e7ece6;border-radius:24px;background:#ffffff;padding:32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#315f46;">Système opérationnel</p>
              <h1 style="margin:14px 0;font-size:28px;line-height:1.2;">Votre système est prêt</h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#52606d;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#52606d;">Voici votre système opérationnel <strong>${safeSystemName}</strong>.</p>
              <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#52606d;">Connectez-vous à Google, puis créez gratuitement votre copie personnelle et modifiable dans votre Drive.</p>
              <a href="${safeCopyUrl}" style="display:inline-block;border-radius:999px;background:#315f46;padding:14px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Créer ma copie dans Google Drive</a>
              <p style="margin:24px 0 8px;font-size:13px;line-height:1.6;color:#52606d;">Si le bouton ne fonctionne pas, copiez ce lien :</p>
              <a href="${safeCopyUrl}" style="font-size:13px;line-height:1.6;color:#315f46;word-break:break-all;">${safeCopyUrl}</a>
            </div>
          </body>
        </html>
      `,
      text: [
        firstName ? `Bonjour ${firstName},` : "Bonjour,",
        "",
        `Votre système opérationnel ${input.systemName} est prêt.`,
        "",
        "Connectez-vous à Google, puis créez gratuitement votre copie personnelle et modifiable dans votre Drive :",
        copyUrl,
      ].join("\n"),
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return { sent: false as const, reason: "resend_error" as const };
  }

  return { sent: true as const, reason: null };
}

async function sendSystemResourceDeliveryEmail(input: {
  apiKey: string;
  destination: string;
  deliveryId: string;
  email: string;
  from: string;
  resourceSlug: string;
}) {
  const resource = getSystemResource(input.resourceSlug);
  if (!resource) {
    return { sent: false as const, reason: "missing_asset" as const };
  }

  const safeDestination = escapeHtml(input.destination);
  const safeTitle = escapeHtml(resource.title);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": buildIdempotencyKey(input.deliveryId),
    },
    body: JSON.stringify({
      from: input.from,
      to: input.email,
      subject: `Votre ressource Demaa - ${resource.title}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <body style="margin:0;padding:32px 16px;background:#f9faf8;font-family:Arial,sans-serif;color:#17231d;">
            <div style="max-width:560px;margin:0 auto;border:1px solid #e7ece6;border-radius:24px;background:#ffffff;padding:32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#315f46;">Ressource Demaa</p>
              <h1 style="margin:14px 0;font-size:28px;line-height:1.2;">Votre ressource est prête</h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#52606d;">Bonjour,</p>
              <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#52606d;">Voici la ressource <strong>${safeTitle}</strong> demandée sur Demaa.</p>
              <a href="${safeDestination}" style="display:inline-block;border-radius:999px;background:#315f46;padding:14px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Ouvrir la ressource</a>
              <p style="margin:24px 0 8px;font-size:13px;line-height:1.6;color:#52606d;">Si le bouton ne fonctionne pas, copiez ce lien :</p>
              <a href="${safeDestination}" style="font-size:13px;line-height:1.6;color:#315f46;word-break:break-all;">${safeDestination}</a>
            </div>
          </body>
        </html>
      `,
      text: [
        "Bonjour,",
        "",
        `Voici la ressource ${resource.title} demandée sur Demaa.`,
        "",
        "Ouvrir la ressource :",
        input.destination,
      ].join("\n"),
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return { sent: false as const, reason: "resend_error" as const };
  }

  return { sent: true as const, reason: null };
}
