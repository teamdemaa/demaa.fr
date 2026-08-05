"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type {
  OperationalSystemDeliveryRequest,
  OperationalSystemDeliverySuccess,
} from "@/lib/operational-system-delivery-contract";
import type { SystemResource } from "@/lib/system-resource-catalog";

type OperationalSystemCopyRequestModalProps = {
  onClose: () => void;
  resource: SystemResource;
  systemSlug: string;
};

type DeliveryErrorPayload = {
  error?: string;
};

type DeliveryPayload =
  | DeliveryErrorPayload
  | OperationalSystemDeliverySuccess
  | null;

function isSuccessfulPayload(
  payload: DeliveryPayload,
): payload is OperationalSystemDeliverySuccess {
  return Boolean(payload && "ok" in payload && payload.ok === true);
}

function getErrorMessage(response: Response, payload: DeliveryPayload) {
  const serverError =
    payload && "error" in payload ? payload.error : undefined;

  if (response.status === 400 && serverError) {
    return serverError;
  }
  if (response.status === 404) {
    return "Cette ressource n’est pas disponible pour le moment.";
  }
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }

  return "Impossible d’envoyer cette ressource pour le moment. Réessayez dans quelques instants.";
}

export default function OperationalSystemCopyRequestModal({
  onClose,
  resource,
  systemSlug,
}: OperationalSystemCopyRequestModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const trackedOpenRef = useRef(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = dialogRef.current;

    function getFocusableElements() {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    emailInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!trackedOpenRef.current) {
      trackedOpenRef.current = true;
      trackSystemJourneyEvent("system_copy_form_opened", {
        resourceSlug: resource.resourceSlug,
        systemSlug,
      });
    }
  }, [resource.resourceSlug, systemSlug]);

  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Merci de renseigner votre adresse e-mail.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer une adresse e-mail valide.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    trackSystemJourneyEvent("system_copy_form_submitted", {
      resourceSlug: resource.resourceSlug,
      systemSlug,
    });

    const flowKey = `resource:${resource.resourceSlug}:${systemSlug}`;
    const requestPayload: OperationalSystemDeliveryRequest = {
      attribution: getLeadAttributionPayload(),
      email: normalizedEmail,
      idempotencyKey: getLeadSubmissionKey(flowKey),
      marketingConsent,
      resourceSlug: resource.resourceSlug,
      systemSlug,
      website,
    };

    try {
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const payload = (await response.json().catch(() => null)) as DeliveryPayload;

      if (!response.ok || !isSuccessfulPayload(payload)) {
        setError(getErrorMessage(response, payload));
        trackSystemJourneyEvent("system_copy_form_failed", {
          statusCode: response.status,
          resourceSlug: resource.resourceSlug,
          systemSlug,
        });
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccess(true);
      trackLeadConversion({
        requestType: "system_kit_request",
        systemSlug,
      });
    } catch {
      setError(
        "Impossible d’envoyer cette ressource pour le moment. Réessayez dans quelques instants.",
      );
      trackSystemJourneyEvent("system_copy_form_failed", {
        resourceSlug: resource.resourceSlug,
        systemSlug,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-blue/35 px-4 py-4 backdrop-blur-sm sm:py-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[48rem] overflow-y-auto rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-copy-modal-title"
        aria-describedby="system-copy-modal-description"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-paper/90 text-brand-blue transition hover:bg-dema-sage hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="flex min-h-[14rem] items-center justify-center bg-dema-sage/45 p-5 sm:min-h-[18rem] sm:p-7 md:min-h-[25rem]">
            <Image
              src={resource.preview.src}
              alt={resource.preview.alt}
              width={resource.preview.width}
              height={resource.preview.height}
              sizes="(max-width: 767px) calc(100vw - 72px), 340px"
              className="h-auto w-full rounded-[0.8rem] shadow-[0_14px_35px_rgba(23,35,29,0.1)]"
            />
          </div>

          <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8">
            {isSuccess ? (
              <div
                ref={successRef}
                className="outline-none"
                role="status"
                tabIndex={-1}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="system-copy-modal-title"
                  className="mt-5 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
                >
                  Votre ressource est dans votre boîte mail.
                </h2>
                <p
                  id="system-copy-modal-description"
                  className="mt-3 text-sm leading-relaxed text-dema-muted"
                >
                  {resource.successDescription}
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {resource.formatLabel}
                </p>
                <h2
                  id="system-copy-modal-title"
                  className="mt-3 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
                >
                  {resource.title}
                </h2>
                <p
                  id="system-copy-modal-description"
                  className="mt-3 text-sm leading-relaxed text-dema-muted"
                >
                  {resource.description}
                </p>
                <p
                  data-resource-preview-disclosure
                  className="mt-3 text-xs leading-relaxed text-dema-muted"
                >
                  {resource.previewDisclosure}
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}
                  noValidate
                >
                  <label
                    className="block text-sm font-medium text-brand-blue"
                    htmlFor="system-copy-email"
                  >
                    Adresse e-mail
                  </label>
                  <input
                    ref={emailInputRef}
                    id="system-copy-email"
                    name="email"
                    className="demaa-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />

                  <div
                    className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="system-copy-website">Site internet</label>
                    <input
                      id="system-copy-website"
                      name="website"
                      type="text"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-xl bg-dema-sage/45 px-3 py-3 text-xs leading-relaxed text-dema-muted">
                    <input
                      name="marketingConsent"
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(event) => setMarketingConsent(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-dema-forest"
                    />
                    <span>J’accepte de recevoir les conseils et actualités Demaa par e-mail. Facultatif.</span>
                  </label>

                  {error ? (
                    <p className="text-sm text-brand-coral" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="demaa-primary-button mt-3 inline-flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : null}
                    {isSubmitting ? "Envoi…" : resource.deliveryLabel}
                  </button>

                  <p className="text-center text-xs leading-relaxed text-dema-muted">
                    Cette adresse est utilisée pour vous envoyer la ressource demandée.{" "}
                    <Link
                      href="/politique-de-confidentialite"
                      className="font-medium text-dema-forest underline underline-offset-2"
                    >
                      Politique de confidentialité
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
