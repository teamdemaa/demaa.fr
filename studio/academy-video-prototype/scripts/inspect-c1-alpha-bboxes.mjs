import path from "node:path";
import {paths} from "./lib/config.mjs";
import {inspectPngAlpha} from "./lib/png-alpha.mjs";

const assets = [
  "illustrations/casting-v2/01-gestion-tresorerie-clean.png",
  "illustrations/casting-v2/01b-gestion-tresorerie-decalage-char4-clean.png",
  "illustrations/casting-v2/01c-gestion-tresorerie-decisions-char7-clean.png",
];

const result = Object.fromEntries(
  await Promise.all(
    assets.map(async (asset) => [
      asset,
      await inspectPngAlpha(path.join(paths.publicDir, asset)),
    ]),
  ),
);
console.log(JSON.stringify(result, null, 2));
