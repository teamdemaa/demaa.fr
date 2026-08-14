"use client";

import { Check, ChevronRight, LoaderCircle, Mic, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { CoachingMessage } from "@/lib/coaching-conversation";
import type { SpecialistOffer } from "@/lib/specialist-offers";

export type CoachingTab = "messages" | "formules";
export type { SpecialistOffer } from "@/lib/specialist-offers";
export type SpecialistAccessIntent = {
  draftToken?: string;
  offer?: SpecialistOffer;
  tab: CoachingTab;
};

const CLARITY_INCLUDED = [
  "Questions écrites ou vocales",
  "Réponse d’un spécialiste sous 24 à 48 heures ouvrées",
  "Second regard sur une décision, une offre, un document ou une action",
  "Prochaine étape concrète pour avancer",
] as const;

const CLARITY_MEMBER_BENEFITS = [
  "L’équipe Demaa mobilisable selon le besoin : structuration, développement commercial, marketing, finance et opérations",
  "Mises en relation facilitées lorsque votre profil correspond au besoin",
  "15 % de réduction sur les autres offres Demaa",
  "Mise en avant prioritaire de votre profil pour les opportunités correspondant à votre expertise",
] as const;
const coachingMessageDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

async function submitCoachingRequest(payload: Record<string, unknown>) {
  const response = await fetch("/api/coaching-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null) as {
    draftMessage?: string;
    error?: string;
    message?: CoachingMessage;
    ok?: boolean;
  } | null;
  if (response.status !== 202) {
    throw new CoachingRequestError(
      body?.error || "Le message n’a pas pu être envoyé.",
      body?.draftMessage,
    );
  }
  return body;
}

class CoachingRequestError extends Error {
  readonly draftMessage?: string;

  constructor(message: string, draftMessage?: string) {
    super(message);
    this.name = "CoachingRequestError";
    this.draftMessage = draftMessage;
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

export default function CoachingPanel({
  initialDraftToken,
  onRequireAccess,
}: {
  initialDraftToken?: string;
  initialOffer?: SpecialistOffer;
  initialTab?: CoachingTab;
  onRequireAccess?: (intent: SpecialistAccessIntent) => void;
}) {
  const [clarityDetailsOpen, setClarityDetailsOpen] = useState(false);

  return (
    <section className="mx-auto max-w-[68rem] pb-16 pt-3 sm:pt-5">
      <header className="mx-auto mb-8 max-w-[42.5rem] text-center">
        <h2 className="text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">Échanger avec un spécialiste</h2>
        <p className="mx-auto mt-4 max-w-[35.625rem] text-base font-light leading-relaxed text-dema-muted sm:text-lg">
          Écrivez ou dictez votre situation. Votre message et les réponses du spécialiste restent réunis dans une conversation simple.
        </p>
        <button
          type="button"
          onClick={() => setClarityDetailsOpen(true)}
          aria-haspopup="dialog"
          className="mx-auto mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-dema-forest/15 bg-dema-paper px-4 text-sm font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
        >
          <span>Clarté · 149 € HT / mois</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>
      <CoachingMessageForm
        initialDraftToken={initialDraftToken}
        isAuthenticated={!onRequireAccess}
        onRequireAccess={onRequireAccess}
      />
      {clarityDetailsOpen ? (
        <ClarityDetailsDialog onClose={() => setClarityDetailsOpen(false)} />
      ) : null}
    </section>
  );
}

function ClarityDetailsDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useAccessibleDialog({ onClose });

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-brand-blue/30 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clarity-details-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-[1.5rem] sm:p-8"
      >
        <button
          type="button"
          data-dialog-initial-focus
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:bg-dema-sage"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="pr-12 text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
          Accompagnement asynchrone
        </p>
        <h3 id="clarity-details-title" className="mt-2 pr-12 text-3xl font-light tracking-[-0.04em] text-brand-blue sm:text-4xl">
          Clarté
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-dema-muted sm:text-base">
          Quand une situation vous bloque, obtenez un regard de terrain pour voir clair, décider et avancer sans attendre un rendez-vous.
        </p>
        <p className="mt-5 text-2xl font-medium tracking-[-0.03em] text-brand-blue">
          149 € <span className="text-sm font-normal tracking-normal text-dema-muted">HT / mois</span>
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <ClarityBenefitList title="Ce qui est inclus" benefits={CLARITY_INCLUDED} />
          <ClarityBenefitList title="Avantages Clarté" benefits={CLARITY_MEMBER_BENEFITS} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-blue"
        >
          Poser ma question
        </button>
      </section>
    </div>
  );
}

function ClarityBenefitList({
  benefits,
  title,
}: {
  benefits: readonly string[];
  title: string;
}) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-brand-blue">{title}</h4>
      <ul className="mt-3 space-y-3 text-sm leading-relaxed text-dema-muted">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoachingMessageForm({
  initialDraftToken,
  isAuthenticated,
  onRequireAccess,
}: {
  initialDraftToken?: string;
  isAuthenticated: boolean;
  onRequireAccess?: (intent: SpecialistAccessIntent) => void;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
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
  });
  const cancelMessageDictation = messageDictation.cancel;

  const loadMessages = useCallback(async (quiet = false) => {
    if (!quiet) setStatus("loading");
    try {
      const response = await fetch("/api/coaching-request", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("history_failed");
      const payload = await response.json() as { messages?: CoachingMessage[] };
      setMessages(Array.isArray(payload.messages) ? payload.messages : []);
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
    if (message) {
      window.sessionStorage.setItem("demaa_coaching_message_draft", message);
    } else {
      window.sessionStorage.removeItem("demaa_coaching_message_draft");
    }
  }, [message]);

  useEffect(() => {
    const history = historyRef.current;
    if (!history) return;
    history.scrollTo({
      behavior: messages.length > 1 ? "smooth" : "auto",
      top: history.scrollHeight,
    });
  }, [messages]);

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
      setPendingDraftToken("");
      setMessage("");
      setStatus("idle");
      if (draftToken) clearCoachingDraftFromUrl();
    } catch (error) {
      if (error instanceof CoachingRequestError && error.draftMessage) {
        setMessage(error.draftMessage);
      }
      setStatus("error");
    }
  }, [cancelMessageDictation, loadMessages, message]);

  useEffect(() => {
    if (
      !isAuthenticated
      || !pendingDraftToken
      || autoSubmissionRef.current === pendingDraftToken
    ) return;

    autoSubmissionRef.current = pendingDraftToken;
    void sendAuthenticatedMessage(pendingDraftToken);
  }, [isAuthenticated, pendingDraftToken, sendAuthenticatedMessage]);

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

    await sendAuthenticatedMessage(pendingDraftToken || undefined);
  }

  return (
    <section className="mx-auto mt-7 max-w-[51.25rem] overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper">
      <div className="flex min-h-[3.875rem] items-center justify-between gap-4 border-b border-dema-line px-5 py-3.5 sm:px-6">
        <h3 className="text-base font-medium text-brand-blue">Votre conversation</h3>
        <span className="shrink-0 rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-dema-forest">Écrit ou vocal</span>
      </div>

      <div
        ref={historyRef}
        className="flex min-h-[14.375rem] max-h-[32rem] flex-col gap-3 overflow-y-auto bg-dema-sage/30 px-4 py-5 sm:px-6"
        aria-live="polite"
        aria-label="Historique de la conversation"
      >
        {status === "loading" ? (
          <div className="m-auto flex items-center gap-2 text-sm text-dema-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Chargement de la conversation…
          </div>
        ) : null}
        {status !== "loading" && messages.length === 0 ? (
          <p className="m-auto max-w-sm text-center text-sm leading-relaxed text-dema-muted">
            Posez votre première question. Vos échanges resteront visibles ici.
          </p>
        ) : null}
        {messages.map((entry) => (
          <article
            key={entry.id}
            className={`max-w-[85%] rounded-[1.1rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${entry.author === "customer" ? "ml-auto bg-dema-forest text-white" : "mr-auto border border-dema-line bg-white text-brand-blue"}`}
          >
            <p className="whitespace-pre-wrap break-words">{entry.body}</p>
            <p className={`mt-1.5 text-[0.68rem] ${entry.author === "customer" ? "text-white/70" : "text-dema-muted"}`}>
              {entry.author === "customer" ? "Vous" : "Spécialiste"} · {coachingMessageDateFormatter.format(new Date(entry.createdAt))}
            </p>
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-dema-line p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-[1.15rem] border border-dema-line bg-white p-2 focus-within:border-dema-forest">
          <textarea
            aria-label="Votre message"
            value={message}
            onChange={(event) => messageDictation.handleValueChange(event.target.value)}
            rows={2}
            placeholder="Écrivez votre message…"
            className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={messageDictation.toggle}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-dema-forest transition hover:bg-dema-sage/50 ${messageDictation.isListening ? "bg-dema-sage ring-1 ring-dema-forest/30" : ""}`}
            aria-label={messageDictation.isListening ? "Arrêter la dictée" : "Dicter le message"}
            aria-pressed={messageDictation.isListening}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button disabled={status === "sending" || (message.trim().length < 2 && !pendingDraftToken)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-[#284f3a] disabled:opacity-40" aria-label="Envoyer le message">
            {status === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {messageDictation.isListening ? <p className="mt-2 px-2 text-xs text-dema-forest" role="status">Dictée en cours… le texte apparaît dans le message.</p> : null}
        {messageDictation.error ? <p className="mt-2 px-2 text-xs text-amber-800" role="alert">{messageDictation.error}</p> : null}
        {status === "error" ? <p className="mt-2 px-2 text-xs font-medium text-red-700">Le message n’a pas pu être envoyé. Votre texte est conservé : réessayez.</p> : null}
      </form>
    </section>
  );
}
