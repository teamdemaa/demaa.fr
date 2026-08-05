import {spawn} from "node:child_process";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";
import {writeJson} from "./lib/speech.mjs";

const rateArgument = process.argv.find((argument) =>
  argument.startsWith("--rate="),
);
const rate = Number(rateArgument?.split("=")[1] ?? 1.2);

if (!Number.isFinite(rate) || rate < 0.5 || rate > 2) {
  throw new Error("Le rythme doit être compris entre 0.5 et 2.");
}

const sourceAudio = path.join(
  paths.projectRoot,
  "public/audio/cookie-v1-source.mp3",
);
const finalAudio = path.join(
  paths.projectRoot,
  "public/audio/cookie-v1-grandfather-1.2x.mp3",
);
const sourceTimingFile = path.join(
  paths.projectRoot,
  "content/cookie-v1-timing-source.generated.json",
);
const finalTimingFile = path.join(
  paths.projectRoot,
  "content/cookie-v1-timing.generated.json",
);
const ffmpeg = path.join(compositorDir, "ffmpeg");

await new Promise((resolve, reject) => {
  const processHandle = spawn(
    ffmpeg,
    [
      "-y",
      "-i",
      sourceAudio,
      "-filter:a",
      `atempo=${rate}`,
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "128k",
      finalAudio,
    ],
    {
      env: {...process.env, DYLD_LIBRARY_PATH: compositorDir},
      stdio: "inherit",
    },
  );

  processHandle.once("error", reject);
  processHandle.once("exit", (code) => {
    if (code === 0) {
      resolve();
    } else {
      reject(new Error(`FFmpeg a terminé avec le code ${code}.`));
    }
  });
});

const sourceTiming = JSON.parse(
  await readFile(sourceTimingFile, "utf8"),
);
const entries = Object.entries(sourceTiming.scenes);
const audioDurationSeconds = sourceTiming.audioDurationSeconds / rate;
const totalDurationSeconds = audioDurationSeconds + 0.8;
const scenes = Object.fromEntries(
  entries.map(([id, scene], index) => {
    const startSeconds = scene.startSeconds / rate;
    const endSeconds =
      index === entries.length - 1
        ? totalDurationSeconds
        : scene.endSeconds / rate;

    return [
      id,
      {
        startSeconds,
        endSeconds,
        durationSeconds: endSeconds - startSeconds,
        speechStartSeconds: scene.speechStartSeconds / rate,
        speechEndSeconds: scene.speechEndSeconds / rate,
      },
    ];
  }),
);

await writeJson(finalTimingFile, {
  ...sourceTiming,
  source: `${sourceTiming.source}+postprocessed-${rate}x`,
  postprocessRate: rate,
  audioDurationSeconds,
  totalDurationSeconds,
  scenes,
});

console.log(`Narration finale : ${finalAudio}`);
console.log(`Rythme : ${rate}×`);
console.log(`Durée audio : ${audioDurationSeconds.toFixed(2)} s`);
console.log(`Durée vidéo : ${totalDurationSeconds.toFixed(2)} s`);
console.log(`Calage final : ${finalTimingFile}`);
