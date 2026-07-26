import {
  buildOperationalWorkbookBlueprint,
  buildOperationalWorkbookPair,
  getOperationalWorkbookFactorySlugs,
} from "../src/lib/operational-workbook-factory";
import {
  CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS,
  compileOperationalWorkbookSheetRequests,
} from "../src/lib/operational-workbook-sheet-compiler";

const args = process.argv.slice(2);
const slugIndex = args.indexOf("--slug");
const variantIndex = args.indexOf("--variant");
const slug = slugIndex >= 0 ? args[slugIndex + 1] : null;
const variant = variantIndex >= 0 ? args[variantIndex + 1] : null;
const shouldCompileSheetBatch = args.includes("--sheet-batch-json");

if (args.includes("--summary")) {
  const summaries = getOperationalWorkbookFactorySlugs().map((systemSlug) => {
    const pair = buildOperationalWorkbookPair(systemSlug);

    return {
      slug: systemSlug,
      actions: pair.editable.actionRows.length,
      demoCalendarRows: pair.demo.calendarRows.length,
      ecosystemRows: pair.editable.ecosystemRows.length,
      processes: new Set(
        pair.editable.processRows.map((row) => row.process),
      ).size,
      processContents: pair.editable.processRows.length,
      teamRoles: pair.editable.teamRows.length,
    };
  });

  process.stdout.write(JSON.stringify(summaries, null, 2));
} else if (slug && (variant === "demo" || variant === "editable")) {
  const blueprint = buildOperationalWorkbookBlueprint(slug, variant);
  const output = shouldCompileSheetBatch
    ? compileOperationalWorkbookSheetRequests(
        blueprint,
        CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS,
      )
    : blueprint;
  process.stdout.write(
    shouldCompileSheetBatch
      ? JSON.stringify(output)
      : JSON.stringify(output, null, 2),
  );
} else if (slug && !variant) {
  process.stdout.write(JSON.stringify(buildOperationalWorkbookPair(slug), null, 2));
} else {
  throw new Error(
    "Utilisez --summary ou --slug <métier> [--variant demo|editable] [--sheet-batch-json].",
  );
}
