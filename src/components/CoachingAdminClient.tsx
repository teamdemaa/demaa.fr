"use client";

import { LoaderCircle, Plus, RotateCcw, Send, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  isCoachingReviewOverdue,
  type CoachingConversationSummary,
  type CoachingFreeStatus,
  type CoachingMessage,
  type CoachingRecommendation,
  type CoachingRecommendationCatalogOption,
} from "@/lib/coaching-conversation";

type Conversation = Readonly<{
  customerEmail: string;
  freeStatus: CoachingFreeStatus;
  id: string;
  messages: readonly CoachingMessage[];
  recommendations: readonly CoachingRecommendation[];
  monthlyBenefit: Readonly<{
    active: boolean;
    source: "coach_business" | "expert_accountant" | null;
    validUntil: string | null;
  }>;
  openedAt: string | null;
}>;

const coachingAdminDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function CoachingAdminClient() {
  const [secret, setSecret] = useState("");
  const [conversations, setConversations] = useState<CoachingConversationSummary[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [completeAfterReply, setCompleteAfterReply] = useState(false);
  const [recommendationCatalog, setRecommendationCatalog] = useState<CoachingRecommendationCatalogOption[]>([]);
  const [recommendationSlug, setRecommendationSlug] = useState("");
  const [recommendationNeedKey, setRecommendationNeedKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-demaa-admin-secret": secret,
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null) as {
      conversation?: Conversation;
      conversations?: CoachingConversationSummary[];
      error?: string;
      message?: CoachingMessage;
      freeStatus?: CoachingFreeStatus;
      recommendation?: CoachingRecommendation;
      recommendationCatalog?: CoachingRecommendationCatalogOption[];
      monthlyBenefit?: Conversation["monthlyBenefit"];
      openedAt?: string;
    } | null;
    if (!response.ok) throw new Error(payload?.error ?? "Une erreur est survenue.");
    return payload;
  }

  async function loadConversations() {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching");
      setConversations(payload?.conversations ?? []);
      setRecommendationCatalog(payload?.recommendationCatalog ?? []);
      setIsUnlocked(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectConversation(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request(`/api/admin/coaching?conversationId=${encodeURIComponent(id)}`);
      setSelected(payload?.conversation ?? null);
      setRecommendationCatalog((current) => payload?.recommendationCatalog ?? current);
      setCompleteAfterReply(false);
      setRecommendationSlug("");
      setRecommendationNeedKey("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || reply.trim().length < 2) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching", {
        method: "POST",
        body: JSON.stringify({
          completeFreeClarification: completeAfterReply,
          conversationId: selected.id,
          message: reply,
          recommendationNeedKey: recommendationNeedKey || undefined,
          recommendationResourceSlug: recommendationSlug || undefined,
        }),
      });
      if (payload?.message) {
        setSelected((current) => current
          ? {
              ...current,
              freeStatus: payload.freeStatus ?? current.freeStatus,
              messages: [...current.messages, payload.message as CoachingMessage],
              recommendations: payload.recommendation
                ? [...current.recommendations, payload.recommendation]
                : current.recommendations,
            }
          : current);
      }
      setReply("");
      setCompleteAfterReply(false);
      setRecommendationSlug("");
      setRecommendationNeedKey("");
      await loadConversations();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Envoi impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reopenClarification() {
    if (!selected) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching", {
        method: "POST",
        body: JSON.stringify({ action: "reopen", conversationId: selected.id }),
      });
      setSelected((current) => current
        ? {
            ...current,
            freeStatus: payload?.freeStatus ?? "open",
            openedAt: payload?.openedAt ?? new Date().toISOString(),
          }
        : current);
      await loadConversations();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Réouverture impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleExpertAccountantBenefit() {
    if (!selected || selected.monthlyBenefit.source === "coach_business") return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching", {
        method: "POST",
        body: JSON.stringify({
          action: "benefit",
          benefitActive: !selected.monthlyBenefit.active,
          conversationId: selected.id,
        }),
      });
      if (payload?.monthlyBenefit) {
        setSelected((current) => current
          ? { ...current, monthlyBenefit: payload.monthlyBenefit as Conversation["monthlyBenefit"] }
          : current);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Mise à jour impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isUnlocked) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-[1.2rem] border border-dema-line bg-white p-6">
        <label className="block space-y-2 text-sm text-brand-blue">
          <span>Clé d’administration</span>
          <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className="w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button type="button" onClick={loadConversations} disabled={isLoading || !secret} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Ouvrir
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid min-h-[36rem] overflow-hidden rounded-[1.3rem] border border-dema-line bg-white lg:grid-cols-[20rem_1fr]">
      <aside className="border-b border-dema-line lg:border-b-0 lg:border-r">
        <div className="border-b border-dema-line px-5 py-4">
          <h2 className="font-medium text-brand-blue">Conversations</h2>
        </div>
        <div className="max-h-[34rem] overflow-y-auto p-2">
          {conversations.length === 0 ? <p className="px-3 py-6 text-sm text-dema-muted">Aucune conversation.</p> : null}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => selectConversation(conversation.id)}
              className={`w-full rounded-xl px-3 py-3 text-left transition hover:bg-dema-sage/35 ${selected?.id === conversation.id ? "bg-dema-sage/55" : ""}`}
            >
              <span className="block truncate text-sm font-medium text-brand-blue">{conversation.customerEmail}</span>
              <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-dema-muted">{conversation.localeCode === "en" ? "English" : "Français"} · {conversation.marketCode ?? "fr-fr"}</span>
              <span className="mt-1 block truncate text-xs text-dema-muted">{conversation.lastMessage}</span>
              <span className="mt-2 inline-flex rounded-md bg-dema-sage/70 px-2 py-1 text-[0.68rem] font-medium text-dema-forest">
                {conversation.freeStatus === "completed" ? "Clôturée" : "Ouverte"}
              </span>
              {conversation.freeStatus === "open" && isCoachingReviewOverdue(conversation.openedAt) ? (
                <span className="ml-1 mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-[0.68rem] font-medium text-amber-800">
                  À revoir · plus de 30 jours
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[32rem] flex-col">
        {selected ? (
          <>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-dema-line px-5 py-4">
              <div>
                <h2 className="font-medium text-brand-blue">{selected.customerEmail}</h2>
                <p className="mt-1 text-xs text-dema-muted">{selected.freeStatus === "completed" ? "Conversation clôturée" : "Conversation ouverte"}</p>
                {selected.freeStatus === "open" && isCoachingReviewOverdue(selected.openedAt) ? (
                  <p className="mt-1 text-xs font-medium text-amber-800">Ouverte depuis plus de 30 jours · clôture manuelle à vérifier</p>
                ) : null}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => void toggleExpertAccountantBenefit()} disabled={isLoading || selected.monthlyBenefit.source === "coach_business"} className="inline-flex min-h-9 items-center rounded-full border border-dema-line px-3 text-xs font-medium text-dema-forest hover:bg-dema-sage/40 disabled:opacity-50">
                  {selected.monthlyBenefit.source === "coach_business"
                    ? "Avantage actif · Coach business"
                    : selected.monthlyBenefit.active
                      ? "Désactiver l’avantage Expert-comptable"
                      : "Activer l’avantage Expert-comptable"}
                </button>
                {selected.freeStatus === "completed" ? (
                  <button type="button" onClick={() => void reopenClarification()} disabled={isLoading} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-dema-line px-3 text-xs font-medium text-dema-forest hover:bg-dema-sage/40 disabled:opacity-50">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Réouvrir
                  </button>
                ) : null}
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-dema-sage/15 p-5">
              {selected.messages.map((message) => {
                const attached = selected.recommendations.filter((item) => item.messageId === message.id);
                return (
                  <div key={message.id} className={message.author === "specialist" ? "ml-auto max-w-[82%]" : "mr-auto max-w-[82%]"}>
                    <article className={`rounded-[1rem] px-4 py-3 text-sm leading-relaxed ${message.author === "specialist" ? "bg-dema-forest text-white" : "border border-dema-line bg-white text-brand-blue"}`}>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p className={`mt-1 text-[0.68rem] ${message.author === "specialist" ? "text-white/70" : "text-dema-muted"}`}>
                        {message.author === "specialist" ? "Équipe Demaa" : "Client"} · {coachingAdminDateFormatter.format(new Date(message.createdAt))}
                      </p>
                    </article>
                    {attached.map((recommendation) => (
                      <div key={recommendation.id} className="mt-2 rounded-xl border border-dema-forest/15 bg-white p-3 text-xs text-brand-blue">
                        <span className="font-semibold">{recommendation.name}</span>
                        {recommendation.needLabel ? <span className="text-dema-muted"> · {recommendation.needLabel}</span> : null}
                        <span className="mt-1 block text-dema-forest">{recommendation.status === "requested" ? "Mise en relation demandée" : "Recommandation envoyée"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <form onSubmit={submitReply} className="border-t border-dema-line p-4">
              <div className="flex items-end gap-2 rounded-xl border border-dema-line p-2 focus-within:border-dema-forest">
                <textarea aria-label="Réponse" value={reply} onChange={(event) => setReply(event.target.value)} rows={2} placeholder="Répondre…" className="min-h-11 flex-1 resize-none px-2 py-2 text-sm outline-none" />
                <button disabled={isLoading || reply.trim().length < 2} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-dema-forest px-4 text-xs font-medium text-white disabled:opacity-40" aria-label={completeAfterReply ? "Envoyer et clôturer" : "Envoyer la réponse"}>
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  <span>{completeAfterReply ? "Envoyer et clôturer" : "Envoyer"}</span>
                </button>
              </div>
              {recommendationSlug ? (
                <div className="mt-3 rounded-xl border border-dema-forest/15 bg-dema-sage/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-brand-blue">Ajouter une recommandation</p>
                    <button type="button" onClick={() => { setRecommendationSlug(""); setRecommendationNeedKey(""); }} aria-label="Retirer la recommandation" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-dema-muted"><X className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                  <select value={recommendationSlug} onChange={(event) => { setRecommendationSlug(event.target.value); setRecommendationNeedKey(""); }} className="mt-2 min-h-10 w-full rounded-lg border border-dema-line bg-white px-3 text-sm text-brand-blue">
                    {recommendationCatalog.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  {(recommendationCatalog.find((item) => item.slug === recommendationSlug)?.needs.length ?? 0) > 0 ? (
                    <select required value={recommendationNeedKey} onChange={(event) => setRecommendationNeedKey(event.target.value)} className="mt-2 min-h-10 w-full rounded-lg border border-dema-line bg-white px-3 text-sm text-brand-blue">
                      <option value="">Choisir le besoin</option>
                      {recommendationCatalog.find((item) => item.slug === recommendationSlug)?.needs.map((need) => <option key={need.key} value={need.key}>{need.label}</option>)}
                    </select>
                  ) : null}
                </div>
              ) : (
                <button type="button" onClick={() => setRecommendationSlug(recommendationCatalog[0]?.slug ?? "")} disabled={recommendationCatalog.length === 0} className="mt-3 inline-flex min-h-9 items-center gap-2 text-xs font-medium text-dema-forest disabled:opacity-40">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une recommandation
                </button>
              )}
              {selected.freeStatus !== "completed" ? (
                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-dema-sage/30 px-3 py-3 text-sm text-brand-blue">
                  <input type="checkbox" checked={completeAfterReply} onChange={(event) => setCompleteAfterReply(event.target.checked)} className="mt-0.5 h-4 w-4 accent-dema-forest" />
                  <span>
                    <span className="block font-medium">Clôturer après cet envoi</span>
                    <span className="mt-0.5 block text-xs text-dema-muted">Le client pourra relire la conversation, mais ne pourra plus répondre.</span>
                  </span>
                </label>
              ) : null}
              {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
            </form>
          </>
        ) : (
          <p className="m-auto text-sm text-dema-muted">Sélectionnez une conversation.</p>
        )}
      </section>
    </div>
  );
}
