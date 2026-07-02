import toolDirectoryPayload from "../src/lib/tool-directory.json" with { type: "json" };

function getArgValue(flag) {
  const inlineArg = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inlineArg) {
    return inlineArg.slice(flag.length + 1) || null;
  }

  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

const categoryFilter = getArgValue("--category");

const tools = toolDirectoryPayload.tools.filter((tool) => {
  if (tool.status === "hidden" || tool.status === "deprecated") {
    return false;
  }

  if (categoryFilter && tool.category !== categoryFilter) {
    return false;
  }

  return true;
});

const rows = tools.map((tool) => ({
  slug: tool.slug ?? tool.name,
  name: tool.name,
  category: tool.category,
  hasKeyFeatures: Array.isArray(tool.keyFeatures) && tool.keyFeatures.length > 0,
  hasIdealFor: Array.isArray(tool.idealFor) && tool.idealFor.length > 0,
  hasPricingNoteVerified: typeof tool.pricingNoteVerified === "string" && tool.pricingNoteVerified.trim().length > 0,
  hasSources: Array.isArray(tool.sources) && tool.sources.length > 0,
  hasLastReviewedAt: typeof tool.lastReviewedAt === "string" && tool.lastReviewedAt.trim().length > 0,
}));

const readyCount = rows.filter(
  (row) => row.hasKeyFeatures && row.hasIdealFor && row.hasSources,
).length;

console.log(
  JSON.stringify(
    {
      total: rows.length,
      readyForModalEnrichment: readyCount,
      missingContent: rows.filter(
        (row) =>
          !row.hasKeyFeatures ||
          !row.hasIdealFor ||
          !row.hasSources ||
          !row.hasLastReviewedAt,
      ),
    },
    null,
    2,
  ),
);
