import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packDir = resolve(scriptDir, "..");
const projectDir = resolve(packDir, "../..");
const contentDirs = [join(packDir, "courses"), join(packDir, "cases")];
const files = contentDirs.flatMap((directory) =>
  readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => join(directory, file)),
);

const errors = [];
const slugs = new Set();

function addError(file, message) {
  errors.push(`${file}: ${message}`);
}

function checkExactCount(file, label, value, expected) {
  if (!Array.isArray(value) || value.length !== expected) {
    addError(file, `${label} doit contenir exactement ${expected} éléments.`);
  }
}

function checkNoVideoFields(file, value, path = "root") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkNoVideoFields(file, item, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    if (/video|narration|durationSeconds/i.test(key)) {
      addError(file, `champ vidéo interdit à ${path}.${key}.`);
    }
    if (typeof child === "string" && /\.(mp4|webm|mov)(?:$|\?)/i.test(child)) {
      addError(file, `ressource vidéo interdite à ${path}.${key}.`);
    }
    checkNoVideoFields(file, child, `${path}.${key}`);
  }
}

for (const absoluteFile of files) {
  const file = absoluteFile.replace(`${packDir}/`, "");
  let course;

  try {
    course = JSON.parse(readFileSync(absoluteFile, "utf8"));
  } catch (error) {
    addError(file, `JSON invalide (${error.message}).`);
    continue;
  }

  if (course.version !== "1.0") addError(file, "version doit être 1.0.");
  if (!["course", "case-study"].includes(course.kind)) addError(file, "kind invalide.");
  if (!["draft", "review", "ready"].includes(course.status)) addError(file, "status invalide.");

  const slug = course.identity?.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    addError(file, "slug absent ou invalide.");
  } else if (slugs.has(slug)) {
    addError(file, `slug dupliqué : ${slug}.`);
  } else {
    slugs.add(slug);
  }

  if (!Array.isArray(course.lessons) || course.lessons.length < 4 || course.lessons.length > 6) {
    addError(file, "lessons doit contenir entre 4 et 6 leçons.");
  }

  const lessonIds = new Set();
  for (const lesson of course.lessons ?? []) {
    if (!lesson.id || lessonIds.has(lesson.id)) addError(file, `id de leçon absent ou dupliqué : ${lesson.id ?? "inconnu"}.`);
    lessonIds.add(lesson.id);
    if (!lesson.body || lesson.body.length < 50 || lesson.body.length > 520) {
      addError(file, `longueur du corps invalide pour la leçon ${lesson.id}.`);
    }
    if (!lesson.visual?.type || !lesson.visual?.data) {
      addError(file, `visuel incomplet pour la leçon ${lesson.id}.`);
    }
    if (!lesson.takeaway || lesson.takeaway.length < 15) {
      addError(file, `idée à retenir trop courte pour la leçon ${lesson.id}.`);
    }
  }

  checkExactCount(file, "recap.points", course.recap?.points, 4);
  checkExactCount(file, "quiz.questions", course.quiz?.questions, 3);

  const questionIds = new Set();
  for (const question of course.quiz?.questions ?? []) {
    if (!question.id || questionIds.has(question.id)) addError(file, `id de question absent ou dupliqué : ${question.id ?? "inconnu"}.`);
    questionIds.add(question.id);
    if (!Array.isArray(question.choices) || question.choices.length < 2 || question.choices.length > 4) {
      addError(file, `la question ${question.id} doit proposer entre 2 et 4 choix.`);
      continue;
    }
    const choiceIds = new Set(question.choices.map((choice) => choice.id));
    if (!choiceIds.has(question.correctChoiceId)) {
      addError(file, `la bonne réponse de ${question.id} ne correspond à aucun choix.`);
    }
    if (!question.explanation || question.explanation.length < 15) {
      addError(file, `explication manquante pour ${question.id}.`);
    }
  }

  if (course.action !== null && (typeof course.action !== "object" || Array.isArray(course.action))) {
    addError(file, "action doit être un objet unique ou null.");
  }

  const image = course.identity?.card?.image;
  if (image) {
    const imageFile = resolve(projectDir, "public", image.replace(/^\//, ""));
    if (!existsSync(imageFile)) addError(file, `vignette introuvable : ${image}.`);
  }

  checkNoVideoFields(file, course);
}

if (files.length === 0) {
  errors.push("Aucun contenu trouvé.");
}

if (errors.length > 0) {
  console.error(`ÉCHEC — ${errors.length} erreur(s)\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK — ${files.length} contenu(s) validé(s), ${slugs.size} slug(s) unique(s).`);
