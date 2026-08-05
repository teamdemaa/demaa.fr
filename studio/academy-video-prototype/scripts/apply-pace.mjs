import {spawn} from "node:child_process";
import {access, copyFile, readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";
import {resolveCourse} from "./lib/course.mjs";
import {assertProductionStage} from "./lib/production.mjs";
import {writeJson} from "./lib/speech.mjs";

const rateArgument = process.argv.find((argument) =>
  argument.startsWith("--rate="),
);
const rate = Number(rateArgument?.split("=")[1] ?? 1);
const isShort = process.argv.includes("--short");
const course = isShort ? null : await resolveCourse();

if (!Number.isFinite(rate) || rate < 0.5 || rate > 2) {
  throw new Error("Le rythme doit être compris entre 0.5 et 2.");
}

const files = isShort
  ? {
      sourceAudio: paths.shortNarrationSourceAudio,
      finalAudio: paths.shortNarrationAudio,
      sourceTiming: paths.shortSourceTiming,
      finalTiming: paths.shortTiming,
    }
  : {
      sourceAudio: course.sourceAudio,
      finalAudio: course.audio,
      sourceTiming: course.sourceTiming,
      finalTiming: course.timing,
    };
const force = process.argv.includes("--force");
if (force && course) {
  await assertProductionStage(course, [
    "voice-approved",
    "render-ready",
    "final",
  ]);
}
const adoptExistingCache = process.argv.includes("--adopt-existing-cache");
const sourceAudio = await readFile(files.sourceAudio);
const sourceTimingText = await readFile(files.sourceTiming, "utf8");
const paceHash = createHash("sha256")
  .update(sourceAudio)
  .update(sourceTimingText)
  .update(String(rate))
  .digest("hex");
const cacheFile = `${files.finalAudio}.manifest.json`;
const finalFilesExist = (
  await Promise.all(
    [files.finalAudio, files.finalTiming].map(async (file) => {
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

if (cache?.paceHash === paceHash && finalFilesExist && !force) {
  console.log(`Narration rythmée réutilisée : ${files.finalAudio}`);
  process.exit(0);
}

if (adoptExistingCache) {
  if (!finalFilesExist) {
    throw new Error("Impossible d’adopter le cache rythmé : un fichier manque.");
  }
  await writeJson(cacheFile, {
    version: 1,
    paceHash,
    rate,
    adoptedAt: new Date().toISOString(),
  });
  console.log(`Cache du rythme adopté : ${cacheFile}`);
  process.exit(0);
}

if (!force) {
  throw new Error(
    finalFilesExist
      ? "Le rendu audio final existe mais son cache ne correspond pas. Utilisez --adopt-existing-cache ou --force."
      : "Le rythme audio doit être calculé. Relancez avec --force.",
  );
}

const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffmpegEnvironment = {
  ...process.env,
  DYLD_LIBRARY_PATH: compositorDir,
};

if (rate === 1) {
  await copyFile(files.sourceAudio, files.finalAudio);
} else {
  await new Promise((resolve, reject) => {
    const processHandle = spawn(
      ffmpeg,
      [
        "-y",
        "-i",
        files.sourceAudio,
        "-filter:a",
        `atempo=${rate}`,
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "128k",
        files.finalAudio,
      ],
      {env: ffmpegEnvironment, stdio: "inherit"},
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
}

const sourceTiming = JSON.parse(await readFile(files.sourceTiming, "utf8"));
const audioDurationSeconds = sourceTiming.audioDurationSeconds / rate;
const totalDurationSeconds = audioDurationSeconds + 1.2;
const entries = Object.entries(sourceTiming.scenes);

const scenes = Object.fromEntries(
  entries.map(([id, scene], index) => {
    const startSeconds = scene.startSeconds / rate;
    const isLast = index === entries.length - 1;
    const endSeconds = isLast
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
        beats: Object.fromEntries(
          Object.entries(scene.beats ?? {}).map(([beatId, beat]) => {
            const cueStartSeconds = beat.cueStartSeconds / rate;
            return [
              beatId,
              {
                cueStartSeconds,
                leadSeconds: beat.leadSeconds,
                startSeconds: Math.max(
                  0,
                  cueStartSeconds - startSeconds - beat.leadSeconds,
                ),
              },
            ];
          }),
        ),
      },
    ];
  }),
);

await writeJson(files.finalTiming, {
  ...sourceTiming,
  source: `${sourceTiming.source}+postprocessed-${rate}x`,
  postprocessRate: rate,
  audioDurationSeconds,
  totalDurationSeconds,
  scenes,
});
await writeJson(cacheFile, {
  version: 1,
  paceHash,
  rate,
  generatedAt: new Date().toISOString(),
});

console.log(`Narration finale : ${files.finalAudio}`);
console.log(`Rythme : ${rate}×`);
console.log(`Durée audio : ${audioDurationSeconds.toFixed(2)} s`);
console.log(`Durée vidéo : ${totalDurationSeconds.toFixed(2)} s`);
console.log(`Calage final : ${files.finalTiming}`);
