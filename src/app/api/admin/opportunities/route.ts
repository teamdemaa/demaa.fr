import { randomBytes } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import { logOperationalError } from "@/lib/operational-log";
import {
  createOpportunity,
  getAllOpportunities,
  getExpertiseById,
  getOpportunityById,
  updateOpportunity,
  updateOpportunityStatus,
} from "@/lib/provider-network.server";
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_WORK_MODES,
  type OpportunityIngestionMode,
  type OpportunityStatus,
  type OpportunityType,
  type OpportunityWorkMode,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

function withPrivateNoStore<T extends NextResponse>(response: T) {
  for (const [name, value] of Object.entries(PRIVATE_NO_STORE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

function privateJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  for (const [name, value] of Object.entries(PRIVATE_NO_STORE_HEADERS)) {
    headers.set(name, value);
  }
  return NextResponse.json(body, { ...init, headers });
}

type CreateBody = {
  cadence?: unknown;
  category?: unknown;
  companyName?: unknown;
  compensation?: unknown;
  domainLabel?: unknown;
  expertiseId?: unknown;
  expiresAt?: unknown;
  expectations?: unknown;
  geography?: unknown;
  ingestionMode?: unknown;
  opportunityType?: unknown;
  sourceKind?: unknown;
  sourceName?: unknown;
  sourcePublishedAt?: unknown;
  sourceRemovedAt?: unknown;
  sourceUrl?: unknown;
  startTiming?: unknown;
  summary?: unknown;
  title?: unknown;
  verifiedAt?: unknown;
  workMode?: unknown;
};

type UpdateBody = CreateBody & {
  opportunityId?: unknown;
  status?: unknown;
};

function normalizeExpectations(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];
  return rawValues
    .map((entry) => normalizeText(entry, 180))
    .filter(Boolean)
    .slice(0, 4);
}

async function normalizeOpportunityFields(
  body: CreateBody | null,
  existing: PublicOpportunity | null = null,
) {
  const title = normalizeText(body?.title, 140);
  const summary = normalizeText(body?.summary, 700, { multiline: true });
  const category = normalizeText(body?.category, 100);
  const expertiseId = normalizeText(body?.expertiseId, 100) || null;
  const domainLabel = normalizeText(body?.domainLabel, 100) || null;
  const opportunityType = (
    normalizeText(body?.opportunityType, 40) || "mission"
  ) as OpportunityType;
  const workModeRaw = normalizeText(body?.workMode, 30);
  const workMode = (workModeRaw || null) as OpportunityWorkMode | null;
  const geography = normalizeText(body?.geography, 100) || null;
  const cadence = normalizeText(body?.cadence, 140) || null;
  const startTiming = normalizeText(body?.startTiming, 140) || null;
  const compensation = normalizeText(body?.compensation, 140) || null;
  const companyName = normalizeText(body?.companyName, 140) || null;
  const expectations = normalizeExpectations(body?.expectations);
  const expiresAtRaw = normalizeText(body?.expiresAt, 40);
  const expiresAt = expiresAtRaw
    ? new Date(`${expiresAtRaw}T23:59:59.999Z`).toISOString()
    : null;
  // Le formulaire ne demande que le nom et le lien de la source : le reste
  // (mode d'ingestion, date de vérification) est déduit, pas ressaisi.
  const sourceName = normalizeText(body?.sourceName, 140) || null;
  const sourceUrl = normalizeText(body?.sourceUrl, 500) || null;
  const isExternallySourced = Boolean(sourceName || sourceUrl);
  const ingestionMode: OpportunityIngestionMode | null = isExternallySourced
    ? "external_discovery"
    : null;
  const verifiedAt = isExternallySourced ? new Date().toISOString() : null;
  const sourceKind = existing?.sourceKind ?? null;
  const sourcePublishedAt = existing?.sourcePublishedAt ?? null;
  const sourceRemovedAt = existing?.sourceRemovedAt ?? null;
  const valid = Boolean(
    title
    && summary.length >= 30
    && category
    && OPPORTUNITY_TYPES.includes(opportunityType)
    && (!workMode || OPPORTUNITY_WORK_MODES.includes(workMode))
    && (!expiresAtRaw || Number.isFinite(Date.parse(expiresAt ?? "")))
    && (!sourceUrl || sourceUrl.startsWith("https://"))
    && (!isExternallySourced || (sourceName && sourceUrl))
    && (!expertiseId || await getExpertiseById(expertiseId)),
  );

  return {
    fields: {
      cadence,
      category,
      companyName,
      compensation,
      domainLabel,
      expertiseId,
      expiresAt,
      expectations,
      geography,
      ingestionMode,
      opportunityType,
      sourceKind,
      sourceName,
      sourcePublishedAt,
      sourceRemovedAt,
      sourceUrl,
      startTiming,
      summary,
      title,
      verifiedAt,
      workMode,
    },
    valid,
  };
}

async function guard(
  request: Request,
  options: {
    keyPrefix: string;
    limit: number;
    requireOrigin: boolean;
  },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withPrivateNoStore(blockedHost);
  if (options.requireOrigin) {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return withPrivateNoStore(blockedOrigin);
  }

  const limited = await enforceRateLimit(request, {
    keyPrefix: options.keyPrefix,
    limit: options.limit,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return withPrivateNoStore(limited);

  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    return privateJson({ error: "Accès refusé." }, { status: 401 });
  }
  return null;
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

export async function GET(request: Request) {
  const blocked = await guard(request, {
    keyPrefix: "opportunity-admin-read",
    limit: 180,
    requireOrigin: false,
  });
  if (blocked) return blocked;
  const opportunities = (await getAllOpportunities())
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return privateJson({ opportunities });
}

export async function POST(request: Request) {
  try {
    const blocked = await guard(request, {
      keyPrefix: "opportunity-admin-create",
      limit: 12,
      requireOrigin: true,
    });
    if (blocked) return blocked;

    const { data: body, response } = await readJsonBody<CreateBody>(request);
    if (response) return withPrivateNoStore(response);
    const { fields, valid } = await normalizeOpportunityFields(body);
    if (!valid) {
      return privateJson({ error: "Les informations de l’opportunité sont incomplètes." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const opportunity: PublicOpportunity = {
      ...fields,
      createdAt: now,
      opportunityId: buildOpportunityId(fields.title),
      publishedAt: now,
      status: "open",
    };
    await createOpportunity(opportunity);
    revalidateTag("provider-network-opportunities", { expire: 0 });
    return privateJson({ ok: true, opportunity }, { status: 201 });
  } catch (error) {
    logOperationalError("opportunities.admin.create_failed", error);
    return privateJson({ error: "Impossible de créer l’opportunité." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const blocked = await guard(request, {
      keyPrefix: "opportunity-admin-update",
      limit: 60,
      requireOrigin: true,
    });
    if (blocked) return blocked;
    const { data: body, response } = await readJsonBody<UpdateBody>(request);
    if (response) return withPrivateNoStore(response);
    const opportunityId = normalizeText(body?.opportunityId, 120);
    const status = normalizeText(body?.status, 20) as OpportunityStatus;
    if (!opportunityId) {
      return privateJson({ error: "Modification invalide." }, { status: 400 });
    }

    const isContentUpdate = body?.title !== undefined;
    let updated = false;
    if (isContentUpdate) {
      const existing = await getOpportunityById(opportunityId);
      const { fields, valid } = await normalizeOpportunityFields(body, existing);
      if (!existing || !valid) {
        return privateJson({ error: "Modification invalide." }, { status: 400 });
      }
      updated = await updateOpportunity({
        ...existing,
        ...fields,
        opportunityId,
      });
    } else {
      if (!["open", "closed"].includes(status)) {
        return privateJson({ error: "Modification invalide." }, { status: 400 });
      }
      if (status === "open") {
        const existing = await getOpportunityById(opportunityId);
        if (!existing) {
          return privateJson({ error: "Annonce introuvable." }, { status: 404 });
        }
        const isExternallySourced = existing.ingestionMode !== null
          && existing.ingestionMode !== "direct_submission";
        if (isExternallySourced && (!existing.sourceName || !existing.sourceUrl || !existing.verifiedAt)) {
          return privateJson({
            error: "Cette annonce externe nécessite une source, une URL et une date de vérification avant publication.",
          }, { status: 400 });
        }
      }
      updated = await updateOpportunityStatus(opportunityId, status);
    }
    if (!updated) {
      return privateJson({ error: "Annonce introuvable." }, { status: 404 });
    }
    revalidateTag("provider-network-opportunities", { expire: 0 });
    return privateJson({ ok: true });
  } catch (error) {
    logOperationalError("opportunities.admin.update_failed", error);
    return privateJson({ error: "Impossible de modifier l’annonce." }, { status: 500 });
  }
}
