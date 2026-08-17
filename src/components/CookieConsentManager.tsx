"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
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
const META_PIXEL_ID = "2790127321387849";
const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

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
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.demaa.co; SameSite=Lax`;
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
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const copy = isEnglish ? {
    region: "Privacy preferences",
    eyebrow: "Cookies & audience measurement",
    description: "Demaa uses trackers to measure journeys and the origin of requests. You can accept all, reject all or choose by purpose.",
    analytics: "Audience measurement",
    analyticsDescription: "Vercel Analytics, Google Analytics and persistent source attribution.",
    marketing: "Advertising",
    marketingDescription: "Meta Pixel and advertising campaign measurement.",
    reject: "Reject all",
    customize: "Customise",
    hide: "Hide choices",
    save: "Save my choices",
    accept: "Accept all",
  } : {
    region: "Préférences de confidentialité",
    eyebrow: "Cookies & mesure d’audience",
    description: "Demaa utilise des traceurs pour mesurer les parcours et l’origine des demandes. Vous pouvez tout accepter, tout refuser ou choisir par finalité.",
    analytics: "Mesure d’audience",
    analyticsDescription: "Vercel Analytics, Google Analytics et attribution persistante des sources.",
    marketing: "Publicité",
    marketingDescription: "Meta Pixel et mesure des campagnes publicitaires.",
    reject: "Tout refuser",
    customize: "Personnaliser",
    hide: "Masquer les choix",
    save: "Enregistrer mes choix",
    accept: "Tout accepter",
  };
  const consentSnapshot = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsentSnapshot,
    () => null,
  );
  const preferences = parseCookieConsentSnapshot(consentSnapshot);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(true);
  const [marketingChoice, setMarketingChoice] = useState(false);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const hasAnalyticsConsent = preferences?.analytics === true;
  const shouldShowBanner = hasHydrated && preferences === null;

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
        <div className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[90] px-4">
          <section
            className="mx-auto max-w-3xl rounded-[1.4rem] border border-dema-line bg-dema-paper p-4 shadow-[0_18px_50px_rgba(23,35,29,0.08)] md:p-5"
            aria-label={copy.region}
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {copy.eyebrow}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  {copy.description}
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
                      <strong className="block">{copy.analytics}</strong>
                      <span className="mt-1 block text-xs leading-relaxed text-dema-muted">
                        {copy.analyticsDescription}
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
                      <strong className="block">{copy.marketing}</strong>
                      <span className="mt-1 block text-xs leading-relaxed text-dema-muted">
                        {copy.marketingDescription}
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
                  {copy.reject}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings((current) => !current)}
                  className="demaa-secondary-button"
                >
                  {showSettings ? copy.hide : copy.customize}
                </button>
                {showSettings ? (
                  <button
                    type="button"
                    onClick={() => saveConsent({ analytics: analyticsChoice, marketing: marketingChoice })}
                    className="demaa-primary-button"
                  >
                    {copy.save}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveConsent({ analytics: true, marketing: true })}
                    className="demaa-primary-button"
                  >
                    {copy.accept}
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
