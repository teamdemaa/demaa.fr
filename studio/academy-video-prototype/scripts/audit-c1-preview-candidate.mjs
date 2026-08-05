import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";

const run = promisify(execFile);
const ffmpeg = path.join(compositorDir, "ffmpeg");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};
const variant = "oumou-warm-v2";
const candidate = "c1-mastering-v2";
const previewRoot = path.join(
  paths.projectRoot,
  "output",
  "staging",
  variant,
  "previews",
);
const original = path.join(previewRoot, "gestion-tresorerie-0-899.mp4");
const mastered = path.join(
  previewRoot,
  candidate,
  "gestion-tresorerie-0-899.mp4",
);
const originalQa = JSON.parse(
  await readFile(path.join(previewRoot, "qa-report.json"), "utf8"),
);
const masteredQa = JSON.parse(
  await readFile(path.join(previewRoot, candidate, "qa-report.json"), "utf8"),
);
const reportDirectory = path.join(
  paths.projectRoot,
  "output",
  "staging",
  variant,
  "audits",
  candidate,
);
const reportPath = path.join(reportDirectory, "preview-audit.json");

const sha256 = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");
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
  };
};
const analyze = async (file) => ({
  full: await measure(file),
  segments: await Promise.all(
    [0, 10, 20].map(async (startSeconds) => ({
      startSeconds,
      endSeconds: startSeconds + 10,
      ...(await measure(file, startSeconds, 10)),
    })),
  ),
});

const before = await analyze(original);
const after = await analyze(mastered);
const originalSha256 = await sha256(original);
const masteredSha256 = await sha256(mastered);
const originalEntry = originalQa.results.find(
  ({course}) => course === "gestion-tresorerie",
);
const masteredEntry = masteredQa.results.find(
  ({course}) => course === "gestion-tresorerie",
);
const otherPreviewsPreserved = (
  await Promise.all(
    originalQa.results
      .filter(({course}) => course !== "gestion-tresorerie")
      .map(async ({file, sha256: expected}) => (await sha256(file)) === expected),
  )
).every(Boolean);
const segmentLevels = after.segments.map(
  ({integratedLufs}) => integratedLufs,
);
const checks = {
  originalPreviewPreserved: originalSha256 === originalEntry?.sha256,
  otherCoursesPreserved: otherPreviewsPreserved,
  masteredCodecQa: masteredQa.allPass === true,
  masteredLoudness:
    after.full.integratedLufs >= -16.5 &&
    after.full.integratedLufs <= -14.5,
  masteredTruePeak: after.full.truePeakDbtp <= -1.45,
  masteredSegmentConsistency:
    Math.max(...segmentLevels) - Math.min(...segmentLevels) <= 2,
};
const report = {
  generatedAt: new Date().toISOString(),
  course: "gestion-tresorerie",
  variant,
  candidate,
  original: {
    file: original,
    sha256: originalSha256,
    qa: originalEntry,
    audio: before,
  },
  mastered: {
    file: mastered,
    sha256: masteredSha256,
    qa: masteredEntry,
    audio: after,
  },
  checks,
  allPass: Object.values(checks).every(Boolean),
};
await mkdir(reportDirectory, {recursive: true});
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (!report.allPass) {
  console.error(JSON.stringify(checks, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Rapport aperçu C1 : ${reportPath}`);
  console.log(
    `Avant : ${before.full.integratedLufs} LUFS / ${before.full.truePeakDbtp} dBTP.`,
  );
  console.log(
    `Après : ${after.full.integratedLufs} LUFS / ${after.full.truePeakDbtp} dBTP.`,
  );
}
