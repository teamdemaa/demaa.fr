export const ALL_SECTORS_LABEL = "Tous";

export const publicSectorLabels = [
  "Conseil & services aux entreprises",
  "Tech & Digital",
  "BTP & services techniques",
  "Immobilier",
  "Hébergement & tourisme",
  "Patrimoine",
  "Mobilité & logistique",
  "Restauration",
  "Commerce & retail",
  "Santé, bien-être & esthétique",
  "Services aux particuliers",
  "Éducation & formation",
  "Industrie & production",
  "Automobile & réparation",
  "Associations & événements",
] as const;

export type PublicSectorLabel = (typeof publicSectorLabels)[number];

export const publicSectorFilterLabels = [
  ALL_SECTORS_LABEL,
  ...publicSectorLabels,
] as const;
