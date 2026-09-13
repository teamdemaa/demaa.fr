import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { logOperationalError } from "@/lib/operational-log";
import { parseRepriseAlertCriteria } from "@/lib/reprise-alerts";
import { deleteRepriseAlert, updateRepriseAlert } from "@/lib/reprise-alert-storage.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type ManageBody = {
  accessToken?: unknown;
  criteria?: unknown;
};

async function guard(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;
  return enforceRateLimit(request, { keyPrefix: "reprise-alert-manage", limit: 12, windowMs: 15 * 60 * 1000 });
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const blocked = await guard(request);
    if (blocked) return blocked;
    const [{ id }, { data: body, response }] = await Promise.all([
      context.params,
      readJsonBody<ManageBody>(request, 10 * 1024),
    ]);
    if (response) return response;
    const accessToken = normalizeText(body?.accessToken, 180);
    const criteria = parseRepriseAlertCriteria(body?.criteria);
    if (!id || !accessToken || !criteria) {
      return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    }
    const updated = await updateRepriseAlert({ accessToken, criteria, id });
    return updated
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Ce lien n’est plus valide." }, { status: 404 });
  } catch (error) {
    logOperationalError("reprise_alert.update_failed", error);
    return NextResponse.json({ error: "Impossible de modifier l’alerte." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const blocked = await guard(request);
    if (blocked) return blocked;
    const [{ id }, { data: body, response }] = await Promise.all([
      context.params,
      readJsonBody<ManageBody>(request, 4 * 1024),
    ]);
    if (response) return response;
    const accessToken = normalizeText(body?.accessToken, 180);
    if (!id || !accessToken) {
      return NextResponse.json({ error: "Suppression invalide." }, { status: 400 });
    }
    const deleted = await deleteRepriseAlert(id, accessToken);
    return deleted
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Ce lien n’est plus valide." }, { status: 404 });
  } catch (error) {
    logOperationalError("reprise_alert.delete_failed", error);
    return NextResponse.json({ error: "Impossible de supprimer l’alerte." }, { status: 500 });
  }
}
