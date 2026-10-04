import landscapes from "@/lib/academy-courses-data.json";

export type LearningEpisode = Readonly<{ number: number; title: string; href: string }>;
const definitions = [
  { slug: "jago", name: "Jago", description: "Relier les marques africaines aux revendeurs, à travers une plateforme de vente en gros.", landscape: 0 },
  { slug: "dumaan", name: "Dumaan", description: "Proposer des pastels, du mafé et des légumes découpés surgelés aux restaurants et traiteurs.", landscape: 2 },
  { slug: "tiimora", name: "Tiimora", description: "Réunir les clients, les demandes, les documents et les échéances des cabinets comptables.", landscape: 1 },
];

// Add episodes only when their titles and content are ready to publish.
export const LEARNING_PROJECT_SERIES = definitions.map((project, index) => {
  const photo = landscapes[project.landscape];
  return { ...project, number: index + 1, image: photo.image, imageAlt: photo.imageAlt,
    imageCaption: photo.imageCaption, imageCredit: photo.imageCredit, imageSource: photo.imageSource,
    imageProvider: photo.imageProvider, imageLicense: photo.imageLicense, episodes: [] as LearningEpisode[] };
});
export type LearningProjectSeries = (typeof LEARNING_PROJECT_SERIES)[number];
export function getLearningProjectSeries(slug: string) {
  return LEARNING_PROJECT_SERIES.find(project => project.slug === slug);
}
