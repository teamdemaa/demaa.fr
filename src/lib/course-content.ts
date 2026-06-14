export interface CourseEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  category: string;
  image?: string;
  tags: string[];
  duration: string;
}

const courseEntries: CourseEntry[] = [
  {
    slug: "facture-electronique",
    title: "La facture électronique",
    date: "2026-06-14",
    description:
      "Comprendre ce qui change, qui est concerné, et comment préparer votre entreprise sans attendre la dernière minute.",
    category: "Conformité & gestion",
    tags: ["cours", "facturation", "conformité", "tpe"],
    duration: "18 min",
    content: `
## Ce qui change

La facture électronique devient un vrai sujet d'organisation, pas seulement un sujet comptable. Il faut pouvoir émettre, recevoir, classer et suivre les statuts de facture dans un système plus propre.

## Qui est concerné

Toutes les entreprises devront progressivement s'équiper pour recevoir puis émettre des factures électroniques selon le calendrier applicable.

## Ce qu'une TPE doit préparer

- Vérifier son outil de facturation actuel
- Identifier si l'expert-comptable ou un logiciel couvre déjà le besoin
- Clarifier le circuit devis, facture, paiement et archivage
- Préparer les informations clients et légales de façon propre

## Ce qu'il faut éviter

- Attendre la dernière minute
- Multiplier les outils sans logique d'ensemble
- Penser que le sujet est uniquement technique

## Outils utiles

Les outils de facturation, ERP légers, CRM avec facturation ou solutions compatibles facture électronique seront les premiers blocs à regarder.

## Services utiles

Si le sujet reste flou, un cadrage rapide avec un bon prestataire ou un accompagnement comptable orienté outils peut faire gagner beaucoup de temps.
    `.trim(),
  },
];

export function getAllCourseEntries(): CourseEntry[] {
  return [...courseEntries].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function getCourseEntryBySlug(slug: string): CourseEntry | null {
  return courseEntries.find((entry) => entry.slug === slug) ?? null;
}
