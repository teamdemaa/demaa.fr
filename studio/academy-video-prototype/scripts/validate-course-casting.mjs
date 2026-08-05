import {access, readFile} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {paths} from "./lib/config.mjs";
import {applyCasting, resolveCourse} from "./lib/course.mjs";
import {
  assertCurrentScript,
  loadProduction,
} from "./lib/production.mjs";

const variant = "oumou-warm-v2";
const expected = {
  "gestion-tresorerie": {
    "deux-realites/distinction": [4],
    "decisions/introduction": [7],
  },
  "chiffre-affaires-benefice": {
    "pilotage/introduction": [8, 2],
  },
  "fixer-ses-prix": {
    "prix-piege/alerte": [5],
    "prix-cible/distinction": [6, 9],
  },
  "construire-systeme-marketing-vente": {
    "systeme/actions": [9, 11, 12],
  },
  "deleguer-sans-perdre-controle": {
    "deleguer-resultat/faux-choix": [10],
    "transmettre-contexte/comprendre": [2, 4, 7],
  },
};

const errors = [];
const requireValue = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const manifest = JSON.parse(await readFile(paths.courseCasting, "utf8"));
requireValue(manifest.version === 1, "course-casting.json : version invalide.");

const referencedAssets = new Set();
for (const [slug, expectedBeats] of Object.entries(expected)) {
  const previousArguments = process.argv;
  process.argv = [
    previousArguments[0],
    previousArguments[1],
    `--course=${slug}`,
    `--variant=${variant}`,
  ];
  const course = await resolveCourse();
  const production = await loadProduction(course);
  await assertCurrentScript(course, production);
  requireValue(
    ["voice-approved", "render-ready", "final"].includes(production.status),
    `${slug}: gate voix absent (${production.status}).`,
  );

  const rawPilot = JSON.parse(await readFile(course.content, "utf8"));
  const pilot = await applyCasting(rawPilot, course);
  process.argv = previousArguments;

  for (const rawScene of rawPilot.scenes) {
    for (const rawBeat of rawScene.beats ?? []) {
      requireValue(
        !rawBeat.illustration,
        `${slug}/${rawScene.id}/${rawBeat.id}: le casting ne doit pas modifier le script approuvé.`,
      );
    }
  }

  const configured =
    manifest.variants?.[variant]?.courses?.[slug]?.beats ?? {};
  requireValue(
    JSON.stringify(Object.keys(configured).sort()) ===
      JSON.stringify(Object.keys(expectedBeats).sort()),
    `${slug}: liste de beats casting inattendue.`,
  );

  for (const [key, characterIds] of Object.entries(expectedBeats)) {
    const [sceneId, beatId] = key.split("/");
    const scene = pilot.scenes.find(({id}) => id === sceneId);
    const beat = scene?.beats?.find(({id}) => id === beatId);
    requireValue(Boolean(beat), `${slug}/${key}: beat introuvable.`);
    requireValue(
      beat?.template === "statement" || beat?.template === "action",
      `${slug}/${key}: template non compatible (${beat?.template ?? "absent"}).`,
    );
    requireValue(Boolean(beat?.illustration), `${slug}/${key}: illustration non fusionnée.`);
    requireValue(
      JSON.stringify(beat?.illustration?.characterIds) ===
        JSON.stringify(characterIds),
      `${slug}/${key}: characterIds incorrects.`,
    );

    const asset = beat?.illustration?.asset;
    if (!asset) {
      continue;
    }
    referencedAssets.add(asset);
    const absoluteAsset = path.join(paths.publicDir, asset);
    try {
      await access(absoluteAsset);
      const metadata = await sharp(absoluteAsset).metadata();
      requireValue(
        metadata.width === 1536 && metadata.height === 1024,
        `${slug}/${key}: asset ${metadata.width}×${metadata.height}, attendu 1536×1024.`,
      );
      requireValue(
        metadata.hasAlpha,
        `${slug}/${key}: canal alpha manquant.`,
      );
    } catch (error) {
      errors.push(`${slug}/${key}: asset inutilisable (${error.message}).`);
    }
  }
}

requireValue(
  referencedAssets.size === 8,
  `Casting : ${referencedAssets.size} assets référencés au lieu de 8.`,
);

if (errors.length) {
  for (const error of errors) {
    console.error(`ERREUR — ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Casting : 5 cours, 8 beats, 12 rôles — OK");
  console.log("Scripts approuvés inchangés — OK");
  console.log("Assets 1536×1024 transparents — OK");
}
