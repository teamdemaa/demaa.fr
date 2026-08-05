import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {paths} from "./lib/config.mjs";
import {argumentValue, resolveCourse} from "./lib/course.mjs";
import {buildNarration} from "./lib/speech.mjs";

const allowMissingMedia = process.argv.includes("--allow-missing-media");
const minimumDurationSeconds = Number(argumentValue("duration-min", "180"));
const maximumDurationSeconds = Number(argumentValue("duration-max", "300"));
if (
  !Number.isFinite(minimumDurationSeconds) ||
  !Number.isFinite(maximumDurationSeconds) ||
  minimumDurationSeconds <= 0 ||
  maximumDurationSeconds < minimumDurationSeconds
) {
  throw new Error("Bornes de durée invalides.");
}
const course = await resolveCourse();
const pilot = JSON.parse(await readFile(course.content, "utf8"));
let timing;
try {
  timing = JSON.parse(await readFile(course.timing, "utf8"));
} catch (error) {
  if (!allowMissingMedia || error?.code !== "ENOENT") {
    throw error;
  }
  timing = {
    fps: pilot.format?.fps ?? 30,
    totalDurationSeconds: 0,
    scenes: {},
  };
}
const errors = [];
const warnings = [];
const cueDiagnostics = [];

const requireValue = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

requireValue(pilot.id, "pilot.id manque.");
requireValue(pilot.title, "pilot.title manque.");
requireValue(pilot.courseTitle, "pilot.courseTitle manque pour l’intro.");
requireValue(Array.isArray(pilot.scenes) && pilot.scenes.length > 0, "Aucune scène.");
requireValue(
  Array.isArray(pilot.scenes) &&
    pilot.scenes.length >= 6 &&
    pilot.scenes.length <= 9,
  "Un mini-cours doit contenir entre 6 et 9 scènes.",
);
requireValue(pilot.format?.fps > 0, "format.fps doit être positif.");
requireValue(pilot.format?.width > 0, "format.width doit être positif.");
requireValue(pilot.format?.height > 0, "format.height doit être positif.");

const sceneIds = new Set();
let narrationWordCount = 0;
for (const scene of pilot.scenes ?? []) {
  const sceneWords = scene.narration?.trim().split(/\s+/u).filter(Boolean).length ?? 0;
  narrationWordCount += sceneWords;
  requireValue(!sceneIds.has(scene.id), `Identifiant de scène dupliqué : ${scene.id}`);
  sceneIds.add(scene.id);
  requireValue(scene.title?.trim(), `${scene.id}: titre vide.`);
  requireValue(scene.narration?.trim(), `${scene.id}: narration vide.`);
  requireValue(
    sceneWords >= 25 && sceneWords <= 130,
    `${scene.id}: narration de ${sceneWords} mots ; cible 25 à 130.`,
  );
  requireValue(
    Array.isArray(scene.onScreen) && scene.onScreen.length > 0,
    `${scene.id}: onScreen vide.`,
  );
  requireValue(
    Array.isArray(scene.onScreen) && scene.onScreen.length <= 4,
    `${scene.id}: maximum 4 éléments onScreen.`,
  );
  if (!allowMissingMedia) {
    requireValue(timing.scenes?.[scene.id], `${scene.id}: timing généré manquant.`);
  }

  if (scene.visual?.asset) {
    try {
      await access(path.join(paths.publicDir, scene.visual.asset));
    } catch {
      errors.push(`${scene.id}: asset introuvable : ${scene.visual.asset}`);
    }
  }

  const beatIds = new Set();
  let previousStart = -1;
  for (const [index, beat] of (scene.beats ?? []).entries()) {
    requireValue(!beatIds.has(beat.id), `${scene.id}: beat dupliqué : ${beat.id}`);
    beatIds.add(beat.id);
    requireValue(
      Number.isFinite(beat.startSeconds) && beat.startSeconds >= 0,
      `${scene.id}/${beat.id}: startSeconds invalide.`,
    );
    requireValue(
      beat.startSeconds >= previousStart,
      `${scene.id}/${beat.id}: les beats ne sont pas triés.`,
    );
    if (index === 0) {
      requireValue(
        beat.startSeconds === 0,
        `${scene.id}: le premier beat doit commencer à 0.`,
      );
    }
    previousStart = beat.startSeconds;

    if (beat.cue) {
      const occurrences = scene.narration.split(beat.cue).length - 1;
      requireValue(
        occurrences === 1,
        `${scene.id}/${beat.id}: la cue « ${beat.cue} » doit apparaître exactement une fois (trouvé : ${occurrences}).`,
      );
    }
  }

  const sceneTiming = timing.scenes?.[scene.id];
  const sceneDuration = sceneTiming?.durationSeconds;
  const lastBeat = scene.beats?.at(-1);
  const effectiveLastStart = lastBeat
    ? (sceneTiming?.beats?.[lastBeat.id]?.startSeconds ??
      lastBeat.startSeconds)
    : -1;
  if (
    Number.isFinite(sceneDuration) &&
    effectiveLastStart >= sceneDuration
  ) {
    errors.push(
      `${scene.id}: le dernier beat (${effectiveLastStart.toFixed(2)} s) dépasse la scène (${sceneDuration.toFixed(2)} s).`,
    );
  }
}

