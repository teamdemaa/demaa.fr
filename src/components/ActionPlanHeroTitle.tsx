import type { InterfaceLocaleCode } from "@/lib/international-context";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

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
        className={satoshiHeroTitleClassName}
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
          On aide les dirigeants à mieux s’organiser grâce à des applications métier adaptées.
        </p>
      ) : null}
    </div>
  );
}
