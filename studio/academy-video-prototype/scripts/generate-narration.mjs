import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";
import {
  elevenLabsRequest,
  paths,
  requireVoiceId,
  voiceSettings,
} from "./lib/config.mjs";
import {resolveCourse} from "./lib/course.mjs";
import {assertProductionStage} from "./lib/production.mjs";
import {buildNarration, deriveTiming, writeJson} from "./lib/speech.mjs";

const isShort = process.argv.includes("--short");
const course = isShort ? null : await resolveCourse();
const output = isShort
  ? {
      pilot: paths.shortPilot,
      narrationAudio: paths.shortNarrationSourceAudio,
      alignment: paths.shortAlignment,
      timing: paths.shortSourceTiming,
    }
  : {
      pilot: course.content,
      narrationAudio: course.sourceAudio,
      alignment: course.alignment,
      timing: course.sourceTiming,
    };

const pilot = JSON.parse(await readFile(output.pilot, "utf8"));
const {text, ranges} = buildNarration(pilot.scenes);
const voiceId = requireVoiceId();
const force = process.argv.includes("--force");
if (force && course) {
  await assertProductionStage(course, [
    "script-approved",
    "voice-approved",
    "render-ready",
    "final",
  ]);
}
const adoptExistingCache = process.argv.includes("--adopt-existing-cache");
const cacheFile = `${output.narrationAudio}.manifest.json`;
const requestDescriptor = {
  text,
  voiceId,
  modelId: voiceSettings.modelId,
  outputFormat: "mp3_44100_128",
  voiceSettings: {
    stability: voiceSettings.stability,
    similarityBoost: voiceSettings.similarityBoost,
    style: voiceSettings.style,
    useSpeakerBoost: voiceSettings.useSpeakerBoost,
    speed: voiceSettings.speed,
  },
};
const requestHash = createHash("sha256")
  .update(JSON.stringify(requestDescriptor))
  .digest("hex");
const requiredFiles = [
  output.narrationAudio,
  output.alignment,
  output.timing,
];
const requiredFilesExist = (
  await Promise.all(
    requiredFiles.map(async (file) => {
      try {
        await access(file);
        return true;
      } catch {
        return false;
      }
    }),
  )
).every(Boolean);
let cache;
try {
  cache = JSON.parse(await readFile(cacheFile, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

if (cache?.requestHash === requestHash && requiredFilesExist && !force) {
  console.log(`Narration réutilisée : ${output.narrationAudio}`);
  console.log("Aucun crédit ElevenLabs consommé.");
  process.exit(0);
}

if (adoptExistingCache) {
  if (!requiredFilesExist) {
    throw new Error("Impossible d’adopter le cache : un fichier existant manque.");
  }
  await writeJson(cacheFile, {
    version: 1,
    requestHash,
    request: requestDescriptor,
    adoptedAt: new Date().toISOString(),
  });
  console.log(`Cache adopté sans appel ElevenLabs : ${cacheFile}`);
  process.exit(0);
}

if (!force) {
  throw new Error(
    requiredFilesExist
      ? "La narration existe mais son cache ne correspond pas. Utilisez --adopt-existing-cache pour l’adopter sans coût, ou --force pour régénérer via ElevenLabs."
      : "La narration doit être générée. Relancez avec --force pour autoriser explicitement l’appel ElevenLabs payant.",
  );
}

const response = await elevenLabsRequest(
  `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: "POST",
    body: JSON.stringify({
      text,
      model_id: voiceSettings.modelId,
      voice_settings: {
        stability: voiceSettings.stability,
        similarity_boost: voiceSettings.similarityBoost,
        style: voiceSettings.style,
        use_speaker_boost: voiceSettings.useSpeakerBoost,
        speed: voiceSettings.speed,
      },
    }),
  },
);

const payload = await response.json();
const alignment = payload.alignment;
const timing = deriveTiming({pilot, text, ranges, alignment});

await mkdir(path.dirname(output.narrationAudio), {recursive: true});
await writeFile(output.narrationAudio, Buffer.from(payload.audio_base64, "base64"));
await writeJson(output.alignment, {
  voiceId,
  modelId: voiceSettings.modelId,
  text,
  alignment,
  normalizedAlignment: payload.normalized_alignment,
});
await writeJson(output.timing, timing);
await writeJson(cacheFile, {
  version: 1,
  requestHash,
  request: requestDescriptor,
  generatedAt: new Date().toISOString(),
});

console.log(`Narration : ${output.narrationAudio}`);
console.log(`Durée audio : ${timing.audioDurationSeconds.toFixed(2)} s`);
console.log(`Durée vidéo : ${timing.totalDurationSeconds.toFixed(2)} s`);
console.log(`Calage : ${output.timing}`);
