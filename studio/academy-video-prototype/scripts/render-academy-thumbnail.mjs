import {mkdirSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const catalogPath = path.join(
  projectRoot,
  "content",
  "academy-thumbnails.json",
);
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const thumbnailId =
  process.argv
    .find((argument) => argument.startsWith("--thumbnail="))
    ?.split("=")[1] ?? "chiffre-affaires-benefice";
const thumbnail = catalog[thumbnailId];

if (!thumbnail) {
  throw new Error(
    `Miniature inconnue : ${thumbnailId}. Valeurs disponibles : ${Object.keys(
      catalog,
    ).join(", ")}`,
  );
}

const {output, ...props} = thumbnail;
const outputPath = path.join(projectRoot, output);
const outputDirectory = path.dirname(outputPath);
const propsPath = path.join(outputDirectory, `.${thumbnailId}.props.json`);
const remotionBinary = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  "remotion",
);

mkdirSync(outputDirectory, {recursive: true});
writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`);

try {
  const result = spawnSync(
    remotionBinary,
    [
      "still",
      "src/index.ts",
      "AcademyThumbnail",
      outputPath,
      "--frame=0",
      `--props=${propsPath}`,
      "--bundle-cache=false",
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Le rendu de la miniature ${thumbnailId} a échoué avec le code ${result.status}.`,
    );
  }
} finally {
  rmSync(propsPath, {force: true});
}

console.log(`Miniature rendue : ${outputPath}`);
