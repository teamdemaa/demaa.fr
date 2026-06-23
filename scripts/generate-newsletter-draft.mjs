import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(process.cwd(), "src/lib/newsletter-content.ts");
const [, , newsletterSlugArg, topicArg, modeArg] = process.argv;

function printUsage() {
  console.log(
    [
      "Usage:",
      '  node scripts/generate-newsletter-draft.mjs <newsletterSlug> "angle ou sujet du mois" [--dry-run]',
      "",
      "Examples:",
      '  node scripts/generate-newsletter-draft.mjs cabinet-comptable "Anticiper les pics d\'échéances" --dry-run',
      '  node scripts/generate-newsletter-draft.mjs e-commerce "Réduire les tickets SAV récurrents"',
    ].join("\n"),
  );
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function escapeTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("ANTHROPIC_API_KEY is missing or invalid in .env.local");
  }

  return new Anthropic({ apiKey });
}

function extractNewsletterMetadata(source, newsletterSlug) {
  const blocks = [...source.matchAll(/\{\n\s+slug: "[^"]+",[\s\S]*?\n\s+\},/g)].map((match) => match[0]);

  for (const block of blocks) {
    if (!block.includes(`slug: "${newsletterSlug}"`)) continue;
    if (!block.includes('title: "Newsletter ')) continue;

    const title = block.match(/title: "([^"]+)"/)?.[1] ?? "";
    const description = block.match(/description:\n\s+"([^"]+)"/)?.[1] ?? "";
    const sectorLabel = block.match(/sectorLabel: "([^"]+)"/)?.[1] ?? "";
    const tagsMatch = block.match(/tags: \[([^\]]+)\]/)?.[1] ?? "";
    const tags = [...tagsMatch.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

    return {
      slug: newsletterSlug,
      title,
      description,
      sectorLabel,
      tags,
    };
  }

  return null;
}

function buildPrompt(newsletter, topic) {
  return `
Tu rédiges un brouillon d'édition de newsletter Demaa.

Contexte newsletter :
- slug: ${newsletter.slug}
- titre: ${newsletter.title}
- secteur: ${newsletter.sectorLabel}
- description: ${newsletter.description}
- tags existants: ${newsletter.tags.join(", ")}

Sujet / angle demandé :
- ${topic}

Objectif :
Produire une édition publique SEO, concrète, courte, utile, orientée dirigeant de petite entreprise.

Contraintes de sortie :
- répondre UNIQUEMENT en JSON valide
- pas de markdown en dehors du champ content
- pas de backticks
- ton direct, simple, actionnable
- le champ status doit valoir "a_valider"
- tags: 4 maximum
- content en markdown avec cette logique :
  - "## Le point du mois"
  - "## Ce qu'il faut regarder"
  - "## Ce qu'on recommande"
  - "## En une phrase"

Format JSON attendu :
{
  "title": "string",
  "description": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "tags": ["string", "string"],
  "content": "string",
  "status": "a_valider"
}
  `.trim();
}

function buildArticleBlock({ newsletterSlug, articleSlug, payload, date }) {
  const tags = payload.tags.map((tag) => `"${escapeTsString(tag)}"`).join(", ");

  return `  {
    slug: "${escapeTsString(articleSlug)}",
    newsletterSlug: "${escapeTsString(newsletterSlug)}",
    title: "${escapeTsString(payload.title)}",
    seoTitle: "${escapeTsString(payload.seoTitle)}",
    description:
      "${escapeTsString(payload.description)}",
    seoDescription:
      "${escapeTsString(payload.seoDescription)}",
    date: "${date}",
    tags: [${tags}],
    status: "a_valider",
    content: \`
${payload.content.trim()}
    \`.trim(),
  },`;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("La génération n'a pas renvoyé un objet JSON exploitable.");
  }

  const requiredStringKeys = [
    "title",
    "description",
    "seoTitle",
    "seoDescription",
    "content",
    "status",
  ];

  for (const key of requiredStringKeys) {
    if (typeof payload[key] !== "string" || !payload[key].trim()) {
      throw new Error(`Champ manquant ou invalide: ${key}`);
    }
  }

  if (payload.status !== "a_valider") {
    throw new Error('Le statut retourné doit être "a_valider".');
  }

  if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
    throw new Error("Le champ tags doit contenir au moins un tag.");
  }

  payload.tags = payload.tags
    .filter((tag) => typeof tag === "string" && tag.trim())
    .map((tag) => tag.trim())
    .slice(0, 4);

  return payload;
}

async function main() {
  if (!newsletterSlugArg || !topicArg) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const dryRun = modeArg === "--dry-run";
  const source = await readFile(filePath, "utf8");
  const newsletter = extractNewsletterMetadata(source, newsletterSlugArg);

  if (!newsletter) {
    throw new Error(`Newsletter introuvable: ${newsletterSlugArg}`);
  }

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2200,
    temperature: 0.5,
    messages: [
      {
        role: "user",
        content: buildPrompt(newsletter, topicArg),
      },
    ],
  });

  const text = response.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();

  const payload = validatePayload(JSON.parse(text));
  const date = new Date().toISOString().slice(0, 10);
  const articleSlug = slugify(payload.title);

  if (source.includes(`slug: "${articleSlug}"`)) {
    throw new Error(`Un article avec le slug "${articleSlug}" existe déjà.`);
  }

  const block = buildArticleBlock({
    newsletterSlug: newsletterSlugArg,
    articleSlug,
    payload,
    date,
  });

  if (dryRun) {
    console.log(block);
    return;
  }

  const marker = "\n];\n\nexport function getAllNewsletters()";

  if (!source.includes(marker)) {
    throw new Error("Impossible de localiser la fin du tableau articles.");
  }

  const updated = source.replace(marker, `\n${block}\n];\n\nexport function getAllNewsletters()`);

  await writeFile(filePath, updated, "utf8");

  console.log(`Brouillon généré: ${newsletterSlugArg} / ${articleSlug}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
