import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import {
  appendSpecialistCoachingMessage,
  getCoachingConversationForAdmin,
  getCoachingConversationSummaries,
  reopenFreeCoachingClarification,
} from "@/lib/coaching-conversation.server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  getExternalRecommendationBySlug,
  getExternalRecommendationCatalog,
  isValidExternalRecommendationNeed,
} from "@/lib/external-recommendation-catalog.server";

export const runtime = "nodejs";

type ReplyBody = {
  action?: unknown;
  completeFreeClarification?: unknown;
  conversationId?: unknown;
  message?: unknown;
  recommendationNeedKey?: unknown;
  recommendationResourceSlug?: unknown;
  systemSlug?: unknown;
};

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
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const blocked = await guard(request, {
      keyPrefix: "coaching-admin-read",
      limit: 180,
      requireOrigin: false,
    });
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
        {
          conversation,
          recommendationCatalog: getExternalRecommendationCatalog().map((item) => ({
            category: item.category,
            name: item.name,
            needs: item.needs,
            slug: item.slug,
          })),
        },
        { headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const conversations = await getCoachingConversationSummaries();
    return NextResponse.json(
      {
        conversations,
        recommendationCatalog: getExternalRecommendationCatalog().map((item) => ({
          category: item.category,
          name: item.name,
          needs: item.needs,
          slug: item.slug,
        })),
      },
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
    const blocked = await guard(request, {
      keyPrefix: "coaching-admin-write",
      limit: 60,
      requireOrigin: true,
    });
    if (blocked) return blocked;

    const { data, response } = await readJsonBody<ReplyBody>(request, 8 * 1024);
    if (response) return withPrivateNoStore(response);
    const conversationId = normalizeText(data?.conversationId, 64);
    const action = normalizeText(data?.action, 20) || "reply";
    const message = normalizeText(data?.message, 2_000, { multiline: true });
    const recommendationResourceSlug = normalizeText(data?.recommendationResourceSlug, 120);
    const recommendationNeedKey = normalizeText(data?.recommendationNeedKey, 40);
    const systemSlug = normalizeText(data?.systemSlug, 120);
    if (
      !/^[a-f0-9]{64}$/.test(conversationId)
      || !["reply", "reopen"].includes(action)
      || (action === "reply" && message.length < 2)
    ) {
      return NextResponse.json(
        { error: "Réponse invalide." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const recommendationResource = recommendationResourceSlug
      ? getExternalRecommendationBySlug(recommendationResourceSlug)
      : null;
    if (
      recommendationResourceSlug
      && (
        !recommendationResource
        || !recommendationResource.active
        || !isValidExternalRecommendationNeed(recommendationResource, recommendationNeedKey)
      )
    ) {
      return NextResponse.json(
        { error: "Recommandation invalide." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (action === "reopen") {
      const result = await reopenFreeCoachingClarification(conversationId);
      if (!result) {
        return NextResponse.json(
          { error: "Conversation introuvable." },
          { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
        );
      }
      if (!result.reopened) {
        return NextResponse.json(
          { error: "Seule une clarification terminée peut être réouverte." },
          { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
        );
      }
      logOperationalEvent("coaching.free_clarification_reopened", {
        conversationId,
        previousStatus: result.previousStatus,
      });
      return NextResponse.json(
        { freeStatus: result.freeStatus, ok: true, openedAt: result.openedAt },
        { status: 200, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const result = await appendSpecialistCoachingMessage({
      body: message,
      completeFreeClarification: data?.completeFreeClarification === true,
      conversationId,
      recommendation: recommendationResource
        ? {
            needKey: recommendationNeedKey || null,
            resourceSlug: recommendationResource.slug,
            systemSlug: systemSlug || null,
          }
        : null,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (data?.completeFreeClarification === true) {
      logOperationalEvent("coaching.free_clarification_completed", { conversationId });
    }

    return NextResponse.json(
      {
        freeStatus: result.freeStatus,
        message: result.message,
        ok: true,
        recommendation: result.recommendation,
      },
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
