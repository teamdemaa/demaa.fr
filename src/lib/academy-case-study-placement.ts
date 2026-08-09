export type ContextualAcademyCaseStudy = Readonly<{
  contentSlug: string;
  durationMinutes: number;
  promise: string;
  systemSlug: string;
  title: string;
}>;

const CONTEXTUAL_CASE_STUDIES: readonly ContextualAcademyCaseStudy[] = [
  {
    systemSlug: "cabinet-de-conseil",
    contentSlug: "cabinet-conseil-acquisition",
    durationMinutes: 8,
    title: "Cabinet de conseil — sortir du bouche-à-oreille",
    promise: "Voir comment un cabinet peut obtenir des demandes plus régulières sans publier tous les jours ni démarcher au hasard.",
  },
  {
    systemSlug: "reparation-informatique-mobile",
    contentSlug: "maintenance-informatique-acquisition",
    durationMinutes: 8,
    title: "Maintenance informatique — qualifier les demandes",
    promise: "Voir comment un prestataire informatique peut attirer, qualifier et convertir des entreprises adaptées à son offre.",
  },
  {
    systemSlug: "agence-de-recrutement",
    contentSlug: "cabinet-recrutement-acquisition",
    durationMinutes: 8,
    title: "Cabinet de recrutement — obtenir de vrais mandats",
    promise: "Voir comment un cabinet de recrutement peut attirer des entreprises avec un besoin réel, qualifier le mandat et construire une relation durable.",
  },
  {
    systemSlug: "nettoyage-professionnel",
    contentSlug: "nettoyage-professionnel-acquisition",
    durationMinutes: 8,
    title: "Nettoyage professionnel — signer du récurrent",
    promise: "Voir comment une entreprise de nettoyage peut attirer les bons locaux, mieux chiffrer et fidéliser ses clients.",
  },
  {
    systemSlug: "organisme-de-formation",
    contentSlug: "formation-b2b-acquisition",
    durationMinutes: 8,
    title: "Formation B2B — remplir une session",
    promise: "Voir comment un organisme de formation peut attirer les bonnes entreprises, qualifier leur besoin et remplir ses sessions.",
  },
  {
    systemSlug: "bureau-etudes",
    contentSlug: "bureau-etudes-acquisition",
    durationMinutes: 8,
    title: "Bureau d’études — obtenir de meilleurs projets",
    promise: "Voir comment un bureau d’études peut rendre son expertise compréhensible et obtenir des projets mieux qualifiés.",
  },
];

export function getContextualAcademyCaseStudy(systemSlug: string) {
  return CONTEXTUAL_CASE_STUDIES.find((placement) => placement.systemSlug === systemSlug) ?? null;
}

export function getContextualAcademyCaseStudyPlacements() {
  return CONTEXTUAL_CASE_STUDIES.map(({ contentSlug, systemSlug }) => ({
    contentSlug,
    systemSlug,
  }));
}
