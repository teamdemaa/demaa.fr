import { NextResponse } from "next/server";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import {
  ADMIN_REQUEST_SOURCES,
  ADMIN_REQUEST_STATUSES,
  type AdminRequestSource,
  type AdminRequestStatus,
} from "@/lib/admin-request-contract";
import {
  getAdminRequest,
  listAdminRequests,
  updateAdminRequestStatus,
} from "@/lib/admin-request-read-model.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

function isSource(value: string | null): value is AdminRequestSource {
  return ADMIN_REQUEST_SOURCES.includes(value as AdminRequestSource);
}

function isStatus(value: string | null): value is AdminRequestStatus {
  return ADMIN_REQUEST_STATUSES.includes(value as AdminRequestStatus);
}

async function authorize(request: Request, keyPrefix: string) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return { identity: null, response: blockedHost };
  const limited = await enforceRateLimit(request, {
    keyPrefix,
    limit: 180,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return { identity: null, response: limited };
  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    return {
      identity: null,
      response: NextResponse.json(
        { error: "Accès refusé." },
        { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
      ),
    };
  }
  return { identity, response: null };
}

export async function GET(request: Request) {
  const authorization = await authorize(request, "admin-requests-read");
  if (authorization.response) return authorization.response;

  const url = new URL(request.url);
  const sourceValue = url.searchParams.get("source");
  const statusValue = url.searchParams.get("status");
  if (sourceValue && !isSource(sourceValue)) {
    return NextResponse.json({ error: "Source inconnue." }, {
      status: 400,
      headers: PRIVATE_NO_STORE_HEADERS,
    });
  }
  if (statusValue && !isStatus(statusValue)) {
    return NextResponse.json({ error: "Statut inconnu." }, {
      status: 400,
      headers: PRIVATE_NO_STORE_HEADERS,
    });
  }
  const id = url.searchParams.get("id")?.trim() || null;
  if (id) {
    if (!sourceValue || !isSource(sourceValue)) {
      return NextResponse.json({ error: "Source requise." }, {
        status: 400,
        headers: PRIVATE_NO_STORE_HEADERS,
      });
    }
    const requestDetail = await getAdminRequest(sourceValue, id);
    return requestDetail
      ? NextResponse.json({ request: requestDetail }, { headers: PRIVATE_NO_STORE_HEADERS })
      : NextResponse.json({ error: "Demande introuvable." }, {
          status: 404,
          headers: PRIVATE_NO_STORE_HEADERS,
        });
  }

  const limitRaw = Number(url.searchParams.get("limit") ?? 30);
  const result = await listAdminRequests({
    cursor: url.searchParams.get("cursor"),
    limit: Number.isInteger(limitRaw) ? limitRaw : 30,
    requestType: url.searchParams.get("type")?.trim() || null,
    source: sourceValue && isSource(sourceValue) ? sourceValue : null,
    status: statusValue && isStatus(statusValue) ? statusValue : null,
  });
  return NextResponse.json(result, { headers: PRIVATE_NO_STORE_HEADERS });
}

export async function PATCH(request: Request) {
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;
  const authorization = await authorize(request, "admin-requests-write");
  if (authorization.response || !authorization.identity) return authorization.response;
  const { data, response } = await readJsonBody<{
    id?: unknown;
    source?: unknown;
    status?: unknown;
  }>(request, 4 * 1024);
  if (response) return response;
  const id = typeof data?.id === "string" ? data.id.trim() : "";
  const source = typeof data?.source === "string" ? data.source : null;
  const status = typeof data?.status === "string" ? data.status : null;
  if (!id || !isSource(source) || !isStatus(status)) {
    return NextResponse.json({ error: "Mise à jour invalide." }, {
      status: 400,
      headers: PRIVATE_NO_STORE_HEADERS,
    });
  }
  const updated = await updateAdminRequestStatus({
    adminUid: authorization.identity.uid,
    id,
    source,
    status,
  });
  return updated
    ? NextResponse.json({ ok: true, status }, { headers: PRIVATE_NO_STORE_HEADERS })
    : NextResponse.json({ error: "Demande introuvable." }, {
        status: 404,
        headers: PRIVATE_NO_STORE_HEADERS,
      });
}
