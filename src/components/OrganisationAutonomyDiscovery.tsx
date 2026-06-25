"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ORGANISATION_AUDIT_MODAL_HREF } from "@/lib/organisation-audit";

type DiscoveryAnswer = "yes" | "no" | null;

const responseContent: Record<Exclude<DiscoveryAnswer, null>, { title: string; body: string }> = {
  yes: {
    title: "Bravo. Votre entreprise peut déjà respirer sans vous.",
    body: "",
  },
  no: {
    title: "C'est le signal qu'il faut structurer maintenant.",
    body: "",
  },
};

export default function OrganisationAutonomyDiscovery() {
  const [typedTitle, setTypedTitle] = useState("");
  const [showArrow, setShowArrow] = useState(false);
  const [answer, setAnswer] = useState<DiscoveryAnswer>(null);
  const selectedResponse = answer ? responseContent[answer] : null;

  useEffect(() => {
    if (!selectedResponse) {
      return;
    }

    const fullTitle = selectedResponse.title;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const revealImmediately = window.setTimeout(() => {
        setTypedTitle(fullTitle);
        setShowArrow(true);
      }, 0);

      return () => {
        window.clearTimeout(revealImmediately);
      };
    }

    let titleIndex = 0;
    let typingTimer: number | null = null;
    let arrowTimer: number | null = null;
    const frameDelay = fullTitle.length > 50 ? 34 : 42;
    const typingStart = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        titleIndex += 1;
        setTypedTitle(fullTitle.slice(0, titleIndex));

        if (titleIndex >= fullTitle.length) {
          if (typingTimer) {
            window.clearInterval(typingTimer);
          }
          arrowTimer = window.setTimeout(() => {
            setShowArrow(true);
          }, 420);
        }
      }, frameDelay);
    }, 220);

    return () => {
      window.clearTimeout(typingStart);
      if (typingTimer) {
        window.clearInterval(typingTimer);
      }
      if (arrowTimer) {
        window.clearTimeout(arrowTimer);
      }
    };
  }, [selectedResponse]);

  useEffect(() => {
    if (!selectedResponse || !showArrow || answer !== "no") {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const target = document.getElementById("organisation-offer-content");

      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 520);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [answer, selectedResponse, showArrow]);

  function handleAnswer(nextAnswer: Exclude<DiscoveryAnswer, null>) {
    setTypedTitle("");
    setShowArrow(false);
    setAnswer(nextAnswer);
  }

  const revealDiscovery = Boolean(answer);

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 text-center md:px-8">
        <div
          className={`mx-auto max-w-6xl space-y-6 transition-[padding,transform] duration-[1400ms] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] md:space-y-7 ${
            revealDiscovery
              ? "translate-y-0 pb-3 pt-6 md:pb-4 md:pt-12"
              : "translate-y-0 pb-10 pt-8 md:pb-14 md:pt-14"
          }`}
        >
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(2.25rem,9vw,4.2rem)] leading-[0.98] tracking-tight">
              <span className="font-sans font-light not-italic text-brand-blue/42">
                Est-ce que votre entreprise peut tourner
              </span>{" "}
              <span className="demaa-hero-title text-brand-blue/88">
                3 mois sans vous ?
              </span>
            </h1>
          </div>

          <div className="flex flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleAnswer("yes")}
              className={`inline-flex min-h-[2.8rem] min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-[0.95rem] font-medium transition sm:min-h-[2.95rem] sm:flex-none sm:px-7 sm:text-base ${
                answer === "yes"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest hover:text-dema-forest"
              }`}
            >
              Oui à peu près
            </button>
            <button
              type="button"
              onClick={() => handleAnswer("no")}
              className={`inline-flex min-h-[2.8rem] min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-[0.95rem] font-medium transition sm:min-h-[2.95rem] sm:flex-none sm:px-7 sm:text-base ${
                answer === "no"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest hover:text-dema-forest"
              }`}
            >
              Non pas encore
            </button>
          </div>

          <div
            className={`transition-all duration-[950ms] delay-75 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] ${
              revealDiscovery
                ? "max-h-48 translate-y-0 opacity-100"
                : "max-h-0 translate-y-1 overflow-hidden opacity-0 pointer-events-none"
            }`}
          >
            {selectedResponse ? (
              <div className="mx-auto max-w-3xl">
                <p
                  className="text-base font-semibold text-brand-blue"
                  aria-label={selectedResponse.title}
                >
                  <span>{typedTitle}</span>
                  {!showArrow ? (
                    <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-brand-blue/70 align-baseline" />
                  ) : null}
                </p>
                {selectedResponse.body ? (
                  <p className="mt-2 text-sm leading-6 text-brand-blue/62 sm:text-base">
                    {selectedResponse.body}
                  </p>
                ) : null}
                {answer === "no" ? (
                  <div className="mt-5 flex justify-center">
                    <Link
                      href={ORGANISATION_AUDIT_MODAL_HREF}
                      scroll={false}
                      className="demaa-primary-button"
                    >
                      Diagnostic organisation offert
                    </Link>
                  </div>
                ) : null}
                <div
                  className={`pointer-events-none mt-2 flex justify-center transition-all duration-500 ${
                    showArrow && answer === "no"
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0"
                  }`}
                >
                  <Image
                    src="/images/home/hand-arrow.png"
                    alt=""
                    aria-hidden="true"
                    width={112}
                    height={70}
                    className={`h-12 w-28 object-contain ${showArrow ? "demaa-arrow-nudge" : ""}`}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
