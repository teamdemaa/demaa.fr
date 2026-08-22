"use client";

import { ChevronDown, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPES,
  OPPORTUNITY_WORK_MODE_LABELS,
  OPPORTUNITY_WORK_MODES,
} from "@/lib/opportunity-contract";

const LOCAL_DRAFT_KEY = "demaa_opportunity_submission_draft";

export default function OpportunitySubmissionDialog({
  initialEmail,
  onClose,
  onSubmitted,
}: {
  initialEmail?: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [restoredDraft] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const parsed = JSON.parse(
        window.sessionStorage.getItem(LOCAL_DRAFT_KEY) ?? "{}",
      ) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [
          key,
          typeof value === "string" ? value : "",
        ]),
      );
    } catch {
      return {};
    }
  });
  const hasRestoredOptionalDetails = [
    "cadence",
    "companyName",
    "compensation",
    "expectations",
    "geography",
    "startTiming",
    "workMode",
  ].some((key) => Boolean(restoredDraft[key]));
  const dialogRef = useAccessibleDialog({ onClose });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contactEmail = String(formData.get("email") ?? "").trim();
    const fields = {
      cadence: formData.get("cadence"),
      category: formData.get("category"),
      companyName: formData.get("companyName"),
      compensation: formData.get("compensation"),
      expectations: formData.get("expectations"),
      geography: formData.get("geography"),
      opportunityType: formData.get("opportunityType"),
      startTiming: formData.get("startTiming"),
      summary: formData.get("summary"),
      title: formData.get("title"),
      workMode: formData.get("workMode"),
    };
    setStatus("sending");
    setError(null);

    try {
      window.sessionStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(fields));
      const draftResponse = await fetch("/api/opportunity-submission-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const draftPayload = await draftResponse.json().catch(() => null) as {
        draftToken?: string;
        error?: string;
      } | null;
      if (draftResponse.status !== 201 || !draftPayload?.draftToken) {
        throw new Error(draftPayload?.error || "Le brouillon n’a pas pu être préparé.");
      }

      const submissionResponse = await fetch("/api/opportunity-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftToken: draftPayload.draftToken, email: contactEmail }),
      });
      const submissionPayload = await submissionResponse.json().catch(() => null) as {
        error?: string;
        ok?: boolean;
      } | null;
      if (!submissionResponse.ok || !submissionPayload?.ok) {
        throw new Error(submissionPayload?.error || "L’opportunité n’a pas pu être envoyée.");
      }
      window.sessionStorage.removeItem(LOCAL_DRAFT_KEY);
      onSubmitted();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "L’opportunité n’a pas pu être envoyée.",
      );
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-brand-blue/30 sm:items-center sm:p-6 sm:backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-submission-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="demaa-dialog-shadow relative max-h-[92svh] w-full overscroll-contain overflow-y-auto rounded-t-[1.5rem] bg-dema-paper px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 outline-none [scrollbar-gutter:stable] sm:max-w-2xl sm:rounded-[1.5rem] sm:p-8"
      >
        <button
          type="button"
          data-dialog-initial-focus
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 id="opportunity-submission-title" className="pr-12 text-2xl font-semibold tracking-[-0.03em] text-brand-blue">
          Soumettre une opportunité
        </h2>
        <p className="mt-2 text-sm leading-6 text-dema-muted">
          Décrivez le besoin. Demaa le vérifie avant publication.
        </p>

        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium text-brand-blue">
            Votre adresse e-mail
            <input
              name="email"
              type="email"
              required
              maxLength={160}
              autoComplete="email"
              defaultValue={initialEmail}
              className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest"
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-brand-blue">
            Titre
            <input name="title" required minLength={5} maxLength={140} defaultValue={restoredDraft.title} className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-brand-blue">
            Description
            <textarea name="summary" required minLength={30} maxLength={700} rows={3} defaultValue={restoredDraft.summary} className="mt-2 w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
          </label>
          <label className="text-sm font-medium text-brand-blue">
            Cadre
            <select name="opportunityType" defaultValue={restoredDraft.opportunityType || "mission"} className="mt-2 min-h-12 w-full rounded-xl border border-dema-line bg-white px-4 outline-none focus:border-dema-forest">
              {OPPORTUNITY_TYPES.map((type) => (
                <option key={type} value={type}>{OPPORTUNITY_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-brand-blue">
            Catégorie
            <input name="category" required maxLength={100} defaultValue={restoredDraft.category} placeholder="Ex. Marketing, BTP, Produit" className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" />
          </label>
          <details
            className="group sm:col-span-2 rounded-xl border border-dema-line bg-dema-paper/55"
            open={hasRestoredOptionalDetails}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-brand-blue [&::-webkit-details-marker]:hidden">
              <span>
                Ajouter des précisions
                <span className="ml-1 font-normal text-dema-muted">(facultatif)</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-dema-muted transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="hidden gap-4 border-t border-dema-line p-4 group-open:grid sm:grid-cols-2">
              <label className="text-sm font-medium text-brand-blue">
                Modalité
                <select name="workMode" defaultValue={restoredDraft.workMode || ""} className="mt-2 min-h-12 w-full rounded-xl border border-dema-line bg-white px-4 outline-none focus:border-dema-forest">
                  <option value="">À préciser</option>
                  {OPPORTUNITY_WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>{OPPORTUNITY_WORK_MODE_LABELS[mode]}</option>
                  ))}
                </select>
              </label>
              <Field name="geography" label="Zone" placeholder="France, ville ou pays" value={restoredDraft.geography} />
              <Field name="cadence" label="Rythme ou durée" placeholder="Ponctuel, 3 mois, récurrent…" value={restoredDraft.cadence} />
              <Field name="startTiming" label="Démarrage" placeholder="Dès que possible, à convenir…" value={restoredDraft.startTiming} />
              <Field name="compensation" label="Budget" placeholder="Seulement s’il est défini" value={restoredDraft.compensation} />
              <Field name="companyName" label="Entreprise" placeholder="Uniquement avec son accord" value={restoredDraft.companyName} />
              <label className="text-sm font-medium text-brand-blue sm:col-span-2">
                Attentes
                <textarea name="expectations" rows={3} defaultValue={restoredDraft.expectations} placeholder="Une attente par ligne, 4 maximum" className="mt-2 w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
              </label>
            </div>
          </details>
          {error ? (
            <p className="sm:col-span-2 text-sm text-red-700" role="alert">{error}</p>
          ) : null}
          <button
            disabled={status === "sending"}
            className="sm:col-span-2 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "sending" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {status === "sending" ? "Envoi…" : "Soumettre"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  value,
}: {
  label: string;
  name: string;
  placeholder: string;
  value?: string;
}) {
  return (
    <label className="text-sm font-medium text-brand-blue">
      {label}
      <input name={name} maxLength={140} defaultValue={value} placeholder={placeholder} className="mt-2 min-h-12 w-full rounded-xl border border-dema-line px-4 outline-none focus:border-dema-forest" />
    </label>
  );
}