requireValue(
  narrationWordCount >= 350 && narrationWordCount <= 700,
  `Narration totale : ${narrationWordCount} mots ; cible 350 à 700.`,
);

for (const id of Object.keys(timing.scenes ?? {})) {
  if (!sceneIds.has(id)) {
    warnings.push(`Timing orphelin : ${id}`);
  }
}

if (!allowMissingMedia) {
  requireValue(
    timing.totalDurationSeconds >= minimumDurationSeconds &&
      timing.totalDurationSeconds <= maximumDurationSeconds,
    `Durée finale : ${timing.totalDurationSeconds.toFixed(2)} s ; cible ${minimumDurationSeconds} à ${maximumDurationSeconds} s.`,
  );
  requireValue(
    Math.abs(
      Object.values(timing.scenes ?? {}).reduce(
        (total, scene) => total + scene.durationSeconds,
        0,
      ) - timing.totalDurationSeconds,
    ) < 0.05,
    "La somme des scènes ne correspond pas à la durée totale.",
  );
}

try {
  const alignmentPayload = JSON.parse(await readFile(course.alignment, "utf8"));
  const alignment = alignmentPayload.alignment;
  const {text, ranges} = buildNarration(pilot.scenes);
  if (alignment?.characters?.join("") === text) {
    const rate = timing.postprocessRate ?? 1;
    for (const scene of pilot.scenes) {
      const range = ranges.find((item) => item.id === scene.id);
      for (const beat of scene.beats ?? []) {
        if (!beat.cue || !range) {
          continue;
        }
        const localIndex = scene.narration.trim().indexOf(beat.cue);
        const absoluteCharacter = range.start + localIndex;
        const cueAbsolute =
          alignment.character_start_times_seconds[absoluteCharacter] / rate;
        const cueRelative =
          cueAbsolute - timing.scenes[scene.id].startSeconds;
        const effectiveStart =
          timing.scenes[scene.id].beats?.[beat.id]?.startSeconds ??
          beat.startSeconds;
        cueDiagnostics.push({
          scene: scene.id,
          beat: beat.id,
          effectiveSeconds: Number(effectiveStart.toFixed(2)),
          spokenCueSeconds: Number(cueRelative.toFixed(2)),
          leadSeconds: Number((cueRelative - effectiveStart).toFixed(2)),
        });
        requireValue(
          cueRelative - effectiveStart >= 0.1 &&
            cueRelative - effectiveStart <= 0.5,
          `${scene.id}/${beat.id}: avance visuelle hors cible ` +
            `(${(cueRelative - effectiveStart).toFixed(2)} s ; cible 0.10 à 0.50).`,
        );
      }
    }
  } else {
    warnings.push("Alignement présent mais texte différent : diagnostic des cues ignoré.");
  }
} catch (error) {
  if (!allowMissingMedia) {
    errors.push(`Alignement inutilisable : ${error.message}`);
  }
}

for (const media of [course.sourceAudio, course.audio]) {
  try {
    await access(media);
  } catch {
    if (!allowMissingMedia) {
      errors.push(`Média manquant : ${path.relative(paths.projectRoot, media)}`);
    }
  }
}

console.log(`Cours : ${course.slug}`);
console.log(`Scènes : ${pilot.scenes.length}`);
console.log(
  `Durée : ${timing.totalDurationSeconds.toFixed(2)} s (${Math.ceil(
    timing.totalDurationSeconds * timing.fps,
  )} images)`,
);
if (cueDiagnostics.length) {
  console.table(cueDiagnostics);
}
for (const warning of warnings) {
  console.warn(`AVERTISSEMENT — ${warning}`);
}
if (errors.length) {
  for (const error of errors) {
    console.error(`ERREUR — ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Validation éditoriale et technique : OK");
}
