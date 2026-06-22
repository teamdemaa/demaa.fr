import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(cwd, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

const packageJson = readJson("package.json");
const nextConfigSource = readText("next.config.ts");
const gitignoreSource = readText(".gitignore");
const eslintConfigSource = readText("eslint.config.mjs");
const tsconfig = readJson("tsconfig.json");

const errors = [];
const warnings = [];

const buildScript = packageJson.scripts?.build ?? "";
const buildStableScript = packageJson.scripts?.["build:stable"] ?? "";
const startScript = packageJson.scripts?.start ?? "";

if (!buildScript.includes("DEMAA_FORCE_LOCAL_DATA=true")) {
  addUnique(errors, 'The "build" script must force local data with DEMAA_FORCE_LOCAL_DATA=true.');
}

if (!buildScript.includes("DEMAA_BUILD_DIST_DIR=.next-build")) {
  addUnique(errors, 'The "build" script must target ".next-build".');
}

if (!buildStableScript.includes("DEMAA_FORCE_LOCAL_DATA=true")) {
  addUnique(
    errors,
    'The "build:stable" script must force local data with DEMAA_FORCE_LOCAL_DATA=true.',
  );
}

if (!buildStableScript.includes("DEMAA_BUILD_DIST_DIR=.next-build")) {
  addUnique(errors, 'The "build:stable" script must target ".next-build".');
}

if (!buildStableScript.includes("TMPDIR=/private/tmp")) {
  addUnique(errors, 'The "build:stable" script must set TMPDIR=/private/tmp.');
}

if (!startScript.includes("DEMAA_BUILD_DIST_DIR=.next-build")) {
  addUnique(errors, 'The "start" script must target ".next-build".');
}

if (!nextConfigSource.includes("distDir: process.env.DEMAA_BUILD_DIST_DIR || '.next'")) {
  addUnique(
    errors,
    "next.config.ts must derive distDir from DEMAA_BUILD_DIST_DIR with .next as fallback.",
  );
}

if (!gitignoreSource.includes("/.next-build/")) {
  addUnique(errors, '.gitignore must ignore "/.next-build/".');
}

if (!eslintConfigSource.includes('".next-build/**"')) {
  addUnique(errors, 'eslint.config.mjs must ignore ".next-build/**".');
}

const tsconfigIncludes = Array.isArray(tsconfig.include) ? tsconfig.include : [];
if (!tsconfigIncludes.includes(".next-build/types/**/*.ts")) {
  addUnique(errors, 'tsconfig.json must include ".next-build/types/**/*.ts".');
}
if (!tsconfigIncludes.includes(".next-build/dev/types/**/*.ts")) {
  addUnique(errors, 'tsconfig.json must include ".next-build/dev/types/**/*.ts".');
}

if (!readText("README.md").includes("isolated `.next-build` directory")) {
  addUnique(warnings, "README.md should mention the isolated .next-build directory.");
}

if (!readText("docs/MAINTENANCE.md").includes("`.next-build`")) {
  addUnique(warnings, "docs/MAINTENANCE.md should mention the .next-build convention.");
}

const result = {
  build: buildScript,
  buildStable: buildStableScript,
  start: startScript,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
