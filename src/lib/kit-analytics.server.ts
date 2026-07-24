import "server-only";

import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  getDateKeysForPeriod,
  getParisDateKey,
  getPeriodStartDateKey,
  resolveKitOpenAttribution,
  type KitAnalyticsPeriod,
} from "@/lib/kit-analytics-utils";

const KIT_OPEN_TOTALS_COLLECTION = "kit_open_totals";
const KIT_OPEN_DAILY_COLLECTION = "kit_open_daily";
const KIT_OPEN_SOURCES_COLLECTION = "kit_open_sources";
const KIT_HISTORICAL_DOWNLOAD_TOTALS_COLLECTION =
  "kit_historical_download_totals";
const KIT_HISTORICAL_DOWNLOAD_SUMMARIES_COLLECTION =
  "kit_historical_download_summaries";

type StoredKitOpenTotal = {
  kit_name?: string;
  kit_slug?: string;
  last_opened_at?: string;
  total_open_count?: number;
};

type StoredKitOpenDaily = {
  date_key?: string;
  kit_name?: string;
  kit_slug?: string;
  total_open_count?: number;
};

type StoredKitOpenSource = {
  campaign?: string | null;
  date_key?: string;
  medium?: string | null;
  source?: string;
  total_open_count?: number;
};

type StoredKitHistoricalDownloadTotal = {
  download_count?: number;
  kit_name?: string;
  kit_slug?: string;
};

type StoredKitHistoricalDownloadSummary = {
  unique_kit_downloads?: number;
  unique_people?: number;
};

export type KitAnalyticsRow = {
  historicalDownloads: number;
  kitName: string;
  kitSlug: string;
  last7Days: number;
  lastOpenedAt: string | null;
  periodOpens: number;
  todayOpens: number;
  totalOpens: number;
};

export type KitAnalyticsOverview = {
  dailySeries: Array<{ date: string; opens: number }>;
  generatedAt: string;
  historicalDownloads: number;
  historicalPeople: number;
  period: KitAnalyticsPeriod;
  periodOpens: number;
  rows: KitAnalyticsRow[];
  topSources: Array<{ opens: number; source: string }>;
  totalOpens: number;
};

function readCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildSourceDocumentId(input: {
  campaign: string | null;
  dateKey: string;
  kitSlug: string;
  medium: string | null;
  source: string;
}) {
  const sourceHash = createHash("sha256")
    .update(`${input.source}|${input.medium ?? ""}|${input.campaign ?? ""}`)
    .digest("hex")
    .slice(0, 16);

  return `${input.dateKey}--${input.kitSlug}--${sourceHash}`;
}

export async function recordKitOpen(input: {
  kitName: string;
  kitSlug: string;
  request: Request;
}) {
  const database = getAdminFirestore();
  const now = new Date();
  const openedAt = now.toISOString();
  const dateKey = getParisDateKey(now);
  const requestUrl = new URL(input.request.url);
  const attribution = resolveKitOpenAttribution(
    input.request.headers.get("referer"),
    requestUrl.hostname,
  );
  const totalRef = database.collection(KIT_OPEN_TOTALS_COLLECTION).doc(input.kitSlug);
  const dailyRef = database
    .collection(KIT_OPEN_DAILY_COLLECTION)
    .doc(`${dateKey}--${input.kitSlug}`);
  const sourceRef = database
    .collection(KIT_OPEN_SOURCES_COLLECTION)
    .doc(buildSourceDocumentId({
      campaign: attribution.campaign,
      dateKey,
      kitSlug: input.kitSlug,
      medium: attribution.medium,
      source: attribution.source,
    }));
  const batch = database.batch();

  batch.set(totalRef, {
    kit_name: input.kitName,
    kit_slug: input.kitSlug,
    last_opened_at: openedAt,
    total_open_count: FieldValue.increment(1),
    updated_at: openedAt,
  }, { merge: true });
  batch.set(dailyRef, {
    date_key: dateKey,
    kit_name: input.kitName,
    kit_slug: input.kitSlug,
    total_open_count: FieldValue.increment(1),
    updated_at: openedAt,
  }, { merge: true });
  batch.set(sourceRef, {
    campaign: attribution.campaign,
    date_key: dateKey,
    entry_path: attribution.entryPath,
    kit_name: input.kitName,
    kit_slug: input.kitSlug,
    medium: attribution.medium,
    source: attribution.source,
    total_open_count: FieldValue.increment(1),
    updated_at: openedAt,
  }, { merge: true });

  await batch.commit();
}

