"use client";

import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { type FormEvent, useState } from "react";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { RepriseOpportunity } from "@/lib/reprise-opportunities";

type SubmissionState = "idle" | "submitting" | "success" | "error";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-wait disabled:opacity-65";

async function submitForm(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
  if (response.status !== 202 || body?.ok !== true) {
    throw new Error(body?.error || "Impossible d’envoyer la demande pour le moment.");
  }
}

function BuyerRequestForm({ opportunity }: { opportunity: RepriseOpportunity }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = `reprise-interest:${opportunity.id}`;
    setState("submitting");
    setError("");

    try {
      await submitForm("/api/reprise-interest", {
        attribution: getLeadAttributionPayload(),
        company: data.get("company"),
        email: data.get("email"),
        faxNumber: data.get("faxNumber"),
        idempotencyKey: getLeadSubmissionKey(flowKey),
        message: data.get("message"),
        name: data.get("name"),
        opportunityId: opportunity.id,
        phone: data.get("phone"),
      });
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "reprise_interest", systemSlug: opportunity.id });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mt-7 rounded-3xl bg-dema-sage/55 p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl font-medium">Demande envoyée.</h3>
        <p className="mt-2 text-sm leading-6 text-dema-muted">Demaa vous recontacte avant de transmettre votre demande à la personne concernée.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate>
      <h3 className="text-2xl font-normal tracking-[-0.035em] sm:col-span-2">Demander une mise en relation</h3>
      <label className="block text-sm font-medium sm:col-span-2">
        Votre projet en quelques mots
        <textarea className={`${inputClassName} min-h-28 resize-y`} name="message" maxLength={2000} placeholder="Votre expérience, ce que vous souhaitez comprendre et les informations dont vous avez besoin." required />
      </label>
      <label className="block text-sm font-medium">Prénom et nom<input className={inputClassName} name="name" autoComplete="name" maxLength={160} required /></label>
      <label className="block text-sm font-medium">Email<input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required /></label>
      <label className="block text-sm font-medium">Téléphone<input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
      <label className="block text-sm font-medium">Entreprise<input className={inputClassName} name="company" autoComplete="organization" maxLength={160} required /></label>
      <label className="hidden" aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
      {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
      <button className={`${primaryButtonClassName} w-full sm:col-span-2 sm:w-auto sm:justify-self-start`} disabled={state === "submitting"} type="submit">{state === "submitting" ? "Envoi…" : "Demander une mise en relation"}</button>
      <p className="text-xs leading-5 text-dema-muted sm:col-span-2">Vos informations servent uniquement à traiter cette demande. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-dema-line bg-dema-cream/40 p-4">
      <dt className="text-xs text-dema-muted">{label}</dt>
      <dd className="mt-2 text-sm font-medium leading-6 text-brand-blue">{value}</dd>
    </div>
  );
}

export default function RepriseOpportunityDetail({
  headingLevel = "h2",
  opportunity,
}: {
  headingLevel?: "h1" | "h2";
  opportunity: RepriseOpportunity;
}) {
  const Heading = headingLevel;

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</p>
      <Heading className="mt-3 text-3xl font-normal tracking-[-0.04em] sm:text-4xl">{opportunity.activity}</Heading>
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}</p>
      <dl className="mt-7 grid gap-3 sm:grid-cols-2">
        <Metric label="Chiffre d’affaires publié" value={opportunity.revenue ?? "Non disponible"} />
        <Metric label="EBE ou rentabilité publiée" value={opportunity.ebe ?? "Non disponible"} />
        <Metric label="Équipe publiée" value={opportunity.employees ?? "Non disponible"} />
        <Metric label="Prix demandé publié" value={opportunity.askingPrice ?? "Non disponible"} />
      </dl>
      <div className="mt-7 border-b border-dema-line pb-7">
        <h3 className="text-sm font-medium">Ce qui est communiqué</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-dema-muted">
          {opportunity.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" /><span>{highlight}</span></li>
          ))}
        </ul>
      </div>
      <BuyerRequestForm opportunity={opportunity} />
    </>
  );
}
