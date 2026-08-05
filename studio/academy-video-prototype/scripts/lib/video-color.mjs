import {spawn} from "node:child_process";
import path from "node:path";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";

const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffmpegEnvironment = {
  ...process.env,
  DYLD_LIBRARY_PATH: compositorDir,
};

export const normalizePreviewToBt709 = (input, output) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(
      ffmpeg,
      [
        "-y",
        "-i",
        input,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-vf",
        "scale=in_range=pc:out_range=tv,format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-color_range",
        "tv",
        "-colorspace",
        "bt709",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        "-c:a",
        "copy",
        output,
      ],
      {
        env: ffmpegEnvironment,
        stdio: "inherit",
      },
    );
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Normalisation BT.709 échouée avec le code ${code}.`));
      }
    });
  });

export const tagPreviewBt709 = (input, output) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(
      ffmpeg,
      [
        "-y",
        "-i",
        input,
        "-map",
        "0",
        "-c",
        "copy",
        "-bsf:v",
        "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
        "-color_range",
        "tv",
        "-colorspace",
        "bt709",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        output,
      ],
      {
        env: ffmpegEnvironment,
        stdio: "inherit",
      },
    );
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Balises BT.709 échouées avec le code ${code}.`));
      }
    });
  });
