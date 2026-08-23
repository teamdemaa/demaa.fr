import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  isOpportunitySubmissionDraftToken,
  parseOpportunitySubmissionFields,
  type OpportunitySubmissionFields,
} from "@/lib/opportunity-submission";
import { parseOpportunity } from "@/lib/opportunity-contract";
import { OPPORTUNITIES_COLLECTION } from "@/lib/provider-network.server";

const COLLECTION = "opportunity_submission_drafts";
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildOpportunityId(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "opportunite";
  return `${slug}-${randomBytes(3).toString("hex")}`;
}

export async function createPendingOpportunitySubmissionDraft(
  fields: OpportunitySubmissionFields,
) {
  const parsed = parseOpportunitySubmissionFields(fields);
  if (!parsed) throw new Error("Invalid opportunity submission draft.");
  const draftToken = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + DRAFT_TTL_MS).toISOString();
  await getAdminFirestore().collection(COLLECTION).doc(hashDraftToken(draftToken)).create({
    created_at: now,
    expires_at: expiresAt,
    fields: parsed,
    opportunity_id: null,
    submitted_at: null,
    submitted_by_email: null,
    updated_at: now,
  });
  return { draftToken, expiresAt } as const;
}

export async function submitPendingOpportunityDraft(input: {
  draftToken: string;
  email: string;
}) {
  if (!isOpportunitySubmissionDraftToken(input.draftToken)) return null;
  const email = normalizeEmail(input.email);
  if (!email) return null;

  const database = getAdminFirestore();
  const draftReference = database
    .collection(COLLECTION)
    .doc(hashDraftToken(input.draftToken));

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(draftReference);
    const stored = snapshot.data() as Record<string, unknown> | undefined;
    if (!snapshot.exists || !stored) return null;
    const expiresAt = Date.parse(
      typeof stored.expires_at === "string" ? stored.expires_at : "",
    );
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    const submittedEmail = normalizeEmail(
      typeof stored.submitted_by_email === "string"
        ? stored.submitted_by_email
        : "",
    );
    if (submittedEmail && submittedEmail !== email) return null;
    const existingOpportunityId = typeof stored.opportunity_id === "string"
      ? stored.opportunity_id
      : "";
    if (existingOpportunityId) {
      return { alreadySubmitted: true, opportunityId: existingOpportunityId };
    }

    const fields = parseOpportunitySubmissionFields(stored.fields);
    if (!fields) return null;
    const now = new Date().toISOString();
    const opportunityId = buildOpportunityId(fields.title);
    const opportunity = parseOpportunity({
      ...fields,
      createdAt: now,
      expertiseId: null,
      opportunityId,
      publishedAt: null,
      status: "draft",
    });
    const opportunityReference = database
      .collection(OPPORTUNITIES_COLLECTION)
      .doc(opportunityId);

    transaction.create(opportunityReference, {
      ...opportunity,
      submittedByEmail: email,
      submittedVia: "public-opportunity-form",
      updatedAt: now,
    });
    transaction.set(
      draftReference,
      {
        opportunity_id: opportunityId,
        submitted_at: now,
        submitted_by_email: email,
        updated_at: now,
      },
      { merge: true },
    );
    return { alreadySubmitted: false, opportunityId };
  });
}
