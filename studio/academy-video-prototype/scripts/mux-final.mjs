import {spawn} from "node:child_process";
import {access} from "node:fs/promises";
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
const {pilot} = await loadCourseFiles(course);
const sourceVideo = path.join(
  course.outputDirectory,
  `${course.slug}-video-only.mp4`,
);
const finalVideo = course.finalOutput;
const introAudioVideo = path.join(
  course.outputDirectory,
  `${course.slug}-intro-audio.mp4`,
);
const ffmpeg = path.join(compositorDir, "ffmpeg");
const remotion = path.join(paths.projectRoot, "node_modules/.bin/remotion");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};

const run = (command, argumentsList) =>
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

const introProps = await writeRenderProps(course, {
  withNarration: false,
  withTypingAudio: true,
});
try {
  await access(introAudioVideo);
  console.log(`Piste de clics réutilisée : ${introAudioVideo}`);
} catch {
  await run(remotion, [
    "render",
    "src/index.ts",
    "CourseMaster",
    introAudioVideo,
    "--codec=h264",
    "--crf=28",
    "--bundle-cache=false",
    `--props=${introProps}`,
    "--frames=0-299",
  ]);
}

await run(ffmpeg, [
  "-y",
  "-i",
  sourceVideo,
  "-i",
  course.audio,
  "-i",
  introAudioVideo,
  "-filter_complex",
  "[1:a]loudnorm=I=-5:TP=-1.5:LRA=11:dual_mono=true[voice];[2:a]volume=0.08[typing];[voice][typing]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0,aresample=48000[aout]",
  "-map",
  "0:v:0",
  "-map",
  "[aout]",
  "-c:v",
  "copy",
  "-bsf:v",
  `setts=pts=N/(${pilot.format.fps}*TB):dts=N/(${pilot.format.fps}*TB),h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1`,
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-movflags",
  "+faststart",
  finalVideo,
]);

console.log(`Vidéo finale : ${finalVideo}`);
