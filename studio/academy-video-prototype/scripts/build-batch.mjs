import {spawn} from "node:child_process";
import {argumentValue, resolveCourse} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";
import {assertProductionStage} from "./lib/production.mjs";

const slugs = (argumentValue("courses") ?? "")
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);

if (!slugs.length) {
  throw new Error("Utilisez --courses=cours-1,cours-2.");
}
if (new Set(slugs).size !== slugs.length) {
  throw new Error("La liste contient un cours en double.");
}

const courses = [];
for (const slug of slugs) {
  const course = await resolveCourse(slug);
  await assertProductionStage(course, ["render-ready", "final"]);
  courses.push(course);
}

if (process.argv.includes("--dry-run")) {
  console.log("Lot prêt :");
  for (const course of courses) {
    console.log(`- ${course.slug}`);
  }
  process.exit(0);
}

const run = (course) =>
  new Promise((resolve, reject) => {
    console.log(`\n##### ${course.slug} #####`);
    const processHandle = spawn(
      process.execPath,
      ["scripts/build-course.mjs", `--course=${course.slug}`],
      {
        cwd: paths.projectRoot,
        env: process.env,
        stdio: "inherit",
      },
    );
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${course.slug} a échoué avec le code ${code}.`));
    });
  });

for (const course of courses) {
  await run(course);
}

console.log(`\nLot terminé : ${courses.length} cours.`);
