"use client";

import { ChevronDown, ChevronRight, LoaderCircle, Mic } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import CoachingRecommendationCard from "@/components/CoachingRecommendationCard";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type {
  CoachingAccess,
  CoachingMessage,
  CoachingRecommendation,
} from "@/lib/coaching-conversation";

export type CoachingTab = "messages";
export type SpecialistAccessIntent = {
  draftToken?: string;
  tab: CoachingTab;
};

function createCoachingMessageDateFormatter(localeCode: "fr" | "en") {
  return new Intl.DateTimeFormat(localeCode === "en" ? "en-GB" : "fr-FR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  });
}

async function submitCoachingRequest(payload: Record<string, unknown>) {
  const response = await fetch("/api/coaching-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null) as {
    access?: CoachingAccess;
    code?: string;
    draftMessage?: string;
    error?: string;
    message?: CoachingMessage;
  } | null;
  if (response.status !== 202) {
    throw new CoachingRequestError(
      body?.error || "Le message n’a pas pu être envoyé.",
      body?.draftMessage,
      body?.code,
    );
  }
  return body;
}

class CoachingRequestError extends Error {
  readonly code?: string;
  readonly draftMessage?: string;

  constructor(message: string, draftMessage?: string, code?: string) {
    super(message);
    this.name = "CoachingRequestError";
    this.draftMessage = draftMessage;
    this.code = code;
  }
}

async function createCoachingDraft(message: string) {
  const response = await fetch("/api/coaching-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const body = await response.json().catch(() => null) as {
    draftToken?: string;
    error?: string;
  } | null;
  if (response.status !== 201 || !body?.draftToken) {
    throw new Error(body?.error || "Le brouillon n’a pas pu être préparé.");
  }
  return body.draftToken;
}

function clearCoachingDraftFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("draftToken")) return;
  url.searchParams.delete("draftToken");
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function CoachBusinessPromo({ localeCode }: { localeCode: "fr" | "en" }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <section className="mx-auto mt-5 max-w-[51.25rem] overflow-hidden rounded-[1.25rem] border border-dema-forest/15 bg-dema-sage/30">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
      >
        <span className="text-base font-medium text-brand-blue sm:text-lg">
          {localeCode === "en" ? "Need ongoing support?" : <>Besoin d’un accompagnement régulier&nbsp;?</>}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-dema-forest transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        aria-hidden={!open}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-dema-forest/10 px-5 pb-5 pt-4 sm:flex sm:items-end sm:justify-between sm:gap-6 sm:px-6 sm:pb-6">
            <div>
              <p className="max-w-xl text-sm leading-relaxed text-dema-muted">
                {localeCode === "en" ? "Monthly support to develop your business, step back from day-to-day pressure and move forward with a regular thinking partner." : "Un accompagnement mensuel pour faire évoluer votre entreprise, prendre du recul et avancer avec un interlocuteur régulier."}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-brand-blue">
                <li>{localeCode === "en" ? "Two individual 60-minute meetings each month" : "Deux rendez-vous individuels de 60 minutes par mois"}</li>
                <li>{localeCode === "en" ? "Follow-up between meetings" : "Un suivi entre les rendez-vous"}</li>
              </ul>
              <p className="mt-3 text-sm font-normal text-dema-muted">
                {localeCode === "en" ? "€750 excl. VAT / month" : "750 € HT / mois"}
              </p>
            </div>
            <Link
              href={localeCode === "en" ? "/en?view=solutions" : "/services/coach-business"}
              className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue sm:mt-0"
            >
              {localeCode === "en" ? "Discover Business coaching" : "Découvrir Coach business"}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CoachingPanel({
  initialDraftToken,
  onRequireAccess,
  localeCode = "fr",
  marketCode = "fr-fr",
}: {
  initialDraftToken?: string;
  initialTab?: CoachingTab;
  onRequireAccess?: (intent: SpecialistAccessIntent) => void;
  localeCode?: "fr" | "en";
  marketCode?: string;
}) {
  const isAuthenticated = !onRequireAccess;

  return (
    <section className="mx-auto max-w-[68rem] pb-16 pt-3 sm:pt-5">
      <header className="mx-auto mb-8 max-w-[42.5rem] text-center">
        <h2 className="text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">
          {localeCode === "en" ? "Clarify my situation" : "Clarifier ma situation"}
        </h2>
        <p className="mx-auto mt-4 max-w-[35.625rem] text-base font-light leading-relaxed text-dema-muted sm:text-lg">
          {localeCode === "en" ? "Describe your situation. The Demaa team will reply here." : "Décrivez votre situation. L’équipe Demaa vous répond ici."}
        </p>
      </header>
      <CoachingMessageForm
        initialDraftToken={initialDraftToken}
        isAuthenticated={isAuthenticated}
        onRequireAccess={onRequireAccess}
        localeCode={localeCode}
        marketCode={marketCode}
      />
    </section>
  );
}

function CoachingMessageForm({
  initialDraftToken,
  isAuthenticated,
  onRequireAccess,
  localeCode,
  marketCode,
}: {
  initialDraftToken?: string;
  isAuthenticated: boolean;
  onRequireAccess?: (intent: SpecialistAccessIntent) => void;
  localeCode: "fr" | "en";
  marketCode: string;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([]);
  const [access, setAccess] = useState<CoachingAccess | null>(
    isAuthenticated ? null : { canSend: true, freeStatus: "available" },
  );
  const [pendingDraftToken, setPendingDraftToken] = useState(initialDraftToken || "");
  const [status, setStatus] = useState<"idle" | "loading" | "sending" | "error">(
    isAuthenticated ? "loading" : "idle",
  );
  const historyRef = useRef<HTMLDivElement>(null);
  const autoSubmissionRef = useRef("");
  const updateMessage = useCallback((nextMessage: string) => {
    if (pendingDraftToken) {
      autoSubmissionRef.current = "";
      setPendingDraftToken("");
      clearCoachingDraftFromUrl();
    }
    setMessage(nextMessage);
    setStatus((current) => current === "error" ? "idle" : current);
  }, [pendingDraftToken]);
  const messageDictation = useSpeechDictation({
    value: message,
    onChange: updateMessage,
    continuous: true,
    interimResults: true,
    language: localeCode === "en" ? "en-GB" : "fr-FR",
  });
  const dateFormatter = useMemo(() => createCoachingMessageDateFormatter(localeCode), [localeCode]);
  const cancelMessageDictation = messageDictation.cancel;

  const loadMessages = useCallback(async (quiet = false) => {
    if (!quiet) setStatus("loading");
    try {
      const response = await fetch("/api/coaching-request", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("history_failed");
      const payload = await response.json() as {
        access?: CoachingAccess;
        messages?: CoachingMessage[];
        recommendations?: CoachingRecommendation[];
      };
      setMessages(Array.isArray(payload.messages) ? payload.messages : []);
      setRecommendations(Array.isArray(payload.recommendations) ? payload.recommendations : []);
      if (payload.access) setAccess(payload.access);
      setStatus((current) => current === "sending" ? current : "idle");
    } catch {
      if (!quiet) setStatus("error");
    }
  }, []);

  useEffect(() => {
    const draft = window.sessionStorage.getItem("demaa_coaching_message_draft");
    if (draft) setMessage(draft);
    if (!isAuthenticated) return;

    void loadMessages();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadMessages(true);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, loadMessages]);

  useEffect(() => {
    if (message) window.sessionStorage.setItem("demaa_coaching_message_draft", message);
    else window.sessionStorage.removeItem("demaa_coaching_message_draft");
  }, [message]);

  useEffect(() => {
    const history = historyRef.current;
    if (!history) return;
    history.scrollTo({
      behavior: messages.length > 1 ? "smooth" : "auto",
      top: history.scrollHeight,
    });
  }, [messages, recommendations]);

  const updateRecommendation = useCallback((next: CoachingRecommendation) => {
    setRecommendations((current) => current.map((item) => item.id === next.id ? next : item));
  }, []);
  const recommendationsByMessage = useMemo(() => {
    const grouped = new Map<string, CoachingRecommendation[]>();
    for (const recommendation of recommendations) {
      const group = grouped.get(recommendation.messageId) ?? [];
      group.push(recommendation);
      grouped.set(recommendation.messageId, group);
    }
    return grouped;
  }, [recommendations]);

  const sendAuthenticatedMessage = useCallback(async (draftToken?: string) => {
    cancelMessageDictation();
    setStatus("sending");
    const flowKey = "coaching:message";
    try {
      const payload = await submitCoachingRequest({
        attribution: getLeadAttributionPayload(),
        ...(draftToken
          ? { draftToken }
          : { idempotencyKey: getLeadSubmissionKey(flowKey), message }),
        requestKind: "message",
        localeCode,
        marketCode,
        source: localeCode === "en" ? "english-talk-to-us" : "echange",
        website: "",
      });
      if (!draftToken) clearLeadSubmissionKey(flowKey);
      if (payload?.message) {
        setMessages((current) => current.some((entry) => entry.id === payload.message?.id)
          ? current
          : [...current, payload.message as CoachingMessage]);
      } else {
        await loadMessages(true);
      }
      if (payload?.access) setAccess(payload.access);
      setPendingDraftToken("");
      setMessage("");
      setStatus("idle");
      if (draftToken) clearCoachingDraftFromUrl();
    } catch (error) {
      if (error instanceof CoachingRequestError && error.draftMessage) {
        setMessage(error.draftMessage);
      }
      if (
        error instanceof CoachingRequestError
        && error.code === "free_clarification_completed"
      ) {
        setAccess({ canSend: false, freeStatus: "completed" });
      }
      setStatus("error");
    }
  }, [cancelMessageDictation, loadMessages, localeCode, marketCode, message]);

  useEffect(() => {
    if (
      !isAuthenticated
      || !access?.canSend
      || !pendingDraftToken
      || autoSubmissionRef.current === pendingDraftToken
    ) return;
    autoSubmissionRef.current = pendingDraftToken;
    void sendAuthenticatedMessage(pendingDraftToken);
  }, [access?.canSend, isAuthenticated, pendingDraftToken, sendAuthenticatedMessage]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (message.trim().length < 2 && !pendingDraftToken) {
      setStatus("error");
      return;
    }

    if (!isAuthenticated) {
      cancelMessageDictation();
      if (pendingDraftToken) {
        onRequireAccess?.({ draftToken: pendingDraftToken, tab: "messages" });
        return;
      }
      setStatus("sending");
      try {
        const draftToken = await createCoachingDraft(message);
        setPendingDraftToken(draftToken);
        setStatus("idle");
        onRequireAccess?.({ draftToken, tab: "messages" });
      } catch {
        setStatus("error");
      }
      return;
    }

    if (!access?.canSend) return;
    await sendAuthenticatedMessage(pendingDraftToken || undefined);
  }

  return (
    <>
      <section className="mx-auto mt-7 max-w-[51.25rem] overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper">
      <div className="flex min-h-[3.875rem] items-center border-b border-dema-line px-5 py-3.5 sm:px-6">
        <h3 className="text-base font-medium text-brand-blue">{localeCode === "en" ? "Your conversation" : "Votre conversation"}</h3>
      </div>

      <div
        ref={historyRef}
        className="flex min-h-[14.375rem] max-h-[32rem] flex-col gap-3 overflow-y-auto bg-dema-sage/30 px-4 py-5 sm:px-6"
        aria-live="polite"
        aria-label={localeCode === "en" ? "Conversation history" : "Historique de la conversation"}
      >
        {status === "loading" ? (
          <div className="m-auto flex items-center gap-2 text-sm text-dema-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            {localeCode === "en" ? "Loading the conversation…" : "Chargement de la conversation…"}
          </div>
        ) : null}
        {messages.map((entry) => {
          const attachedRecommendations = recommendationsByMessage.get(entry.id) ?? [];
          return (
            <div key={entry.id} className={entry.author === "customer" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}>
              <article className={`rounded-[1.1rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${entry.author === "customer" ? "bg-dema-forest text-white" : "border border-dema-line bg-white text-brand-blue"}`}>
                <p className="whitespace-pre-wrap break-words">{entry.body}</p>
                <p className={`mt-1.5 text-[0.68rem] ${entry.author === "customer" ? "text-white/70" : "text-dema-muted"}`}>
                  {entry.author === "customer" ? (localeCode === "en" ? "You" : "Vous") : (localeCode === "en" ? "Demaa team" : "Équipe Demaa")} · {dateFormatter.format(new Date(entry.createdAt))}
                </p>
              </article>
              {localeCode === "fr"
                ? attachedRecommendations.map((recommendation) => (
                    <CoachingRecommendationCard key={recommendation.id} recommendation={recommendation} onRequested={updateRecommendation} />
                  ))
                : null}
            </div>
          );
        })}
      </div>

      {access?.freeStatus === "completed" ? (
        <div className="border-t border-dema-line p-4 text-center sm:p-5">
          <p className="text-sm font-medium text-brand-blue">{localeCode === "en" ? "Need ongoing support?" : "Besoin d’un accompagnement régulier ?"}</p>
          <p className="mt-1 text-sm text-dema-muted">
            {localeCode === "en" ? "Business coaching helps you move your priorities forward over time." : "Coach business vous aide à faire avancer vos priorités dans la durée."}
          </p>
          <Link
            href={localeCode === "en" ? "/en?view=solutions" : "/services/coach-business"}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white hover:bg-brand-blue"
          >
            {localeCode === "en" ? "Discover Business coaching" : "Découvrir Coach business"}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="border-t border-dema-line p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-[1.15rem] border border-dema-line bg-white p-2 focus-within:border-dema-forest">
            <textarea
              aria-label={localeCode === "en" ? "Your message" : "Votre message"}
              value={message}
              onChange={(event) => messageDictation.handleValueChange(event.target.value)}
              rows={2}
              placeholder={localeCode === "en" ? "Describe the situation you would like to clarify…" : "Décrivez la situation que vous souhaitez clarifier…"}
              className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={messageDictation.toggle}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-dema-forest transition hover:bg-dema-sage/50 ${messageDictation.isListening ? "bg-dema-sage ring-1 ring-dema-forest/30" : ""}`}
              aria-label={messageDictation.isListening ? (localeCode === "en" ? "Stop dictation" : "Arrêter la dictée") : (localeCode === "en" ? "Dictate the message" : "Dicter le message")}
              aria-pressed={messageDictation.isListening}
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              disabled={status === "sending" || (message.trim().length < 2 && !pendingDraftToken)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-[#284f3a] disabled:opacity-40"
              aria-label={localeCode === "en" ? "Clarify my situation" : "Clarifier ma situation"}
            >
              {status === "sending" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {access?.freeStatus === "available" ? (
            <p className="mt-2 px-2 text-xs text-dema-muted">{localeCode === "en" ? "Your first exchange is free." : "Ce premier échange est gratuit."}</p>
          ) : null}
          {messageDictation.error ? <p className="mt-2 px-2 text-xs text-amber-800" role="alert">{messageDictation.error}</p> : null}
          {status === "error" ? <p className="mt-2 px-2 text-xs font-medium text-red-700">{localeCode === "en" ? "The message was not sent. Try again." : "Le message n’a pas été envoyé. Réessayez."}</p> : null}
        </form>
      )}
      </section>
      {access && access.freeStatus !== "completed" ? <CoachBusinessPromo localeCode={localeCode} /> : null}
    </>
  );
}
