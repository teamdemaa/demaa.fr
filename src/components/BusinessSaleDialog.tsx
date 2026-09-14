"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { BusinessValuationInput, BusinessValuationResult } from "@/lib/business-valuation";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const buttonClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";

export default function BusinessSaleDialog({
  onClose,
  valuationInput,
  valuationResult,
}: {
  onClose: () => void;
  valuationInput?: BusinessValuationInput;
  valuationResult?: BusinessValuationResult;
}) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = "business-sale:initial";
    setState("submitting");
    setError("");
    try {
      const response = await fetch("/api/business-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company: data.get("company"),
          email: data.get("email"),
          faxNumber: data.get("faxNumber"),
          idempotencyKey: getLeadSubmissionKey(flowKey),
          message: data.get("message"),
          name: data.get("name"),
          phone: data.get("phone"),
          valuationInput,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (response.status !== 202 || body?.ok !== true) throw new Error(body?.error || "Impossible d’envoyer la demande pour le moment.");
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "business_sale_request" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  return (
    <DirectoryDetailDialogShell ariaLabel="Vendre mon entreprise" maxWidthClassName="max-w-2xl" onClose={onClose}>
      {state === "success" ? (
        <div className="py-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-forest text-dema-paper"><Check className="h-5 w-5" aria-hidden="true" /></span>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Demande envoyée.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-dema-muted">Nous vous recontactons pour comprendre votre projet et préparer la prochaine étape.</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Projet de transmission</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Vendre mon entreprise.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-dema-muted">Décrivez-nous d’abord votre entreprise et votre projet de transmission.</p>
          {valuationResult ? (
            <div className="mt-6 rounded-2xl bg-dema-sage/55 p-4 text-sm text-brand-blue">
              <span className="block text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">Estimation jointe</span>
              <span className="mt-2 block">{formatCurrency(valuationResult.low)} à {formatCurrency(valuationResult.high)}</span>
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate>
            <label className="block text-sm font-medium sm:col-span-2">Votre entreprise et votre projet en quelques mots<textarea className={`${inputClassName} min-h-28 resize-y`} name="message" maxLength={1200} placeholder="Par exemple : activité, taille de l’équipe, chiffre d’affaires approximatif et projet de transmission." required /></label>
            <label className="block text-sm font-medium">Prénom et nom<input className={inputClassName} name="name" autoComplete="name" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Email<input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Téléphone<input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
            <label className="block text-sm font-medium">Entreprise<input className={inputClassName} name="company" autoComplete="organization" maxLength={160} required /></label>
            <label className="hidden" aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
            {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
            <div className="sm:col-span-2"><button className={`${buttonClassName} w-full sm:w-auto`} disabled={state === "submitting"} type="submit">{state === "submitting" ? "Envoi…" : "Envoyer ma demande"}</button></div>
            <p className="text-xs leading-5 text-dema-muted sm:col-span-2">Vos informations servent uniquement à traiter votre demande. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
