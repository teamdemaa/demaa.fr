"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useSyncExternalStore } from "react";

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

function writeStoredConsent(value: CookieConsent) {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export default function CookieConsentManager() {
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

  function handleConsent(value: CookieConsent) {
    writeStoredConsent(value);
  }

  const hasAcceptedTracking = consent === "accepted";
  const shouldShowBanner = consent === null;

  useEffect(() => {
    if (!hasAcceptedTracking || typeof window === "undefined") {
      return;
    }

    if (typeof window.gtag !== "function") {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", "G-V1V4EX55K6");
    }

    if (!document.querySelector('script[data-demaa-analytics="google"]')) {
      const googleScript = document.createElement("script");
      googleScript.src = "https://www.googletagmanager.com/gtag/js?id=G-V1V4EX55K6";
      googleScript.async = true;
      googleScript.dataset.demaaAnalytics = "google";
      document.head.appendChild(googleScript);
    }

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
        }
      );

      window.fbq = fbq;
      window._fbq = fbq;
      window.fbq("init", "3030409753790915");
      window.fbq("track", "PageView");
    }

    if (!document.querySelector('script[data-demaa-analytics="meta"]')) {
      const metaScript = document.createElement("script");
      metaScript.src = "https://connect.facebook.net/en_US/fbevents.js";
      metaScript.async = true;
      metaScript.dataset.demaaAnalytics = "meta";
      document.head.appendChild(metaScript);
    }
  }, [hasAcceptedTracking]);

  return (
    <>
      {hasAcceptedTracking ? <Analytics /> : null}

      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-4 z-[90] px-4">
          <section className="mx-auto max-w-3xl rounded-[1.4rem] border border-dema-line bg-dema-paper p-4 shadow-[0_18px_50px_rgba(23,35,29,0.08)] md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Cookies & mesure d&apos;audience
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Demaa utilise des cookies et traceurs pour mesurer l&apos;audience et améliorer le site. Vous pouvez accepter ou refuser les outils de mesure et publicitaires.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleConsent("rejected")}
                  className="demaa-secondary-button"
                >
                  Refuser
                </button>
                <button
                  type="button"
                  onClick={() => handleConsent("accepted")}
                  className="demaa-primary-button"
                >
                  Accepter
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
