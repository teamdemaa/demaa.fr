import "server-only";

import type { RepriseAlertCriteria } from "@/lib/reprise-alerts";
import { getRepriseOpportunityPath } from "@/lib/reprise-opportunity-seo";
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
  return value === null
    ? "Non renseigné"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
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

function emailShell(title: string, content: string) {
  return `<div style="margin:0;background:#f8fbff;padding:28px 12px;font-family:Arial,sans-serif;color:#17283e"><div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #d8e0e7;border-radius:22px;background:#ffffff"><div style="padding:30px 24px 16px"><p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.14em;color:#244a68">sini · Alerte de reprise</p><h1 style="margin:14px 0 0;font-size:29px;line-height:1.18;font-weight:500;letter-spacing:-.03em;color:#17283e">${escapeHtml(title)}</h1></div><div style="padding:0 24px 30px">${content}</div></div><p style="max-width:620px;margin:16px auto 0;text-align:center;font-size:11px;line-height:1.6;color:#627181">sini · Reprendre, vendre et préparer la suite</p></div>`;
}

function linkButton(href: string, label: string, secondary = false) {
  const background = secondary ? "#ffffff" : "#244a68";
  const color = secondary ? "#244a68" : "#ffffff";
  const border = secondary ? "1px solid #d8e0e7" : "1px solid #244a68";
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:999px;border:${border};background:${background}"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;color:${color}">${escapeHtml(label)}</a></td></tr></table>`;
}

function fallbackLink(href: string) {
  return `<p style="margin:14px 0 0;font-size:11px;line-height:1.6;color:#627181">Si le bouton ne fonctionne pas, ouvrez ce lien :<br><a href="${escapeHtml(href)}" style="color:#244a68;word-break:break-all">${escapeHtml(href)}</a></p>`;
}

function criteriaHtml(criteria: RepriseAlertCriteria) {
  return `<div style="margin-top:24px;border:1px solid #d8e0e7;border-radius:16px;background:#f8fbff;padding:18px"><p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#17283e">Vos critères</p>${criteriaLines(criteria).map((line) => `<p style="margin:5px 0;font-size:13px;line-height:1.5;color:#627181">${escapeHtml(line)}</p>`).join("")}</div>`;
}

function getOpportunityUrl(baseUrl: string, opportunity: RepriseOpportunity) {
  return `${baseUrl}${getRepriseOpportunityPath(opportunity)}`;
}

function opportunityListHtml(baseUrl: string, opportunity: RepriseOpportunity) {
  const opportunityUrl = getOpportunityUrl(baseUrl, opportunity);
  return `<div style="margin-top:12px;border:1px solid #d8e0e7;border-radius:16px;padding:16px"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.1em;color:#244a68">${escapeHtml(opportunity.category)}</p><p style="margin:8px 0 0;font-size:17px;line-height:1.35;font-weight:600;color:#17283e">${escapeHtml(opportunity.activity)}</p><p style="margin:7px 0 0;font-size:13px;line-height:1.5;color:#627181">${escapeHtml(opportunity.location)}</p><p style="margin:12px 0 0"><a href="${escapeHtml(opportunityUrl)}" style="font-size:13px;font-weight:700;color:#244a68;text-decoration:underline">Voir la fiche de l’entreprise</a></p></div>`;
}

function opportunityCardHtml(baseUrl: string, opportunity: RepriseOpportunity) {
  const opportunityUrl = getOpportunityUrl(baseUrl, opportunity);
  const metrics = [
    ["Chiffre d’affaires", opportunity.revenue],
    ["EBE ou rentabilité", opportunity.ebe],
    ["Équipe", opportunity.employees],
    ["Prix demandé", opportunity.askingPrice],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return `<div style="margin-top:24px;border:1px solid #d8e0e7;border-radius:18px;background:#f8fbff;padding:20px"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.1em;color:#244a68">${escapeHtml(opportunity.category)}</p><h2 style="margin:9px 0 0;font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-.02em;color:#17283e">${escapeHtml(opportunity.activity)}</h2><p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#627181">${escapeHtml(opportunity.location)}</p>${metrics.length > 0 ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;border-top:1px solid #d8e0e7">${metrics.map(([label, value]) => `<tr><td style="padding:10px 8px 10px 0;border-bottom:1px solid #d8e0e7;font-size:12px;color:#627181">${escapeHtml(label)}</td><td style="padding:10px 0 10px 8px;border-bottom:1px solid #d8e0e7;text-align:right;font-size:13px;font-weight:600;color:#17283e">${escapeHtml(value)}</td></tr>`).join("")}</table>` : ""}<div style="margin-top:20px">${linkButton(opportunityUrl, "Voir la fiche de l’entreprise")}</div>${fallbackLink(opportunityUrl)}</div>`;
}

function managementLinks(manageUrl: string, unsubscribeUrl: string) {
  return `<div style="margin-top:26px;border-top:1px solid #d8e0e7;padding-top:20px"><p style="margin:0;font-size:12px;line-height:1.7;color:#627181"><a href="${escapeHtml(manageUrl)}" style="font-weight:600;color:#244a68">Modifier mon alerte</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${escapeHtml(unsubscribeUrl)}" style="color:#244a68">Supprimer mon alerte</a></p></div>`;
}

