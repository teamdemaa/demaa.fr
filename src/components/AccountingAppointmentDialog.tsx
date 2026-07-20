"use client";

import type React from "react";
import { useEffect, useId, useState } from "react";
import { ArrowRight, LoaderCircle, Search, X } from "lucide-react";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingAppointmentDialogProps = {
  firm?: AccountingFirm;
  firms?: AccountingFirm[];
  buttonLabel?: string;
  buttonClassName?: string;
};

type CompanySuggestion = {
  name: string;
  siren: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  activity: string;
  legalForm: string;
  category: string;
};

const INITIAL_FORM = {
  email: "",
  phone: "",
  companyName: "",
  details: "",
  website: "",
};

export default function AccountingAppointmentDialog({
  firm,
  firms,
  buttonLabel = "Demander une mise en relation",
  buttonClassName = "inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue",
}: AccountingAppointmentDialogProps) {
  const fieldId = useId();
  const selectedFirms = firms?.length ? firms : firm ? [firm] : [];
  const firmNames = selectedFirms.map((item) => item.name);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanySuggestion | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [companySearchError, setCompanySearchError] = useState<string | null>(null);

  function handleChange(field: keyof typeof INITIAL_FORM, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }

  function resetState() {
    setFormData(INITIAL_FORM);
    setIsSubmitting(false);
    setError(null);
    setSuccess(null);
    setSelectedCompany(null);
    setCompanySuggestions([]);
    setCompanySearchError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.phone.trim()) {
      setError("Merci d'indiquer votre email et votre téléphone.");
      return;
    }

    if (!formData.companyName.trim()) {
      setError("Merci d'indiquer votre entreprise.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firmSlug: firm?.slug,
          firmSlugs: selectedFirms.map((item) => item.slug),
          firmNames,
          email: formData.email,
          phone: formData.phone,
          message: formData.details,
          sourceUrl: window.location.href,
          company: formData.companyName
            ? {
                name: formData.companyName,
                activity: selectedCompany?.activity,
                address: selectedCompany?.address,
                city: selectedCompany?.city,
                postalCode: selectedCompany?.postalCode,
                legalForm: selectedCompany?.legalForm,
                category: selectedCompany?.category,
                siren: selectedCompany?.siren,
                siret: selectedCompany?.siret,
              }
            : undefined,
          website: formData.website,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d'envoyer la demande pour le moment. Merci de réessayer."
        );
      }

      setSuccess("Demande envoyée. Nous revenons vers vous rapidement.");
      setFormData(INITIAL_FORM);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'envoyer la demande pour le moment. Merci de réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const query = formData.companyName.trim();

    if (!isOpen || selectedCompany || query.length < 2) {
      setCompanySuggestions([]);
      setCompanySearchError(null);
      setIsCompanyLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsCompanyLoading(true);
        setCompanySearchError(null);
        const response = await fetch(
          `/api/company-search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; results?: CompanySuggestion[] }
          | null;

        if (!response.ok) {
          throw new Error(
            payload?.error ||
              "La recherche d'entreprise est indisponible pour le moment."
          );
        }

        setCompanySuggestions(payload?.results ?? []);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setCompanySuggestions([]);
        setCompanySearchError(
          searchError instanceof Error ? searchError.message : null
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsCompanyLoading(false);
        }
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [formData.companyName, isOpen, selectedCompany]);

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
        disabled={selectedFirms.length === 0}
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-blue/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Demande de mise en relation avec ${firmNames.join(", ")}`}
          onClick={() => {
            setIsOpen(false);
            resetState();
          }}
        >
          <div
            className="w-full max-w-2xl rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Annuaire experts-comptables
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
                  {selectedFirms.length > 1
                    ? `${selectedFirms.length} cabinets sélectionnés`
                    : selectedFirms[0]?.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Laissez simplement votre entreprise et vos coordonnées pour être
                  recontacté.
                </p>
                {selectedFirms.length > 1 ? (
                  <p className="mt-2 text-xs leading-relaxed text-brand-blue/68">
                    {firmNames.join(", ")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetState();
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {success ? (
              <div className="mt-5 rounded-[1rem] border border-dema-line bg-dema-sage/55 px-4 py-3">
                <p className="text-sm font-medium text-brand-blue">{success}</p>
              </div>
            ) : (
              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <div className="relative">
                  <label
                    htmlFor={`${fieldId}-company`}
                    className="mb-1.5 block text-sm font-medium text-brand-blue"
                  >
                    Entreprise
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue/36"
                      aria-hidden="true"
                    />
                    <input
                      id={`${fieldId}-company`}
                      type="text"
                      value={formData.companyName}
                      onChange={(event) => {
                        handleChange("companyName", event.target.value);
                        setSelectedCompany(null);
                      }}
                      placeholder="Nom de l'entreprise, SIREN ou SIRET"
                      className="demaa-input demaa-input-with-icon pr-12"
                    />
                    {isCompanyLoading ? (
                      <LoaderCircle
                        className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-dema-forest"
                        aria-hidden="true"
                      />
                    ) : selectedCompany ? (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dema-forest/52 transition hover:bg-dema-sage/70 hover:text-dema-forest"
                        onClick={() => {
                          setSelectedCompany(null);
                          setCompanySuggestions([]);
                          handleChange("companyName", "");
                        }}
                        aria-label="Modifier l'entreprise"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  {companySuggestions.length && !selectedCompany ? (
                    <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-[1rem] border border-dema-line bg-dema-paper shadow-[0_18px_40px_rgba(23,35,29,0.08)]">
                      {companySuggestions.map((company) => (
                        <button
                          key={`${company.siren}-${company.siret || company.name}`}
                          type="button"
                          className="block w-full border-b border-dema-line/70 px-4 py-3 text-left last:border-b-0 hover:bg-dema-sage/55"
                          onClick={() => {
                            setSelectedCompany(company);
                            setCompanySuggestions([]);
                            handleChange("companyName", company.name);
                          }}
                        >
                          <span className="block text-sm font-semibold text-brand-blue">
                            {company.name}
                          </span>
                          <span className="mt-1 block text-xs text-dema-muted">
                            {[company.city, company.siren].filter(Boolean).join(" · ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {companySearchError ? (
                    <p className="mt-2 text-xs text-dema-muted">
                      {companySearchError}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    id={`${fieldId}-email`}
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleChange("email", value)}
                  />
                  <Field
                    id={`${fieldId}-phone`}
                    label="Téléphone / WhatsApp"
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${fieldId}-details`}
                    className="mb-1.5 block text-sm font-medium text-brand-blue"
                  >
                    Besoin ou contexte facultatif
                  </label>
                  <textarea
                    id={`${fieldId}-details`}
                    value={formData.details}
                    onChange={(event) => handleChange("details", event.target.value)}
                    rows={3}
                    placeholder="Exemple : création d'entreprise, changement de cabinet, besoin en paie..."
                    className="demaa-textarea"
                  />
                </div>

                <input
                  type="text"
                  value={formData.website}
                  onChange={(event) => handleChange("website", event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {error ? <p className="text-sm text-dema-forest">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-brand-blue"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="demaa-input"
      />
    </div>
  );
}
