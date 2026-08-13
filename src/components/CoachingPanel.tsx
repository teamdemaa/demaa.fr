"use client";

import { Check, LoaderCircle, Mic, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { CoachingMessage } from "@/lib/coaching-conversation";
import {
  SPECIALIST_OFFERS,
  type SpecialistOffer,
} from "@/lib/specialist-offers";

export type CoachingTab = "messages" | "formules";
export type { SpecialistOffer } from "@/lib/specialist-offers";
export type SpecialistAccessIntent = {
  offer?: SpecialistOffer;
  tab: CoachingTab;
};
type PilotageRhythm = 1 | 2;

const COMMON_BENEFITS = [
  "Toute l’équipe Demaa mobilisable selon le besoin : structuration, développement commercial, marketing, finance et opérations",
  "Mises en relation facilitées si votre profil correspond",
  "Jusqu’à –15 % sur une sélection de services et d’outils partenaires",
  "Accès anticipé aux opportunités pertinentes",
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
  initialOffer,
  initialTab = "messages",
  onRequireAccess,
}: {
  initialOffer?: SpecialistOffer;
  initialTab?: CoachingTab;
  onRequireAccess?: (intent: SpecialistAccessIntent) => void;
}) {
  const [tab, setTab] = useState<CoachingTab>(initialTab);
  const [selectedOffer, setSelectedOffer] = useState<SpecialistOffer | null>(initialOffer ?? null);
  const [pilotageRhythm, setPilotageRhythm] = useState<PilotageRhythm>(1);

  const pilotageOffer: SpecialistOffer = pilotageRhythm === 2 ? "pilotage_2" : "pilotage_1";
  const pilotagePrice = pilotageRhythm === 2 ? "550 €" : "350 €";
  const closeFormulaDialog = useCallback(() => setSelectedOffer(null), []);

  return (
    <section className="mx-auto max-w-[68rem] pb-16 pt-3 sm:pt-5">
      <header className="mx-auto mb-8 max-w-[42.5rem] text-center">
        <h2 className="text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">Parler à un spécialiste</h2>
        <p className="mx-auto mt-4 max-w-[35.625rem] text-base font-light leading-relaxed text-dema-muted sm:text-lg">
          Débloquez une situation avec un premier échange offert par l’équipe Demaa. Choisissez ensuite un abonnement seulement si vous souhaitez être accompagné dans la durée.
        </p>
      </header>

      <div className="mx-auto flex gap-8 border-b border-dema-line" role="tablist" aria-label="Parler à un spécialiste">
        {(["messages", "formules"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`-mb-px min-h-12 border-b-2 px-1 text-sm font-medium transition ${tab === value ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}
          >
            {value === "messages" ? "Messages" : "Formules"}
          </button>
        ))}
      </div>

      {tab === "formules" ? (
        <section className="mx-auto mt-7 max-w-[67.5rem]" aria-label="Abonnements avec un spécialiste">
          <div>
            <h3 className="text-2xl font-medium tracking-[-0.03em] text-brand-blue">Choisir votre formule</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-dema-muted">Clarté pour décider maintenant. Maestro pour reprendre durablement la direction de votre entreprise.</p>
          </div>

          <div className="mt-5 rounded-[1.1rem] bg-dema-sage/65 p-4 sm:px-5 sm:py-[1.125rem]">
            <strong className="block text-sm font-medium text-dema-forest">Avantages inclus dans les abonnements</strong>
            <div className="mt-3 grid gap-2.5 text-sm leading-snug text-dema-muted sm:grid-cols-2 sm:gap-x-6">
              {COMMON_BENEFITS.map((benefit) => (
                <span key={benefit} className="flex gap-2 before:shrink-0 before:text-dema-forest before:content-['✓']">{benefit}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormulaCard
              note="Échanges écrits ou vocaux"
              title="Clarté"
              audience="Quand une situation vous bloque, obtenez un regard de terrain pour voir clair, décider et avancer."
              price="149 €"
              benefits={[
                "Questions écrites ou vocales",
                "Réponse d’un spécialiste sous 24 à 48 heures ouvrées",
                "Second regard sur une décision, une offre, un document ou une action",
                "Prochaine étape concrète",
              ]}
              cta="Choisir Clarté"
              onSelect={() => onRequireAccess ? onRequireAccess({ offer: "echanges", tab: "formules" }) : setSelectedOffer("echanges")}
            />

            <FormulaCard
              recommended
              note="Avec un spécialiste dédié"
              title="Maestro"
              audience="Reprenez votre place de dirigeant. Donnez le cap, organisez l’exécution et faites avancer l’entreprise sans rester au centre de tout."
              price={pilotagePrice}
              selector={(
                <div className="grid grid-cols-2 gap-1 rounded-full border border-dema-line bg-dema-sage/35 p-1" role="group" aria-label="Nombre de sessions mensuelles">
                  {([1, 2] as const).map((rhythm) => (
                    <button
                      key={rhythm}
                      type="button"
                      aria-pressed={pilotageRhythm === rhythm}
                      onClick={() => setPilotageRhythm(rhythm)}
                      className={`min-h-10 min-w-0 rounded-full px-1.5 text-[0.72rem] leading-tight transition min-[360px]:text-xs sm:px-3 sm:text-sm ${pilotageRhythm === rhythm ? "bg-white text-dema-forest shadow-sm" : "text-dema-muted hover:text-dema-forest"}`}
                    >
                      {rhythm} session{rhythm === 2 ? "s" : ""} / mois
                    </button>
                  ))}
                </div>
              )}
              benefits={[
                `${pilotageRhythm} session${pilotageRhythm === 2 ? "s individuelles" : " individuelle"} de 60 minutes par mois`,
                "Échanges écrits ou vocaux avec votre spécialiste",
                "Clarification et ajustement de votre stratégie avec la méthode ASOP",
                "Priorisation et ajustement du plan d’action",
                "Préparation et revue raisonnable de documents",
              ]}
              cta={`Choisir Maestro · ${pilotageRhythm} session${pilotageRhythm === 2 ? "s" : ""}`}
              onSelect={() => onRequireAccess ? onRequireAccess({ offer: pilotageOffer, tab: "formules" }) : setSelectedOffer(pilotageOffer)}
            />
          </div>
        </section>
      ) : (
        onRequireAccess ? (
          <section className="mx-auto mt-7 max-w-[51.25rem] overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper">
            <div className="flex min-h-[3.875rem] items-center justify-between gap-4 border-b border-dema-line px-5 py-3.5">
              <h3 className="text-base font-medium text-brand-blue">Votre conversation</h3>
              <span className="shrink-0 rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-dema-forest">Premier échange offert</span>
            </div>
            <div className="flex min-h-[14.375rem] items-center justify-center bg-dema-sage/30 p-6 text-center">
              <div className="max-w-md">
                <p className="text-sm leading-relaxed text-dema-muted">
                  Identifiez-vous pour écrire votre message, conserver la conversation et retrouver la réponse du spécialiste.
                </p>
                <button
                  type="button"
                  onClick={() => onRequireAccess({ tab: "messages" })}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-[#284f3a]"
                >
                  Continuer par e-mail
                </button>
              </div>
            </div>
          </section>
        ) : (
          <CoachingMessageForm />
        )
      )}

      {selectedOffer ? <CoachingRequestDialog offer={selectedOffer} onClose={closeFormulaDialog} /> : null}
    </section>
  );
}

function FormulaCard({
  audience,
  benefits,
  cta,
  note,
  onSelect,
  price,
  recommended = false,
  selector,
  title,
}: {
  audience: string;
  benefits: readonly string[];
  cta: string;
  note: string;
  onSelect: () => void;
  price: string;
  recommended?: boolean;
  selector?: React.ReactNode;
  title: string;
}) {
  return (
    <article className={`flex min-w-0 flex-col rounded-[1.35rem] border bg-dema-paper p-5 sm:p-6 ${recommended ? "border-dema-forest/55 shadow-[0_12px_34px_rgba(47,104,76,0.10)]" : "border-dema-line"}`}>
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-dema-forest">{note}</span>
      <h4 className="mt-3 text-2xl font-medium tracking-[-0.025em] text-brand-blue">{title}</h4>
      <p className="mt-1 min-h-[2.9rem] text-sm leading-relaxed text-dema-muted md:min-h-[3.8rem]">{audience}</p>
      {selector ? <div className="mt-4">{selector}</div> : null}
      <p className="mb-4 mt-5 text-[2rem] font-medium tracking-[-0.04em] text-brand-blue">
        {price} <small className="text-sm font-normal tracking-normal text-dema-muted">HT / mois</small>
      </p>
      <ul className="mb-6 grid gap-2.5 text-sm leading-snug text-dema-muted">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2 before:shrink-0 before:text-dema-forest before:content-['✓']">{benefit}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={`mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition ${recommended ? "border-dema-forest bg-dema-forest text-white hover:bg-[#284f3a]" : "border-dema-forest/30 text-dema-forest hover:bg-dema-sage/45"}`}
      >
        {cta}
      </button>
    </article>
  );
}

function CoachingRequestDialog({ offer, onClose }: { offer: SpecialistOffer; onClose: () => void }) {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const dialogRef = useAccessibleDialog({ onClose });

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
        requestKind: "formula", website: "", idempotencyKey: getLeadSubmissionKey(flowKey),
      });
      clearLeadSubmissionKey(flowKey);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-brand-blue/30 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="coaching-dialog-title" tabIndex={-1} className="relative max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[1.5rem] sm:p-8">
        <button type="button" onClick={onClose} data-dialog-initial-focus aria-label="Fermer" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line"><X className="h-4 w-4" /></button>
        {status === "sent" ? (
          <div className="py-8 text-center"><Check className="mx-auto h-8 w-8 text-dema-forest" /><h3 id="coaching-dialog-title" className="mt-4 text-2xl font-semibold">Demande reçue</h3><p className="mt-2 text-sm text-dema-muted">Nous vous recontacterons par téléphone pour organiser la suite.</p></div>
        ) : (
          <form onSubmit={submit}>
            <h3 id="coaching-dialog-title" className="pr-12 text-2xl font-semibold text-brand-blue">Choisir cette formule</h3>
            <p className="mt-2 text-sm text-dema-muted">{SPECIALIST_OFFERS[offer].title} · {SPECIALIST_OFFERS[offer].price}</p>
            <p className="mt-1 text-sm text-dema-muted">Indiquez simplement comment vous joindre. Aucun abonnement ni paiement n’est déclenché maintenant.</p>
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
    <section className="mx-auto mt-7 max-w-[51.25rem] overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper">
      <div className="flex min-h-[3.875rem] items-center justify-between gap-4 border-b border-dema-line px-5 py-3.5 sm:px-6">
        <h3 className="text-base font-medium text-brand-blue">Votre conversation</h3>
        <span className="shrink-0 rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-dema-forest">Premier échange offert</span>
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
