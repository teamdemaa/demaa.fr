import {access, mkdir, rename} from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {spawn} from "node:child_process";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {argumentValue} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";

const TARGET_I = -16;
const TARGET_TP = -1.5;
const TARGET_LRA = 11;
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
const force = process.argv.includes("--force");
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
const outputDirectory = path.join(stagingDirectory, "harmonized");
const ffmpeg = path.join(compositorDir, "ffmpeg");
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

const measureLoudness = async (file) => {
  const {stderr} = await run(ffmpeg, [
    "-hide_banner",
    "-nostats",
    "-v",
    "info",
    "-i",
    file,
    "-vn",
    "-filter:a",
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:print_format=json`,
    "-f",
    "null",
    "-",
  ]);
  const payload = stderr.match(/\{\s*"input_i"[\s\S]*?\}/u)?.[0];
  if (!payload) {
    throw new Error(`Mesure loudnorm introuvable pour ${file}.`);
  }
  return JSON.parse(payload);
};

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

await mkdir(outputDirectory, {recursive: true});
const report = [];

for (const slug of slugs) {
  const source = path.join(stagingDirectory, `cours-${slug}-final.mp4`);
  const output = path.join(outputDirectory, `cours-${slug}-final.mp4`);
  const temporaryOutput = `${output}.tmp.mp4`;
  await access(source);
  try {
    await access(output);
    if (!force) {
      throw new Error(
        `La sortie existe déjà : ${output}. Utilisez --force pour la remplacer atomiquement.`,
      );
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  const before = await measureLoudness(source);
  const filter = [
    `loudnorm=I=${TARGET_I}`,
    `TP=${TARGET_TP}`,
    `LRA=${TARGET_LRA}`,
    `measured_I=${before.input_i}`,
    `measured_TP=${before.input_tp}`,
    `measured_LRA=${before.input_lra}`,
    `measured_thresh=${before.input_thresh}`,
    `offset=${before.target_offset}`,
    "linear=true",
    "print_format=summary",
  ].join(":");

  await run(ffmpeg, [
    "-y",
    "-hide_banner",
    "-nostats",
    "-v",
    "warning",
    "-i",
    source,
    "-map",
    "0:v:0",
    "-map",
    "0:a:0",
    "-c:v",
    "copy",
    "-filter:a",
    filter,
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    temporaryOutput,
  ]);
  await rename(temporaryOutput, output);

  const after = await measureLoudness(output);
  const sourceVideoSha256 = await videoDigest(source);
  const outputVideoSha256 = await videoDigest(output);
  if (sourceVideoSha256 !== outputVideoSha256) {
    throw new Error(`Le flux vidéo a changé pour ${slug}.`);
  }

  report.push({
    slug,
    source,
    output,
    beforeLufs: Number(before.input_i),
    afterLufs: Number(after.input_i),
    truePeak: Number(after.input_tp),
    videoSha256: outputVideoSha256,
    videoStreamCopied: true,
  });
  console.log(
    `${slug}: ${before.input_i} → ${after.input_i} LUFS · vidéo identique`,
  );
}

console.log(JSON.stringify(report, null, 2));
