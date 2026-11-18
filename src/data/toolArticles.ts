/**
 * Written articles shown below a tool on its page: how the tool works, when to use it, mistakes to avoid and a short FAQ.
 * Keyed by the page route. Section bodies are trusted HTML written in these files (paragraphs, lists, tables and internal
 * links only) and are rendered by src/components/ToolArticle.astro through BaseLayout.
 */
import { toolArticlesA } from "./toolArticlesA";
import { toolArticlesB } from "./toolArticlesB";

export interface ToolArticle {
  /** Page route with leading and trailing slash, for example "/merge-pdf/". */
  route: string;
  /** H2 shown above the article. */
  title: string;
  sections: { heading: string; html: string }[];
  faqs?: { q: string; a: string }[];
}

export const toolArticles: ToolArticle[] = [...toolArticlesA, ...toolArticlesB];

const byRoute = new Map(toolArticles.map((article) => [article.route, article]));

export function articleForRoute(route: string): ToolArticle | undefined {
  return byRoute.get(route);
}
