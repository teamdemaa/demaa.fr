"use client";

import { CheckCircle2, LoaderCircle, Mail, Save } from "lucide-react";
import { useState } from "react";
import type { ActionPlan } from "@/lib/action-plan-contract";
import { isValidEmail, normalizeEmail } from "@/lib/email";

type PendingClaim = {
  actionPlanId: string;
  actionPlanClaimSecret: string;
};

type SaveState =
  | "idle"
  | "creating"
  | "email"
  | "sending"
  | "sent"
  | "saved";

export default function ActionPlanSaveControl({
  plan,
  sourceText,
}: {
  plan: ActionPlan;
  sourceText: string;
}) {
  const [state, setState] = useState<SaveState>("idle");
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function createSavedPlan() {
    if (state !== "idle") return;
    setState("creating");
    setError(null);

    try {
      const response = await fetch("/api/action-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, sourceText }),
      });
      const body = (await response.json().catch(() => null)) as
        | {
            status?: "saved" | "pending_claim";
            actionPlanId?: string;
            actionPlanClaimSecret?: string;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || "Impossible de sauvegarder ce plan.");
      }

      if (body?.status === "saved") {
        setState("saved");
        return;
      }

      if (
        body?.status !== "pending_claim" ||
        !body.actionPlanId ||
        !body.actionPlanClaimSecret
      ) {
        throw new Error("Impossible de préparer la sauvegarde.");
      }

      setPendingClaim({
        actionPlanId: body.actionPlanId,
        actionPlanClaimSecret: body.actionPlanClaimSecret,
      });
      setState("email");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible de sauvegarder ce plan.",
      );
      setState("idle");
    }
  }

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!pendingClaim || !isValidEmail(normalizedEmail)) {
      setError("Indiquez une adresse e-mail valide.");
      return;
    }

    setState("sending");
    setError(null);

    try {
      const response = await fetch("/api/customer-space/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          actionPlanId: pendingClaim.actionPlanId,
          actionPlanClaimSecret: pendingClaim.actionPlanClaimSecret,
          returnTo: `/mon-espace/plans/${encodeURIComponent(pendingClaim.actionPlanId)}`,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { sent?: boolean; devLink?: string | null; error?: string }
        | null;

      if (!response.ok || !body?.sent) {
        throw new Error(body?.error || "Impossible d’envoyer le lien sécurisé.");
      }

      setDevLink(body.devLink || null);
      setState("sent");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Impossible d’envoyer le lien sécurisé.",
      );
      setState("email");
    }
  }

  if (state === "saved") {
    return (
      <p className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-forest" role="status">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Plan sauvegardé
      </p>
    );
  }

  if (state === "sent") {
    return (
      <div className="max-w-sm text-sm" role="status">
        <p className="inline-flex items-center gap-2 font-medium text-dema-forest">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Lien envoyé. Votre plan sera rattaché après connexion.
        </p>
        {devLink ? (
          <a href={devLink} className="mt-2 inline-flex text-xs text-dema-forest underline">
            Ouvrir le lien de test
          </a>
        ) : null}
      </div>
    );
  }

  if (state === "email" || state === "sending") {
    return (
      <form onSubmit={sendMagicLink} className="w-full max-w-md rounded-2xl border border-dema-line bg-dema-paper p-3 sm:flex sm:items-end sm:gap-2">
        <label className="block min-w-0 flex-1 text-xs text-dema-muted">
          Votre e-mail pour retrouver ce plan
          <span className="relative mt-1.5 block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@entreprise.fr"
              autoComplete="email"
              className="min-h-11 w-full rounded-full border border-dema-line bg-dema-cream pl-9 pr-3 text-sm text-brand-blue outline-none focus:border-dema-forest/30"
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={state === "sending"}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-4 text-sm font-semibold text-white disabled:opacity-60 sm:mt-0 sm:w-auto"
        >
          {state === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Envoyer le lien
        </button>
        {error ? <p className="mt-2 text-xs text-red-700 sm:mt-0">{error}</p> : null}
      </form>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void createSavedPlan()}
        disabled={state === "creating"}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue disabled:opacity-60"
      >
        {state === "creating" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        {state === "creating" ? "Préparation…" : "Sauvegarder ce plan"}
      </button>
      {error ? <p className="mt-2 max-w-sm text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
