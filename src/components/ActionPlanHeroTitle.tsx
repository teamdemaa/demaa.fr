"use client";

import { useEffect, useState } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const SUBJECTS = {
  fr: ["entreprise", "agence", "startup", "cabinet"],
  en: ["business", "agency", "startup", "practice"],
} as const;

export default function ActionPlanHeroTitle({
  animate = true,
  localeCode,
}: {
  animate?: boolean;
  localeCode: InterfaceLocaleCode;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!animate || media.matches) return;

    let swapTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setVisible(false);
      swapTimeout = window.setTimeout(() => {
        setIndex((current) => (current + 1) % SUBJECTS[localeCode].length);
        setVisible(true);
      }, 180);
    }, 4_500);

    return () => {
      window.clearInterval(interval);
      if (swapTimeout) window.clearTimeout(swapTimeout);
    };
  }, [animate, localeCode]);

  const subject = SUBJECTS[localeCode][animate ? index : 0];
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
          <span
            className={`inline-block transition-opacity duration-200 motion-reduce:transition-none ${!animate || visible ? "opacity-100" : "opacity-0"}`}
          >
            {subject}
          </span>
          {localeCode === "en" ? " back" : ""}
        </span>
        &nbsp;?
      </span>
    </h1>
  );
}
