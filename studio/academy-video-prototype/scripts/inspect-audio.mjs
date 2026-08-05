import {access, readFile} from "node:fs/promises";
import {paths} from "./lib/config.mjs";
import {resolveCourse} from "./lib/course.mjs";

const hasCourseArgument = process.argv.some(
  (argument) =>
    argument === "--course" || argument.startsWith("--course="),
);
const course = hasCourseArgument ? await resolveCourse() : null;
const audio = course?.audio ?? paths.narrationAudio;
const timingFile = course?.timing ?? paths.timing;

await access(audio);
const timing = JSON.parse(await readFile(timingFile, "utf8"));

console.log(`Source : ${timing.source}`);
console.log(`Audio : ${timing.audioDurationSeconds.toFixed(2)} s`);
console.log(`Vidéo : ${timing.totalDurationSeconds.toFixed(2)} s`);

for (const [id, scene] of Object.entries(timing.scenes)) {
  console.log(
    `${id.padEnd(18)} ${scene.startSeconds.toFixed(2)} → ${scene.endSeconds.toFixed(2)} s (${scene.durationSeconds.toFixed(2)} s)`,
  );
}
