export const SPECIALIST_OFFERS = {
  echanges: {
    price: "149 € HT / mois",
    title: "Clarté",
  },
  pilotage_1: {
    price: "350 € HT / mois",
    title: "Maestro · 1 session / mois",
  },
  pilotage_2: {
    price: "550 € HT / mois",
    title: "Maestro · 2 sessions / mois",
  },
} as const;

export type SpecialistOffer = keyof typeof SPECIALIST_OFFERS;

export function isSpecialistOffer(value: string): value is SpecialistOffer {
  return Object.prototype.hasOwnProperty.call(SPECIALIST_OFFERS, value);
}
