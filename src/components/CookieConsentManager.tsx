"use client";

import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
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
const BANNER_REVEAL_DELAY_MS = 500;
const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;
const consentChoiceButtonClassName =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-dema-forest/25 bg-dema-paper px-2.5 text-xs font-medium leading-none text-dema-forest transition hover:border-dema-forest/40 hover:bg-dema-sage/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30";

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
    eyebrow: "Cookies",
    description: "Audience and advertising campaign measurement, with your consent.",
    analytics: "Audience measurement",
    analyticsDescription: "Vercel Analytics, Google Analytics and persistent source attribution.",
    marketing: "Advertising",
    marketingDescription: "Meta Pixel and advertising campaign measurement.",
    reject: "Reject all",
    customize: "Customise",
    hide: "Hide choices",
    save: "Save my choices",
    accept: "Accept all",
    learnMore: "Learn more",
  } : {
    region: "Préférences de confidentialité",
    eyebrow: "Cookies",
    description: "Mesure d’audience et des campagnes publicitaires, avec votre accord.",
    analytics: "Mesure d’audience",
    analyticsDescription: "Vercel Analytics, Google Analytics et attribution persistante des sources.",
    marketing: "Publicité",
    marketingDescription: "Meta Pixel et mesure des campagnes publicitaires.",
    reject: "Tout refuser",
    customize: "Personnaliser",
    hide: "Masquer les choix",
    save: "Enregistrer mes choix",
    accept: "Tout accepter",
    learnMore: "En savoir plus",
  };
  const consentSnapshot = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsentSnapshot,
    () => null,
  );
  const preferences = parseCookieConsentSnapshot(consentSnapshot);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);
  const [marketingChoice, setMarketingChoice] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const hasAnalyticsConsent = preferences?.analytics === true;
  const shouldShowBanner = hasHydrated && bannerReady && preferences === null;

  function saveConsent(input: { analytics: boolean; marketing: boolean }) {
    writeCookieConsentPreferences(input);
    setShowSettings(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setBannerReady(true), BANNER_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

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
        <div className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[90] px-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:left-5 sm:right-auto sm:w-[min(32rem,calc(100vw-2.5rem))] sm:px-0">
          <section
            className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-4 shadow-[0_14px_40px_rgba(23,35,29,0.09)]"
            aria-label={copy.region}
          >
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-dema-forest">
                  {copy.eyebrow}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-dema-muted">
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

              {showSettings ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => saveConsent({ analytics: false, marketing: false })}
                      className={consentChoiceButtonClassName}
                    >
                      {copy.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveConsent({ analytics: analyticsChoice, marketing: marketingChoice })}
                      className={consentChoiceButtonClassName}
                    >
                      {copy.save}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="self-start text-xs font-medium text-dema-muted underline-offset-4 hover:text-dema-forest hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    {copy.hide}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => saveConsent({ analytics: false, marketing: false })}
                      className={consentChoiceButtonClassName}
                    >
                      {copy.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveConsent({ analytics: true, marketing: true })}
                      className={consentChoiceButtonClassName}
                    >
                      {copy.accept}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dema-muted">
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="font-medium underline-offset-4 hover:text-dema-forest hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      {copy.customize}
                    </button>
                    <span aria-hidden="true">·</span>
                    <Link
                      href="/politique-de-cookies"
                      className="underline-offset-4 hover:text-dema-forest hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      {copy.learnMore}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
