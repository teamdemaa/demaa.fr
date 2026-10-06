import { EPISODE_SLUGS } from "@/lib/publication-contract";
import landscapes from "@/lib/academy-courses-data.json";

export type LearningEpisode = Readonly<{ number: number; title: string; href?: string }>;
export function getApproachLandscape(number: number) {
  const index = ({ 0: 7, 1: 5, 2: 4, 3: 0 } as Record<number, number>)[number];
  return index === undefined ? undefined : landscapes[index];
}
const definitions = [
  { slug: "jago", name: "Jago", description: "Faciliter l’approvisionnement en produits africains des boutiques, épiceries et revendeurs.", landscape: 0 },
  { slug: "dumaan", name: "Dumaan", description: "Simplifier les repas du quotidien avec des préparations ouest-africaines pour les familles.", landscape: 2 },
  { slug: "tiimora", name: "Tiimora", description: "Réunir les clients, les demandes, les documents et les échéances des cabinets comptables.", landscape: 1 },
];

// A missing URL keeps announced episodes non-clickable until publication.
const episodeTitles = ["La genèse du projet", "Stratégie", "Plan d’action", "Update 1", "Update 2", "Update 3"];
export const LEARNING_PROJECT_SERIES = definitions.map((project, index) => {
  const photo = landscapes[project.landscape];
  return { ...project, number: index + 1, image: photo.image, imageAlt: photo.imageAlt,
    imageCaption: photo.imageCaption, imageCredit: photo.imageCredit, imageSource: photo.imageSource,
    imageProvider: photo.imageProvider, imageLicense: photo.imageLicense, episodes: episodeTitles.map((title, number): LearningEpisode => {
      return { number, title };
    }) };
});
export type LearningProjectSeries = (typeof LEARNING_PROJECT_SERIES)[number];
export function getLearningProjectSeries(slug: string) {
  return LEARNING_PROJECT_SERIES.find(project => project.slug === slug);
}

export function withPublishedEpisodes(project: LearningProjectSeries, numbers: readonly number[]) {
  return { ...project, episodes: project.episodes.map(episode => ({ ...episode, ...(numbers.includes(episode.number) ? { href: `/tutoriels/${project.slug}/${EPISODE_SLUGS[episode.number]}` } : {}) })) };
}
