import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  appendSpecialistCoachingMessage,
  getCoachingConversationForAdmin,
  getCoachingConversationSummaries,
} from "@/lib/coaching-conversation.server";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type ReplyBody = {
  conversationId?: unknown;
  message?: unknown;
};

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

function getAdminSecret() {
  return process.env.COACHING_ADMIN_SECRET?.trim()
    || process.env.OPPORTUNITIES_ADMIN_SECRET?.trim()
    || "";
}
function hasValidSecret(request: Request) {
  const expected = getAdminSecret();
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
  if (!getAdminSecret()) {
    return NextResponse.json(
      { error: "Administration non configurée." },
      { status: 503, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  if (!hasValidSecret(request)) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const blocked = guard(request, false);
    if (blocked) return blocked;

    const conversationId = normalizeText(
      new URL(request.url).searchParams.get("conversationId"),
      64,
    );
    if (conversationId && !/^[a-f0-9]{64}$/.test(conversationId)) {
      return NextResponse.json(
        { error: "Conversation invalide." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (conversationId) {
      const conversation = await getCoachingConversationForAdmin(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation introuvable." },
          { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
        );
      }
      return NextResponse.json(
        { conversation },
        { headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const conversations = await getCoachingConversationSummaries();
    return NextResponse.json(
      { conversations },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  } catch (error) {
    logOperationalError("coaching.admin.read_failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les conversations." },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: Request) {
  try {
    const blocked = guard(request, true);
    if (blocked) return blocked;
    const limited = await enforceRateLimit(request, {
      keyPrefix: "coaching-admin-reply",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { data, response } = await readJsonBody<ReplyBody>(request, 8 * 1024);
    if (response) return response;
    const conversationId = normalizeText(data?.conversationId, 64);
    const message = normalizeText(data?.message, 2_000, { multiline: true });
    if (!/^[a-f0-9]{64}$/.test(conversationId) || message.length < 2) {
      return NextResponse.json(
        { error: "Réponse invalide." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const result = await appendSpecialistCoachingMessage({
      body: message,
      conversationId,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { message: result.message, ok: true },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  } catch (error) {
    logOperationalError("coaching.admin.reply_failed", error);
    return NextResponse.json(
      { error: "Impossible d’envoyer la réponse." },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
