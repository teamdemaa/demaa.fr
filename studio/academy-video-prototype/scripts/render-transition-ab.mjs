import {spawn} from "node:child_process";
import {createHash} from "node:crypto";
import {access, mkdir, readFile, unlink, writeFile} from "node:fs/promises";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {argumentValue, loadCourseFiles, resolveCourse} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";
import {assertProductionStage} from "./lib/production.mjs";

const slug = argumentValue("course", "gestion-tresorerie");
const fromSeconds = Number(argumentValue("from", "80"));
const durationSeconds = Number(argumentValue("seconds", "14"));
const reuseExisting = process.argv.includes("--reuse-existing");
if (!Number.isFinite(fromSeconds) || fromSeconds < 0) {
  throw new Error("--from doit être positif ou nul.");
}
if (
  !Number.isFinite(durationSeconds) ||
  durationSeconds <= 0 ||
  durationSeconds > 20
) {
  throw new Error("--seconds doit être compris entre 0 et 20.");
}

const course = await resolveCourse(slug);
await assertProductionStage(course, ["render-ready", "final"]);
const {pilot, timing} = await loadCourseFiles(course);
if (pilot.format.fps !== 30 || timing.fps !== 30) {
  throw new Error(
    `Le test A/B exige 30 fps (cours : ${pilot.format.fps}, timing : ${timing.fps}).`,
  );
}
if (fromSeconds + durationSeconds > timing.totalDurationSeconds) {
  throw new Error("L’extrait demandé dépasse la durée du cours.");
}

const scene = pilot.scenes.find((item) => {
  const sceneTiming = timing.scenes[item.id];
  return (
    fromSeconds >= sceneTiming.startSeconds &&
    fromSeconds + durationSeconds <= sceneTiming.endSeconds
  );
});
if (!scene) {
  throw new Error(
    "Le test A/B doit rester dans une seule scène afin de comparer le même contenu.",
  );
}

const fps = pilot.format.fps;
const startFrame = Math.floor(fromSeconds * fps);
const endFrame = startFrame + Math.round(durationSeconds * fps) - 1;
const outputDirectory = path.join(
  paths.projectRoot,
  "output",
  "transition-ab",
);
const remotion = path.join(paths.projectRoot, "node_modules/.bin/remotion");
const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffprobe = path.join(compositorDir, "ffprobe");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};

await mkdir(outputDirectory, {recursive: true});

const run = (command, argumentsList) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(command, argumentsList, {
      cwd: paths.projectRoot,
      env: environment,
      stdio: "inherit",
    });
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) resolve();
      else {
        reject(
          new Error(`${path.basename(command)} a terminé avec le code ${code}.`),
        );
      }
    });
  });

const capture = (command, argumentsList) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(command, argumentsList, {
      cwd: paths.projectRoot,
      env: environment,
    });
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
      if (code === 0) resolve({stdout, stderr});
      else {
        reject(
          new Error(
            `${path.basename(command)} a terminé avec le code ${code}.\n${stderr.slice(-3000)}`,
          ),
        );
      }
    });
  });

const outputs = [];
for (const motionProfile of ["legacy", "stable"]) {
  const propsPath = path.join(
    outputDirectory,
    `${slug}-${motionProfile}.props.json`,
  );
  const output = path.join(
    outputDirectory,
    `${slug}-transition-${motionProfile}-${startFrame}-${endFrame}.mp4`,
  );
  const videoOnly = path.join(
    outputDirectory,
    `${slug}-transition-${motionProfile}-video-only-${startFrame}-${endFrame}.mp4`,
  );
  await writeFile(
    propsPath,
    `${JSON.stringify(
      {
        pilot,
        timing,
        audioFile: course.audioFile,
        withNarration: false,
        withTypingAudio: false,
        withWaveform: true,
        waveformVariant: "subtle",
        motionProfile,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  let shouldRender = true;
  if (reuseExisting) {
    try {
      await access(videoOnly);
      shouldRender = false;
      console.log(`Vidéo seule réutilisée : ${videoOnly}`);
    } catch {
      try {
        await access(output);
        await run(ffmpeg, [
          "-y",
          "-v",
          "error",
          "-i",
          output,
          "-map",
          "0:v:0",
          "-an",
          "-c:v",
          "copy",
          videoOnly,
        ]);
        shouldRender = false;
        console.log(`Vidéo seule extraite : ${videoOnly}`);
      } catch {
        shouldRender = true;
      }
    }
  }
  if (shouldRender) {
    await run(remotion, [
      "render",
      "src/index.ts",
      "CourseMasterVideoOnly",
      videoOnly,
      "--codec=h264",
      "--crf=18",
      "--pixel-format=yuv420p",
      "--color-space=bt709",
      "--gop-size=60",
      "--muted",
      "--bundle-cache=false",
      `--props=${propsPath}`,
      `--frames=${startFrame}-${endFrame}`,
    ]);
  }
  outputs.push({
    motionProfile,
    output,
    videoOnly,
    propsPath,
  });
}

const sharedAudio = path.join(
  outputDirectory,
  `${slug}-transition-audio-${startFrame}-${endFrame}.mp4`,
);
await run(ffmpeg, [
  "-y",
  "-v",
  "error",
  "-i",
  course.audio,
  "-ss",
  String(fromSeconds),
  "-t",
  String(durationSeconds),
  "-vn",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-f",
  "mp4",
  sharedAudio,
]);

for (const item of outputs) {
  await run(ffmpeg, [
    "-y",
    "-v",
    "error",
    "-i",
    item.videoOnly,
    "-i",
    sharedAudio,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c",
    "copy",
    "-bsf:v",
    "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1",
    "-shortest",
    "-movflags",
    "+faststart",
    item.output,
  ]);
  const probe = await capture(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_type,r_frame_rate,color_space,color_transfer,color_primaries",
    "-of",
    "json",
    item.output,
  ]);
  const decodedAudio = path.join(
    outputDirectory,
    `.${slug}-${item.motionProfile}.wav`,
  );
  await run(ffmpeg, [
    "-y",
    "-v",
    "error",
    "-i",
    item.output,
    "-map",
    "0:a:0",
    "-c:a",
    "pcm_s16le",
    "-f",
    "wav",
    decodedAudio,
  ]);
  const audioHash = createHash("sha256")
    .update(await readFile(decodedAudio))
    .digest("hex");
  await unlink(decodedAudio);
  item.metadata = JSON.parse(probe.stdout);
  item.decodedAudioSha256 = audioHash;
}

const [legacy, stable] = outputs;
if (legacy.decodedAudioSha256 !== stable.decodedAudioSha256) {
  throw new Error("Les pistes audio décodées des extraits A et B diffèrent.");
}

const manifest = path.join(outputDirectory, `${slug}-transition-ab.json`);
await writeFile(
  manifest,
  `${JSON.stringify(
    {
      course: slug,
      scene: scene.id,
      fromSeconds,
      durationSeconds,
      startFrame,
      endFrame,
      fps,
      colorSpace: "bt709",
      pixelFormat: "yuv420p",
      outputs,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Scène : ${scene.id}`);
console.log(`A — historique : ${legacy.output}`);
console.log(`B — stabilisé : ${stable.output}`);
console.log(`Audio décodé identique : ${legacy.decodedAudioSha256}`);
console.log(`Manifeste : ${manifest}`);
