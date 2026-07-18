import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { saveCockpitStateByEmail } from "@/lib/cockpit-db";
import type { CockpitPeriod, CockpitTask } from "@/lib/cockpit-types";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

const ALLOWED_PERIODS = new Set<CockpitPeriod>([
  "overdue",
  "today",
  "week",
  "later",
  "undated",
]);

type CockpitStateBody = {
  activitySlug?: unknown;
  tasks?: unknown;
};

async function getAuthenticatedEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value ?? null;
  return getEmailFromCustomerSessionToken(token);
}

function normalizeTasks(value: unknown): CockpitTask[] | null {
  if (!Array.isArray(value) || value.length > 200) return null;

  const tasks: CockpitTask[] = [];

  for (const rawTask of value) {
    if (!rawTask || typeof rawTask !== "object") return null;

    const candidate = rawTask as Record<string, unknown>;
    const id = normalizeText(candidate.id, 160);
    const title = normalizeText(candidate.title, 180);
    const pillar = normalizeText(candidate.pillar, 100);
    const scheduleLabel = normalizeText(candidate.scheduleLabel, 80);
    const recurrence = normalizeText(candidate.recurrence, 80);
    const period = normalizeText(candidate.period, 20) as CockpitPeriod;

    if (!id || !title || !pillar || !scheduleLabel || !ALLOWED_PERIODS.has(period)) {
      return null;
    }

    tasks.push({
      id,
      title,
      pillar,
      period,
      scheduleLabel,
      completed: candidate.completed === true,
      ...(recurrence ? { recurrence } : {}),
      ...(candidate.custom === true ? { custom: true } : {}),
    });
  }

  return tasks;
}

export async function PUT(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const email = await getAuthenticatedEmail();

  if (!email) {
    return NextResponse.json(
      { error: "Session expirée. Reconnectez-vous." },
      { status: 401 },
    );
  }

  const limited = enforceRateLimit(
    request,
    {
      keyPrefix: "cockpit-state",
      limit: 120,
      windowMs: 10 * 60 * 1000,
    },
    email,
  );
  if (limited) return limited;

  const { data: body, response } = await readJsonBody<CockpitStateBody>(
    request,
    128 * 1024,
  );
  if (response) return response;

  const activitySlug = normalizeText(body?.activitySlug, 120);
  const tasks = normalizeTasks(body?.tasks);

  if (!activitySlug || !tasks) {
    return NextResponse.json(
      { error: "L’espace envoyé est invalide." },
      { status: 400 },
    );
  }

  try {
    const state = await saveCockpitStateByEmail(email, { activitySlug, tasks });
    return NextResponse.json({ saved: true, updatedAt: state.updatedAt });
  } catch (error) {
    console.error("[cockpit] Unable to save remote state.", error);
    return NextResponse.json(
      { error: "La synchronisation est temporairement indisponible." },
      { status: 503 },
    );
  }
}
