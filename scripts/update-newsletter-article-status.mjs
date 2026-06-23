import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(process.cwd(), "src/lib/newsletter-content.ts");
const [, , newsletterSlugArg, articleSlugArg, nextStatusArg] = process.argv;

const allowedStatuses = new Set(["a_valider", "publie"]);

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/update-newsletter-article-status.mjs --list-pending",
      "  node scripts/update-newsletter-article-status.mjs <newsletterSlug> <articleSlug> <a_valider|publie>",
    ].join("\n"),
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractArticleBlocks(source) {
  return [...source.matchAll(/\{\n\s+slug: "[^"]+",[\s\S]*?\n\s+\},/g)].map((match) => match[0]);
}

function listPendingArticles(source) {
  const matches = extractArticleBlocks(source)
    .map((block) => {
      const slugMatch = block.match(/slug: "([^"]+)"/);
      const newsletterSlugMatch = block.match(/newsletterSlug: "([^"]+)"/);
      const statusMatch = block.match(/status: "(a_valider|publie)"/);

      if (!slugMatch || !newsletterSlugMatch || statusMatch?.[1] !== "a_valider") {
        return null;
      }

      return {
        articleSlug: slugMatch[1],
        newsletterSlug: newsletterSlugMatch[1],
      };
    })
    .filter(Boolean);

  if (!matches.length) {
    console.log("Aucun article en attente.");
    return;
  }

  console.log("Articles en attente :");
  for (const match of matches) {
    console.log(`- ${match.newsletterSlug} / ${match.articleSlug}`);
  }
}

async function main() {
  const source = await readFile(filePath, "utf8");

  if (newsletterSlugArg === "--list-pending") {
    listPendingArticles(source);
    return;
  }

  if (!newsletterSlugArg || !articleSlugArg || !nextStatusArg) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!allowedStatuses.has(nextStatusArg)) {
    console.error(`Statut invalide: ${nextStatusArg}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  const blockPattern = new RegExp(
    String.raw`(\{\n\s+slug: "${escapeRegExp(articleSlugArg)}",\n\s+newsletterSlug: "${escapeRegExp(newsletterSlugArg)}",[\s\S]*?\n\s+status: ")(a_valider|publie)(",)`,
  );

  const match = source.match(blockPattern);

  if (!match) {
    console.error(
      `Impossible de trouver l'article ${newsletterSlugArg} / ${articleSlugArg} dans src/lib/newsletter-content.ts`,
    );
    process.exitCode = 1;
    return;
  }

  const currentStatus = match[2];

  if (currentStatus === nextStatusArg) {
    console.log(
      `Aucun changement: ${newsletterSlugArg} / ${articleSlugArg} est déjà en statut "${nextStatusArg}".`,
    );
    return;
  }

  const updated = source.replace(blockPattern, `$1${nextStatusArg}$3`);

  if (updated === source) {
    console.error("Le fichier n'a pas pu être mis à jour.");
    process.exitCode = 1;
    return;
  }

  await writeFile(filePath, updated, "utf8");

  console.log(
    `Statut mis à jour: ${newsletterSlugArg} / ${articleSlugArg} -> ${nextStatusArg}`,
  );
}

await main();
