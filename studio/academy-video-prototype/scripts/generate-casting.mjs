import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {
  elevenLabsRequest,
  paths,
  requireVoiceId,
  voiceSettings,
} from "./lib/config.mjs";

const text = (await readFile(paths.castingText, "utf8")).trim();
const voiceId = process.argv[2]?.trim() || requireVoiceId();
const response = await elevenLabsRequest(
  `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
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

await mkdir(paths.audioDir, {recursive: true});
const output = path.join(paths.audioDir, `casting-${voiceId}.mp3`);
await writeFile(output, Buffer.from(await response.arrayBuffer()));
console.log(`Casting créé : ${output}`);
