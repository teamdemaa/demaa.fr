"use client";

import { Check, LoaderCircle, Mic, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { CoachingMessage } from "@/lib/coaching-conversation";

type CoachingTab = "messages" | "sessions";
type Offer = "session" | "parcours";

const offers = [
  {
    id: "session" as const,
    title: "Session de pilotage",
    meta: "60 minutes · par téléphone",
    price: "150 € HT",
    text: "Un spécialiste analyse votre situation et vous aide à choisir la prochaine étape.",
    cta: "Réserver une session",
  },
  {
    id: "parcours" as const,
    title: "Parcours de pilotage",
    meta: "3 sessions de 60 minutes · valables 3 mois",
    price: "400 € HT",
    text: "Le même spécialiste vous aide à décider, agir et ajuster au fil des séances.",
    cta: "Choisir le parcours",
  },
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
  if (response.status !== 202) throw new Error("request_failed");
  return response.json().catch(() => null) as Promise<{
    message?: CoachingMessage;
    ok?: boolean;
  } | null>;
}

export default function CoachingPanel({
  onRequireAccess,
}: {
  onRequireAccess?: () => void;
}) {
  const [tab, setTab] = useState<CoachingTab>("messages");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  return (
    <section className="mx-auto max-w-[68rem] pb-16 pt-3 sm:pt-5">
      <header>
        <h2 className="text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">Parler à un spécialiste</h2>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dema-muted sm:text-lg">
          Débloquez une situation avec un spécialiste qui comprend votre quotidien et s’appuie sur l’expérience du terrain.
        </p>
      </header>

      <div className="mt-7 flex border-b border-dema-line" role="tablist" aria-label="Parler à un spécialiste">
        {(["messages", "sessions"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-12 border-b-2 px-5 text-sm font-medium transition ${tab === value ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}
          >
            {value === "messages" ? "Messages" : "Sessions"}
          </button>
        ))}
      </div>

      {tab === "sessions" ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <article key={offer.id} className="flex h-full flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
              <div className="flex h-full flex-col">
                <div className="min-w-0">
                  <p className="text-xs text-dema-muted">{offer.meta}</p>
                  <h3 className="mt-1 text-xl font-medium tracking-[-0.02em] text-brand-blue">{offer.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">{offer.text}</p>
                </div>
                <div className="mt-5 shrink-0 md:mt-auto md:pt-5">
                  <p className="text-lg font-medium text-brand-blue">{offer.price}</p>
                  <button type="button" onClick={() => onRequireAccess ? onRequireAccess() : setSelectedOffer(offer.id)} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full border border-dema-forest/20 px-4 text-sm font-medium text-dema-forest transition hover:bg-dema-sage/45">
                    {offer.cta}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        onRequireAccess ? (
          <section className="mt-7 max-w-3xl rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
            <h3 className="text-xl font-medium text-brand-blue">Écrire à un spécialiste</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-dema-muted">
              Identifiez-vous d’abord pour conserver la conversation et retrouver les réponses du spécialiste.
            </p>
            <button
              type="button"
              onClick={onRequireAccess}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-[#284f3a]"
            >
              Continuer par e-mail
            </button>
          </section>
        ) : (
          <CoachingMessageForm />
        )
      )}

      {selectedOffer ? <CoachingRequestDialog offer={selectedOffer} onClose={() => setSelectedOffer(null)} /> : null}
    </section>
  );
}

function CoachingRequestDialog({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!company.trim() || phone.replace(/\D/g, "").length < 8) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const flowKey = `coaching:${offer}`;
    try {
      await submitCoachingRequest({
        attribution: getLeadAttributionPayload(), company, phone, message, offer,
        requestKind: "session", website: "", idempotencyKey: getLeadSubmissionKey(flowKey),
      });
      clearLeadSubmissionKey(flowKey);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-brand-blue/30 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="coaching-dialog-title">
      <div className="relative max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[1.5rem] sm:p-8">
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line"><X className="h-4 w-4" /></button>
        {status === "sent" ? (
          <div className="py-8 text-center"><Check className="mx-auto h-8 w-8 text-dema-forest" /><h3 id="coaching-dialog-title" className="mt-4 text-2xl font-semibold">Demande reçue</h3><p className="mt-2 text-sm text-dema-muted">Nous vous recontacterons par téléphone pour organiser la suite.</p></div>
        ) : (
          <form onSubmit={submit}>
            <h3 id="coaching-dialog-title" className="pr-12 text-2xl font-semibold text-brand-blue">Organiser l’échange</h3>
            <p className="mt-2 text-sm text-dema-muted">Indiquez simplement comment vous joindre. Aucun paiement n’est demandé maintenant.</p>
            <label className="mt-6 block text-sm font-medium">Entreprise<input value={company} onChange={(event) => setCompany(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" /></label>
            <label className="mt-4 block text-sm font-medium">Téléphone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+33 6 12 34 56 78" className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" /></label>
            <label className="mt-4 block text-sm font-medium">Votre situation <span className="font-normal text-dema-muted">(facultatif)</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" /></label>
            {status === "error" ? <p className="mt-3 text-sm text-red-700">Vérifiez les informations puis réessayez.</p> : null}
            <button disabled={status === "sending"} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest text-sm font-semibold text-white disabled:opacity-60">{status === "sending" ? "Envoi…" : "Être recontacté(e)"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function CoachingMessageForm() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "sending" | "error">("loading");
  const historyRef = useRef<HTMLDivElement>(null);
  const messageDictation = useSpeechDictation({
    value: message,
    onChange: setMessage,
    continuous: true,
    interimResults: true,
  });

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
    void loadMessages();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadMessages(true);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadMessages]);

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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (message.trim().length < 2) {
      setStatus("error"); return;
    }
    messageDictation.cancel();
    setStatus("sending");
    const flowKey = "coaching:message";
    try {
      const payload = await submitCoachingRequest({ attribution: getLeadAttributionPayload(), message, requestKind: "message", website: "", idempotencyKey: getLeadSubmissionKey(flowKey) });
      clearLeadSubmissionKey(flowKey);
      if (payload?.message) {
        setMessages((current) => current.some((entry) => entry.id === payload.message?.id)
          ? current
          : [...current, payload.message as CoachingMessage]);
      } else {
        await loadMessages(true);
      }
      setMessage("");
      setStatus("idle");
    } catch { setStatus("error"); }
  }

  return (
    <section className="mt-7 max-w-3xl overflow-hidden rounded-[1.35rem] border border-dema-line bg-dema-paper">
      <div className="border-b border-dema-line px-5 py-4 sm:px-6">
        <h3 className="text-xl font-medium text-brand-blue">Écrire à un spécialiste</h3>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          Envoyez une question ou dictez-la. Un spécialiste vous répond sous 24 à 48 h.
        </p>
      </div>

      <div
        ref={historyRef}
        className="flex min-h-72 max-h-[32rem] flex-col gap-3 overflow-y-auto bg-dema-sage/20 px-4 py-5 sm:px-6"
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
          <button disabled={status === "sending" || message.trim().length < 2} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-[#284f3a] disabled:opacity-40" aria-label="Envoyer le message">
            {status === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {messageDictation.isListening ? <p className="mt-2 px-2 text-xs text-dema-forest" role="status">Dictée en cours… le texte apparaît dans le message.</p> : null}
        {messageDictation.error ? <p className="mt-2 px-2 text-xs text-amber-800" role="alert">{messageDictation.error}</p> : null}
        {status === "error" ? <p className="mt-2 px-2 text-xs font-medium text-red-700">Le message n’a pas pu être envoyé. Réessayez.</p> : null}
      </form>
    </section>
  );
}
