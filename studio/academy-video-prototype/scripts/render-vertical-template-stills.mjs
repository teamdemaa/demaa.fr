import {mkdirSync} from "node:fs";
import {spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(
  projectRoot,
  "output",
  "vertical-template",
);
const remotionBinary = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  "remotion",
);
const targets = [
  {
    composition: "AcademyVerticalCourseTemplate",
    output: "academy-course-9x16.png",
  },
  {
    composition: "JusteVerticalCaseTemplate",
    output: "juste-case-9x16.png",
  },
];

mkdirSync(outputDirectory, {recursive: true});

for (const target of targets) {
  const outputPath = path.join(outputDirectory, target.output);
  const result = spawnSync(
    remotionBinary,
    [
      "still",
      "src/index.ts",
      target.composition,
      outputPath,
      "--frame=45",
      "--bundle-cache=false",
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Le rendu ${target.composition} a échoué avec le code ${result.status}.`,
    );
  }

  console.log(`Still vertical rendu : ${outputPath}`);
}
