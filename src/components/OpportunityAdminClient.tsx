"use client";

import { LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import type { PublicOpportunity } from "@/lib/opportunity-contract";

export default function OpportunityAdminClient({
  expertises,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
}) {
  const [secret, setSecret] = useState("");
  const [opportunities, setOpportunities] = useState<PublicOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-demaa-admin-secret": secret,
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

  async function load() {
    setError(null);
    setIsLoading(true);
    try {
      const payload = await request("/api/admin/opportunities");
      setOpportunities(payload?.opportunities ?? []);
      setIsUnlocked(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
    } finally {
      setIsLoading(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await request("/api/admin/opportunities", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      form.reset();
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

  if (!isUnlocked) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-[1.2rem] border border-dema-line bg-white p-6">
        <label className="block space-y-2 text-sm text-brand-blue">
          <span>Clé d’administration</span>
          <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className="w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button type="button" onClick={load} disabled={isLoading || secret.length < 1} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Ouvrir
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={create} className="space-y-4 rounded-[1.2rem] border border-dema-line bg-white p-6">
        <h2 className="text-xl font-medium text-brand-blue">Nouvelle opportunité</h2>
        <input name="title" required placeholder="Titre" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <textarea name="summary" minLength={30} required rows={5} placeholder="Besoin concret, sans révéler le client" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <select name="expertiseId" required defaultValue="" className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 text-sm outline-none focus:border-dema-forest">
          <option value="" disabled>Expertise recherchée</option>
          {expertises.map((entry) => <option key={entry.expertiseId} value={entry.expertiseId}>{entry.label}</option>)}
        </select>
        <input name="category" required placeholder="Catégorie affichée" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <input name="geography" placeholder="Zone géographique (facultatif)" className="w-full rounded-xl border border-dema-line px-4 py-3 text-sm outline-none focus:border-dema-forest" />
        <label className="block space-y-2 text-sm text-brand-blue">
          <span>Date de fin <span className="text-dema-muted">(facultatif)</span></span>
          <input name="expiresAt" type="date" className="w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Publier l’opportunité
        </button>
      </form>

      <section>
        <h2 className="text-xl font-medium text-brand-blue">Opportunités enregistrées</h2>
        <div className="mt-4 space-y-3">
          {opportunities.map((opportunity) => (
            <article key={opportunity.opportunityId} className="rounded-[1rem] border border-dema-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-dema-forest">{opportunity.status}</p>
                  <h3 className="mt-1 font-medium text-brand-blue">{opportunity.title}</h3>
                </div>
                <button type="button" disabled={isLoading} onClick={() => changeStatus(opportunity.opportunityId, opportunity.status === "open" ? "closed" : "open")} className="shrink-0 rounded-full border border-dema-line px-3 py-2 text-xs font-medium text-dema-forest">
                  {opportunity.status === "open" ? "Fermer" : "Rouvrir"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
