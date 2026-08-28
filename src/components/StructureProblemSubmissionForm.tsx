"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import {
  STRUCTURE_NEWSLETTER_NAME,
  STRUCTURE_PUBLICATION_CONSENT,
} from "@/lib/structure-newsletter-contract";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type ApiResponse = { error?: string; ok?: boolean } | null;

type ProblemForm = {
  companyActivity: string;
  consent: boolean;
  faxNumber: string;
  problem: string;
  professionalPage: string;
};

const EMPTY_PROBLEM_FORM: ProblemForm = {
  companyActivity: "",
  consent: false,
  faxNumber: "",
  problem: "",
  professionalPage: "",
};

function responseError(response: Response, payload: ApiResponse, fallback: string) {
  if (payload?.error) return payload.error;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Merci de réessayer plus tard.";
  }
  return fallback;
}

type StructureProblemSubmissionFormProps = {
  onClose?: () => void;
};

export default function StructureProblemSubmissionForm({
  onClose,
}: StructureProblemSubmissionFormProps) {
  const { email } = useCustomerIdentity();
  const [problemForm, setProblemForm] = useState(EMPTY_PROBLEM_FORM);
  const [problemSubmitting, setProblemSubmitting] = useState(false);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [problemEmail, setProblemEmail] = useState("");
  const [problemSent, setProblemSent] = useState(false);

  useEffect(() => {
    if (!email) return;
    setProblemEmail((current) => current || email);
  }, [email]);

  function updateProblemField<Field extends keyof ProblemForm>(
    field: Field,
    value: ProblemForm[Field],
  ) {
    setProblemForm((current) => ({ ...current, [field]: value }));
  }

  async function submitProblem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (problemSubmitting) return;

    setProblemError(null);
    setProblemSubmitting(true);
    const flowKey = "structure-problem";

    try {
      const response = await fetch("/api/structure-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          companyActivity: problemForm.companyActivity,
          consent: problemForm.consent,
          email: problemEmail,
          faxNumber: problemForm.faxNumber,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          problem: problemForm.problem,
          professionalPage: problemForm.professionalPage,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse;
      if (!response.ok || payload?.ok !== true) {
        setProblemError(responseError(
          response,
          payload,
          "Impossible d’envoyer votre proposition pour le moment. Merci de réessayer.",
        ));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setProblemForm(EMPTY_PROBLEM_FORM);
      setProblemSent(true);
      trackLeadConversion({ requestType: "structure_problem_submission" });
    } catch {
      setProblemError(
        "Impossible d’envoyer votre proposition pour le moment. Merci de réessayer.",
      );
    } finally {
      setProblemSubmitting(false);
    }
  }

  if (problemSent) {
    return (
      <div className="py-3 text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-serif text-3xl font-light tracking-[-0.03em] text-brand-blue">
          Merci, votre cas est proposé.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dema-muted">
          Si votre cas est retenu, l’équipe vous contactera pour organiser la
          session de 45 minutes. Vous recevrez ensuite la synthèse et validerez
          sa version anonymisée destinée à la newsletter.
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center sm:w-auto"
          >
            Fermer
          </button>
        ) : (
          <Link
            href="/modeles"
            className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center sm:w-auto"
          >
            Voir les modèles
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-dema-forest">
        Session de travail offerte
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2rem,6vw,2.6rem)] font-light leading-[1.02] tracking-[-0.035em] text-brand-blue">
        45 minutes pour structurer un problème concret
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-dema-muted">
        Si votre cas est retenu, nous le travaillons avec vous pendant 45
        minutes, puis nous vous envoyons une synthèse claire. Une version
        anonymisée que vous validez est ensuite partagée dans la newsletter
        {` ${STRUCTURE_NEWSLETTER_NAME}`}
      </p>

      <form className="mt-6 space-y-4" onSubmit={submitProblem} aria-busy={problemSubmitting}>
        <div>
          <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-problem">
            Sur quoi avez-vous besoin d’aide ?
          </label>
          <textarea
            id="structure-problem"
            className="demaa-textarea mt-2 min-h-28"
            value={problemForm.problem}
            onChange={(event) => updateProblemField("problem", event.target.value)}
            rows={5}
            required
            minLength={20}
            maxLength={4000}
            placeholder="Expliquez ce qui bloque aujourd’hui et ce que vous avez déjà essayé."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-company-activity">
            Votre entreprise ou activité
          </label>
          <input
            id="structure-company-activity"
            className="demaa-input mt-2"
            value={problemForm.companyActivity}
            onChange={(event) => updateProblemField("companyActivity", event.target.value)}
            autoComplete="organization"
            required
            maxLength={160}
            placeholder="Nom et activité de votre entreprise"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-professional-page">
            Votre site ou page professionnelle
          </label>
          <input
            id="structure-professional-page"
            className="demaa-input mt-2"
            type="url"
            value={problemForm.professionalPage}
            onChange={(event) => updateProblemField("professionalPage", event.target.value)}
            autoComplete="url"
            required
            maxLength={500}
            placeholder="https://votre-site.fr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-contact-email">
            Votre adresse e-mail
          </label>
          <input
            id="structure-contact-email"
            className="demaa-input mt-2"
            type="email"
            value={problemEmail}
            onChange={(event) => setProblemEmail(event.target.value)}
            autoComplete="email"
            required
            maxLength={160}
          />
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-dema-muted" htmlFor="structure-publication-consent">
          <input
            id="structure-publication-consent"
            type="checkbox"
            checked={problemForm.consent}
            onChange={(event) => updateProblemField("consent", event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-dema-forest"
            required
          />
          <span>{STRUCTURE_PUBLICATION_CONSENT.text}</span>
        </label>

        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="structure-fax-number">Fax</label>
          <input
            id="structure-fax-number"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={problemForm.faxNumber}
            onChange={(event) => updateProblemField("faxNumber", event.target.value)}
          />
        </div>

        {problemError ? (
          <p className="text-sm text-brand-coral" role="alert">
            {problemError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={problemSubmitting}
          className="demaa-primary-button inline-flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
        >
          {problemSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {problemSubmitting ? "Envoi…" : "Proposer mon cas"}
        </button>
      </form>
    </>
  );
}
