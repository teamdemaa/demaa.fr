"use client";

import { CheckCircle2, LoaderCircle, Mail, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import { isValidEmail, normalizeEmail } from "@/lib/email";

type PendingClaim = {
  actionPlanId: string;
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
  workspace,
  demoMode = false,
}: {
  plan: PersistableActionPlan;
  sourceText: string;
  workspace: ActionPlanWorkspaceState;
  demoMode?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subscribeToStructure, setSubscribeToStructure] = useState(false);
  const [newsletterWarning, setNewsletterWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!dialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && state !== "sending") {
        setDialogOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dialogOpen, state]);

  async function createSavedPlan() {
    if (state === "email" || state === "sending" || state === "sent") {
      setDialogOpen(true);
      return;
    }
    if (state !== "idle") return;

    if (demoMode) {
      setPendingClaim({
        actionPlanId: "demo-action-plan",
      });
      setState("email");
      setDialogOpen(true);
      return;
    }

    setState("creating");
    setError(null);

    try {
      const response = await fetch("/api/action-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, sourceText, workspaceState: workspace }),
      });
      const body = (await response.json().catch(() => null)) as
        | {
            status?: "saved" | "pending_claim";
            actionPlan?: { id?: string };
            actionPlanId?: string;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || "Impossible de sauvegarder ce plan.");
      }

      if (body?.status === "saved") {
        const savedPlanId = body.actionPlan?.id;
        if (!savedPlanId || !/^[A-Za-z0-9_-]{12,64}$/.test(savedPlanId)) {
          throw new Error("Le plan est sauvegardé, mais son accès est indisponible.");
        }
        setState("saved");
        router.push(`/plans/${encodeURIComponent(savedPlanId)}`);
        return;
      }

      if (
        body?.status !== "pending_claim" ||
        !body.actionPlanId
      ) {
        throw new Error("Impossible de préparer la sauvegarde.");
      }

      setPendingClaim({
        actionPlanId: body.actionPlanId,
      });
      setState("email");
      setDialogOpen(true);
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
    setNewsletterWarning(null);

    if (demoMode) {
      setState("sent");
      return;
    }

    try {
      const response = await fetch("/api/customer-space/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          actionPlanId: pendingClaim.actionPlanId,
          returnTo: `/plans/${encodeURIComponent(pendingClaim.actionPlanId)}`,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { sent?: boolean; devLink?: string | null; error?: string }
        | null;

      if (!response.ok || !body?.sent) {
        throw new Error(body?.error || "Impossible d’envoyer le lien sécurisé.");
      }

      if (subscribeToStructure) {
        try {
          const newsletterResponse = await fetch("/api/newsletter-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail, website: "" }),
          });
          const newsletterBody = (await newsletterResponse.json().catch(() => null)) as
            | { ok?: boolean }
            | null;
          if (!newsletterResponse.ok || newsletterBody?.ok !== true) {
            setNewsletterWarning(
              "Le lien a bien été envoyé, mais l’inscription à Structure n’a pas pu être confirmée.",
            );
          }
        } catch {
          setNewsletterWarning(
            "Le lien a bien été envoyé, mais l’inscription à Structure n’a pas pu être confirmée.",
          );
        }
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
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void createSavedPlan()}
        disabled={state === "creating" || state === "sending"}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-dema-forest px-3 text-xs font-semibold text-white transition hover:bg-brand-blue disabled:opacity-60 sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm"
      >
        {state === "creating" || state === "sending" ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" aria-hidden="true" />
        ) : state === "sent" ? (
          <CheckCircle2 className="hidden h-4 w-4 sm:block" aria-hidden="true" />
        ) : (
          <Save className="hidden h-4 w-4 sm:block" aria-hidden="true" />
        )}
        {state === "creating"
          ? "Préparation…"
          : state === "sending"
            ? "Envoi…"
            : state === "sent"
              ? "Lien envoyé"
              : "Enregistrer"}
      </button>
      {error ? <p className="mt-2 max-w-sm text-xs text-red-700">{error}</p> : null}

      {dialogOpen &&
      (state === "email" || state === "sending" || state === "sent")
        ? createPortal(
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto overscroll-contain bg-brand-blue/20 p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={() => {
            if (state !== "sending") setDialogOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-plan-title"
            className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[1.4rem] border border-dema-line bg-dema-paper p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Sauvegarde</p>
                <h2 id="save-plan-title" className="mt-1 text-2xl font-medium tracking-[-0.035em] text-brand-blue">
                  Enregistrer mon plan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                disabled={state === "sending"}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-dema-muted disabled:opacity-50"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {state === "sent" ? (
              <div className="mt-6" role="status">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-dema-forest">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {demoMode
                      ? "Mode démo : le lien sécurisé permettrait de retrouver ce plan. Aucun e-mail n’a été envoyé."
                      : "Lien envoyé. Ouvrez-le pour retrouver ce plan sur vos autres appareils."}
                  </span>
                </p>
                {devLink ? (
                  <a href={devLink} className="mt-4 inline-flex text-sm text-dema-forest underline">
                    Ouvrir le lien de test
                  </a>
                ) : null}
                {newsletterWarning ? (
                  <p className="mt-3 text-xs leading-relaxed text-amber-800" role="alert">
                    {newsletterWarning}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setState("email");
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center text-sm text-dema-forest underline"
                >
                  Renvoyer le lien
                </button>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-dema-line text-sm font-medium text-brand-blue"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={sendMagicLink} className="mt-5">
                <p className="text-sm leading-relaxed text-dema-muted">
                  Votre plan est enregistré sur cet appareil. Indiquez votre adresse e-mail pour le retrouver ailleurs.
                </p>
                <label className="mt-5 block text-xs font-medium text-dema-muted">
                  Adresse e-mail
                  <span className="relative mt-1.5 block">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="vous@entreprise.fr"
                      autoComplete="email"
                      autoFocus
                      className="min-h-12 w-full rounded-full border border-dema-line bg-dema-cream pl-11 pr-4 text-sm text-brand-blue outline-none focus:border-dema-forest/30"
                    />
                  </span>
                </label>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-dema-line/80 bg-dema-cream/55 p-3 text-sm leading-relaxed text-dema-muted">
                  <input
                    type="checkbox"
                    checked={subscribeToStructure}
                    onChange={(event) => setSubscribeToStructure(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f6748]"
                  />
                  <span>
                    Recevoir <strong className="font-medium text-brand-blue">Structure</strong> : réponses aux problématiques de dirigeants, actualités entrepreneuriales et tarifs négociés.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {state === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  M’envoyer le lien
                </button>
                {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
              </form>
            )}
          </section>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
