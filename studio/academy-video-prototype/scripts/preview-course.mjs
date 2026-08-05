import {spawn} from "node:child_process";
import {mkdir, readFile, unlink} from "node:fs/promises";
import path from "node:path";
import {argumentValue, loadCourseFiles, resolveCourse, writeRenderProps} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";
import {assertProductionStage} from "./lib/production.mjs";
import {
  normalizePreviewToBt709,
  tagPreviewBt709,
} from "./lib/video-color.mjs";

const course = await resolveCourse();
await assertProductionStage(course, ["render-ready", "final"]);
const {pilot, timing} = await loadCourseFiles(course);
const fromSeconds = Number(argumentValue("from", "0"));
const durationSeconds = Number(argumentValue("seconds", "10"));
const candidate = argumentValue("candidate", "");
const strictC1Candidate =
  course.slug === "gestion-tresorerie" &&
  course.variant === "oumou-warm-v2" &&
  candidate.startsWith("c1-strict-layout-");
const strictC1RenderAudio = strictC1Candidate
  ? JSON.parse(
      await readFile(
        path.join(
          paths.projectRoot,
          "content/courses/gestion-tresorerie/strict-narrative-contract.json",
        ),
        "utf8",
      ),
    ).renderAudio.file
  : null;
const strictC1AudioFile = strictC1RenderAudio
  ? path.relative(
      paths.publicDir,
      path.join(paths.projectRoot, strictC1RenderAudio),
    )
  : null;
const requestedAudioFile = argumentValue(
  "audio-file",
  strictC1AudioFile ?? course.audioFile,
);

if (candidate && !/^[a-z0-9-]+$/u.test(candidate)) {
  throw new Error("--candidate doit contenir uniquement a-z, 0-9 et des tirets.");
}
if (
  path.isAbsolute(requestedAudioFile) ||
  requestedAudioFile.startsWith("../") ||
  requestedAudioFile.includes("/../")
) {
  throw new Error("--audio-file doit être un chemin sûr relatif à public/.");
}

if (!Number.isFinite(fromSeconds) || fromSeconds < 0) {
  throw new Error("--from doit être un nombre positif ou nul.");
}
if (
  !Number.isFinite(durationSeconds) ||
  durationSeconds <= 0 ||
  durationSeconds > 30
) {
  throw new Error("--seconds doit être compris entre 0 et 30.");
}
if (fromSeconds >= timing.totalDurationSeconds) {
  throw new Error("--from dépasse la durée du cours.");
}

const startFrame = Math.floor(fromSeconds * pilot.format.fps);
const endFrame = Math.min(
  Math.ceil((fromSeconds + durationSeconds) * pilot.format.fps) - 1,
  Math.ceil(timing.totalDurationSeconds * pilot.format.fps) - 1,
);
const previewDirectory = path.join(
  course.outputDirectory,
  "previews",
  ...(candidate ? [candidate] : []),
);
const output = path.join(
  previewDirectory,
  `${course.slug}-${startFrame}-${endFrame}.mp4`,
);
const rawOutput = `${output}.raw.mp4`;
const normalizedOutput = `${output}.normalized.mp4`;
const props = await writeRenderProps(course, {
  withNarration: true,
  withTypingAudio: true,
  withWaveform: true,
  waveformVariant: "subtle",
  audioFile: requestedAudioFile,
});
const remotion = path.join(paths.projectRoot, "node_modules/.bin/remotion");
const argumentsList = [
  "render",
  "src/index.ts",
  "CourseMaster",
  rawOutput,
  "--codec=h264",
  "--crf=18",
  "--bundle-cache=false",
  `--props=${props}`,
  `--frames=${startFrame}-${endFrame}`,
];

if (process.argv.includes("--dry-run")) {
  console.log(`Aperçu : ${path.relative(paths.projectRoot, output)}`);
  console.log(`${path.relative(paths.projectRoot, remotion)} ${argumentsList.join(" ")}`);
  process.exit(0);
}

await mkdir(previewDirectory, {recursive: true});
await new Promise((resolve, reject) => {
  const processHandle = spawn(remotion, argumentsList, {
    cwd: paths.projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  processHandle.once("error", reject);
  processHandle.once("exit", (code) => {
    if (code === 0) resolve();
    else reject(new Error(`L’aperçu a échoué avec le code ${code}.`));
  });
});

await normalizePreviewToBt709(rawOutput, normalizedOutput);
await tagPreviewBt709(normalizedOutput, output);
await unlink(rawOutput);
await unlink(normalizedOutput);
console.log(`Aperçu : ${output}`);
