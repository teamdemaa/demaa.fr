import {spawn} from "node:child_process";
import {paths} from "./lib/config.mjs";
import {resolveCourse} from "./lib/course.mjs";
import {assertProductionStage} from "./lib/production.mjs";

const course = await resolveCourse();
await assertProductionStage(course, ["render-ready", "final"]);
const node = process.execPath;
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const courseArgument = `--course=${course.slug}`;
const variantArgument = course.variant
  ? `--variant=${course.variant}`
  : null;
const paceArgument = process.argv.find((argument) =>
  argument.startsWith("--pace="),
) ?? "--pace=1.2";
const forwardedCourseArguments = [
  courseArgument,
  ...(variantArgument ? [variantArgument] : []),
];
const voiceArgumentPrefixes = [
  "--voice-id=",
  "--model-id=",
  "--stability=",
  "--similarity-boost=",
  "--style=",
  "--speed=",
  "--speaker-boost=",
];
const voiceArguments = process.argv.filter((argument) =>
  voiceArgumentPrefixes.some((prefix) => argument.startsWith(prefix)),
);
const validationArguments = process.argv.filter(
  (argument) =>
    argument.startsWith("--duration-min=") ||
    argument.startsWith("--duration-max="),
);

const run = (label, command, argumentsList) =>
  new Promise((resolve, reject) => {
    console.log(`\n=== ${label} ===`);
    const processHandle = spawn(command, argumentsList, {
      cwd: paths.projectRoot,
      env: process.env,
      stdio: "inherit",
    });
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} a échoué avec le code ${code}.`));
      }
    });
  });

await run("Validation du cours", node, [
  "scripts/validate-course.mjs",
  ...forwardedCourseArguments,
  ...validationArguments,
]);
await run("Cache de narration", node, [
  "scripts/generate-narration.mjs",
  ...forwardedCourseArguments,
  ...voiceArguments,
]);
await run(`Cache du rythme ${paceArgument.split("=")[1]}×`, node, [
  "scripts/apply-pace.mjs",
  ...forwardedCourseArguments,
  `--rate=${paceArgument.split("=")[1]}`,
]);
await run("TypeScript", npm, ["run", "typecheck"]);
await run("Rendu vidéo segmenté", node, [
  "scripts/render-video-segments.mjs",
  ...forwardedCourseArguments,
]);
await run("Mixage voix et clics", node, [
  "scripts/mux-final.mjs",
  ...forwardedCourseArguments,
]);
await run("Contrôle qualité", node, [
  "scripts/qa-video.mjs",
  ...forwardedCourseArguments,
]);

console.log(`\nCours terminé : ${course.finalOutput}`);
