"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { SpecialistOffer } from "@/lib/specialist-offers";

const COACH_BUSINESS_OFFER: SpecialistOffer = "coach_business";

export default function CoachBusinessCallbackForm() {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [situation, setSituation] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company.trim() || phone.replace(/\D/g, "").length < 8) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const flowKey = `coach-business:${COACH_BUSINESS_OFFER}`;
    try {
      const response = await fetch("/api/coaching-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          message: situation,
          offer: COACH_BUSINESS_OFFER,
          phone,
          requestKind: "accompaniment",
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

  if (status === "sent") {
    return (
      <div className="py-6 text-center" role="status">
        <Check className="mx-auto h-7 w-7 text-dema-forest" aria-hidden="true" />
        <p className="mt-3 font-medium text-brand-blue">Demande reçue</p>
        <p className="mt-1 text-sm text-dema-muted">L’équipe vous rappellera pour vérifier le besoin et le matching.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 border-t border-dema-line/80 pt-5">
      <label className="block text-sm font-medium text-brand-blue">Entreprise
        <input required value={company} onChange={(event) => setCompany(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-dema-line px-3 outline-none focus:border-dema-forest" />
      </label>
      <label className="mt-3 block text-sm font-medium text-brand-blue">Numéro WhatsApp
        <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+33 6 12 34 56 78" className="mt-2 min-h-11 w-full rounded-xl border border-dema-line px-3 outline-none focus:border-dema-forest" />
      </label>
      <label className="mt-3 block text-sm font-medium text-brand-blue">Priorité <span className="font-normal text-dema-muted">(facultatif)</span>
        <textarea value={situation} onChange={(event) => setSituation(event.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-dema-line px-3 py-2 outline-none focus:border-dema-forest" />
      </label>
      {status === "error" ? <p className="mt-2 text-xs text-red-700" role="alert">Vérifiez vos informations puis réessayez.</p> : null}
      <button disabled={status === "sending"} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-4 text-sm font-semibold text-white disabled:opacity-60">
        {status === "sending" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {status === "sending" ? "Envoi…" : "Être rappelé(e)"}
      </button>
    </form>
  );
}
