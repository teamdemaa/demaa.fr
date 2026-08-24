"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  AdminRequestDetail,
  AdminRequestSource,
  AdminRequestStatus,
  AdminRequestSummary,
} from "@/lib/admin-request-contract";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  accounting_directory_introduction: "Mise en relation comptable",
  accounting_recommendation: "Recommandation comptable",
  accounting_request: "Demande comptable",
  coaching_recommendation_introduction: "Mise en relation coaching",
  guest_plan_diagnostic: "Diagnostic de plan",
  opportunity_interest: "Intérêt annonce",
  provider_profile_submission: "Profil prestataire",
  service_callback_request: "Rappel service",
  service_request: "Demande de service",
  solution_referral: "Mise en relation",
  structure_problem_submission: "Problématique Structure",
  system_kit_request: "Demande de kit",
};

const STATUS_LABELS: Record<AdminRequestStatus, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  responded: "Répondu",
  closed: "Clos",
};

const DELIVERY_LABELS: Record<string, string> = {
  abandoned: "abandonné",
  exhausted: "épuisé",
  failed: "échec",
  pending: "en attente",
  processing: "en cours",
  sent: "envoyé",
  skipped: "ignoré",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function LeadRequestsAdminClient() {
  const [requests, setRequests] = useState<AdminRequestSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [source, setSource] = useState<"" | AdminRequestSource>("");
  const [status, setStatus] = useState<"" | AdminRequestStatus>("");
  const [detail, setDetail] = useState<AdminRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cursor: string | null, append: boolean) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (cursor) params.set("cursor", cursor);
      if (source) params.set("source", source);
      if (status) params.set("status", status);
      const response = await fetch(`/api/admin/lead-requests?${params}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null) as {
        error?: string;
        nextCursor?: string | null;
        requests?: AdminRequestSummary[];
      } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Une erreur est survenue.");
      setRequests((current) => append
        ? [...current, ...(payload?.requests ?? [])]
        : payload?.requests ?? []);
      setNextCursor(payload?.nextCursor ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [source, status]);

  useEffect(() => {
    setDetail(null);
    void load(null, false);
  }, [load]);

  async function openDetail(request: AdminRequestSummary) {
    setError(null);
    const params = new URLSearchParams({ id: request.id, source: request.source });
    const response = await fetch(`/api/admin/lead-requests?${params}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null) as {
      error?: string;
      request?: AdminRequestDetail;
    } | null;
    if (!response.ok || !payload?.request) {
      setError(payload?.error ?? "La demande n’a pas pu être ouverte.");
      return;
    }
    setDetail(payload.request);
  }

  async function updateStatus(nextStatus: AdminRequestStatus) {
    if (!detail || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/lead-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.id, source: detail.source, status: nextStatus }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Le statut n’a pas pu être modifié.");
      setDetail((current) => current ? { ...current, status: nextStatus } : null);
      setRequests((current) => current.map((request) =>
        request.id === detail.id && request.source === detail.source
          ? { ...request, status: nextStatus }
          : request,
      ));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Le statut n’a pas pu être modifié.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-brand-blue">
          Source
          <select value={source} onChange={(event) => setSource(event.target.value as typeof source)} className="ml-2 min-h-10 rounded-xl border border-dema-line bg-white px-3">
            <option value="">Toutes</option>
            <option value="lead">Formulaires</option>
            <option value="service">Services</option>
            <option value="referral">Mises en relation</option>
          </select>
        </label>
        <label className="text-sm text-brand-blue">
          Statut
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="ml-2 min-h-10 rounded-xl border border-dema-line bg-white px-3">
            <option value="">Tous</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <Link href="/admin/opportunites" className="ml-auto inline-flex min-h-10 items-center rounded-full border border-dema-line bg-white px-4 text-sm text-dema-forest">
          Annonces
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}

      {detail ? (
        <section className="mt-6 rounded-[1.2rem] border border-dema-line bg-white p-5 sm:p-6" aria-labelledby="admin-request-detail-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-dema-forest">{detail.sourceLabel}</p>
              <h2 id="admin-request-detail-title" className="mt-1 text-xl font-medium text-brand-blue">{detail.title}</h2>
              <p className="mt-2 text-sm text-dema-muted">
                {[detail.contact.name, detail.contact.company, detail.contact.email, detail.contact.phone].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button type="button" onClick={() => setDetail(null)} className="text-sm text-dema-muted underline underline-offset-4">Fermer</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <dl className="space-y-3">
              {detail.fields.filter((field) => field.value).map((field, index) => (
                <div key={`${field.label}-${index}`}>
                  <dt className="text-xs font-medium uppercase tracking-[0.08em] text-dema-muted">{field.label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-brand-blue">{field.value}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-3 sm:min-w-48">
              <label className="block text-xs font-medium uppercase tracking-[0.08em] text-dema-muted">
                Statut
                <select disabled={isSaving} value={detail.status} onChange={(event) => void updateStatus(event.target.value as AdminRequestStatus)} className="mt-2 min-h-10 w-full rounded-xl border border-dema-line bg-white px-3 text-sm normal-case tracking-normal text-brand-blue">
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              {detail.contact.email ? (
                <a href={`mailto:${encodeURIComponent(detail.contact.email)}?subject=${encodeURIComponent(`Votre demande Demaa - ${detail.title}`)}`} className="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-dema-forest px-4 text-sm font-medium text-white">
                  Répondre par e-mail
                </a>
              ) : null}
              {detail.specializedHref ? (
                <Link href={detail.specializedHref} className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-dema-line px-4 text-sm text-dema-forest">
                  Ouvrir la gestion dédiée
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <div className="mt-10 text-center"><LoaderCircle className="mx-auto h-5 w-5 animate-spin text-dema-muted" aria-label="Chargement" /></div>
      ) : requests.length === 0 ? (
        <p className="mt-10 text-center text-sm text-dema-muted">Aucune demande pour le moment.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((request) => (
            <article key={`${request.source}:${request.id}`} className="rounded-[1rem] border border-dema-line bg-white p-5">
              <button type="button" onClick={() => void openDetail(request)} className="flex w-full flex-wrap items-start justify-between gap-3 text-left">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-dema-forest">
                    {REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType} · {request.sourceLabel}
                  </p>
                  <h3 className="mt-1 font-medium text-brand-blue">{request.title}</h3>
                  <p className="mt-1 text-sm text-dema-muted">
                    {[request.contact.name, request.contact.email, request.contact.phone].filter(Boolean).join(" · ") || "Contact non renseigné"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-dema-muted">{dateFormatter.format(new Date(request.createdAt))}</p>
                  <p className="mt-1 text-xs font-medium text-dema-forest">{STATUS_LABELS[request.status]}</p>
                  <div className="mt-1 flex flex-wrap justify-end gap-1">
                    {Object.entries(request.deliveryStatus).filter(([, value]) => value !== "skipped").map(([channel, value]) => (
                      <span key={channel} className={`rounded-full border px-2 py-0.5 text-[10px] ${value === "sent" ? "border-dema-forest/30 text-dema-forest" : value === "failed" || value === "exhausted" ? "border-red-300 text-red-700" : "border-dema-line text-dema-muted"}`}>
                        {channel} · {DELIVERY_LABELS[value] ?? value}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            </article>
          ))}
          {nextCursor ? (
            <button type="button" disabled={isLoadingMore} onClick={() => void load(nextCursor, true)} className="mx-auto flex min-h-11 items-center justify-center rounded-full border border-dema-line bg-white px-5 text-sm text-dema-forest disabled:opacity-60">
              {isLoadingMore ? "Chargement…" : "Afficher plus"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
