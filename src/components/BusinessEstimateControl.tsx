"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const defaultButtonClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";

function EstimateDialog({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = "business-estimate:initial";
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
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (response.status !== 202 || body?.ok !== true) throw new Error(body?.error || "Impossible d’envoyer la demande pour le moment.");
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "business_estimate_request" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  return (
    <DirectoryDetailDialogShell ariaLabel="Parler de votre entreprise" maxWidthClassName="max-w-2xl" onClose={onClose}>
      {state === "success" ? (
        <div className="py-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-forest text-dema-paper"><Check className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Demande envoyée.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-dema-muted">Nous vous recontactons pour fixer l’entretien de 30 minutes et préparer les informations utiles.</p></div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Entretien offert · 30 minutes</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Parlons de votre entreprise.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-dema-muted">Vous n’avez pas besoin d’avoir tous les chiffres. Laissez-nous vos coordonnées et nous préparerons le reste ensemble pendant l’entretien.</p>
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate>
            <label className="block text-sm font-medium">Email<input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Téléphone <span className="font-normal text-dema-muted">(facultatif)</span><input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
            <label className="block text-sm font-medium">Entreprise <span className="font-normal text-dema-muted">(facultatif)</span><input className={inputClassName} name="company" autoComplete="organization" maxLength={160} /></label>
            <label className="block text-sm font-medium">Prénom et nom<input className={inputClassName} name="name" autoComplete="name" maxLength={160} required /></label>
            <label className="block text-sm font-medium sm:col-span-2">En quelques mots <span className="font-normal text-dema-muted">(facultatif)</span><textarea className={`${inputClassName} min-h-24 resize-y`} name="message" maxLength={1000} placeholder="Ce que vous souhaitez préparer ou comprendre." /></label>
            <label className="hidden" aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
            {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
            <div className="sm:col-span-2"><button className={`${defaultButtonClassName} w-full sm:w-auto`} disabled={state === "submitting"} type="submit">{state === "submitting" ? "Envoi…" : "Prendre rendez-vous"}</button></div>
            <p className="text-xs leading-5 text-dema-muted sm:col-span-2">Vos informations servent uniquement à préparer cet échange. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}

export default function BusinessEstimateControl({ className = defaultButtonClassName, label = "Estimer mon entreprise" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>{open ? createPortal(<EstimateDialog onClose={() => setOpen(false)} />, document.body) : null}</>;
}
