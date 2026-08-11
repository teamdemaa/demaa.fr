import { randomBytes, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { logOperationalError } from "@/lib/operational-log";
import {
  createOpportunity,
  getAllOpportunities,
  getExpertiseById,
  updateOpportunityStatus,
} from "@/lib/provider-network.server";
import {
  OPPORTUNITY_TYPES,
  type OpportunityStatus,
  type OpportunityType,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type CreateBody = {
  category?: unknown;
  expertiseId?: unknown;
  expiresAt?: unknown;
  geography?: unknown;
  opportunityType?: unknown;
  summary?: unknown;
  title?: unknown;
};

type UpdateBody = {
  opportunityId?: unknown;
  status?: unknown;
};

function hasValidSecret(request: Request) {
  const expected = process.env.OPPORTUNITIES_ADMIN_SECRET ?? "";
  const provided = request.headers.get("x-demaa-admin-secret") ?? "";
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expected.length >= 24
    && expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

function guard(request: Request, requireOrigin: boolean) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  if (requireOrigin) {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;
  }
  if (!process.env.OPPORTUNITIES_ADMIN_SECRET) {
    return NextResponse.json({ error: "Administration non configurée." }, { status: 503 });
  }
  if (!hasValidSecret(request)) {
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
  const blocked = guard(request, false);
  if (blocked) return blocked;
  const opportunities = (await getAllOpportunities())
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return NextResponse.json({ opportunities });
}

export async function POST(request: Request) {
  try {
    const blocked = guard(request, true);
    if (blocked) return blocked;
    const limited = await enforceRateLimit(request, {
      keyPrefix: "opportunity-admin-create",
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<CreateBody>(request);
    if (response) return response;
    const title = normalizeText(body?.title, 140);
    const summary = normalizeText(body?.summary, 700, { multiline: true });
    const category = normalizeText(body?.category, 100);
    const expertiseId = normalizeText(body?.expertiseId, 100) || null;
    const opportunityType = (
      normalizeText(body?.opportunityType, 40) || "mission"
    ) as OpportunityType;
    const geography = normalizeText(body?.geography, 100) || null;
    const expiresAtRaw = normalizeText(body?.expiresAt, 40);
    const expiresAt = expiresAtRaw
      ? new Date(`${expiresAtRaw}T23:59:59.999Z`).toISOString()
      : null;
    if (
      !title
      || summary.length < 30
      || !category
      || !OPPORTUNITY_TYPES.includes(opportunityType)
      || (expiresAtRaw && !Number.isFinite(Date.parse(expiresAt ?? "")))
      || (expertiseId && !(await getExpertiseById(expertiseId)))
    ) {
      return NextResponse.json({ error: "Les informations de l’opportunité sont incomplètes." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const opportunity: PublicOpportunity = {
      category,
      createdAt: now,
      expertiseId,
      expiresAt,
      geography,
      opportunityId: buildOpportunityId(title),
      opportunityType,
      publishedAt: now,
      status: "open",
      summary,
      title,
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
    const blocked = guard(request, true);
    if (blocked) return blocked;
    const { data: body, response } = await readJsonBody<UpdateBody>(request);
    if (response) return response;
    const opportunityId = normalizeText(body?.opportunityId, 120);
    const status = normalizeText(body?.status, 20) as OpportunityStatus;
    if (!opportunityId || !["open", "closed"].includes(status)) {
      return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    }
    const updated = await updateOpportunityStatus(opportunityId, status);
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
