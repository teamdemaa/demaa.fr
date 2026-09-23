export type CoachProfile = Readonly<{
  slug: string;
  name: string;
  location: string;
  format: string;
  specialties: readonly string[];
  summary: string;
  fit: string;
  website: string;
}>;

// Public professional websites checked on 2026-09-20. These are editorial
// leads, not vetted DEMAA partners. Do not imply availability or a fixed price.
export const coachProfiles: readonly CoachProfile[] = [
  {
    slug: "igor-baschet",
    name: "Igor Baschet",
    location: "Paris",
    format: "Présentiel et à distance",
    specialties: ["Développement commercial", "Posture du dirigeant"],
    summary: "Coaching et conseil en développement commercial pour entrepreneurs et dirigeants de PME.",
    fit: "Pour clarifier les décisions commerciales et travailler à la fois sur le développement de l’activité et la posture du dirigeant.",
    website: "https://www.igorbaschet.fr/",
  },
  {
    slug: "julian-perrier",
    name: "Julian Perrier · Lead Up Coaching",
    location: "Lyon et à distance",
    format: "Présentiel et à distance",
    specialties: ["Pilotage & organisation", "Délégation"],
    summary: "Accompagnement de dirigeants de TPE et PME pour prendre du recul et rendre l’entreprise moins dépendante d’eux.",
    fit: "Pour un dirigeant qui souhaite mieux organiser l’activité, déléguer et sortir de la surcharge opérationnelle.",
    website: "https://julianperrier.com/coach-de-dirigeant-lyon/",
  },
  {
    slug: "raissa-bahsoun",
    name: "Raïssa Bahsoun",
    location: "Paris et La Réunion",
    format: "Présentiel et à distance",
    specialties: ["Leadership", "Transformation"],
    summary: "Coaching de dirigeants, managers et entrepreneurs autour du leadership et des périodes de transformation.",
    fit: "Pour travailler sa posture de leader, ses décisions et la conduite d’un changement au sein de l’équipe.",
    website: "https://www.raissabahsoun.fr/",
  },
];
