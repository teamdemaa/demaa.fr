"use client";

import { Check, ChevronRight, LoaderCircle, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import type { CoachingRecommendation } from "@/lib/coaching-conversation";

export default function CoachingRecommendationCard({
  onRequested,
  recommendation,
}: {
  onRequested: (recommendation: CoachingRecommendation) => void;
  recommendation: CoachingRecommendation;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    recommendation.status === "requested" ? "success" : "idle",
  );
  const dialogRef = useAccessibleDialog({ isOpen, onClose: () => setIsOpen(false) });
  const unavailable = recommendation.status === "withdrawn";
  const alreadyRequested = recommendation.status !== "recommended";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company.trim() || phone.replace(/\D/g, "").length < 8) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/coaching-recommendation-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company: company.trim(),
          phone: phone.trim(),
          recommendationId: recommendation.id,
          website,
        }),
      });
      const payload = await response.json().catch(() => null) as {
        error?: string;
        recommendation?: CoachingRecommendation;
      } | null;
      if (response.status !== 202 || !payload?.recommendation) {
        throw new Error(payload?.error || "request_failed");
      }
      onRequested(payload.recommendation);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="mt-2 w-full max-w-md rounded-[1rem] border border-dema-forest/15 bg-white p-4 text-left text-brand-blue shadow-sm">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-dema-forest">
          Recommandé pour votre situation
        </p>
        <p className="mt-3 text-xs font-medium text-dema-muted">{recommendation.category}</p>
        <h4 className="mt-1 text-base font-semibold">{recommendation.name}</h4>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-dema-muted">
          {recommendation.description}
        </p>
        {recommendation.needLabel ? (
          <p className="mt-2 text-xs font-medium text-dema-forest">Besoin : {recommendation.needLabel}</p>
        ) : null}
        <button
          type="button"
          disabled={unavailable}
          onClick={() => setIsOpen(true)}
          className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-dema-forest disabled:text-dema-muted"
        >
          {unavailable
            ? "Mise en relation indisponible"
            : alreadyRequested
              ? "Voir la demande"
              : "Demander une mise en relation"}
          {!unavailable ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
        </button>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-brand-blue/30 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`recommendation-${recommendation.id}-title`} tabIndex={-1} className="demaa-dialog-shadow max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[1.35rem] bg-dema-paper p-5 outline-none sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-dema-forest">{recommendation.category}</p>
                <h3 id={`recommendation-${recommendation.id}-title`} className="mt-2 text-2xl font-semibold text-brand-blue">{recommendation.name}</h3>
              </div>
              <button data-dialog-initial-focus type="button" onClick={() => setIsOpen(false)} aria-label="Fermer" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-dema-muted">{recommendation.connectionProcess}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <section>
                <h4 className="text-sm font-semibold text-brand-blue">Ce qui peut être pris en charge</h4>
                <ul className="mt-3 space-y-2">
                  {recommendation.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-5 text-dema-muted"><Check className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h4 className="text-sm font-semibold text-brand-blue">Limites de l’intervention</h4>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-dema-muted">
                  {recommendation.limits.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </section>
            </div>

            <p className="mt-6 rounded-xl bg-dema-sage/45 p-4 text-sm leading-6 text-brand-blue">
              La mise en relation est gratuite. Le professionnel retenu confirme son périmètre et son tarif, puis facture directement son intervention.
            </p>

            {status === "success" || alreadyRequested ? (
              <p role="status" className="mt-6 rounded-xl border border-dema-forest/20 p-4 text-sm font-medium text-dema-forest">
                Demande reçue. La Team Demaa revient vers vous pour organiser la mise en relation.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-brand-blue">Entreprise
                  <input value={company} onChange={(event) => setCompany(event.target.value)} maxLength={160} autoComplete="organization" className="mt-2 min-h-11 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" />
                </label>
                <label className="text-sm font-semibold text-brand-blue">Numéro WhatsApp
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={60} type="tel" inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" className="mt-2 min-h-11 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" />
                </label>
                <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <button disabled={status === "sending"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
                  {status === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
                </button>
                {status === "error" ? <p role="alert" className="text-sm text-red-700 sm:col-span-2">Vérifiez les informations puis réessayez.</p> : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
