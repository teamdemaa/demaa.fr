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
  type OpportunityStatus,
  type OpportunityType,
  type OpportunityWorkMode,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

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
  opportunityType?: unknown;
  startTiming?: unknown;
  summary?: unknown;
  title?: unknown;
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

async function normalizeOpportunityFields(body: CreateBody | null) {
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
  const valid = Boolean(
    title
    && summary.length >= 30
    && category
    && OPPORTUNITY_TYPES.includes(opportunityType)
    && (!workMode || OPPORTUNITY_WORK_MODES.includes(workMode))
    && (!expiresAtRaw || Number.isFinite(Date.parse(expiresAt ?? "")))
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
      opportunityType,
      startTiming,
      summary,
      title,
      workMode,
    },
    valid,
  };
}

async function guard(request: Request, requireOrigin: boolean) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  if (requireOrigin) {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;
  }
  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
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
  const blocked = await guard(request, false);
  if (blocked) return blocked;
  const limited = await enforceRateLimit(request, {
    keyPrefix: "opportunity-admin-read",
    limit: 180,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;
  const opportunities = (await getAllOpportunities())
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return NextResponse.json({ opportunities });
}

export async function POST(request: Request) {
  try {
    const blocked = await guard(request, true);
    if (blocked) return blocked;
    const limited = await enforceRateLimit(request, {
      keyPrefix: "opportunity-admin-create",
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<CreateBody>(request);
    if (response) return response;
    const { fields, valid } = await normalizeOpportunityFields(body);
    if (!valid) {
      return NextResponse.json({ error: "Les informations de l’opportunité sont incomplètes." }, { status: 400 });
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
    return NextResponse.json({ ok: true, opportunity }, { status: 201 });
  } catch (error) {
    logOperationalError("opportunities.admin.create_failed", error);
    return NextResponse.json({ error: "Impossible de créer l’opportunité." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const blocked = await guard(request, true);
    if (blocked) return blocked;
    const { data: body, response } = await readJsonBody<UpdateBody>(request);
    if (response) return response;
    const opportunityId = normalizeText(body?.opportunityId, 120);
    const status = normalizeText(body?.status, 20) as OpportunityStatus;
    if (!opportunityId) {
      return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    }

    const isContentUpdate = body?.title !== undefined;
    let updated = false;
    if (isContentUpdate) {
      const existing = await getOpportunityById(opportunityId);
      const { fields, valid } = await normalizeOpportunityFields(body);
      if (!existing || !valid) {
        return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
      }
      updated = await updateOpportunity({
        ...existing,
        ...fields,
        opportunityId,
      });
    } else {
      if (!["open", "closed"].includes(status)) {
        return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
      }
      updated = await updateOpportunityStatus(opportunityId, status);
    }
    if (!updated) {
      return NextResponse.json({ error: "Opportunité introuvable." }, { status: 404 });
    }
    revalidateTag("provider-network-opportunities", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logOperationalError("opportunities.admin.update_failed", error);
    return NextResponse.json({ error: "Impossible de modifier l’opportunité." }, { status: 500 });
  }
}