export async function getKitAnalyticsOverview(
  period: KitAnalyticsPeriod,
  now = new Date(),
): Promise<KitAnalyticsOverview> {
  const database = getAdminFirestore();
  const startDateKey = getPeriodStartDateKey(period, now);
  const last7StartDateKey = getPeriodStartDateKey(7, now);
  const todayDateKey = getParisDateKey(now);
  const [
    totalsSnapshot,
    dailySnapshot,
    sourcesSnapshot,
    historicalTotalsSnapshot,
    historicalSummarySnapshot,
  ] = await Promise.all([
    database.collection(KIT_OPEN_TOTALS_COLLECTION).get(),
    database
      .collection(KIT_OPEN_DAILY_COLLECTION)
      .where("date_key", ">=", startDateKey)
      .get(),
    database
      .collection(KIT_OPEN_SOURCES_COLLECTION)
      .where("date_key", ">=", startDateKey)
      .get(),
    database.collection(KIT_HISTORICAL_DOWNLOAD_TOTALS_COLLECTION).get(),
    database
      .collection(KIT_HISTORICAL_DOWNLOAD_SUMMARIES_COLLECTION)
      .doc("v1")
      .get(),
  ]);
  const rowsBySlug = new Map<string, KitAnalyticsRow>();
  const dailyTotals = new Map<string, number>();
  const sourceTotals = new Map<string, number>();

  for (const document of totalsSnapshot.docs) {
    const data = document.data() as StoredKitOpenTotal;
    const kitSlug = data.kit_slug || document.id;

    rowsBySlug.set(kitSlug, {
      historicalDownloads: 0,
      kitName: data.kit_name || kitSlug,
      kitSlug,
      last7Days: 0,
      lastOpenedAt: data.last_opened_at || null,
      periodOpens: 0,
      todayOpens: 0,
      totalOpens: readCount(data.total_open_count),
    });
  }

  for (const document of dailySnapshot.docs) {
    const data = document.data() as StoredKitOpenDaily;
    const kitSlug = data.kit_slug;
    const dateKey = data.date_key;

    if (!kitSlug || !dateKey) continue;

    const opens = readCount(data.total_open_count);
    const row = rowsBySlug.get(kitSlug) ?? {
      historicalDownloads: 0,
      kitName: data.kit_name || kitSlug,
      kitSlug,
      last7Days: 0,
      lastOpenedAt: null,
      periodOpens: 0,
      todayOpens: 0,
      totalOpens: opens,
    };

    row.periodOpens += opens;
    if (dateKey >= last7StartDateKey) row.last7Days += opens;
    if (dateKey === todayDateKey) row.todayOpens += opens;
    rowsBySlug.set(kitSlug, row);
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + opens);
  }

  for (const document of historicalTotalsSnapshot.docs) {
    const data = document.data() as StoredKitHistoricalDownloadTotal;
    const kitSlug = data.kit_slug || document.id;
    const existingRow = rowsBySlug.get(kitSlug);

    rowsBySlug.set(kitSlug, {
      historicalDownloads: readCount(data.download_count),
      kitName: data.kit_name || existingRow?.kitName || kitSlug,
      kitSlug,
      last7Days: existingRow?.last7Days ?? 0,
      lastOpenedAt: existingRow?.lastOpenedAt ?? null,
      periodOpens: existingRow?.periodOpens ?? 0,
      todayOpens: existingRow?.todayOpens ?? 0,
      totalOpens: existingRow?.totalOpens ?? 0,
    });
  }

  for (const document of sourcesSnapshot.docs) {
    const data = document.data() as StoredKitOpenSource;
    const source = data.source || "Accès direct / non attribué";
    sourceTotals.set(
      source,
      (sourceTotals.get(source) ?? 0) + readCount(data.total_open_count),
    );
  }

  const rows = [...rowsBySlug.values()].sort(
    (left, right) =>
      right.periodOpens - left.periodOpens
      || right.totalOpens - left.totalOpens
      || right.historicalDownloads - left.historicalDownloads
      || left.kitName.localeCompare(right.kitName, "fr"),
  );
  const historicalSummary =
    historicalSummarySnapshot.data() as StoredKitHistoricalDownloadSummary | undefined;
  const historicalDownloadsFromRows = rows.reduce(
    (sum, row) => sum + row.historicalDownloads,
    0,
  );

  return {
    dailySeries: getDateKeysForPeriod(period, now).map((date) => ({
      date,
      opens: dailyTotals.get(date) ?? 0,
    })),
    generatedAt: now.toISOString(),
    historicalDownloads:
      readCount(historicalSummary?.unique_kit_downloads)
      || historicalDownloadsFromRows,
    historicalPeople: readCount(historicalSummary?.unique_people),
    period,
    periodOpens: rows.reduce((sum, row) => sum + row.periodOpens, 0),
    rows,
    topSources: [...sourceTotals.entries()]
      .map(([source, opens]) => ({ opens, source }))
      .sort((left, right) => right.opens - left.opens)
      .slice(0, 8),
    totalOpens: rows.reduce((sum, row) => sum + row.totalOpens, 0),
  };
}
