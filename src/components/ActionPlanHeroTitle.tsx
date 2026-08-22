import type { InterfaceLocaleCode } from "@/lib/international-context";

export default function ActionPlanHeroTitle({
  localeCode,
}: {
  animate?: boolean;
  localeCode: InterfaceLocaleCode;
}) {
  const accessibleTitle = localeCode === "en"
    ? "What takes too much of your time today?"
    : "Qu’est-ce qui vous prend trop de temps aujourd’hui ?";

  return (
    <h1
      aria-label={accessibleTitle}
      className="text-balance text-[clamp(2.1rem,5.25vw,3.9rem)] font-light leading-[0.98] tracking-[-0.055em] text-brand-blue/62"
    >
      <span aria-hidden="true">
        {localeCode === "en" ? "What takes too much" : "Qu’est-ce qui vous prend"}
        <br />
        <span className="demaa-hero-title text-dema-forest">
          {localeCode === "en" ? "of your time today?" : "trop de temps aujourd’hui ?"}
        </span>
      </span>
    </h1>
  );
}
