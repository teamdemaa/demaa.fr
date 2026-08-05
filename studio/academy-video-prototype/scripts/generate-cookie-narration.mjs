import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {
  elevenLabsRequest,
  paths,
  requireVoiceId,
  voiceSettings,
} from "./lib/config.mjs";
import {buildNarration, deriveTiming, writeJson} from "./lib/speech.mjs";

const pilotPath = path.join(paths.projectRoot, "content/cookie-v1.json");
const audioPath = path.join(
  paths.projectRoot,
  "public/audio/cookie-v1-source.mp3",
);
const alignmentPath = path.join(
  paths.projectRoot,
  "public/audio/cookie-v1-alignment.json",
);
const timingPath = path.join(
  paths.projectRoot,
  "content/cookie-v1-timing-source.generated.json",
);

const pilot = JSON.parse(await readFile(pilotPath, "utf8"));
const {text, ranges} = buildNarration(pilot.scenes);
const voiceId = requireVoiceId();

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
const timing = deriveTiming({
  pilot,
  text,
  ranges,
  alignment: payload.alignment,
});

await mkdir(paths.audioDir, {recursive: true});
await writeFile(audioPath, Buffer.from(payload.audio_base64, "base64"));
await writeJson(alignmentPath, {
  voiceId,
  modelId: voiceSettings.modelId,
  text,
  alignment: payload.alignment,
  normalizedAlignment: payload.normalized_alignment,
});
await writeJson(timingPath, timing);

console.log(`Narration source : ${audioPath}`);
console.log(`Durée audio source : ${timing.audioDurationSeconds.toFixed(2)} s`);
console.log(`Calage source : ${timingPath}`);
