import {readFile} from "node:fs/promises";
import {resolveCourse} from "./lib/course.mjs";
import {buildNarration, deriveTiming, writeJson} from "./lib/speech.mjs";

const course = await resolveCourse();
const [pilot, alignmentPayload] = await Promise.all([
  readFile(course.content, "utf8").then(JSON.parse),
  readFile(course.alignment, "utf8").then(JSON.parse),
]);
const {text, ranges} = buildNarration(pilot.scenes);
const timing = deriveTiming({
  pilot,
  text,
  ranges,
  alignment: alignmentPayload.alignment,
});

await writeJson(course.sourceTiming, timing);
console.log(`Timing source reconstruit : ${course.sourceTiming}`);
