"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { RepriseAlertCriteriaFields } from "@/components/RepriseAlertDialog";
import type { RepriseAlertCriteria } from "@/lib/reprise-alerts";

type State = "idle" | "saving" | "saved" | "deleting" | "deleted" | "error";

export default function RepriseAlertManagement({
  accessToken,
  alertId,
  initialCriteria,
  initialDeleteIntent,
}: {
  accessToken: string;
  alertId: string;
  initialCriteria: RepriseAlertCriteria;
  initialDeleteIntent: boolean;
}) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [error, setError] = useState("");
  const [state, setState] = useState<State>("idle");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setError("");
    try {
      const response = await fetch(`/api/reprise-alerts/${encodeURIComponent(alertId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, criteria }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (!response.ok || body?.ok !== true) throw new Error(body?.error || "Impossible de modifier l’alerte.");
      setState("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible de modifier l’alerte.");
      setState("error");
    }
  }

  async function remove() {
    setState("deleting");
    setError("");
    try {
      const response = await fetch(`/api/reprise-alerts/${encodeURIComponent(alertId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (!response.ok || body?.ok !== true) throw new Error(body?.error || "Impossible de supprimer l’alerte.");
      setState("deleted");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer l’alerte.");
      setState("error");
    }
  }

  if (state === "deleted") {
    return <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-7 text-center sm:p-10"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Check className="h-5 w-5" aria-hidden="true" /></span><h1 className="mt-5 text-3xl font-normal tracking-[-0.04em]">Votre alerte est supprimée.</h1><Link href="/a-reprendre" className="mt-6 inline-block text-sm font-medium text-dema-forest underline underline-offset-4">Voir les entreprises à reprendre</Link></div>;
  }

  return (
    <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-6 sm:p-9">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Alerte de reprise</p>
      <h1 className="mt-4 text-3xl font-normal tracking-[-0.04em] sm:text-5xl">{initialDeleteIntent ? "Supprimer votre alerte." : "Modifier votre alerte."}</h1>
      {initialDeleteIntent ? (
        <div className="mt-7">
          <p className="text-sm leading-6 text-dema-muted">Vous ne recevrez plus les nouvelles opportunités correspondant à cette recherche.</p>
          {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-4"><button type="button" onClick={remove} disabled={state === "deleting"} className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper disabled:opacity-60">{state === "deleting" ? "Suppression…" : "Supprimer mon alerte"}</button><Link href={`/alertes-reprise/${alertId}?token=${encodeURIComponent(accessToken)}`} className="inline-flex min-h-11 items-center text-sm font-medium text-dema-forest underline underline-offset-4">Conserver l’alerte</Link></div>
        </div>
      ) : (
        <form className="mt-8" onSubmit={save}>
          <RepriseAlertCriteriaFields criteria={criteria} onChange={(next) => { setCriteria(next); if (state === "saved") setState("idle"); }} />
          {state === "saved" ? <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-dema-forest"><Check className="h-4 w-4" aria-hidden="true" />Modifications enregistrées.</p> : null}
          {error ? <p className="mt-5 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
          <div className="mt-7 flex flex-wrap items-center gap-5"><button type="submit" disabled={state === "saving"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:opacity-60">{state === "saving" ? "Enregistrement…" : "Enregistrer les critères"}</button><button type="button" onClick={remove} disabled={state === "deleting"} className="text-sm text-dema-muted underline underline-offset-4">{state === "deleting" ? "Suppression…" : "Supprimer mon alerte"}</button></div>
        </form>
      )}
    </div>
  );
}
