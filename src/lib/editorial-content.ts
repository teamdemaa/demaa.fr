import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { systemResources } from "@/lib/system-resources";
import { templatesData } from "@/lib/templates";

const blogContentDirectory = path.join(process.cwd(), "content", "blog");

export type EditorialContentType = "article" | "resource" | "template";

export interface EditorialEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  type: EditorialContentType;
  category: string;
  image?: string;
  tags: string[];
  ctaLabel?: string;
  ctaHref?: string;
  slides?: string[];
}

function normalizeTags(tags: unknown, fallback: string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()));
  }

  return fallback;
}

function getArticleEntries(): EditorialEntry[] {
  if (!fs.existsSync(blogContentDirectory)) return [];

  return fs
    .readdirSync(blogContentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(blogContentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || "Titre par défaut",
        date: matterResult.data.date || "1970-01-01",
        description: matterResult.data.description || "",
        content: matterResult.content,
        type: "article" as const,
        category: matterResult.data.category || "Article",
        image: typeof matterResult.data.image === "string" ? matterResult.data.image : undefined,
        tags: normalizeTags(matterResult.data.tags, ["article", "conseil"]),
      };
    });
}

function getResourceEntries(): EditorialEntry[] {
  return systemResources.map((resource, index) => ({
    slug: resource.id,
    title: resource.title,
    date: `2026-02-${String(index + 10).padStart(2, "0")}`,
    description: `Ressource Demaa pour ${resource.category.toLowerCase()} et structurer l'activité plus concrètement.`,
    content:
      `Cette ressource Demaa aide à avancer plus vite sur le sujet "${resource.category}". ` +
      `Elle regroupe un support visuel directement exploitable, pensé pour les petites structures qui veulent cadrer les bons réflexes sans repartir de zéro.`,
    type: "resource",
    category: resource.category,
    image: resource.image,
    tags: ["ressource", "modèle", resource.category.toLowerCase()],
    ctaLabel: resource.resourceLabel,
    ctaHref: resource.resourceHref,
    slides: resource.slides,
  }));
}

function getTemplateEntries(): EditorialEntry[] {
  const templateSlugs: Record<string, string> = {
    m1: "obligations-tpe-template",
    m2: "suivi-previsionnel-financier-template",
    m3: "systeme-operationnel-template",
  };

  return templatesData.map((template, index) => ({
    slug: templateSlugs[template.id] ?? template.id,
    title: template.name,
    date: `2026-01-${String(index + 10).padStart(2, "0")}`,
    description: template.description,
    content:
      `${template.description}\n\nCe modèle est proposé comme ressource directement exploitable. ` +
      `Il permet de partir d'une base claire, puis d'adapter le support à votre activité.`,
    type: "template",
    category: template.category,
    image: template.image,
    tags: ["template", "modèle", template.category.toLowerCase()],
    ctaLabel: "Ouvrir le template",
    ctaHref: template.link,
  }));
}

export function getAllEditorialEntries(): EditorialEntry[] {
  return [...getArticleEntries(), ...getResourceEntries(), ...getTemplateEntries()].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function getEditorialEntryBySlug(slug: string): EditorialEntry | null {
  return getAllEditorialEntries().find((entry) => entry.slug === slug) ?? null;
}
