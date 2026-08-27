"use client";

import {
  Building2,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  CreditCard,
  HandHelping,
  HeartPulse,
  Home,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SolutionRailCardContent, {
  SOLUTION_RAIL_CARD_FRAME_CLASS_NAME,
  SOLUTION_RAIL_CARD_INTERACTIVE_CLASS_NAME,
  SOLUTION_RAIL_CLASS_NAME,
} from "@/components/SolutionRailCard";

const dailySolutions = [
  { name: "Wecasa", href: "https://www.wecasa.fr/", tag: "Déléguer", description: "Déléguez le ménage, la garde d’enfants et certains services du quotidien.", Icon: Home },
  { name: "Yoojo", href: "https://yoojo.fr/tous-les-services", tag: "Déléguer", description: "Trouvez rapidement de l’aide pour un petit travail, un déménagement ou un imprévu.", Icon: HandHelping },
  { name: "Jow", href: "https://jow.com/fr", tag: "Charge mentale", description: "Planifiez vos repas et préparez vos courses en quelques minutes.", Icon: CookingPot },
  { name: "Qare", href: "https://www.qare.fr/", tag: "Se préserver", description: "Consultez à distance quand vous ne pouvez pas libérer une demi-journée.", Icon: Stethoscope },
  { name: "Ulys Pro", href: "https://ulys.com/professionnel/les-offres-telepeage-ulys/", tag: "Se déplacer", description: "Regroupez péages, parkings et justificatifs sur une seule facture.", Icon: CarFront },
  { name: "Wojo", href: "https://www.wojo.com/fr-FR", tag: "Se déplacer", description: "Réservez ponctuellement un bureau ou une salle de réunion.", Icon: Building2 },
  { name: "American Express Business", href: "https://www.americanexpress.com/fr-fr/professionnel/cartes-pro/business-gold/index.html", tag: "Se déplacer", description: "Centralisez vos dépenses professionnelles et vos justificatifs de déplacement.", Icon: CreditCard },
  { name: "Amarok e-Santé", href: "https://sante-dirigeant.fr/", tag: "Se préserver", description: "Évaluez votre niveau de stress avant que l’épuisement ne s’installe.", Icon: HeartPulse },
] as const;

export default function LeaderDailyRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railState, setRailState] = useState({
    canNext: dailySolutions.length > 1,
    canPrevious: false,
  });

  const updateRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const nextState = {
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
    };
    setRailState((current) =>
      current.canNext === nextState.canNext &&
      current.canPrevious === nextState.canPrevious
        ? current
        : nextState,
    );
  }, []);

  useEffect(() => {
    updateRailState();
    window.addEventListener("resize", updateRailState);
    return () => window.removeEventListener("resize", updateRailState);
  }, [updateRailState]);

  function navigateRail(direction: -1 | 1) {
    const rail = railRef.current;
    const firstCard = rail?.querySelector<HTMLElement>("[data-leader-daily-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      behavior: "smooth",
      left: direction * (firstCard.getBoundingClientRect().width + gap),
    });
  }

  return (
    <section aria-labelledby="leader-daily-heading" className="min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-4">
        <h3
          id="leader-daily-heading"
          className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
        >
          Le quotidien du dirigeant
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Voir les solutions du quotidien précédentes"
            onClick={() => navigateRail(-1)}
            disabled={!railState.canPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Voir les solutions du quotidien suivantes"
            onClick={() => navigateRail(1)}
            disabled={!railState.canNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={updateRailState}
        className={SOLUTION_RAIL_CLASS_NAME}
      >
        {dailySolutions.map(({ name, href, tag, description, Icon }) => (
          <div
            key={name}
            data-leader-daily-card
            className={SOLUTION_RAIL_CARD_FRAME_CLASS_NAME}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={SOLUTION_RAIL_CARD_INTERACTIVE_CLASS_NAME}
              aria-label={`Découvrir ${name}, nouvelle fenêtre`}
            >
              <SolutionRailCardContent
                category={tag}
                description={description}
                Icon={Icon}
                title={name}
              />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
