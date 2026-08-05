import {spawn} from "node:child_process";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {paths} from "./lib/config.mjs";

const sourceVideo = path.join(
  paths.projectRoot,
  "output/demaa-cookie-v1-video-only.mp4",
);
const narration = path.join(
  paths.projectRoot,
  "public/audio/cookie-v1-grandfather-1.2x.mp3",
);
const finalVideo = path.join(
  paths.projectRoot,
  "output/demaa-cookie-v1.mp4",
);
const ffmpeg = path.join(compositorDir, "ffmpeg");

await new Promise((resolve, reject) => {
  const processHandle = spawn(
    ffmpeg,
    [
      "-y",
      "-i",
      sourceVideo,
      "-i",
      narration,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "-movflags",
      "+faststart",
      finalVideo,
    ],
    {
      env: {...process.env, DYLD_LIBRARY_PATH: compositorDir},
      stdio: "inherit",
    },
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

console.log(`Vidéo finale : ${finalVideo}`);
