import {access, rename} from "node:fs/promises";
import path from "node:path";
import {argumentValue} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";
import {
  normalizePreviewToBt709,
  tagPreviewBt709,
} from "./lib/video-color.mjs";

const variant = argumentValue("variant", "oumou-warm-v2");
const tagOnly = process.argv.includes("--tag-only");
const courses = argumentValue(
  "courses",
  "gestion-tresorerie,chiffre-affaires-benefice,fixer-ses-prix,construire-systeme-marketing-vente,deleguer-sans-perdre-controle",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

for (const slug of courses) {
  const preview = path.join(
    paths.projectRoot,
    "output",
    "staging",
    variant,
    "previews",
    `${slug}-0-899.mp4`,
  );
  await access(preview);
  const normalized = `${preview}.normalized.mp4`;
  const tagged = `${preview}.tagged.mp4`;
  if (tagOnly) {
    await tagPreviewBt709(preview, tagged);
  } else {
    await normalizePreviewToBt709(preview, normalized);
    await tagPreviewBt709(normalized, tagged);
  }
  await rename(tagged, preview);
  console.log(`BT.709 : ${preview}`);
}
