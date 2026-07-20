"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  parseCookieConsentSnapshot,
  readCookieConsentSnapshot,
  subscribeToCookieConsent,
  writeCookieConsentPreferences,
} from "@/lib/cookie-consent";
import {
  clearPersistedLeadAttribution,
  initializeLeadAttribution,
} from "@/lib/lead-attribution-client";

const GOOGLE_ANALYTICS_ID = "G-V1V4EX55K6";
const META_PIXEL_ID = "3030409753790915";

function ensureGtagQueue() {
  window.dataLayer = window.dataLayer || [];
  window.gtag ??= function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
}

function clearTrackingCookies(prefixes: string[]) {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !prefixes.some((prefix) => name.startsWith(prefix))) continue;

    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.demaa.fr; SameSite=Lax`;
  }
}

function ensureGoogleAnalytics() {
  ensureGtagQueue();

  if (!document.querySelector('script[data-demaa-analytics="google"]')) {
    window.gtag?.("js", new Date());
    window.gtag?.("config", GOOGLE_ANALYTICS_ID, {
      anonymize_ip: true,
      send_page_view: true,
    });

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
    script.async = true;
    script.dataset.demaaAnalytics = "google";
    document.head.appendChild(script);
  }
}

function ensureMetaPixel() {
  if (typeof window.fbq !== "function") {
    const queue: unknown[][] = [];
    const fbq = Object.assign(
      (...args: unknown[]) => {
        queue.push(args);
      },
      {
        queue,
        push: (...args: unknown[]) => queue.push(args),
        loaded: true,
        version: "2.0",
      },
    );

    window.fbq = fbq;
    window._fbq = fbq;
    window.fbq("init", META_PIXEL_ID);
  }

  window.fbq?.("consent", "grant");
  window.fbq?.("track", "PageView");

  if (!document.querySelector('script[data-demaa-analytics="meta"]')) {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.async = true;
    script.dataset.demaaAnalytics = "meta";
    document.head.appendChild(script);
  }
}

export default function CookieConsentManager() {
  const consentSnapshot = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsentSnapshot,
    () => null,
  );
  const preferences = parseCookieConsentSnapshot(consentSnapshot);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(true);
  const [marketingChoice, setMarketingChoice] = useState(false);

  const hasAnalyticsConsent = preferences?.analytics === true;
  const shouldShowBanner = preferences === null;

  function saveConsent(input: { analytics: boolean; marketing: boolean }) {
    writeCookieConsentPreferences(input);
    setShowSettings(false);
  }

  useEffect(() => {
    ensureGtagQueue();
    window.gtag?.("consent", "default", {
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });
  }, []);

  useEffect(() => {
    if (consentSnapshot === "accepted") {
      writeCookieConsentPreferences({ analytics: true, marketing: true });
    } else if (consentSnapshot === "rejected") {
      writeCookieConsentPreferences({ analytics: false, marketing: false });
    }
  }, [consentSnapshot]);

  useEffect(() => {
    const analytics = preferences?.analytics === true;
    const marketing = preferences?.marketing === true;

    ensureGtagQueue();
    window.gtag?.("consent", "update", {
      ad_personalization: marketing ? "granted" : "denied",
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    });

    if (analytics || marketing) {
      ensureGoogleAnalytics();
    } else {
      clearTrackingCookies(["_ga", "_gid", "_gat"]);
    }

    if (marketing) {
      ensureMetaPixel();
    } else {
      window.fbq?.("consent", "revoke");
      clearTrackingCookies(["_fbp", "_fbc"]);
    }

    if (!analytics) {
      clearPersistedLeadAttribution();
    }
    initializeLeadAttribution();
  }, [consentSnapshot, preferences?.analytics, preferences?.marketing]);

  return (
    <>
      {hasAnalyticsConsent ? <Analytics /> : null}

      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-4 z-[90] px-4">
          <section
            className="mx-auto max-w-3xl rounded-[1.4rem] border border-dema-line bg-dema-paper p-4 shadow-[0_18px_50px_rgba(23,35,29,0.08)] md:p-5"
            aria-label="Préférences de confidentialité"
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Cookies & mesure d&apos;audience
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Demaa utilise des traceurs pour mesurer les parcours et l&apos;origine des demandes. Vous pouvez tout accepter, tout refuser ou choisir par finalité.
                </p>
              </div>

              {showSettings ? (
                <div className="grid gap-3 rounded-[1rem] border border-dema-line bg-dema-sage/25 p-4 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-blue">
                    <input
                      type="checkbox"
                      checked={analyticsChoice}
                      onChange={(event) => setAnalyticsChoice(event.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <strong className="block">Mesure d&apos;audience</strong>
                      <span className="mt-1 block text-xs leading-relaxed text-dema-muted">
                        Vercel Analytics, Google Analytics et attribution persistante des sources.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-blue">
                    <input
                      type="checkbox"
                      checked={marketingChoice}
                      onChange={(event) => setMarketingChoice(event.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <strong className="block">Publicité</strong>
                      <span className="mt-1 block text-xs leading-relaxed text-dema-muted">
                        Meta Pixel et mesure des campagnes publicitaires.
                      </span>
                    </span>
                  </label>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => saveConsent({ analytics: false, marketing: false })}
                  className="demaa-secondary-button"
                >
                  Tout refuser
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings((current) => !current)}
                  className="demaa-secondary-button"
                >
                  {showSettings ? "Masquer les choix" : "Personnaliser"}
                </button>
                {showSettings ? (
                  <button
                    type="button"
                    onClick={() => saveConsent({ analytics: analyticsChoice, marketing: marketingChoice })}
                    className="demaa-primary-button"
                  >
                    Enregistrer mes choix
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveConsent({ analytics: true, marketing: true })}
                    className="demaa-primary-button"
                  >
                    Tout accepter
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
