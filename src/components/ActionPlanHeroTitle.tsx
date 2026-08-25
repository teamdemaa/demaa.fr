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
    <div>
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
      {localeCode === "fr" ? (
        <p className="mx-auto mt-5 max-w-2xl text-balance text-sm font-light leading-relaxed text-dema-muted sm:text-base">
          On aide les dirigeants à structurer leur entreprise avec des systèmes simples, pour gagner du temps et la rendre moins dépendante d’eux.
        </p>
      ) : null}
    </div>
  );
}
