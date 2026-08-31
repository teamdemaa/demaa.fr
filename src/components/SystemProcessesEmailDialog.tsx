"use client";

import { Check, LoaderCircle, Mail } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type Status = "idle" | "sending" | "success" | "error";

type ApiPayload = { error?: string; ok?: boolean } | null;

export default function SystemProcessesEmailDialog({
  onClose,
  systemName,
  systemSlug,
}: {
  onClose: () => void;
  systemName: string;
  systemSlug: string;
}) {
  const { email: customerEmail } = useCustomerIdentity();
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const flowKey = `system-processes-pdf:${systemSlug}`;
  const email = emailInput ?? customerEmail ?? "";

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/system-processes/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          systemSlug,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ApiPayload;
      if (!response.ok || payload?.ok !== true) {
        setStatus("error");
        setError(
          payload?.error ??
          "Impossible d’envoyer le PDF pour le moment. Merci de réessayer.",
        );
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Impossible d’envoyer le PDF pour le moment. Merci de réessayer.");
    }
  }

  return (
    <DirectoryDetailDialogShell
      ariaLabel={`Recevoir la checklist des processus métier : ${systemName}`}
      maxWidthClassName="max-w-md"
      onClose={onClose}
    >
      {status === "success" ? (
        <div ref={successRef} className="outline-none" role="status" tabIndex={-1}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 pr-10 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            Le PDF vient de vous être envoyé.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Vérifiez votre boîte de réception. La checklist de {systemName} est jointe à l’e-mail.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center"
          >
            Fermer
          </button>
        </div>
      ) : (
        <>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 pr-10 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            Recevoir cette checklist <span className="whitespace-nowrap">par e-mail</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Nous vous envoyons le PDF des processus métier pour {systemName}. Cet envoi ne vous inscrit à aucune communication marketing.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
            aria-busy={status === "sending"}
          >
            <div
              className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="system-processes-website">Site internet</label>
              <input
                id="system-processes-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            <label className="block text-sm font-medium text-brand-blue" htmlFor="system-processes-email">
              Adresse e-mail
            </label>
            <input
              id="system-processes-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="vous@entreprise.fr"
              className="min-h-12 w-full rounded-xl border border-dema-line bg-dema-paper px-4 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/40"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="demaa-primary-button inline-flex min-h-12 w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              {status === "sending" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "sending" ? "Envoi en cours…" : "Recevoir le PDF"}
            </button>
            {error ? (
              <p className="text-sm leading-relaxed text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}
