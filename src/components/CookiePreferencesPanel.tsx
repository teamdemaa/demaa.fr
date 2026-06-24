"use client";

import { useSyncExternalStore } from "react";

type CookieConsent = "accepted" | "rejected";

const COOKIE_CONSENT_STORAGE_KEY = "demaa-cookie-consent";
const COOKIE_CONSENT_EVENT = "demaa-cookie-consent-change";

function readStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return rawValue === "accepted" || rawValue === "rejected" ? rawValue : null;
}

function updateConsent(value: CookieConsent | null) {
  if (value === null) {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } else {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export default function CookiePreferencesPanel() {
  const consent = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readStoredConsent,
    () => null
  );

  const statusLabel =
    consent === "accepted"
      ? "Vous avez accepté les traceurs optionnels."
      : consent === "rejected"
        ? "Vous avez refusé les traceurs optionnels."
        : "Aucun choix n’est enregistré pour le moment.";

  return (
    <div className="rounded-[1.25rem] border border-dema-line bg-dema-sage/35 p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        Préférences actuelles
      </p>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">{statusLabel}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => updateConsent("accepted")}
          className="demaa-primary-button"
        >
          Autoriser les traceurs optionnels
        </button>
        <button
          type="button"
          onClick={() => updateConsent("rejected")}
          className="demaa-secondary-button"
        >
          Refuser les traceurs optionnels
        </button>
        <button
          type="button"
          onClick={() => updateConsent(null)}
          className="demaa-secondary-button"
        >
          Réafficher le bandeau
        </button>
      </div>
    </div>
  );
}
