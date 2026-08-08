"use client";

import { Check, LoaderCircle, Mic } from "lucide-react";
import { type FormEvent, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
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
  STRUCTURE_NEWSLETTER_PROMISE,
  STRUCTURE_PUBLICATION_CONSENT,
  STRUCTURE_VOICE_SUBMISSION,
} from "@/lib/structure-newsletter-contract";

type ApiResponse = { error?: string; ok?: boolean } | null;

type ProblemForm = {
  companyActivity: string;
  consent: boolean;
  email: string;
  faxNumber: string;
  problem: string;
  professionalPage: string;
};

const EMPTY_PROBLEM_FORM: ProblemForm = {
  companyActivity: "",
  consent: false,
  email: "",
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

export default function StructureNewsletterBlock() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterHoneypot, setNewsletterHoneypot] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProblemOpen, setIsProblemOpen] = useState(false);
  const [problemForm, setProblemForm] = useState(EMPTY_PROBLEM_FORM);
  const [problemSubmitting, setProblemSubmitting] = useState(false);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [problemSent, setProblemSent] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newsletterSubmitting) return;

    setNewsletterError(null);
    setNewsletterSubmitting(true);
    try {
      const response = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail,
          website: newsletterHoneypot,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse;
      if (!response.ok || payload?.ok !== true) {
        setNewsletterError(responseError(
          response,
          payload,
          "L’inscription est momentanément indisponible. Merci de réessayer.",
        ));
        return;
      }

      setNewsletterEmail("");
      setIsSubscribed(true);
    } catch {
      setNewsletterError(
        "L’inscription est momentanément indisponible. Merci de réessayer.",
      );
    } finally {
      setNewsletterSubmitting(false);
    }
  }

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
          email: problemForm.email,
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
          "Impossible d’envoyer votre problématique pour le moment. Merci de réessayer.",
        ));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setProblemForm(EMPTY_PROBLEM_FORM);
      setProblemSent(true);
      trackLeadConversion({ requestType: "structure_problem_submission" });
    } catch {
      setProblemError(
        "Impossible d’envoyer votre problématique pour le moment. Merci de réessayer.",
      );
    } finally {
      setProblemSubmitting(false);
    }
  }

  function closeProblem() {
    setIsProblemOpen(false);
    setProblemError(null);
  }

  return (
    <>
      <section
        aria-labelledby="structure-newsletter-title"
        className="border-t border-dema-line/80 pt-8 sm:pt-9"
      >
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(15rem,0.92fr)_minmax(22rem,1.08fr)] lg:gap-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-dema-muted">
              Newsletter
            </p>
            <h2
              id="structure-newsletter-title"
              className="mt-1 font-serif text-[2rem] font-light italic leading-none tracking-[-0.035em] text-dema-forest"
            >
              {STRUCTURE_NEWSLETTER_NAME}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-dema-muted">
              {STRUCTURE_NEWSLETTER_PROMISE}
            </p>
          </div>

          <div>
            {isSubscribed ? (
              <div
                className="flex min-h-13 items-center rounded-xl border border-dema-forest/20 bg-dema-sage/55 px-4 text-sm text-dema-forest"
                role="status"
              >
                Merci, votre inscription à Structure est confirmée.
              </div>
            ) : (
              <form onSubmit={subscribe} aria-busy={newsletterSubmitting}>
                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="structure-newsletter-website">Site internet</label>
                  <input
                    id="structure-newsletter-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={newsletterHoneypot}
                    onChange={(event) => setNewsletterHoneypot(event.target.value)}
                  />
                </div>
                <div className="grid overflow-hidden rounded-xl border border-dema-line bg-dema-paper focus-within:border-dema-forest/35 focus-within:ring-2 focus-within:ring-dema-forest/10 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="sr-only" htmlFor="structure-newsletter-email">
                    Votre adresse e-mail
                  </label>
                  <input
                    id="structure-newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Votre adresse e-mail"
                    className="min-h-13 min-w-0 bg-dema-paper px-4 text-sm text-brand-blue outline-none placeholder:text-dema-muted/65"
                    aria-describedby={newsletterError ? "structure-newsletter-error" : undefined}
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="inline-flex min-h-13 items-center justify-center gap-2 border-t border-dema-forest/15 bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-wait disabled:opacity-65 sm:border-l sm:border-t-0"
                  >
                    {newsletterSubmitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : null}
                    {newsletterSubmitting ? "Inscription…" : "S’abonner"}
                  </button>
                </div>
                {newsletterError ? (
                  <p id="structure-newsletter-error" className="mt-2 text-sm text-brand-coral" role="alert">
                    {newsletterError}
                  </p>
                ) : null}
              </form>
            )}

            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dema-muted">
              <span>5 min de lecture · Désinscription en un clic</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  setProblemSent(false);
                  setIsProblemOpen(true);
                }}
                className="font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4 transition hover:decoration-dema-forest"
              >
                Proposer ma problématique
              </button>
            </p>
          </div>
        </div>
      </section>

      {isProblemOpen ? (
        <DirectoryDetailDialogShell
          ariaLabel="Proposer une problématique à Structure"
          maxWidthClassName="max-w-2xl"
          onClose={closeProblem}
        >
          {problemSent ? (
            <div className="py-3 text-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-serif text-3xl font-light tracking-[-0.03em] text-brand-blue">
                Merci pour votre confiance.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dema-muted">
                Votre situation a bien été transmise. Si elle est sélectionnée,
                l’équipe vous contactera avant toute publication.
              </p>
              <button
                type="button"
                onClick={closeProblem}
                className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center sm:w-auto"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-dema-forest">
                {STRUCTURE_NEWSLETTER_NAME}
              </p>
              <h2 className="mt-2 font-serif text-[clamp(2rem,6vw,2.6rem)] font-light leading-[1.02] tracking-[-0.035em] text-brand-blue">
                Quelle problématique freine votre entreprise ?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-dema-muted">
                Demaa étudie les situations reçues et peut en construire un cas
                utile à tous. Toutes les propositions ne pourront pas être
                traitées. Si la vôtre est retenue, l’équipe vous contactera avant
                toute publication.
              </p>

              <form className="mt-6 space-y-4" onSubmit={submitProblem} aria-busy={problemSubmitting}>
                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-company-activity">
                    Votre entreprise ou activité
                  </label>
                  <input
                    id="structure-company-activity"
                    data-dialog-initial-focus
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
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-problem">
                    Votre problématique
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

                <div
                  className="rounded-xl border border-dema-line bg-dema-sage/30 p-4"
                  data-structure-voice-status={STRUCTURE_VOICE_SUBMISSION.enabled ? "enabled" : "disabled"}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-paper text-dema-muted">
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-brand-blue">
                        Message vocal · bientôt disponible
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-dema-muted">
                        L’enregistrement de {STRUCTURE_VOICE_SUBMISSION.maximumDurationSeconds / 60} minutes sera activé après la mise en
                        place de son stockage sécurisé et de sa suppression
                        automatique à {STRUCTURE_VOICE_SUBMISSION.recordingRetentionDays} jours.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="structure-contact-email">
                    Votre adresse e-mail
                  </label>
                  <input
                    id="structure-contact-email"
                    className="demaa-input mt-2"
                    type="email"
                    value={problemForm.email}
                    onChange={(event) => updateProblemField("email", event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={160}
                    placeholder="vous@entreprise.fr"
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
                  {problemSubmitting ? "Envoi…" : "Envoyer ma problématique"}
                </button>
              </form>
            </>
          )}
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
