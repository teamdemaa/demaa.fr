import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {paths} from "./lib/config.mjs";
import {buildNarration} from "./lib/speech.mjs";

const relativeFiles = {
  script:
    "content/courses/gestion-tresorerie/variants/oumou-warm-v2/course.json",
  audio:
    "public/courses/gestion-tresorerie/variants/oumou-warm-v2/audio/narration.mp3",
  alignment:
    "public/courses/gestion-tresorerie/variants/oumou-warm-v2/audio/alignment.json",
  timing:
    "content/courses/gestion-tresorerie/variants/oumou-warm-v2/timing.generated.json",
};
const absoluteFiles = Object.fromEntries(
  Object.entries(relativeFiles).map(([key, file]) => [
    key,
    path.join(paths.projectRoot, file),
  ]),
);
const [pilot, alignmentPayload, timing] = await Promise.all([
  readFile(absoluteFiles.script, "utf8").then(JSON.parse),
  readFile(absoluteFiles.alignment, "utf8").then(JSON.parse),
  readFile(absoluteFiles.timing, "utf8").then(JSON.parse),
]);
const hashes = Object.fromEntries(
  await Promise.all(
    Object.entries(absoluteFiles).map(async ([key, file]) => [
      key,
      createHash("sha256").update(await readFile(file)).digest("hex"),
    ]),
  ),
);
const {text, ranges} = buildNarration(pilot.scenes);
const alignment = alignmentPayload.alignment;
if (alignment.characters.join("") !== text) {
  throw new Error("Le script C1 et l’alignement C1 ne correspondent pas.");
}

const firstPhrase = (narration) => {
  const match = narration.trim().match(/^.*?[.!?](?:\s|$)/u);
  return (match?.[0] ?? narration.trim()).trim();
};
const elementsForBeat = (scene, beat) => {
  if (!beat) return scene.onScreen.map((value, index) => `onScreen.${index}:${value}`);
  switch (beat.template) {
    case "statement":
      return [
        ...(beat.eyebrow ? [`eyebrow:${beat.eyebrow}`] : []),
        ...beat.lines.map((value, index) => `line.${index}:${value}`),
      ];
    case "comparison":
      return [
        `eyebrow:${beat.eyebrow}`,
        `left:${beat.left.label}|${beat.left.title}`,
        `sign:${beat.sign}`,
        `right:${beat.right.label}|${beat.right.title}`,
      ];
    case "timeline":
      return scene.onScreen.map((value, index) => `timeline.${index}:${value}`);
    case "chips":
      return [
        `eyebrow:${beat.eyebrow}`,
        `title:${beat.title}`,
        ...beat.items.map((value, index) => `chip.${index}:${value}`),
      ];
    case "example-pair":
      return [
        `eyebrow:${beat.eyebrow}`,
        `left:${beat.left.label}|${beat.left.value}`,
        `right:${beat.right.label}|${beat.right.value}`,
      ];
    case "metrics":
      return [
        `eyebrow:${beat.eyebrow}`,
        ...beat.cards.map(
          (card, index) => `metric.${index}:${card.label}|${card.value}`,
        ),
      ];
    case "paper-bank":
      return [
        `eyebrow:${beat.eyebrow}`,
        `left:${beat.left.label}|${beat.left.value}`,
        `middle:${beat.middle}`,
        `right:${beat.right.label}|${beat.right.value}`,
      ];
    case "term":
      return [
        `eyebrow:${beat.eyebrow}`,
        `term:${beat.term}`,
        `definition:${beat.definition}`,
      ];
    case "growth":
    case "low-point":
      return scene.onScreen.map(
        (value, index) => `${beat.template}.${index}:${value}`,
      );
    case "action":
      return [
        `number:${beat.number}`,
        `title:${beat.title}`,
        `detail:${beat.detail}`,
        ...beat.tags.map((value, index) => `tag.${index}:${value}`),
      ];
    default:
      throw new Error(`Template C1 inconnu : ${beat.template}`);
  }
};

const beats = [];
for (const scene of pilot.scenes) {
  const range = ranges.find(({id}) => id === scene.id);
  const sceneTiming = timing.scenes[scene.id];
  const narrativeBeats = scene.beats?.length
    ? scene.beats
    : [{id: "scene", startSeconds: 0, template: null}];
  for (const [index, beat] of narrativeBeats.entries()) {
    const triggerType = index === 0 ? "scene-start" : "cue";
    if (triggerType === "cue" && !beat.cue) {
      throw new Error(`${scene.id}/${beat.id}: cue explicite requise.`);
    }
    const phrase = triggerType === "scene-start" ? firstPhrase(scene.narration) : beat.cue;
    const sceneRelativeStart = scene.narration.trim().indexOf(phrase);
    if (sceneRelativeStart < 0) {
      throw new Error(`${scene.id}/${beat.id}: phrase source introuvable.`);
    }
    const absoluteStart = range.start + sceneRelativeStart;
    const absoluteEnd = absoluteStart + phrase.length - 1;
    const cueAudioSeconds =
      alignment.character_start_times_seconds[absoluteStart] /
      (timing.postprocessRate ?? 1);
    const visualStartSeconds =
      index === 0
        ? sceneTiming.startSeconds
        : sceneTiming.startSeconds +
          sceneTiming.beats[beat.id].startSeconds;
    beats.push({
      sceneId: scene.id,
      beatId: beat.id,
      trigger: {
        type: triggerType,
        cue: triggerType === "cue" ? phrase : null,
      },
      sourcePhrase: phrase,
      sourcePhraseRange: {
        sceneRelativeStart,
        sceneRelativeEnd: sceneRelativeStart + phrase.length - 1,
        absoluteStart,
        absoluteEnd,
      },
      sceneStartSeconds: sceneTiming.startSeconds,
      cueAudioSeconds,
      visualStartSeconds,
      visualLeadSeconds: Number(
        (cueAudioSeconds - visualStartSeconds).toFixed(6),
      ),
      elements: elementsForBeat(scene, beat.template ? beat : null),
    });
  }
}

console.log(
  JSON.stringify(
    {
      version: 1,
      kind: "NarrativeBeatContract",
      course: "gestion-tresorerie",
      variant: "oumou-warm-v2",
      immutableSources: {
        ...Object.fromEntries(
          Object.entries(relativeFiles).map(([key, file]) => [
            key,
            {file, sha256: hashes[key]},
          ]),
        ),
      },
      renderAudio: {
        file: "public/courses/gestion-tresorerie/variants/oumou-warm-v2/audio/candidates/c1-mastering-v2/narration-mastered.wav",
        sha256:
          "44fb08899317cd122c5690d011a3b8ac3426dbc2063c7c9ffd03a52670a13ce3",
        provenance: "c1-mastering-v2 déjà validé, aucun crédit vocal",
      },
      policy: {
        sceneStartTrigger: "first beat starts exactly at scene boundary",
        cueLeadSeconds: 0.25,
        cueLeadToleranceSeconds: 0.02,
        hiddenElementDelayFrames: 0,
      },
      beats,
    },
    null,
    2,
  ),
);
