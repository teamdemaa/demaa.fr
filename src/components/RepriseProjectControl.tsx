"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const defaultButtonClassName =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";

function RepriseProjectDialog({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = "reprise-project:initial";
    setState("submitting");
    setError("");

    try {
      const response = await fetch("/api/reprise-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: data.get("activity"),
          attribution: getLeadAttributionPayload(),
          budget: data.get("budget"),
          email: data.get("email"),
          faxNumber: data.get("faxNumber"),
          idempotencyKey: getLeadSubmissionKey(flowKey),
          message: data.get("message"),
          name: data.get("name"),
          phone: data.get("phone"),
          region: data.get("region"),
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        ok?: boolean;
      } | null;
      if (response.status !== 202 || body?.ok !== true)
        throw new Error(
          body?.error || "Impossible d’envoyer la demande pour le moment.",
        );
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "reprise_project_request" });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d’envoyer la demande.",
      );
      setState("error");
    }
  }

  return (
    <DirectoryDetailDialogShell
      ariaLabel="Confier ma recherche d’entreprise"
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
    >
      {state === "success" ? (
        <div className="py-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">
            Votre recherche est bien reçue.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-dema-muted">
            Nous vous recontactons pour préciser vos critères avant de
            commencer la recherche.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
            Recherche d’entreprise
          </p>
          <h2 className="mt-3 text-3xl font-normal tracking-[-0.04em] sm:text-4xl">
            Décrivez l’entreprise que vous souhaitez reprendre.
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <label className="block text-sm font-medium sm:col-span-2">
              Activité recherchée
              <input
                className={inputClassName}
                name="activity"
                maxLength={240}
                placeholder="Par exemple : maintenance, cabinet de conseil ou logiciel métier"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Région
              <input
                className={inputClassName}
                name="region"
                maxLength={160}
                placeholder="Une ou plusieurs régions"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Budget maximal
              <input
                className={inputClassName}
                name="budget"
                inputMode="numeric"
                maxLength={80}
                placeholder="Par exemple : 500 000 €"
                required
              />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Votre projet en quelques mots
              <textarea
                className={`${inputClassName} min-h-28 resize-y`}
                name="message"
                maxLength={1600}
                placeholder="Votre expérience, votre calendrier et les critères importants pour vous."
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Prénom et nom
              <input
                className={inputClassName}
                name="name"
                autoComplete="name"
                maxLength={160}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                className={inputClassName}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={160}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Téléphone
              <input
                className={inputClassName}
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                required
              />
            </label>
            <label className="hidden" aria-hidden="true">
              Fax
              <input name="faxNumber" tabIndex={-1} autoComplete="off" />
            </label>
            {error ? (
              <p
                className="text-sm font-medium text-red-700 sm:col-span-2"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <button
                className={`${defaultButtonClassName} w-full sm:w-auto`}
                disabled={state === "submitting"}
                type="submit"
              >
                {state === "submitting"
                  ? "Envoi…"
                  : "Confier ma recherche à Demaa"}
              </button>
            </div>
            <p className="text-xs leading-5 text-dema-muted sm:col-span-2">
              Vos informations servent uniquement à traiter cette demande.
              Consultez notre{" "}
              <Link
                href="/politique-de-confidentialite"
                className="underline underline-offset-2"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}

export default function RepriseProjectControl({
  className = defaultButtonClassName,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Confier ma recherche
      </button>
      {open
        ? createPortal(
            <RepriseProjectDialog onClose={() => setOpen(false)} />,
            document.body,
          )
        : null}
    </>
  );
}
