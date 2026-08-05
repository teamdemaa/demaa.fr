import {access} from "node:fs/promises";
import path from "node:path";
import {spawn} from "node:child_process";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {loadCourseFiles, resolveCourse} from "./lib/course.mjs";
import {
  assertProductionStage,
  finalizeProduction,
} from "./lib/production.mjs";

const course = await resolveCourse();
await assertProductionStage(course, ["render-ready", "final"]);
const {pilot, timing} = await loadCourseFiles(course);
const fileArgument = process.argv.find((argument) => argument.startsWith("--file="));
const video = fileArgument ? path.resolve(fileArgument.slice(7)) : course.finalOutput;
await access(video);

const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffprobe = path.join(compositorDir, "ffprobe");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};

const capture = (command, argumentsList) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(command, argumentsList, {env: environment});
    let stdout = "";
    let stderr = "";
    processHandle.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    processHandle.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) {
        resolve({stdout, stderr});
      } else {
        reject(new Error(`${path.basename(command)} (${code})\n${stderr.slice(-3000)}`));
      }
    });
  });

const probe = await capture(ffprobe, [
  "-v",
  "error",
  "-show_entries",
  "format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,color_space,color_transfer,color_primaries",
  "-of",
  "json",
  video,
]);
const metadata = JSON.parse(probe.stdout);
const videoStream = metadata.streams.find((stream) => stream.codec_type === "video");
const audioStream = metadata.streams.find((stream) => stream.codec_type === "audio");
const duration = Number(metadata.format.duration);
const expectedDuration = timing.totalDurationSeconds;
const failures = [];

if (!videoStream) failures.push("Flux vidéo absent.");
if (!audioStream) failures.push("Flux audio absent.");
if (videoStream?.width !== pilot.format.width) failures.push(`Largeur : ${videoStream?.width}.`);
if (videoStream?.height !== pilot.format.height) failures.push(`Hauteur : ${videoStream?.height}.`);
if (videoStream?.r_frame_rate !== `${pilot.format.fps}/1`) {
  failures.push(`Cadence : ${videoStream?.r_frame_rate}.`);
}
if (videoStream?.color_space !== "bt709") {
  failures.push(`Espace couleur : ${videoStream?.color_space ?? "absent"}.`);
}
if (videoStream?.color_transfer !== "bt709") {
  failures.push(
    `Courbe de transfert : ${videoStream?.color_transfer ?? "absente"}.`,
  );
}
if (videoStream?.color_primaries !== "bt709") {
  failures.push(
    `Primaires : ${videoStream?.color_primaries ?? "absentes"}.`,
  );
}
if (Math.abs(duration - expectedDuration) > 0.15) {
  failures.push(
    `Durée ${duration.toFixed(3)} s au lieu de ${expectedDuration.toFixed(3)} s.`,
  );
}

await capture(ffmpeg, [
  "-v",
  "error",
  "-i",
  video,
  "-an",
  "-c:v",
  "rawvideo",
  "-f",
  "null",
  "-",
]);
const scan = await capture(ffmpeg, [
  "-v",
  "info",
  "-i",
  video,
  "-vn",
  "-filter:a",
  "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
  "-c:a",
  "pcm_s16le",
  "-f",
  "null",
  "-",
]);
const loudness = scan.stderr.match(/"input_i"\s*:\s*"([^"]+)"/u)?.[1];
const loudnessValue = Number(loudness);
if (!Number.isFinite(loudnessValue)) {
  failures.push("Loudness intégrée non mesurable.");
} else if (loudnessValue < -18 || loudnessValue > -14) {
  failures.push(
    `Loudness intégrée ${loudnessValue.toFixed(2)} LUFS hors cible −18 à −14 LUFS.`,
  );
}

console.log(`Fichier : ${video}`);
console.log(
  `Vidéo : ${videoStream?.codec_name}, ${videoStream?.width}×${videoStream?.height}, ${videoStream?.r_frame_rate}`,
);
console.log(`Audio : ${audioStream?.codec_name}`);
console.log(`Durée : ${duration.toFixed(3)} s`);
console.log(`Loudness intégrée : ${loudness ?? "non mesurée"} LUFS`);
console.log("Décodage intégral : OK");

if (failures.length) {
  for (const failure of failures) console.error(`ERREUR — ${failure}`);
  process.exitCode = 1;
} else {
  await finalizeProduction(course, {
    duration,
    loudness,
    videoStream,
    audioStream,
  });
  console.log("Contrôle qualité vidéo : OK");
  console.log("Statut de production : final");
}
