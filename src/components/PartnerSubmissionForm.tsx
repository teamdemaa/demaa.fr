"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";
import {
  MAX_PARTNER_SELECTED_SYSTEMS,
  PARTNER_SUBMISSION_CONSENT_TEXT,
  type PartnerSubmissionRequest,
} from "@/lib/partner-submission-contract";

type SystemOption = Readonly<{
  name: string;
  slug: string;
}>;

type PartnerSubmissionFormProps = Readonly<{
  systems: readonly SystemOption[];
}>;

type FormStep = 1 | 2 | 3;

const steps: ReadonlyArray<Readonly<{ label: string; step: FormStep }>> = [
  { step: 1, label: "La solution" },
  { step: 2, label: "Les métiers" },
  { step: 3, label: "Votre contact" },
];

const fieldClassName =
  "mt-2 w-full rounded-xl border border-dema-line bg-white px-4 py-3.5 text-sm font-normal text-brand-blue shadow-[0_3px_12px_rgba(23,35,29,0.025)] outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/35 focus:ring-2 focus:ring-dema-forest/10";

const labelClassName = "block text-sm font-medium text-brand-blue";

type SubmissionResponse = Readonly<{
  error?: string;
  ok?: boolean;
}> | null;

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export default function PartnerSubmissionForm({
  systems,
}: PartnerSubmissionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<FormStep>(1);
  const [query, setQuery] = useState("");
  const [selectedSystemSlugs, setSelectedSystemSlugs] = useState<string[]>([]);
  const [fax, setFax] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const systemsBySlug = useMemo(
    () => new Map(systems.map((system) => [system.slug, system])),
    [systems],
  );
  const filteredSystems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return systems.slice(0, 12);

    return systems
      .filter((system) => normalizeSearchValue(system.name).includes(normalizedQuery))
      .slice(0, 12);
  }, [query, systems]);

  function toggleSystem(slug: string) {
    setFormError(null);
    setSelectedSystemSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((selectedSlug) => selectedSlug !== slug);
      }
      if (current.length >= MAX_PARTNER_SELECTED_SYSTEMS) {
        setFormError(
          `Vous pouvez sélectionner jusqu’à ${MAX_PARTNER_SELECTED_SYSTEMS} métiers.`,
        );
        return current;
      }
      return [...current, slug];
    });
  }

  function getFormValue(name: string) {
    const value = formRef.current
      ? new FormData(formRef.current).get(name)
      : null;
    return typeof value === "string" ? value.trim() : "";
  }

  function openSystemsStep() {
    const description = getFormValue("description");
    if (
      !getFormValue("solutionName")
      || !getFormValue("website")
      || !getFormValue("solutionType")
      || description.length < 20
    ) {
      setFormError(
        "Complétez la présentation de votre solution avant de choisir les métiers.",
      );
      return;
    }

    setFormError(null);
    setStep(2);
  }

  function openContactStep() {
    if (selectedSystemSlugs.length === 0) {
      setFormError("Sélectionnez au moins un métier concerné.");
      return;
    }

    setFormError(null);
    setStep(3);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const fullName = getFormValue("fullName");
    const email = getFormValue("email");
    const company = getFormValue("company");
    const consent = new FormData(event.currentTarget).get("consent") === "on";

    if (!fullName || !email || !company || !consent) {
      setFormError(
        "Complétez vos coordonnées et acceptez l’utilisation de ces informations.",
      );
      return;
    }
    if (!isValidEmail(email)) {
      setFormError("Renseignez une adresse e-mail valide.");
      return;
    }

    const flowKey = "partner-solution-submission";
    const payload: PartnerSubmissionRequest = {
      attribution: getLeadAttributionPayload(),
      company,
      consent,
      description: getFormValue("description"),
      email,
      fax,
      fullName,
      idempotencyKey: getLeadSubmissionKey(flowKey),
      selectedSystemSlugs,
      solutionName: getFormValue("solutionName"),
      solutionType: getFormValue("solutionType") as PartnerSubmissionRequest["solutionType"],
      website: getFormValue("website"),
    };

    setFormError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/partner-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as SubmissionResponse;

      if (!response.ok || !result?.ok) {
        setFormError(
          result?.error
            || "Impossible d’envoyer votre proposition pour le moment. Réessayez.",
        );
        return;
      }

      clearLeadSubmissionKey(flowKey);
      trackLeadConversion({ requestType: "partner_solution_submission" });
      setIsSuccess(true);
    } catch {
      setFormError(
        "Impossible d’envoyer votre proposition pour le moment. Réessayez.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <section
        className="mt-10 rounded-[1.5rem] border border-dema-line/80 bg-dema-paper px-6 py-10 text-center shadow-[0_18px_55px_rgba(23,35,29,0.045)] sm:mt-12 sm:px-10 sm:py-14"
        role="status"
      >
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.025em] text-brand-blue">
          Proposition envoyée
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-6 text-dema-muted">
          Merci. L’équipe Demaa va étudier votre solution et sa pertinence pour les métiers
          sélectionnés. Nous vous recontacterons si nous avons besoin de précisions.
        </p>
        <Link
          href="/systemes"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-dema-line bg-white px-5 py-3 text-sm font-medium text-dema-forest transition hover:border-dema-forest/25 hover:bg-dema-sage/40"
        >
          Voir les systèmes métier
        </Link>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      aria-labelledby="partner-form-title"
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
      noValidate
      className="mt-10 overflow-hidden rounded-[1.5rem] border border-dema-line/80 bg-dema-paper shadow-[0_18px_55px_rgba(23,35,29,0.045)] sm:mt-12"
    >
      <div className="border-b border-dema-line px-6 py-6 sm:px-9 sm:py-8">
        <h2
          id="partner-form-title"
          className="text-2xl font-light tracking-[-0.025em] text-brand-blue sm:text-[1.75rem]"
        >
          Présentez-nous votre solution
        </h2>
        <p className="mt-2 max-w-xl text-sm font-light leading-6 text-dema-muted">
          Trois étapes courtes pour nous aider à la positionner au bon endroit.
        </p>

        <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Étapes du formulaire">
          {steps.map((item) => {
            const isCurrent = item.step === step;
            const isComplete = item.step < step;
            return (
              <li key={item.step}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.step <= step) {
                      setFormError(null);
                      setStep(item.step);
                    }
                  }}
                  disabled={item.step > step}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex w-full items-center gap-2 border-t-2 pt-3 text-left text-xs transition disabled:cursor-default sm:text-sm ${
                    isCurrent
                      ? "border-dema-forest font-medium text-dema-forest"
                      : isComplete
                        ? "border-dema-forest/35 font-normal text-brand-blue"
                        : "border-dema-line font-light text-dema-muted"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                      isCurrent || isComplete
                        ? "bg-dema-sage text-dema-forest"
                        : "bg-dema-cream text-dema-muted"
                    }`}
                    aria-hidden="true"
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : item.step}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="px-6 py-8 sm:px-9 sm:py-10">
        <section hidden={step !== 1} aria-label="La solution">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Nom
              <input
                name="solutionName"
                type="text"
                placeholder="Nom du produit ou du service"
                minLength={2}
                maxLength={160}
                required
                className={fieldClassName}
              />
            </label>
            <label className={labelClassName}>
              Site web
              <input
                name="website"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://"
                maxLength={500}
                required
                className={fieldClassName}
              />
            </label>
            <label className={labelClassName}>
              Catégorie
              <select
                name="solutionType"
                defaultValue=""
                required
                className={fieldClassName}
              >
                <option value="" disabled>
                  Sélectionner une catégorie
                </option>
                <option value="software">Logiciel</option>
                <option value="service-provider">Prestataire de services</option>
                <option value="supplier">Fournisseur</option>
                <option value="network">Réseau professionnel</option>
                <option value="training">Formation</option>
                <option value="funding">Financement</option>
              </select>
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Description
              <span className="mt-1 block text-xs font-light leading-5 text-dema-muted">
                Le besoin traité, le public concerné et ce qui rend votre solution utile.
              </span>
              <textarea
                name="description"
                rows={4}
                placeholder="Décrivez brièvement votre solution…"
                minLength={20}
                maxLength={2000}
                required
                className={`${fieldClassName} resize-y leading-6`}
              />
            </label>
          </div>

          {formError ? (
            <p className="mt-5 text-sm text-brand-coral" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={openSystemsStep}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-blue"
            >
              Choisir les métiers
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section hidden={step !== 2} aria-label="Les métiers concernés">
          {selectedSystemSlugs.length > 0 ? (
            <div className="flex flex-wrap gap-2" aria-label="Métiers sélectionnés">
              {selectedSystemSlugs.map((slug) => {
                const selectedSystem = systemsBySlug.get(slug);
                if (!selectedSystem) return null;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleSystem(slug)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-dema-forest transition hover:bg-dema-line"
                    aria-label={`Retirer ${selectedSystem.name}`}
                  >
                    {selectedSystem.name}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : null}

          <label
            className={`${labelClassName} ${selectedSystemSlugs.length > 0 ? "mt-5" : ""}`}
          >
            Rechercher un métier
            <span className="relative mt-2 block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex. agence marketing, cabinet comptable…"
                className={`${fieldClassName} mt-0 pl-11`}
              />
            </span>
          </label>

          <div
            className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-dema-line bg-white p-2"
            role="group"
            aria-label="Résultats des métiers"
          >
            {filteredSystems.length > 0 ? (
              filteredSystems.map((system) => {
                const isSelected = selectedSystemSlugs.includes(system.slug);
                return (
                  <label
                    key={system.slug}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-light text-brand-blue transition hover:bg-dema-sage/70"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSystem(system.slug)}
                      className="h-4 w-4 rounded border-dema-line accent-dema-forest"
                    />
                    <span>{system.name}</span>
                  </label>
                );
              })
            ) : (
              <p className="px-3 py-6 text-center text-sm font-light text-dema-muted">
                Aucun métier trouvé. Essayez un terme plus simple.
              </p>
            )}
          </div>

          {formError ? (
            <p className="mt-5 text-sm text-brand-coral" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-7 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep(1);
              }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </button>
            <button
              type="button"
              onClick={openContactStep}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-blue"
            >
              Ajouter mon contact
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section hidden={step !== 3} aria-labelledby="partner-step-contact">
          <h3
            id="partner-step-contact"
            className="text-sm font-medium uppercase tracking-[0.14em] text-dema-forest"
          >
            Votre contact
          </h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Prénom et nom
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Votre nom"
                minLength={2}
                maxLength={140}
                required
                className={fieldClassName}
              />
            </label>
            <label className={labelClassName}>
              E-mail professionnel
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@entreprise.fr"
                maxLength={160}
                required
                className={fieldClassName}
              />
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Entreprise
              <input
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Nom de votre entreprise"
                minLength={2}
                maxLength={160}
                required
                className={fieldClassName}
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl bg-dema-sage/45 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
            <p className="text-sm font-light leading-6 text-dema-muted">
              Chaque proposition est étudiée manuellement. L’envoi ne garantit pas le
              référencement : nous vérifions la solution et sa pertinence pour chaque métier.
            </p>
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm font-light leading-6 text-dema-muted">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 shrink-0 rounded border-dema-line accent-dema-forest"
            />
            <span>
              {PARTNER_SUBMISSION_CONSENT_TEXT} Consultez notre{" "}
              <Link
                href="/politique-de-confidentialite"
                className="font-medium text-dema-forest underline decoration-dema-forest/35 underline-offset-2"
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          <div
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="partner-submission-fax">Fax</label>
            <input
              id="partner-submission-fax"
              name="fax"
              type="text"
              value={fax}
              onChange={(event) => setFax(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {formError ? (
            <p className="mt-5 text-sm text-brand-coral" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col-reverse gap-4 border-t border-dema-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep(2);
              }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </button>
            <div className="flex flex-col items-stretch sm:items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? "Envoi en cours…" : "Envoyer ma proposition"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
