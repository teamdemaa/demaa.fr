import {access, mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {argumentValue, loadCourseCatalog} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";

const slug = argumentValue("slug");
const requestedTitle = argumentValue("title");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

if (!slug || !slugPattern.test(slug)) {
  throw new Error(
    "Utilisez --slug=nom-du-cours avec des lettres minuscules, chiffres et tirets.",
  );
}

const catalog = await loadCourseCatalog();
if (catalog.courses[slug]) {
  throw new Error(`Le cours « ${slug} » existe déjà dans le catalogue.`);
}

const title =
  requestedTitle?.trim() ||
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
const courseDirectory = path.join(paths.projectRoot, "content/courses", slug);
const publicAudioDirectory = path.join(
  paths.publicDir,
  "courses",
  slug,
  "audio",
);
const contentFile = path.join(courseDirectory, "course.json");
const productionFile = path.join(courseDirectory, "production.json");

try {
  await access(contentFile);
  throw new Error(
    `Le fichier ${path.relative(paths.projectRoot, contentFile)} existe déjà.`,
  );
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

await Promise.all([
  mkdir(courseDirectory, {recursive: true}),
  mkdir(publicAudioDirectory, {recursive: true}),
]);

const course = {
  id: slug,
  title,
  shortTitle: "",
  courseTitle: title.toUpperCase(),
  introVisual: {
    primaryLabel: "",
    secondaryLabel: "",
  },
  audience: "Dirigeants de TPE en France",
  status: "draft",
  format: {
    width: 1920,
    height: 1080,
    fps: 30,
    targetDurationSeconds: 210,
  },
  editorialContract: {
    tone:
      "Professeur expérimenté, calme, direct, humain. Aucun jargon non expliqué.",
    rule:
      "Une idée par écran. Chaque chiffre doit permettre de refaire le calcul.",
    screenTextRule:
      "Le texte à l’écran résume ou chiffre. Il ne retranscrit pas la narration.",
  },
  scenes: [],
};
const production = {
  version: 1,
  course: slug,
  status: "draft",
  createdAt: new Date().toISOString(),
};

const relative = (file) => path.relative(paths.projectRoot, file);
catalog.courses[slug] = {
  content: relative(contentFile),
  production: relative(productionFile),
  sourceTiming: relative(
    path.join(courseDirectory, "timing-source.generated.json"),
  ),
  timing: relative(path.join(courseDirectory, "timing.generated.json")),
  alignment: relative(path.join(publicAudioDirectory, "alignment.json")),
  sourceAudio: relative(
    path.join(publicAudioDirectory, "narration-source.mp3"),
  ),
  audio: relative(path.join(publicAudioDirectory, "narration.mp3")),
  finalOutput: `output/cours-${slug}-final.mp4`,
};

await Promise.all([
  writeFile(contentFile, `${JSON.stringify(course, null, 2)}\n`, "utf8"),
  writeFile(productionFile, `${JSON.stringify(production, null, 2)}\n`, "utf8"),
  writeFile(
    paths.courseCatalog,
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  ),
]);

console.log(`Cours créé : ${slug}`);
console.log(`Contenu : ${relative(contentFile)}`);
console.log(`Statut : draft`);
