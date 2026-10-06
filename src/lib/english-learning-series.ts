import { LEARNING_PROJECT_SERIES } from "./academy-project-series";
const descriptions: Record<string, string> = {
  jago: "Making it easier for shops, grocers and resellers to source African products in bulk.",
  tiimora: "Bringing clients, requests, documents and deadlines together for accounting firms.",
  dumaan: "Making everyday family meals easier with West African food preparations.",
};
export function englishLandscape<T extends { imageCaption?: string }>(photo: T) {
  const caption = (photo.imageCaption ?? "").replace("Cap-Vert", "Cape Verde").replace("Sénégal", "Senegal").replace("Namibie", "Namibia").replace("Maroc", "Morocco").replace("Islande", "Iceland").replace("Italie", "Italy");
  return { ...photo, imageCaption: caption, imageAlt: `Landscape: ${caption}` };
}
export const ENGLISH_LEARNING_SERIES = LEARNING_PROJECT_SERIES.map(p => ({ ...englishLandscape(p), description: descriptions[p.slug] }));
export const ENGLISH_EPISODE_TITLES = ["Origins", "Strategy", "Action plan", "Update 1", "Update 2", "Update 3"];
