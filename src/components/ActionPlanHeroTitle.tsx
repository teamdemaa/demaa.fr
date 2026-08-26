import type { InterfaceLocaleCode } from "@/lib/international-context";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

export default function ActionPlanHeroTitle({
  localeCode,
  variant = "default",
}: {
  animate?: boolean;
  localeCode: InterfaceLocaleCode;
  variant?: "default" | "diagnostic";
}) {
  const isFocusedDiagnostic = localeCode === "fr" && variant === "diagnostic";
  const accessibleTitle = isFocusedDiagnostic
    ? "Trouvez ce qu’il faut mettre en place pour gagner du temps."
    : localeCode === "en"
    ? "What takes too much of your time today?"
    : "Qu’est-ce qui vous prend trop de temps aujourd’hui ?";

  return (
    <div>
      <h1
        aria-label={accessibleTitle}
        className={satoshiHeroTitleClassName}
      >
        <span aria-hidden="true">
          {isFocusedDiagnostic
            ? "Trouvez ce qu’il faut mettre en place"
            : localeCode === "en" ? "What takes too much" : "Qu’est-ce qui vous prend"}
          <br />
          <span className="demaa-hero-title text-dema-forest">
            {isFocusedDiagnostic
              ? "pour gagner du temps."
              : localeCode === "en" ? "of your time today?" : "trop de temps aujourd’hui ?"}
          </span>
        </span>
      </h1>
      {localeCode === "fr" ? (
        <p className="mx-auto mt-5 max-w-2xl text-balance text-sm font-light leading-relaxed text-dema-muted sm:text-base">
          {isFocusedDiagnostic
            ? "Décrivez ce qui vous ralentit. Demaa prépare un plan d’action avec les processus, ressources et solutions adaptés pour rendre votre entreprise moins dépendante de vous."
            : "On aide les dirigeants à mieux s’organiser grâce à des applications métier adaptées."}
        </p>
      ) : null}
    </div>
  );
}
