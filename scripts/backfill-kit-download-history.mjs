import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import {
  aggregateConfirmedKitHistory,
  KIT_HISTORY_BACKFILL_VERSION,
  KIT_HISTORY_EVIDENCE_RULE,
} from "./lib/kit-history-aggregation.mjs";

const TOTALS_COLLECTION = "kit_historical_download_totals";
const SUMMARIES_COLLECTION = "kit_historical_download_summaries";
const SUMMARY_DOCUMENT_ID = "v1";
const supportedArguments = new Set(["--apply"]);
const unknownArguments = process.argv.slice(2)
  .filter((argument) => !supportedArguments.has(argument));

if (unknownArguments.length) {
  throw new Error(`Argument(s) inconnu(s) : ${unknownArguments.join(", ")}`);
}

const apply = process.argv.includes("--apply");

function initializeFirebase() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Configuration Firebase manquante. Définissez FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY.",
      );
    }

    initializeApp({
      credential: cert({ clientEmail, privateKey, projectId }),
      projectId,
    });
  }

  return getFirestore();
}

function mapDocuments(snapshot) {
  return snapshot.docs.map((document) => document.data());
}

function sortObjectByKey(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right, "fr")),
  );
}

async function verifyStoredBackfill(database, expected) {
  const [summarySnapshot, totalsSnapshot] = await Promise.all([
    database.collection(SUMMARIES_COLLECTION).doc(SUMMARY_DOCUMENT_ID).get(),
    database.collection(TOTALS_COLLECTION).get(),
  ]);
  const storedSummary = summarySnapshot.data();
  const storedTotal = totalsSnapshot.docs.reduce(
    (sum, document) => sum + Number(document.data().download_count ?? 0),
    0,
  );

  if (
    !summarySnapshot.exists
    || storedSummary?.unique_kit_downloads !== expected.uniqueKitDownloads
    || storedSummary?.unique_people !== expected.uniquePeople
    || storedTotal !== expected.uniqueKitDownloads
  ) {
    throw new Error("La vérification du backfill Firestore a échoué.");
  }
}

const catalog = new Map(
  enterpriseAnnuaire.enterprises.map((enterprise) => [
    enterprise.slug,
    enterprise.name,
  ]),
);
const database = initializeFirebase();
const [leadSnapshot, sequenceSnapshot, legacySnapshot] = await Promise.all([
  database
    .collection("lead_requests")
    .where("request_type", "==", "system_kit_request")
    .get(),
  database.collection("system_kit_sequences").get(),
  database.collection("abonnes").get(),
]);
const history = aggregateConfirmedKitHistory({
  leadRequests: mapDocuments(leadSnapshot),
  legacySubscribers: mapDocuments(legacySnapshot),
  sequences: mapDocuments(sequenceSnapshot),
});
const unknownKitSlugs = Object.keys(history.perKit)
  .filter((slug) => !catalog.has(slug));

if (unknownKitSlugs.length) {
  throw new Error(
    `Kits absents du catalogue : ${unknownKitSlugs.join(", ")}`,
  );
}

const report = {
  action: apply ? "apply" : "dry-run",
  backfillVersion: KIT_HISTORY_BACKFILL_VERSION,
  evidenceRule: KIT_HISTORY_EVIDENCE_RULE,
  excludedUnconfirmedLeadPairs: history.excludedUnconfirmedLeadPairs,
  perKit: sortObjectByKey(history.perKit),
  sourcePairCounts: history.sourcePairCounts,
  uniqueKitDownloads: history.uniqueKitDownloads,
  uniquePeople: history.uniquePeople,
};

if (apply) {
  const updatedAt = new Date().toISOString();
  const batch = database.batch();

  for (const [kitSlug, downloadCount] of Object.entries(history.perKit)) {
    batch.set(database.collection(TOTALS_COLLECTION).doc(kitSlug), {
      backfill_version: KIT_HISTORY_BACKFILL_VERSION,
      download_count: downloadCount,
      evidence_rule: KIT_HISTORY_EVIDENCE_RULE,
      kit_name: catalog.get(kitSlug),
      kit_slug: kitSlug,
      updated_at: updatedAt,
    });
  }

  batch.set(database.collection(SUMMARIES_COLLECTION).doc(SUMMARY_DOCUMENT_ID), {
    backfill_version: KIT_HISTORY_BACKFILL_VERSION,
    evidence_rule: KIT_HISTORY_EVIDENCE_RULE,
    excluded_unconfirmed_lead_pairs: history.excludedUnconfirmedLeadPairs,
    source_pair_counts: {
      current_kit_sequences: history.sourcePairCounts.currentKitSequences,
      legacy_kit_subscribers: history.sourcePairCounts.legacyKitSubscribers,
      sent_kit_emails: history.sourcePairCounts.sentKitEmails,
    },
    unique_kit_downloads: history.uniqueKitDownloads,
    unique_people: history.uniquePeople,
    updated_at: updatedAt,
  });

  await batch.commit();
  await verifyStoredBackfill(database, history);
}

console.log(JSON.stringify(report, null, 2));