export async function sendRepriseAlertConfirmation(input: {
  accessToken: string;
  alertId: string;
  baseUrl: string;
  criteria: RepriseAlertCriteria;
  currentMatches?: readonly RepriseOpportunity[];
  email: string;
}) {
  const manageUrl = `${input.baseUrl}/alertes-reprise/${input.alertId}?token=${encodeURIComponent(input.accessToken)}`;
  const unsubscribeUrl = `${manageUrl}&action=unsubscribe`;
  const marketplaceUrl = input.baseUrl;
  const lines = criteriaLines(input.criteria);
  const currentMatches = input.currentMatches ?? [];
  const displayedMatches = currentMatches.slice(0, 3);
  const matchText = displayedMatches.flatMap((opportunity) => [
    `- ${opportunity.activity} · ${opportunity.location}`,
    `  Voir la fiche : ${getOpportunityUrl(input.baseUrl, opportunity)}`,
  ]);
  const matchHtml = displayedMatches.length > 0
    ? `<div style="margin-top:26px"><h2 style="margin:0;font-size:19px;font-weight:600;color:#17283e">${currentMatches.length} entreprise${currentMatches.length > 1 ? "s" : ""} correspond${currentMatches.length > 1 ? "ent" : ""} déjà à votre recherche</h2>${displayedMatches.map((opportunity) => opportunityListHtml(input.baseUrl, opportunity)).join("")}${currentMatches.length > displayedMatches.length ? `<p style="margin:14px 0 0;font-size:13px;color:#627181">Et ${currentMatches.length - displayedMatches.length} autre${currentMatches.length - displayedMatches.length > 1 ? "s" : ""} correspondance${currentMatches.length - displayedMatches.length > 1 ? "s" : ""} sur sini.</p>` : ""}</div>`
    : `<p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#66736b">Aucune entreprise publiée ne correspond encore exactement à vos critères. Nous vous écrirons dès qu’une nouvelle opportunité conviendra.</p>`;

  await sendTransactionalEmail({
    html: emailShell(
      "Votre alerte est créée.",
      `<p style="margin:0;font-size:15px;line-height:1.7;color:#66736b">Votre recherche est enregistrée. Chaque email contiendra un accès direct à la fiche de l’entreprise concernée.</p>${criteriaHtml(input.criteria)}${matchHtml}<div style="margin-top:24px">${linkButton(marketplaceUrl, "Voir les entreprises à reprendre")}</div>${fallbackLink(marketplaceUrl)}<div style="margin-top:14px">${linkButton(manageUrl, "Gérer mon alerte", true)}</div>${managementLinks(manageUrl, unsubscribeUrl)}`,
    ),
    idempotencyKey: `reprise-alert-confirmation-${input.alertId}`,
    subject: currentMatches.length > 0
      ? `Votre alerte est créée · ${currentMatches.length} correspondance${currentMatches.length > 1 ? "s" : ""}`
      : "Votre alerte de reprise est créée",
    text: [
      "Votre alerte de reprise est créée.",
      "",
      "Votre recherche est enregistrée. Chaque email contiendra un accès direct à la fiche de l’entreprise concernée.",
      "",
      ...lines,
      ...(matchText.length > 0 ? ["", "Entreprises correspondant déjà à votre recherche :", ...matchText] : ["", "Aucune entreprise publiée ne correspond encore exactement à vos critères."]),
      "",
      `Voir les entreprises à reprendre : ${marketplaceUrl}`,
      `Modifier mon alerte : ${manageUrl}`,
      `Supprimer mon alerte : ${unsubscribeUrl}`,
    ].join("\n"),
    to: input.email,
  });
}

export async function sendInternalRepriseAlertCreated(input: {
  alertId: string;
  criteria: RepriseAlertCriteria;
  email: string;
}) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL?.trim();
  if (!to) throw new Error("SINI internal alert recipient is not configured.");
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
  const opportunityUrl = getOpportunityUrl(input.baseUrl, input.opportunity);
  const manageUrl = `${input.baseUrl}/alertes-reprise/${input.alertId}?token=${encodeURIComponent(input.accessToken)}`;
  const unsubscribeUrl = `${manageUrl}&action=unsubscribe`;
  const details = [
    input.opportunity.location,
    input.opportunity.revenue ? `Chiffre d’affaires : ${input.opportunity.revenue}` : null,
    input.opportunity.ebe ? `EBE ou rentabilité : ${input.opportunity.ebe}` : null,
    input.opportunity.employees ? `Équipe : ${input.opportunity.employees}` : null,
    input.opportunity.askingPrice ? `Prix demandé : ${input.opportunity.askingPrice}` : null,
  ].filter((detail): detail is string => Boolean(detail));

  await sendTransactionalEmail({
    html: emailShell(
      "Une nouvelle entreprise correspond à votre recherche.",
      `<p style="margin:0;font-size:15px;line-height:1.7;color:#66736b">Cette opportunité vient d’être publiée et correspond aux critères de votre alerte.</p>${opportunityCardHtml(input.baseUrl, input.opportunity)}${managementLinks(manageUrl, unsubscribeUrl)}`,
    ),
    idempotencyKey: `reprise-alert-match-${input.alertId}-${input.opportunity.id}`,
    subject: `Nouvelle entreprise à reprendre · ${input.opportunity.activity}`,
    text: [
      "Une nouvelle entreprise correspond à votre recherche.",
      "",
      input.opportunity.activity,
      ...details,
      "",
      `Voir la fiche de l’entreprise : ${opportunityUrl}`,
      `Modifier mon alerte : ${manageUrl}`,
      `Supprimer mon alerte : ${unsubscribeUrl}`,
    ].join("\n"),
    to: input.email,
  });
}
