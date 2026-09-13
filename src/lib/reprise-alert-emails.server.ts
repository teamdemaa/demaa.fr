import "server-only";

import type { RepriseAlertCriteria } from "@/lib/reprise-alerts";
import type { RepriseOpportunity } from "@/lib/reprise-opportunities";
import { sendTransactionalEmail } from "@/lib/transactional-email.server";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function formatAmount(value: number | null) {
  return value === null ? "Non renseigné" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function criteriaLines(criteria: RepriseAlertCriteria) {
  return [
    `Activité : ${criteria.query || "Toutes"}`,
    `Catégories : ${criteria.categories.join(", ") || "Toutes"}`,
    `Régions : ${criteria.regions.join(", ") || "Toutes"}`,
    `Budget maximal : ${formatAmount(criteria.budgetMax)}`,
    `Chiffre d’affaires minimal : ${formatAmount(criteria.revenueMin)}`,
    `Informations manquantes : ${criteria.includeMissing ? "incluses" : "exclues"}`,
  ];
}

function linkButton(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;border-radius:999px;background:#315f46;color:#fff;padding:12px 20px;text-decoration:none;font-family:Arial,sans-serif;font-weight:600">${escapeHtml(label)}</a>`;
}

export async function sendRepriseAlertConfirmation(input: {
  accessToken: string;
  alertId: string;
  baseUrl: string;
  criteria: RepriseAlertCriteria;
  email: string;
}) {
  const manageUrl = `${input.baseUrl}/alertes-reprise/${input.alertId}?token=${encodeURIComponent(input.accessToken)}`;
  const unsubscribeUrl = `${manageUrl}&action=unsubscribe`;
  const lines = criteriaLines(input.criteria);
  await sendTransactionalEmail({
    html: `<div style="max-width:620px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#17231d"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#315f46">Alerte de reprise</p><h1 style="font-size:28px;font-weight:500">Votre alerte est créée.</h1><p style="color:#66736b;line-height:1.6">Nous vous écrirons lorsqu’une nouvelle entreprise correspondra à votre recherche.</p><ul style="padding-left:20px;line-height:1.8">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul><p style="margin-top:28px">${linkButton(manageUrl, "Modifier mon alerte")}</p><p style="margin-top:24px;font-size:12px;color:#7c857f"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#56645c">Supprimer mon alerte</a></p></div>`,
    idempotencyKey: `reprise-alert-confirmation-${input.alertId}`,
    subject: "Votre alerte de reprise est créée",
    text: ["Votre alerte de reprise est créée.", "", "Nous vous écrirons lorsqu’une nouvelle entreprise correspondra à votre recherche.", "", ...lines, "", `Modifier mon alerte : ${manageUrl}`, `Supprimer mon alerte : ${unsubscribeUrl}`].join("\n"),
    to: input.email,
  });
}

export async function sendInternalRepriseAlertCreated(input: {
  alertId: string;
  criteria: RepriseAlertCriteria;
  email: string;
}) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL?.trim() || "team@demaa.fr";
  const lines = criteriaLines(input.criteria);
  await sendTransactionalEmail({
    html: `<div style="font-family:Arial,sans-serif;color:#17231d"><h1 style="font-size:22px">Nouvelle alerte de reprise</h1><p><strong>Email :</strong> ${escapeHtml(input.email)}</p><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul><p>Référence : ${escapeHtml(input.alertId)}</p></div>`,
    idempotencyKey: `reprise-alert-internal-${input.alertId}`,
    replyTo: input.email,
    subject: "Nouvelle alerte de reprise",
    text: ["Nouvelle alerte de reprise", `Email : ${input.email}`, ...lines, `Référence : ${input.alertId}`].join("\n"),
    to,
  });
}

export async function sendRepriseOpportunityMatch(input: {
  accessToken: string;
  alertId: string;
  baseUrl: string;
  email: string;
  opportunity: RepriseOpportunity;
}) {
  const opportunityUrl = `${input.baseUrl}/a-reprendre?opportunite=${encodeURIComponent(input.opportunity.id)}`;
  const manageUrl = `${input.baseUrl}/alertes-reprise/${input.alertId}?token=${encodeURIComponent(input.accessToken)}`;
  const unsubscribeUrl = `${manageUrl}&action=unsubscribe`;
  const details = [input.opportunity.location, input.opportunity.revenue, input.opportunity.ebe].filter(Boolean).join(" · ");
  await sendTransactionalEmail({
    html: `<div style="max-width:620px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#17231d"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#315f46">Alerte de reprise</p><h1 style="font-size:28px;font-weight:500">Une nouvelle entreprise correspond à votre recherche.</h1><h2 style="margin-top:28px;font-size:21px;font-weight:500">${escapeHtml(input.opportunity.activity)}</h2><p style="color:#66736b;line-height:1.6">${escapeHtml(details)}</p><p style="margin-top:28px">${linkButton(opportunityUrl, "Voir l’opportunité")}</p><p style="margin-top:28px;font-size:12px;color:#7c857f"><a href="${escapeHtml(manageUrl)}" style="color:#56645c">Modifier mon alerte</a> · <a href="${escapeHtml(unsubscribeUrl)}" style="color:#56645c">Supprimer mon alerte</a></p></div>`,
    idempotencyKey: `reprise-alert-match-${input.alertId}-${input.opportunity.id}`,
    subject: `Nouvelle opportunité : ${input.opportunity.activity}`,
    text: ["Une nouvelle entreprise correspond à votre recherche.", "", input.opportunity.activity, details, "", `Voir l’opportunité : ${opportunityUrl}`, `Modifier mon alerte : ${manageUrl}`, `Supprimer mon alerte : ${unsubscribeUrl}`].join("\n"),
    to: input.email,
  });
}
