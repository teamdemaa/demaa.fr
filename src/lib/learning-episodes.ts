import articles from "@/lib/learning-episodes-data.json";

export const PUBLISHED_LEARNING_EPISODES = articles;
export function getLearningEpisode(project: string, slug: string) {
  return articles.find(article => article.project === project && article.slug === slug);
}
