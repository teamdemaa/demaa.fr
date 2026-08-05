import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";

const run = promisify(execFile);
const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffprobe = path.join(compositorDir, "ffprobe");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};
const slug = "gestion-tresorerie";
const variant = "oumou-warm-v2";
const candidate = "c1-mastering-v2";
const courseDirectory = path.join(
  paths.projectRoot,
  "content",
  "courses",
  slug,
  "variants",
  variant,
);
const publicAudioDirectory = path.join(
  paths.publicDir,
  "courses",
  slug,
  "variants",
  variant,
  "audio",
);
const source = path.join(publicAudioDirectory, "narration-source.mp3");
const outputDirectory = path.join(
  publicAudioDirectory,
  "candidates",
  candidate,
);
const output = path.join(outputDirectory, "narration-mastered.wav");
const reportDirectory = path.join(
  paths.projectRoot,
  "output",
  "staging",
  variant,
  "audits",
  candidate,
);
const reportPath = path.join(reportDirectory, "audio-audit.json");
const timing = JSON.parse(
  await readFile(path.join(courseDirectory, "timing.generated.json"), "utf8"),
);
const production = JSON.parse(
  await readFile(path.join(courseDirectory, "production.json"), "utf8"),
);

const sha256 = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");
const sourceSha256 = await sha256(source);
if (sourceSha256 !== production.voice?.sourceAudioSha256) {
  throw new Error("Le hash de la narration source ne correspond pas au gate voix.");
}

await mkdir(outputDirectory, {recursive: true});
await mkdir(reportDirectory, {recursive: true});
await run(
  ffmpeg,
  [
    "-v",
    "error",
    "-i",
    source,
    "-filter:a",
    "loudnorm=I=-12:TP=-1.5:LRA=5,volume=-3dB",
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s24le",
    "-y",
    output,
  ],
  {env: environment, maxBuffer: 3_000_000},
);

const measure = async (file, startSeconds = null, durationSeconds = null) => {
  const args = ["-v", "info"];
  if (startSeconds !== null) args.push("-ss", String(startSeconds));
  if (durationSeconds !== null) args.push("-t", String(durationSeconds));
  args.push(
    "-i",
    file,
    "-vn",
    "-filter:a",
    "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
    "-c:a",
    "pcm_s16le",
    "-f",
    "null",
    "-",
  );
  const {stderr} = await run(ffmpeg, args, {
    env: environment,
    maxBuffer: 3_000_000,
  });
  const value = (key) =>
    Number(
      stderr.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, "u"))?.[1],
    );
  return {
    integratedLufs: value("input_i"),
    truePeakDbtp: value("input_tp"),
    loudnessRangeLu: value("input_lra"),
    thresholdLufs: value("input_thresh"),
  };
};

const sceneMeasurements = async (file) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(timing.scenes).map(async ([scene, values]) => [
        scene,
        await measure(
          file,
          values.startSeconds,
          values.endSeconds - values.startSeconds,
        ),
      ]),
    ),
  );

const before = {
  full: await measure(source),
  scenes: await sceneMeasurements(source),
};
const after = {
  full: await measure(output),
  scenes: await sceneMeasurements(output),
};
const outputSha256 = await sha256(output);
const probeDuration = async (file) => {
  const {stdout} = await run(
    ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nk=1:nw=1",
      file,
    ],
    {env: environment, maxBuffer: 1_000_000},
  );
  return Number(stdout.trim());
};
const sourceDurationSeconds = await probeDuration(source);
const outputDurationSeconds = await probeDuration(output);
const sceneLevels = Object.values(after.scenes).map(
  ({integratedLufs}) => integratedLufs,
);
const expectedStereoIntegratedLufs = Number(
  (after.full.integratedLufs + 3.01).toFixed(2),
);
const checks = {
  sourcePreserved: (await sha256(source)) === sourceSha256,
  integratedLoudness:
    expectedStereoIntegratedLufs >= -16.5 &&
    expectedStereoIntegratedLufs <= -15.5,
  truePeak: after.full.truePeakDbtp <= -4.45,
  sceneConsistency:
    Math.max(...sceneLevels) - Math.min(...sceneLevels) <= 2.5,
  durationAndTimingUntouched:
    Math.abs(outputDurationSeconds - timing.audioDurationSeconds) <= 0.002,
};
const report = {
  generatedAt: new Date().toISOString(),
  course: slug,
  variant,
  candidate,
  source,
  output,
  sourceSha256,
  outputSha256,
  processing: {
    filter: "loudnorm=I=-12:TP=-1.5:LRA=5,volume=-3dB",
    outputFormat: "PCM 24-bit, 48 kHz, mono WAV",
    rationale:
      "Le loudnorm corrige la chute progressive ; l’atténuation finale de 3 dB compense le passage mono vers stéréo du rendu Remotion.",
  },
  sourceDurationSeconds,
  outputDurationSeconds,
  timingAudioDurationSeconds: timing.audioDurationSeconds,
  expectedStereoIntegratedLufs,
  timingSha256: production.render?.timingSha256,
  before,
  after,
  checks,
  allPass: Object.values(checks).every(Boolean),
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (!report.allPass) {
  console.error(JSON.stringify(report.checks, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Audio candidat : ${output}`);
  console.log(`Rapport : ${reportPath}`);
  console.log(
    `Avant : ${before.full.integratedLufs} LUFS / ${before.full.truePeakDbtp} dBTP / LRA ${before.full.loudnessRangeLu}.`,
  );
  console.log(
    `Après : ${after.full.integratedLufs} LUFS / ${after.full.truePeakDbtp} dBTP / LRA ${after.full.loudnessRangeLu}.`,
  );
  console.log(
    `Rendu stéréo attendu : ${expectedStereoIntegratedLufs} LUFS.`,
  );
}
