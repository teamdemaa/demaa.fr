"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { LeadRequestSummary } from "@/app/api/admin/lead-requests/route";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  accounting_directory_introduction: "Mise en relation comptable",
  accounting_recommendation: "Recommandation comptable",
  accounting_request: "Demande comptable",
  coaching_recommendation_introduction: "Mise en relation coaching",
  opportunity_interest: "Intérêt opportunité",
  provider_profile_submission: "Profil prestataire",
  service_callback_request: "Rappel service",
  system_kit_request: "Demande de kit",
};

const STATUS_LABELS: Record<string, string> = {
  abandoned: "abandonné",
  failed: "échec",
  pending: "en attente",
  sent: "envoyé",
  skipped: "ignoré",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function LeadRequestsAdminClient() {
  const [requests, setRequests] = useState<LeadRequestSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/lead-requests", { cache: "no-store" });
        const payload = await response.json().catch(() => null) as
          | { requests?: LeadRequestSummary[]; error?: string }
          | null;
        if (!response.ok) throw new Error(payload?.error ?? "Une erreur est survenue.");
        setRequests(payload?.requests ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
      } finally {
        setIsLoaded(true);
      }
    }
    void load();
  }, []);

  if (!isLoaded) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-[1.2rem] border border-dema-line bg-white p-6 text-center">
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <LoaderCircle className="mx-auto h-5 w-5 animate-spin text-dema-muted" aria-hidden="true" />
        )}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-dema-muted">
        Aucune demande pour le moment.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-3">
      {requests.map((request) => (
        <article key={request.id} className="rounded-[1rem] border border-dema-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-dema-forest">
                {REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}
                {request.sectorLabel ? ` · ${request.sectorLabel}` : ""}
              </p>
              <h3 className="mt-1 font-medium text-brand-blue">{request.title}</h3>
              <p className="mt-1 text-sm text-dema-muted">
                {[request.contact.name, request.contact.email, request.contact.phone]
                  .filter(Boolean)
                  .join(" · ") || "Contact non renseigné"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-dema-muted">
                {dateFormatter.format(new Date(request.createdAt))}
              </p>
              <div className="mt-1 flex flex-wrap justify-end gap-1">
                {Object.entries(request.notificationStatus).map(([channel, status]) => (
                  <span
                    key={channel}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      status === "sent"
                        ? "border-dema-forest/30 text-dema-forest"
                        : status === "failed"
                          ? "border-red-300 text-red-700"
                          : "border-dema-line text-dema-muted"
                    }`}
                  >
                    {channel} · {STATUS_LABELS[status] ?? status}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
