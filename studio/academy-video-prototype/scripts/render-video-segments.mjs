import {spawn} from "node:child_process";
import {mkdir, unlink, writeFile} from "node:fs/promises";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";
import {
  loadCourseFiles,
  resolveCourse,
  writeRenderProps,
} from "./lib/course.mjs";
import {assertProductionStage} from "./lib/production.mjs";

const course = await resolveCourse();
await assertProductionStage(course, ["render-ready", "final"]);
const outputDirectory = course.outputDirectory;
const remotion = path.join(paths.projectRoot, "node_modules/.bin/remotion");
const ffmpeg = path.join(compositorDir, "ffmpeg");
const {pilot, timing} = await loadCourseFiles(course);
if (pilot.format.fps !== 30 || timing.fps !== 30) {
  throw new Error(
    `Le pipeline master exige 30 fps (cours : ${pilot.format.fps}, timing : ${timing.fps}).`,
  );
}
const renderProps = await writeRenderProps(course);
const totalFrames = Math.ceil(timing.totalDurationSeconds * timing.fps);
const framesPerSegment = 900;
const ranges = [];
for (let start = 0; start < totalFrames; start += framesPerSegment) {
  ranges.push([
    start,
    Math.min(start + framesPerSegment - 1, totalFrames - 1),
  ]);
}

await mkdir(outputDirectory, {recursive: true});

const run = (command, argumentsList, environment = process.env) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(command, argumentsList, {
      cwd: paths.projectRoot,
      env: environment,
      stdio: "inherit",
    });

    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${path.basename(command)} a terminé avec le code ${code}.`),
        );
      }
    });
  });

const segmentPaths = [];
for (const [start, end] of ranges) {
  const segment = path.join(
    outputDirectory,
    `${course.slug}-segment-${start}-${end}.mp4`,
  );
  segmentPaths.push(segment);
  console.log(`\nSegment ${start}-${end}`);
  await run(remotion, [
    "render",
    "src/index.ts",
    "CourseMasterVideoOnly",
    segment,
    "--codec=h264",
    "--crf=18",
    "--pixel-format=yuv420p",
    "--color-space=bt709",
    "--gop-size=60",
    "--muted",
    "--bundle-cache=false",
    `--props=${renderProps}`,
    `--frames=${start}-${end}`,
  ]);
}

const concatList = path.join(outputDirectory, `${course.slug}-segments.txt`);
await writeFile(
  concatList,
  segmentPaths.map((segment) => `file '${segment}'`).join("\n"),
  "utf8",
);

const finalVideoOnly = path.join(
  outputDirectory,
  `${course.slug}-video-only.mp4`,
);
await run(
  ffmpeg,
  [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatList,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    finalVideoOnly,
  ],
  {...process.env, DYLD_LIBRARY_PATH: compositorDir},
);

await Promise.all([
  ...segmentPaths.map((segment) => unlink(segment)),
  unlink(concatList),
]);

console.log(`Vidéo assemblée : ${finalVideoOnly}`);
