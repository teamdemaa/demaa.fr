import { createHash } from "node:crypto";

export const KIT_HISTORY_BACKFILL_VERSION = "kit-history-v1";
export const KIT_HISTORY_EVIDENCE_RULE =
  "ancien abonné kit OU séquence kit actuelle OU email du kit envoyé";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value) {
  return cleanString(value).toLowerCase();
}

function inferKitSlug(row) {
  const systemSlug = cleanString(row?.system_slug);
  if (systemSlug) return systemSlug;

  const source = cleanString(row?.source);
  if (source.startsWith("systeme_kit_")) {
    return source.slice("systeme_kit_".length).trim();
  }

  return "";
}

function createPair(emailValue, slugValue, evidence) {
  const email = normalizeEmail(emailValue);
  const slug = cleanString(slugValue);

  if (!email || !slug) return null;

  const personKey = hash(email);

  return {
    evidence,
    pairKey: hash(`${personKey}|${slug}`),
    personKey,
    slug,
  };
}

function toPairMap(pairs) {
  return new Map(
    pairs
      .filter(Boolean)
      .map((pair) => [pair.pairKey, pair]),
  );
}

function getLeadSlug(lead) {
  return (
    cleanString(lead?.context?.system_slug)
    || cleanString(lead?.context?.sector_slug)
  );
}

/**
 * @param {{
 *   leadRequests?: Array<Record<string, any>>,
 *   legacySubscribers?: Array<Record<string, any>>,
 *   sequences?: Array<Record<string, any>>,
 * }} input
 */
export function aggregateConfirmedKitHistory({
  leadRequests = [],
  legacySubscribers = [],
  sequences = [],
} = {}) {
  const allLeadPairs = toPairMap(
    leadRequests.map((lead) =>
      createPair(lead?.contact?.email, getLeadSlug(lead), "lead_request"),
    ),
  );
  const sentLeadPairs = toPairMap(
    leadRequests
      .filter((lead) => lead?.notification_status?.kit_email?.status === "sent")
      .map((lead) =>
        createPair(lead?.contact?.email, getLeadSlug(lead), "sent_kit_email"),
      ),
  );
  const sequencePairs = toPairMap(
    sequences
      .filter((row) =>
        row?.sequence_type === "kit_systeme"
        || cleanString(row?.source).startsWith("systeme_kit_"),
      )
      .map((row) =>
        createPair(row?.email, inferKitSlug(row), "current_kit_sequence"),
      ),
  );
  const legacyPairs = toPairMap(
    legacySubscribers
      .filter((row) =>
        cleanString(row?.source).startsWith("systeme_kit_")
        || row?.sequence_type === "kit_systeme",
      )
      .map((row) =>
        createPair(row?.email, inferKitSlug(row), "legacy_kit_subscriber"),
      ),
  );
  const confirmedPairs = new Map([
    ...legacyPairs,
    ...sequencePairs,
    ...sentLeadPairs,
  ]);
  const people = new Set(
    [...confirmedPairs.values()].map((pair) => pair.personKey),
  );
  const perKit = Object.fromEntries(
    [...confirmedPairs.values()]
      .reduce((counts, pair) => {
        counts.set(pair.slug, (counts.get(pair.slug) ?? 0) + 1);
        return counts;
      }, new Map())
      .entries(),
  );

  return {
    excludedUnconfirmedLeadPairs: [...allLeadPairs.keys()]
      .filter((pairKey) => !confirmedPairs.has(pairKey))
      .length,
    perKit,
    sourcePairCounts: {
      currentKitSequences: sequencePairs.size,
      legacyKitSubscribers: legacyPairs.size,
      sentKitEmails: sentLeadPairs.size,
    },
    uniqueKitDownloads: confirmedPairs.size,
    uniquePeople: people.size,
  };
}
