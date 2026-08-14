"use client";

import { LoaderCircle, Mic, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  return (
    <section className="mx-auto max-w-[68rem] pb-16 pt-3 sm:pt-5">
      <header className="mx-auto mb-8 max-w-[42.5rem] text-center">
        <h2 className="text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">Échanger avec un spécialiste</h2>
        <p className="mx-auto mt-4 max-w-[35.625rem] text-base font-light leading-relaxed text-dema-muted sm:text-lg">
          Écrivez ou dictez votre situation. Votre message et les réponses du spécialiste restent réunis dans une conversation simple.
        </p>
        <p className="mt-3 text-sm font-medium text-dema-forest">
          Clarté · accompagnement asynchrone à 149 € HT / mois
        </p>
      </header>
      <CoachingMessageForm
        initialDraftToken={initialDraftToken}
        isAuthenticated={!onRequireAccess}
        onRequireAccess={onRequireAccess}
      />
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
