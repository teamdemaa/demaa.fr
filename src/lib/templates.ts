export interface TemplateRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  link: string;
  image: string;
}

export const templatesData: TemplateRecord[] = [
  {
    id: "m1",
    name: "Les Obligations d’une TPE",
    category: "Juridique & Admin",
    description: "Un guide complet sur vos obligations fiscales, sociales, comptables et juridiques pour ne rien oublier.",
    shortDescription: "Fiscales, sociales, comptables et juridiques",
    link: "https://canva.link/obligationstpe",
    image: "/images/templates/obligations_tpe.png"
  },
  {
    id: "m2",
    name: "Suivi et prévisionnel financier",
    category: "Finance",
    description: "L'outil indispensable pour piloter votre trésorerie, le nerf de la guerre de toute entreprise.",
    shortDescription: "Trésorerie le nerf de la guerre",
    link: "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
    image: "/images/templates/previsionnel_financier.png"
  },
  {
    id: "m3",
    name: "Système opérationnel",
    category: "Opérations",
    description: "La structure dont vous avez besoin pour que votre activité soit solide et scalable.",
    shortDescription: "Sans système en place, tout est fragile",
    link: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    image: "/images/templates/systeme_operationnel.png"
  }
];

export async function getTemplates(): Promise<TemplateRecord[]> {
  return new Promise((resolve) => setTimeout(() => resolve(templatesData), 20));
}
