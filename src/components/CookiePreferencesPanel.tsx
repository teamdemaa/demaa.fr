"use client";

import { useSyncExternalStore } from "react";
import {
  clearCookieConsentPreferences,
  parseCookieConsentSnapshot,
  readCookieConsentSnapshot,
  subscribeToCookieConsent,
  writeCookieConsentPreferences,
} from "@/lib/cookie-consent";

export default function CookiePreferencesPanel() {
  const consentSnapshot = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsentSnapshot,
    () => null,
  );
  const preferences = parseCookieConsentSnapshot(consentSnapshot);
  const analytics = preferences?.analytics ?? false;
  const marketing = preferences?.marketing ?? false;

  const statusLabel = preferences
    ? `Mesure d’audience ${preferences.analytics ? "autorisée" : "refusée"} · Publicité ${preferences.marketing ? "autorisée" : "refusée"}.`
    : "Aucun choix n’est enregistré pour le moment.";

  return (
    <div className="rounded-[1.25rem] border border-dema-line bg-dema-sage/35 p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        Préférences actuelles
      </p>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">{statusLabel}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-blue">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(event) => writeCookieConsentPreferences({
              analytics: event.target.checked,
              marketing,
            })}
            className="mt-1 h-4 w-4"
          />
          <span>
            <strong className="block">Mesure d&apos;audience</strong>
            <span className="mt-1 block text-xs text-dema-muted">
              Parcours, sources d&apos;acquisition et statistiques anonymes.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-blue">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => writeCookieConsentPreferences({
              analytics,
              marketing: event.target.checked,
            })}
            className="mt-1 h-4 w-4"
          />
          <span>
            <strong className="block">Publicité</strong>
            <span className="mt-1 block text-xs text-dema-muted">
              Mesure des campagnes Meta et publicitaires.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => writeCookieConsentPreferences({ analytics: false, marketing: false })}
          className="demaa-secondary-button"
        >
          Tout refuser
        </button>
        <button
          type="button"
          onClick={clearCookieConsentPreferences}
          className="demaa-secondary-button"
        >
          Réafficher le bandeau
        </button>
      </div>
    </div>
  );
}
