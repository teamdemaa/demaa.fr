"use client";

import { useEffect, useState } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const SUBJECTS = {
  fr: ["entreprise", "agence", "cabinet"],
  en: ["business", "agency", "practice"],
} as const;

type TypewriterPhase = "deleting" | "holding" | "typing";

function getAnimatedPhrase(localeCode: InterfaceLocaleCode, subject: string) {
  return localeCode === "en" ? `${subject} back?` : `${subject}\u00a0?`;
}

function TypewriterPhrase({
  animate,
  localeCode,
}: {
  animate: boolean;
  localeCode: InterfaceLocaleCode;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TypewriterPhase>("holding");
  const [typedLength, setTypedLength] = useState(() => (
    getAnimatedPhrase(localeCode, SUBJECTS[localeCode][0]).length
  ));

  const subject = SUBJECTS[localeCode][index];
  const animatedPhrase = getAnimatedPhrase(localeCode, subject);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!animate || media.matches) return;

    let timeout: number;
    if (phase === "typing") {
      if (typedLength < animatedPhrase.length) {
        timeout = window.setTimeout(() => setTypedLength((current) => current + 1), 90);
      } else {
        timeout = window.setTimeout(() => setPhase("holding"), 2_300);
      }
    } else if (phase === "holding") {
      timeout = window.setTimeout(() => setPhase("deleting"), 2_300);
    } else if (phase === "deleting" && typedLength > 0) {
      timeout = window.setTimeout(() => setTypedLength((current) => current - 1), 48);
    } else {
      timeout = window.setTimeout(() => {
        setIndex((current) => (current + 1) % SUBJECTS[localeCode].length);
        setPhase("typing");
      }, 220);
    }

    return () => window.clearTimeout(timeout);
  }, [animate, animatedPhrase.length, localeCode, phase, typedLength]);

  const displayedPhrase = animate ? animatedPhrase.slice(0, typedLength) : animatedPhrase;

  return (
    <span className="inline-block whitespace-nowrap">
      {displayedPhrase}
      {animate ? (
        <span
          aria-hidden="true"
          className="ml-[0.04em] inline-block h-[0.76em] w-[0.035em] animate-pulse bg-current align-[-0.03em] motion-reduce:hidden"
        />
      ) : null}
    </span>
  );
}

export default function ActionPlanHeroTitle({
  animate = true,
  localeCode,
}: {
  animate?: boolean;
  localeCode: InterfaceLocaleCode;
}) {
  const accessibleTitle = localeCode === "en"
    ? "What’s holding your business back?"
    : "Qu’est-ce qui freine votre entreprise ?";

  return (
    <h1
      aria-label={accessibleTitle}
      className="text-balance text-[clamp(2.1rem,5.25vw,3.9rem)] font-light leading-[0.98] tracking-[-0.055em] text-brand-blue/62"
    >
      <span aria-hidden="true">
        {localeCode === "en" ? "What’s holding" : "Qu’est-ce qui"}
        <br />
        <span className="demaa-hero-title text-dema-forest">
          {localeCode === "en" ? "your " : "freine votre "}
          <TypewriterPhrase
            key={`${localeCode}:${animate ? "animated" : "static"}`}
            animate={animate}
            localeCode={localeCode}
          />
        </span>
      </span>
    </h1>
  );
}
