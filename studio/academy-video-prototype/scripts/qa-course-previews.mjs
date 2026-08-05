import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import {argumentValue} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";

const run = promisify(execFile);
const ffmpeg = path.join(compositorDir, "ffmpeg");
const ffprobe = path.join(compositorDir, "ffprobe");
const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};
const variant = argumentValue("variant", "oumou-warm-v2");
const candidate = argumentValue("candidate", "");
if (candidate && !/^[a-z0-9-]+$/u.test(candidate)) {
  throw new Error("--candidate doit contenir uniquement a-z, 0-9 et des tirets.");
}
const courses = argumentValue(
  "courses",
  "gestion-tresorerie,chiffre-affaires-benefice,fixer-ses-prix,construire-systeme-marketing-vente,deleguer-sans-perdre-controle",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const previewDirectory = path.join(
  paths.projectRoot,
  "output",
  "staging",
  variant,
  "previews",
  ...(candidate ? [candidate] : []),
);

const results = [];
const errors = [];
for (const slug of courses) {
  const file = path.join(previewDirectory, `${slug}-0-899.mp4`);
  const {stdout} = await run(
    ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "stream=index,codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,pix_fmt,color_range,color_space,color_transfer,color_primaries,sample_rate,channels",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      file,
    ],
    {env: environment, maxBuffer: 2_000_000},
  );
  const probe = JSON.parse(stdout);
  const video = probe.streams.find(({codec_type: type}) => type === "video");
  const audio = probe.streams.find(({codec_type: type}) => type === "audio");
  const duration = Number(probe.format.duration);
  const checks = {
    duration: duration >= 29.9 && duration <= 30.2,
    video:
      video?.codec_name === "h264" &&
      video.width === 1920 &&
      video.height === 1080 &&
      video.avg_frame_rate === "30/1" &&
      video.pix_fmt === "yuv420p",
    color:
      video?.color_range === "tv" &&
      video.color_space === "bt709" &&
      video.color_transfer === "bt709" &&
      video.color_primaries === "bt709",
    audio:
      audio?.codec_name === "aac" &&
      audio.sample_rate === "48000" &&
      audio.channels === 2,
  };

  try {
    await run(
      ffmpeg,
      [
        "-v",
        "error",
        "-i",
        file,
        "-an",
        "-c:v",
        "rawvideo",
        "-f",
        "null",
        "-",
      ],
      {
        env: environment,
        maxBuffer: 2_000_000,
      },
    );
    checks.decode = true;
  } catch {
    checks.decode = false;
  }

  for (const [check, passed] of Object.entries(checks)) {
    if (!passed) {
      errors.push(`${slug}: contrôle ${check} en échec.`);
    }
  }
  const bytes = await readFile(file);
  results.push({
    course: slug,
    file,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    durationSeconds: duration,
    streams: {video, audio},
    checks,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  variant,
  candidate: candidate || null,
  previewSeconds: 30,
  allPass: errors.length === 0,
  errors,
  results,
};
const reportPath = path.join(previewDirectory, "qa-report.json");
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length) {
  for (const error of errors) {
    console.error(`ERREUR — ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Aperçus : ${results.length}/${results.length} décodables, H.264/AAC, 1920×1080, 30 fps.`,
  );
  console.log("Couleur : yuv420p, plage TV, matrice/primaires/transfert BT.709.");
  console.log(`Rapport : ${reportPath}`);
}
