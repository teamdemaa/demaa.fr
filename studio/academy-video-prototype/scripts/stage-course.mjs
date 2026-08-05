import {spawn} from "node:child_process";
import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {argumentValue, resolveCourse} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";
import {
  assertCurrentScript,
  loadProduction,
  productionStatuses,
  sha256File,
  writeProduction,
} from "./lib/production.mjs";

const target = argumentValue("set");
const expectedPace = Number(argumentValue("pace", "1.2"));
if (!Number.isFinite(expectedPace) || expectedPace < 0.5 || expectedPace > 2) {
  throw new Error("--pace doit être compris entre 0.5 et 2.");
}
const course = await resolveCourse();
const production = await loadProduction(course);

if (!productionStatuses.includes(target)) {
  throw new Error(
    `Statut invalide. Choisissez : ${productionStatuses.join(", ")}.`,
  );
}
if (target === "final") {
  throw new Error(
    "Le statut final est attribué uniquement par le contrôle qualité.",
  );
}
if (target === production.status) {
  console.log(`${course.slug}: statut déjà « ${target} ».`);
  process.exit(0);
}

const now = new Date().toISOString();
const requireFiles = async (files, label) => {
  for (const file of files) {
    try {
      await access(file);
    } catch {
      throw new Error(
        `${label} manquant : ${path.relative(paths.projectRoot, file)}`,
      );
    }
  }
};
const runValidation = () =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(
      process.execPath,
      [
        "scripts/validate-course.mjs",
        `--course=${course.slug}`,
        "--allow-missing-media",
      ],
      {
        cwd: paths.projectRoot,
        env: process.env,
        stdio: "inherit",
      },
    );
    processHandle.once("error", reject);
    processHandle.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("Le script ne passe pas la validation éditoriale."));
    });
  });

let next;
if (target === "draft") {
  next = {
    version: 1,
    course: course.slug,
    status: "draft",
    createdAt: production.createdAt ?? now,
    updatedAt: now,
  };
} else if (target === "script-approved") {
  if (production.status !== "draft") {
    throw new Error(
      `Transition refusée : ${production.status} → script-approved. ` +
        "Revenez explicitement à draft avant de remplacer un script approuvé.",
    );
  }
  await runValidation();
  next = {
    ...production,
    status: target,
    updatedAt: now,
    script: {
      approvedAt: now,
      sha256: await sha256File(course.content),
    },
  };
} else if (target === "voice-approved") {
  if (production.status !== "script-approved") {
    throw new Error(
      `Transition refusée : ${production.status} → voice-approved.`,
    );
  }
  await assertCurrentScript(course, production);
  await requireFiles(
    [course.sourceAudio, course.alignment, course.sourceTiming],
    "Fichier de voix",
  );
  const alignment = JSON.parse(await readFile(course.alignment, "utf8"));
  next = {
    ...production,
    status: target,
    updatedAt: now,
    voice: {
      approvedAt: now,
      voiceId: alignment.voiceId,
      modelId: alignment.modelId,
      sourceAudioSha256: await sha256File(course.sourceAudio),
      alignmentSha256: await sha256File(course.alignment),
      sourceTimingSha256: await sha256File(course.sourceTiming),
    },
  };
} else if (target === "render-ready") {
  if (production.status !== "voice-approved") {
    throw new Error(
      `Transition refusée : ${production.status} → render-ready.`,
    );
  }
  await assertCurrentScript(course, production);
  await requireFiles([course.audio, course.timing], "Média final");
  const timing = JSON.parse(await readFile(course.timing, "utf8"));
  if (timing.postprocessRate !== expectedPace) {
    throw new Error(
      `Rythme invalide : ${timing.postprocessRate ?? "absent"} au lieu de ${expectedPace}.`,
    );
  }
  next = {
    ...production,
    status: target,
    updatedAt: now,
    render: {
      approvedAt: now,
      pace: timing.postprocessRate,
      audioSha256: await sha256File(course.audio),
      timingSha256: await sha256File(course.timing),
    },
  };
}

await writeProduction(course, next);
console.log(`${course.slug}: ${production.status} → ${next.status}`);
