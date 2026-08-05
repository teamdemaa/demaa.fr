import {createHash} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";

export const productionStatuses = [
  "draft",
  "script-approved",
  "voice-approved",
  "render-ready",
  "final",
];

export const sha256File = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");

export const loadProduction = async (course) => {
  if (!course.production) {
    throw new Error(
      `${course.slug}: chemin production absent du catalogue.`,
    );
  }

  try {
    return JSON.parse(await readFile(course.production, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
    return {
      version: 1,
      course: course.slug,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
  }
};

export const writeProduction = async (course, production) => {
  await mkdir(path.dirname(course.production), {recursive: true});
  await writeFile(
    course.production,
    `${JSON.stringify(production, null, 2)}\n`,
    "utf8",
  );
};

export const assertCurrentScript = async (course, production) => {
  const currentHash = await sha256File(course.content);
  const approvedHash = production.script?.sha256;
  if (!approvedHash || approvedHash !== currentHash) {
    throw new Error(
      `${course.slug}: le script a changé depuis son approbation. ` +
        "Revenez à draft, validez le contenu, puis approuvez de nouveau le script.",
    );
  }
  return currentHash;
};

export const assertProductionStage = async (
  course,
  allowedStatuses,
  {requireCurrentScript = true} = {},
) => {
  const production = await loadProduction(course);
  if (!allowedStatuses.includes(production.status)) {
    throw new Error(
      `${course.slug}: statut « ${production.status} ». ` +
        `Statut requis : ${allowedStatuses.join(" ou ")}.`,
    );
  }
  if (requireCurrentScript) {
    await assertCurrentScript(course, production);
  }
  return production;
};

export const finalizeProduction = async (
  course,
  {duration, loudness, videoStream, audioStream},
) => {
  const production = await assertProductionStage(
    course,
    ["render-ready", "final"],
  );
  const completedAt = new Date().toISOString();
  const outputHash = await sha256File(course.finalOutput);
  const next = {
    ...production,
    status: "final",
    updatedAt: completedAt,
    final: {
      approvedAt: completedAt,
      output: path.relative(path.dirname(course.production), course.finalOutput),
      sha256: outputHash,
      qa: {
        durationSeconds: Number(duration.toFixed(3)),
        loudnessLufs: loudness === undefined ? null : Number(loudness),
        videoCodec: videoStream?.codec_name,
        audioCodec: audioStream?.codec_name,
        width: videoStream?.width,
        height: videoStream?.height,
        fps: videoStream?.r_frame_rate,
        fullDecode: true,
      },
    },
  };
  await writeProduction(course, next);
  return next;
};
