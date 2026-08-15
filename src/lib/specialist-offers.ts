export const SPECIALIST_OFFERS = {
  coach_business: {
    price: "750 € HT / mois",
    title: "Coach business · accompagnement mensuel",
  },
} as const;

export type SpecialistOffer = keyof typeof SPECIALIST_OFFERS;

export function isSpecialistOffer(value: string): value is SpecialistOffer {
  return Object.prototype.hasOwnProperty.call(SPECIALIST_OFFERS, value);
}
