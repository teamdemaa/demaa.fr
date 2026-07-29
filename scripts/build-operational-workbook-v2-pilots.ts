import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  compileOperationalWorkbookV2ApplicationPlan,
  serializeOperationalWorkbookV2ApplicationPlan,
} from "../src/lib/operational-workbook-v2-compiler";
import type { OperationalWorkbookV2SheetPreflight } from "../src/lib/operational-workbook-v2-compiler";
import {
  buildOperationalWorkbookV2Blueprint,
  buildOperationalWorkbookV2Pair,
  getOperationalWorkbookV2PilotSlugs,
} from "../src/lib/operational-workbook-v2-factory";
import {
  isOperationalWorkbookV2PilotSlug,
  type OperationalWorkbookV2Variant,
} from "../src/lib/operational-workbook-v2";

const args = process.argv.slice(2);
const slugIndex = args.indexOf("--slug");
const variantIndex = args.indexOf("--variant");
const sheetStateIndex = args.indexOf("--sheet-state-json");
const slug = slugIndex >= 0 ? args[slugIndex + 1] : null;
const variant = variantIndex >= 0 ? args[variantIndex + 1] : null;
const sheetStatePath =
  sheetStateIndex >= 0 ? args[sheetStateIndex + 1] : null;
const shouldCompileSealedPlan = args.includes("--sealed-plan-json");

if (args.includes("--sheet-batch-json")) {
  throw new Error(
    "Le mode raw requests est interdit. Utilisez --sealed-plan-json ; le plan devra être vérifié par assertOperationalWorkbookV2ApplicationPlan juste avant toute future application.",
  );
}

function assertVariant(value: string | null): OperationalWorkbookV2Variant {
  if (value !== "demo" && value !== "editable") {
    throw new Error("La variante doit être demo ou editable.");
  }
  return value;
}

function readSheetPreflight(
  filePath: string | null,
): OperationalWorkbookV2SheetPreflight {
  if (!filePath) {
    throw new Error(
      "Le plan scellé exige --sheet-state-json <fichier-preflight>.",
    );
  }

  const parsed = JSON.parse(
    readFileSync(resolve(process.cwd(), filePath), "utf8"),
  ) as OperationalWorkbookV2SheetPreflight;
  if (!parsed || !Array.isArray(parsed.sheets)) {
    throw new Error("Le fichier de préflight des feuilles est invalide.");
  }
  return parsed;
}

if (args.includes("--summary")) {
  const summaries = getOperationalWorkbookV2PilotSlugs().map((systemSlug) => {
    const pair = buildOperationalWorkbookV2Pair(systemSlug);
    const margins = pair.demo.forecastPeriods.flatMap((period) =>
      period.operatingMarginRate === null
        ? []
        : [period.operatingMarginRate],
    );

    return {
      slug: systemSlug,
      schemaVersion: pair.demo.schemaVersion,
      workbookVersion: pair.demo.workbookVersion,
      assetRevision: pair.demo.assetRevision,
      sourceContents: pair.demo.sourceContentCount,
      routines: pair.demo.routineRows.length,
      actions: pair.demo.actionRows.length,
      teamRows: pair.demo.teamRows.length,
      ecosystemRows: pair.demo.ecosystemRows.length,
      calendarRows: pair.demo.calendarRows.length,
      demoOperatingMarginRange: {
        min: Math.min(...margins),
        max: Math.max(...margins),
      },
      demoClosingCash: pair.demo.forecastPeriods.at(-1)?.closingCash,
    };
  });

  process.stdout.write(JSON.stringify(summaries, null, 2));
} else if (slug && variant) {
  if (!isOperationalWorkbookV2PilotSlug(slug)) {
    throw new Error(`Le slug ${slug} ne fait pas partie des cinq pilotes.`);
  }

  const blueprint = buildOperationalWorkbookV2Blueprint(
    slug,
    assertVariant(variant),
  );
  if (shouldCompileSealedPlan) {
    const plan = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      readSheetPreflight(sheetStatePath),
    );
    process.stdout.write(
      serializeOperationalWorkbookV2ApplicationPlan(plan),
    );
  } else {
    process.stdout.write(JSON.stringify(blueprint, null, 2));
  }
} else if (slug) {
  if (!isOperationalWorkbookV2PilotSlug(slug)) {
    throw new Error(`Le slug ${slug} ne fait pas partie des cinq pilotes.`);
  }

  process.stdout.write(
    JSON.stringify(buildOperationalWorkbookV2Pair(slug), null, 2),
  );
} else {
  throw new Error(
    "Utilisez --summary ou --slug <pilote> [--variant demo|editable] [--sealed-plan-json --sheet-state-json <fichier>].",
  );
}
