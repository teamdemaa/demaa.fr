import {createReadStream} from "node:fs";
import {access, writeFile} from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {spawn} from "node:child_process";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {argumentValue} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";

const activeCourseSlugs = [
  "gestion-tresorerie",
  "chiffre-affaires-benefice",
  "fixer-ses-prix",
  "construire-systeme-marketing-vente",
  "deleguer-sans-perdre-controle",
];
const allowedCourseSlugs = [
  ...activeCourseSlugs,
  "transformer-demande-client",
];
const slugs = argumentValue("courses", activeCourseSlugs.join(","))
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);
for (const slug of slugs) {
  if (!allowedCourseSlugs.includes(slug)) {
    throw new Error(`Cours non autorisé dans ce lot : ${slug}.`);
  }
}
const stagingDirectory = path.join(
  paths.projectRoot,
  "output",
  "staging",
  "oumou-v1",
);
const harmonizedDirectory = path.join(stagingDirectory, "harmonized");
const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffprobe = path.join(compositorDir, "ffprobe");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};

const run = (command, argumentsList) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, {env: environment});
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve({stdout, stderr});
      } else {
        reject(
          new Error(
            `${path.basename(command)} (${code})\n${stderr.slice(-4000)}`,
          ),
        );
      }
    });
  });

const fileDigest = (file) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.once("error", reject);
    stream.once("end", () => resolve(hash.digest("hex")));
  });

const videoDigest = (file) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const child = spawn(
      ffmpeg,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        file,
        "-map",
        "0:v:0",
        "-c:v",
        "copy",
        "-f",
        "h264",
        "-",
      ],
      {env: environment},
    );
    let stderr = "";
    child.stdout.on("data", (chunk) => hash.update(chunk));
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve(hash.digest("hex"));
      } else {
        reject(new Error(`Empreinte vidéo impossible.\n${stderr.slice(-2000)}`));
      }
    });
  });

const inspect = async (file) => {
  const {stdout} = await run(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,color_space,color_transfer,color_primaries",
    "-of",
    "json",
    file,
  ]);
  const metadata = JSON.parse(stdout);
  const video = metadata.streams.find((stream) => stream.codec_type === "video");
  const audio = metadata.streams.find((stream) => stream.codec_type === "audio");
  const {stderr} = await run(ffmpeg, [
    "-hide_banner",
    "-nostats",
    "-v",
    "info",
    "-i",
    file,
    "-vn",
    "-filter:a",
    "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
    "-f",
    "null",
    "-",
  ]);
  const payload = stderr.match(/\{\s*"input_i"[\s\S]*?\}/u)?.[0];
  if (!payload) {
    throw new Error(`Mesure loudnorm introuvable pour ${file}.`);
  }
  const loudness = JSON.parse(payload);
  return {
    durationSeconds: Number(metadata.format.duration),
    loudnessLufs: Number(loudness.input_i),
    truePeakDbtp: Number(loudness.input_tp),
    video,
    audio,
  };
};

const report = [];
for (const slug of slugs) {
  const source = path.join(stagingDirectory, `cours-${slug}-final.mp4`);
  const output = path.join(harmonizedDirectory, `cours-${slug}-final.mp4`);
  await Promise.all([access(source), access(output)]);
  const [sourceInfo, outputInfo] = await Promise.all([
    inspect(source),
    inspect(output),
  ]);
  await run(ffmpeg, [
    "-v",
    "error",
    "-i",
    output,
    "-an",
    "-c:v",
    "rawvideo",
    "-f",
    "null",
    "-",
  ]);
  const [sha256, sourceVideoSha256, outputVideoSha256] = await Promise.all([
    fileDigest(output),
    videoDigest(source),
    videoDigest(output),
  ]);

  const failures = [];
  if (outputInfo.video?.codec_name !== "h264") failures.push("codec vidéo");
  if (outputInfo.video?.width !== 1920) failures.push("largeur");
  if (outputInfo.video?.height !== 1080) failures.push("hauteur");
  if (outputInfo.video?.r_frame_rate !== "30/1") failures.push("cadence");
  if (outputInfo.video?.color_space !== "bt709") failures.push("espace couleur");
  if (outputInfo.video?.color_transfer !== "bt709") {
    failures.push("courbe de transfert");
  }
  if (outputInfo.video?.color_primaries !== "bt709") failures.push("primaires");
  if (outputInfo.audio?.codec_name !== "aac") failures.push("codec audio");
  if (Math.abs(outputInfo.loudnessLufs - -16) > 0.3) failures.push("loudness");
  if (
    Math.abs(outputInfo.durationSeconds - sourceInfo.durationSeconds) > 0.05
  ) {
    failures.push("durée");
  }
  if (sourceVideoSha256 !== outputVideoSha256) failures.push("flux vidéo");
  if (failures.length) {
    throw new Error(`${slug}: QA en échec (${failures.join(", ")}).`);
  }

  report.push({
    slug,
    file: output,
    durationSeconds: outputInfo.durationSeconds,
    beforeLufs: sourceInfo.loudnessLufs,
    finalLufs: outputInfo.loudnessLufs,
    truePeakDbtp: outputInfo.truePeakDbtp,
    sha256,
    videoSha256: outputVideoSha256,
    videoStreamCopied: true,
    decode: "OK",
  });
  console.log(
    `${slug}: ${outputInfo.durationSeconds.toFixed(3)} s · ` +
      `${outputInfo.loudnessLufs.toFixed(2)} LUFS · vidéo identique · QA OK`,
  );
}

const reportFile = path.join(harmonizedDirectory, "qa-report.json");
await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Rapport : ${reportFile}`);
