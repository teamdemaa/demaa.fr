"use client";

import { Check, Compass, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import type { SpecialistOffer } from "@/lib/specialist-offers";

type CoachRhythm = 1 | 2;

export default function CoachBusinessServiceCard() {
  const [open, setOpen] = useState(false);
  const [rhythm, setRhythm] = useState<CoachRhythm>(1);

  return (
    <>
      <article className="flex min-h-[25rem] min-w-0 flex-col rounded-[1.4rem] border border-dema-forest/45 bg-dema-paper p-6 shadow-[0_10px_28px_rgba(23,35,29,0.05)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Compass className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          Accompagnement du dirigeant
        </p>
        <h3 className="mt-7 text-xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue">
          Coach business
        </h3>
        <p className="mt-3 text-sm leading-6 text-dema-muted">
          Trouvez le coach adapté à votre situation pour clarifier le cap,
          prioriser le plan d’action et organiser l’exécution tout en restant
          aux commandes.
        </p>
        <ul className="mt-5 space-y-2 text-sm leading-6 text-dema-muted">
          <li>Matching guidé avec le bon coach</li>
          <li>1 ou 2 sessions individuelles de 60 minutes par mois</li>
          <li>15 % de réduction pour les abonnés Clarté</li>
        </ul>
        <div className="mt-auto border-t border-dema-line/80 pt-5">
          <p className="text-sm font-semibold text-dema-forest">
            À partir de 350 € HT / mois
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
          >
            Être rappelé(e)
          </button>
        </div>
      </article>

      {open ? (
        <CoachBusinessDialog
          initialRhythm={rhythm}
          onClose={() => setOpen(false)}
          onRhythmChange={setRhythm}
        />
      ) : null}
    </>
  );
}

function CoachBusinessDialog({
  initialRhythm,
  onClose,
  onRhythmChange,
}: {
  initialRhythm: CoachRhythm;
  onClose: () => void;
  onRhythmChange: (rhythm: CoachRhythm) => void;
}) {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [situation, setSituation] = useState("");
  const [rhythm, setRhythm] = useState(initialRhythm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const dialogRef = useAccessibleDialog({ onClose });
  const offer: SpecialistOffer = rhythm === 2 ? "pilotage_2" : "pilotage_1";
  const price = rhythm === 2 ? "550 €" : "350 €";

  function selectRhythm(nextRhythm: CoachRhythm) {
    setRhythm(nextRhythm);
    onRhythmChange(nextRhythm);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company.trim() || phone.replace(/\D/g, "").length < 8) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    const flowKey = `coach-business:${offer}`;
    try {
      const response = await fetch("/api/coaching-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          message: situation,
          offer,
          phone,
          requestKind: "formula",
          website: "",
        }),
      });
      if (response.status !== 202) throw new Error("callback_failed");
      clearLeadSubmissionKey(flowKey);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-brand-blue/30 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-business-dialog-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-dvh w-full max-w-xl overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-[1.5rem] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          data-dialog-initial-focus
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {status === "sent" ? (
          <div className="py-10 text-center">
            <Check className="mx-auto h-8 w-8 text-dema-forest" aria-hidden="true" />
            <h3 id="coach-business-dialog-title" className="mt-4 text-2xl font-semibold text-brand-blue">
              Demande reçue
            </h3>
            <p className="mt-2 text-sm leading-6 text-dema-muted">
              L’équipe vous rappellera pour comprendre votre situation et vous
              orienter vers le coach adapté.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 id="coach-business-dialog-title" className="pr-12 text-2xl font-semibold text-brand-blue">
              Trouver le bon coach business
            </h3>
            <p className="mt-2 text-sm leading-6 text-dema-muted">
              Choisissez le rythme envisagé. Le rappel sert à vérifier le besoin
              et le matching ; aucun paiement n’est déclenché.
            </p>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-brand-blue">Accompagnement souhaité</legend>
              <div className="mt-2 grid grid-cols-2 gap-2" role="group">
                {([1, 2] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rhythm === value}
                    onClick={() => selectRhythm(value)}
                    className={`min-h-14 rounded-xl border px-3 text-sm transition ${
                      rhythm === value
                        ? "border-dema-forest bg-dema-sage text-dema-forest"
                        : "border-dema-line text-dema-muted"
                    }`}
                  >
                    {value} session{value === 2 ? "s" : ""} / mois
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold text-dema-forest">
                {price} HT / mois · session{rhythm === 2 ? "s" : ""} de 60 minutes
              </p>
            </fieldset>

            <label className="mt-5 block text-sm font-medium text-brand-blue">
              Entreprise
              <input
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-brand-blue">
              Téléphone
              <input
                required
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-brand-blue">
              Votre priorité <span className="font-normal text-dema-muted">(facultatif)</span>
              <textarea
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest"
              />
            </label>
            {status === "error" ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                Vérifiez vos informations puis réessayez.
              </p>
            ) : null}
            <button
              disabled={status === "sending"}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest text-sm font-semibold text-white disabled:opacity-60"
            >
              {status === "sending" ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {status === "sending" ? "Envoi…" : "Être rappelé(e)"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
