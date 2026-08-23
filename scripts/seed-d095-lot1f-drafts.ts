import { randomBytes } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseOpportunity } from "@/lib/opportunity-contract";
import { OPPORTUNITIES_COLLECTION } from "@/lib/provider-network.server";

const PRODUCTION_PROJECT_ID = "demaa-dde32";
const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
const confirmedProjectId = (
  process.argv.find((entry) => entry.startsWith("--confirm-project="))
    ?.slice("--confirm-project=".length) ?? ""
);
const applyGate = process.argv.includes("--apply-d095-lot1f-drafts");

if (!applyGate || projectId !== PRODUCTION_PROJECT_ID || confirmedProjectId !== projectId) {
  throw new Error(
    `Confirmation explicite requise. ${JSON.stringify({ applyGate, confirmedProjectId, projectId })}`,
  );
}

function buildOpportunityId(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "opportunite";
  return `${slug}-${randomBytes(3).toString("hex")}`;
}

const now = new Date().toISOString();

const candidates = [
  {
    category: "Beauté et coiffure",
    domainLabel: "Fonds de commerce",
    geography: "Le Teich (33470)",
    opportunityType: "reprise-transmission",
    summary:
      "Fonds de commerce d’un salon de beauté à reprendre au Teich, en Gironde, dans le cadre d’une liquidation judiciaire.",
    title: "Salon de beauté à reprendre au Teich",
    expiresAt: "2026-09-16T23:59:59.999Z",
    ingestionMode: "external_discovery",
    sourceKind: "administrateur judiciaire",
    sourceName: "Actify — SELARL EKIP’",
    sourcePublishedAt: "2026-08-21T00:00:00.000Z",
    sourceUrl: "https://actify.fr/entreprises-liquidation-judiciaire/50784_fonds-de-commerce/",
    verifiedAt: "2026-08-23T00:00:00.000Z",
  },
  {
    category: "Restauration et Tourisme",
    domainLabel: "Fonds de commerce",
    geography: "Bordeaux (33000)",
    opportunityType: "reprise-transmission",
    summary:
      "Fonds de commerce d’un bar-restaurant au centre de Bordeaux à reprendre dans le cadre d’une liquidation judiciaire.",
    title: "Bar-restaurant à reprendre à Bordeaux",
    expiresAt: "2026-09-16T23:59:59.999Z",
    ingestionMode: "external_discovery",
    sourceKind: "administrateur judiciaire",
    sourceName: "Actify — SELARL EKIP’",
    sourcePublishedAt: "2026-08-21T00:00:00.000Z",
    sourceUrl: "https://actify.fr/entreprises-liquidation-judiciaire/50883_fonds-de-commerce/",
    verifiedAt: "2026-08-23T00:00:00.000Z",
  },
  {
    category: "Aide à la personne",
    domainLabel: "Association loi 1901",
    geography: "Néac (33500)",
    opportunityType: "reprise-transmission",
    summary:
      "Reprise d’une association d’aide à domicile (SAAD) en Gironde, 34 salariés, dans le cadre d’une procédure collective. Offre globale envisageable avec deux structures voisines.",
    title: "Association d’aide à domicile à reprendre en Gironde",
    expiresAt: "2026-10-01T23:59:59.999Z",
    ingestionMode: "external_discovery",
    sourceKind: "administrateur judiciaire",
    sourceName: "Actify — ASCAGNE AJ SO",
    sourcePublishedAt: "2026-08-21T00:00:00.000Z",
    sourceUrl:
      "https://actify.fr/entreprises-liquidation-judiciaire/recherche-de-candidats-repreneurs-association-aiadl-loi-1901/",
    verifiedAt: "2026-08-23T00:00:00.000Z",
  },
] as const;

const firestore = getAdminFirestore();
const created: string[] = [];

for (const candidate of candidates) {
  const opportunityId = buildOpportunityId(candidate.title);
  const opportunity = parseOpportunity({
    ...candidate,
    createdAt: now,
    expertiseId: null,
    opportunityId,
    publishedAt: null,
    status: "draft",
  });
  await firestore
    .collection(OPPORTUNITIES_COLLECTION)
    .doc(opportunityId)
    .create(opportunity);
  created.push(opportunityId);
}

console.log(JSON.stringify({ created, projectId }, null, 2));
