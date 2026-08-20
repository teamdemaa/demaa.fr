"use client";

import { LoaderCircle, Pencil } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPES,
  OPPORTUNITY_WORK_MODE_LABELS,
  OPPORTUNITY_WORK_MODES,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";

export default function OpportunityAdminClient({
  expertises,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
}) {
  const [opportunities, setOpportunities] = useState<PublicOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingOpportunity, setEditingOpportunity] =
    useState<PublicOpportunity | null>(null);

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null) as {
      error?: string;
      opportunities?: PublicOpportunity[];
    } | null;
    if (!response.ok) throw new Error(payload?.error ?? "Une erreur est survenue.");
    return payload;
  }

  const load = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const payload = await request("/api/admin/opportunities");
      setOpportunities(payload?.opportunities ?? []);
      setIsLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await request("/api/admin/opportunities", {
        method: editingOpportunity ? "PATCH" : "POST",
        body: JSON.stringify({
          ...Object.fromEntries(formData.entries()),
          ...(editingOpportunity
            ? { opportunityId: editingOpportunity.opportunityId }
            : {}),
        }),
      });
      form.reset();
      setEditingOpportunity(null);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Création impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function changeStatus(opportunityId: string, status: "open" | "closed") {
    setError(null);
    setIsLoading(true);
    try {
      await request("/api/admin/opportunities", {
        method: "PATCH",
        body: JSON.stringify({ opportunityId, status }),
      });
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Modification impossible.");
    } finally {
      setIsLoading(false);
    }
  }

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

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form key={editingOpportunity?.opportunityId ?? "new"} onSubmit={create} className="space-y-4 rounded-[1.2rem] border border-dema-line bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-medium text-brand-blue">
            {editingOpportunity ? "Modifier l’opportunité" : "Nouvelle opportunité"}
          </h2>
          {editingOpportunity ? (
            <button type="button" onClick={() => setEditingOpportunity(null)} className="text-xs font-medium text-dema-muted underline underline-offset-4">
              Annuler
            </button>
          ) : null}
        </div>
        <input aria-label="Titre" name="title" required defaultValue={editingOpportunity?.title ?? ""} placeholder="Titre" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <textarea aria-label="Description" name="summary" minLength={30} required rows={5} defaultValue={editingOpportunity?.summary ?? ""} placeholder="Décrivez l’opportunité de manière claire, sans information confidentielle" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <select aria-label="Cadre de l’opportunité" name="opportunityType" required defaultValue={editingOpportunity?.opportunityType ?? "mission"} className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 text-sm outline-none focus:border-dema-forest">
          {OPPORTUNITY_TYPES.map((type) => (
            <option key={type} value={type}>{OPPORTUNITY_TYPE_LABELS[type]}</option>
          ))}
        </select>
        <select aria-label="Expertise associée" name="expertiseId" defaultValue={editingOpportunity?.expertiseId ?? ""} className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 text-sm outline-none focus:border-dema-forest">
          <option value="">Expertise associée (facultatif)</option>
          {expertises.map((entry) => <option key={entry.expertiseId} value={entry.expertiseId}>{entry.label}</option>)}
        </select>
        <input aria-label="Catégorie affichée" name="category" required defaultValue={editingOpportunity?.category ?? ""} placeholder="Catégorie affichée" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input aria-label="Domaine affiché" name="domainLabel" defaultValue={editingOpportunity?.domainLabel ?? ""} placeholder="Domaine ou spécialité (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <select aria-label="Modalité" name="workMode" defaultValue={editingOpportunity?.workMode ?? ""} className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 text-sm outline-none focus:border-dema-forest">
          <option value="">Modalité (facultatif)</option>
          {OPPORTUNITY_WORK_MODES.map((mode) => (
            <option key={mode} value={mode}>{OPPORTUNITY_WORK_MODE_LABELS[mode]}</option>
          ))}
        </select>
        <input aria-label="Zone" name="geography" defaultValue={editingOpportunity?.geography ?? ""} placeholder="Zone : France, ville ou pays (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input aria-label="Rythme ou durée" name="cadence" defaultValue={editingOpportunity?.cadence ?? ""} placeholder="Rythme ou durée (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input aria-label="Démarrage prévu" name="startTiming" defaultValue={editingOpportunity?.startTiming ?? ""} placeholder="Démarrage prévu (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <textarea aria-label="Attentes principales" name="expectations" rows={4} defaultValue={editingOpportunity?.expectations.join("\n") ?? ""} placeholder="Attentes principales : une par ligne, 4 maximum (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input aria-label="Budget ou rémunération" name="compensation" defaultValue={editingOpportunity?.compensation ?? ""} placeholder="Budget ou rémunération, seulement si défini" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input aria-label="Nom de l’entreprise" name="companyName" defaultValue={editingOpportunity?.companyName ?? ""} placeholder="Entreprise, uniquement avec son accord" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <label className="block space-y-2 text-sm text-brand-blue">
          <span>Date de fin <span className="text-dema-muted">(facultatif)</span></span>
          <input name="expiresAt" type="date" defaultValue={editingOpportunity?.expiresAt?.slice(0, 10) ?? ""} className="w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {editingOpportunity ? "Enregistrer les modifications" : "Publier l’opportunité"}
        </button>
      </form>

      <section>
        <h2 className="text-xl font-medium text-brand-blue">Opportunités enregistrées</h2>
        <div className="mt-4 space-y-3">
          {opportunities.map((opportunity) => (
            <article key={opportunity.opportunityId} className="rounded-[1rem] border border-dema-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-dema-forest">
                    {OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType]} · {opportunity.status}
                  </p>
                  <h3 className="mt-1 font-medium text-brand-blue">{opportunity.title}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" disabled={isLoading} onClick={() => setEditingOpportunity(opportunity)} className="inline-flex items-center gap-1.5 rounded-full border border-dema-line px-3 py-2 text-xs font-medium text-dema-forest">
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
                  </button>
                  <button type="button" disabled={isLoading} onClick={() => changeStatus(opportunity.opportunityId, opportunity.status === "open" ? "closed" : "open")} className="rounded-full border border-dema-line px-3 py-2 text-xs font-medium text-dema-forest">
                    {opportunity.status === "draft"
                      ? "Publier"
                      : opportunity.status === "open"
                        ? "Fermer"
                        : "Rouvrir"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
