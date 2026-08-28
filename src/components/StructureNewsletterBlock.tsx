"use client";

import { LoaderCircle } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import StructureProblemSubmissionForm from "@/components/StructureProblemSubmissionForm";
import {
  STRUCTURE_NEWSLETTER_NAME,
  STRUCTURE_NEWSLETTER_PROMISE,
} from "@/lib/structure-newsletter-contract";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type ApiResponse = { error?: string; ok?: boolean } | null;

function responseError(response: Response, payload: ApiResponse, fallback: string) {
  if (payload?.error) return payload.error;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Merci de réessayer plus tard.";
  }
  return fallback;
}

export default function StructureNewsletterBlock() {
  const { email } = useCustomerIdentity();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterHoneypot, setNewsletterHoneypot] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProblemOpen, setIsProblemOpen] = useState(false);

  const subscribe = useCallback(async () => {
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

      setIsSubscribed(true);
    } catch {
      setNewsletterError(
        "L’inscription est momentanément indisponible. Merci de réessayer.",
      );
    } finally {
      setNewsletterSubmitting(false);
    }
  }, [newsletterEmail, newsletterHoneypot, newsletterSubmitting]);

  useEffect(() => {
    if (!email) return;
    setNewsletterEmail((current) => current || email);
  }, [email]);

  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent === "structure-problem") {
      const timeout = window.setTimeout(() => {
        setIsProblemOpen(true);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, []);

  function closeProblem() {
    setIsProblemOpen(false);
  }

  return (
    <>
      <section
        aria-labelledby="structure-newsletter-title"
        className="mx-auto w-full max-w-4xl border-t border-dema-line/80 pt-8 sm:pt-9"
      >
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(15rem,0.92fr)_minmax(22rem,1.08fr)] lg:gap-10">
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
                Merci, votre inscription à Structurer est confirmée.
              </div>
            ) : (
              <form
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  void subscribe();
                }}
                aria-busy={newsletterSubmitting}
              >
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
                <div className="flex overflow-hidden rounded-xl border border-dema-line bg-dema-paper focus-within:border-dema-forest/45">
                  <label className="sr-only" htmlFor="structure-newsletter-email">Adresse e-mail</label>
                  <input
                    id="structure-newsletter-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Votre adresse e-mail"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-brand-blue outline-none"
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-wait disabled:opacity-65"
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
                  setIsProblemOpen(true);
                }}
                className="font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4 transition hover:decoration-dema-forest"
              >
                Proposer mon cas
              </button>
            </p>
          </div>
        </div>
      </section>

      {isProblemOpen ? (
        <DirectoryDetailDialogShell
          ariaLabel="Proposer un cas pour une session Structurer"
          maxWidthClassName="max-w-2xl"
          onClose={closeProblem}
        >
          <StructureProblemSubmissionForm onClose={closeProblem} />
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
