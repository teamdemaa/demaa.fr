import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {paths} from "./config.mjs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const argumentValue = (name, fallback) => {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }

  const flagIndex = process.argv.indexOf(`--${name}`);
  if (flagIndex !== -1) {
    return process.argv[flagIndex + 1];
  }

  return fallback;
};

const insideProject = (relativePath) => {
  const resolved = path.resolve(paths.projectRoot, relativePath);
  const prefix = `${paths.projectRoot}${path.sep}`;
  if (!resolved.startsWith(prefix)) {
    throw new Error(`Chemin hors projet refusé : ${relativePath}`);
  }
  return resolved;
};

export const loadCourseCatalog = async () =>
  JSON.parse(await readFile(paths.courseCatalog, "utf8"));

export const applyCasting = async (pilot, course) => {
  if (!course.variant) {
    return pilot;
  }

  let casting;
  try {
    casting = JSON.parse(await readFile(paths.courseCasting, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return pilot;
    }
    throw error;
  }

  const courseCasting =
    casting.variants?.[course.variant]?.courses?.[course.slug];
  if (!courseCasting) {
    return pilot;
  }

  const illustrations = courseCasting.beats ?? {};
  return {
    ...pilot,
    scenes: pilot.scenes.map((scene) => ({
      ...scene,
      beats: scene.beats?.map((beat) => {
        const illustration = illustrations[`${scene.id}/${beat.id}`];
        return illustration ? {...beat, illustration} : beat;
      }),
    })),
  };
};

const existingVariantContent = async (slug, variant, fallback) => {
  if (!variant) {
    return fallback;
  }

  const relativePath = `content/courses/${slug}/variants/${variant}/course.json`;
  try {
    await access(insideProject(relativePath));
    return relativePath;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
};

export const resolveCourse = async (
  requestedSlug = argumentValue("course"),
) => {
  const catalog = await loadCourseCatalog();
  const slug = requestedSlug || catalog.defaultCourse;
  if (!slugPattern.test(slug)) {
    throw new Error(`Slug de cours invalide : ${slug}`);
  }

  const entry = catalog.courses[slug];
  if (!entry) {
    throw new Error(
      `Cours inconnu : ${slug}. Disponibles : ${Object.keys(catalog.courses).join(", ")}`,
    );
  }

  const variant = argumentValue("variant");
  if (variant && !slugPattern.test(variant)) {
    throw new Error(`Variante de cours invalide : ${variant}`);
  }

  const effectiveEntry = variant
    ? {
        ...entry,
        content: await existingVariantContent(slug, variant, entry.content),
        production: `content/courses/${slug}/variants/${variant}/production.json`,
        sourceTiming: `content/courses/${slug}/variants/${variant}/timing-source.generated.json`,
        timing: `content/courses/${slug}/variants/${variant}/timing.generated.json`,
        alignment: `public/courses/${slug}/variants/${variant}/audio/alignment.json`,
        sourceAudio: `public/courses/${slug}/variants/${variant}/audio/narration-source.mp3`,
        audio: `public/courses/${slug}/variants/${variant}/audio/narration.mp3`,
        finalOutput: `output/staging/${variant}/cours-${slug}-final.mp4`,
      }
    : entry;
  const resolved = Object.fromEntries(
    Object.entries(effectiveEntry).map(([key, value]) => [
      key,
      insideProject(value),
    ]),
  );
  const publicPrefix = `${paths.publicDir}${path.sep}`;
  if (!resolved.audio.startsWith(publicPrefix)) {
    throw new Error(`L’audio final doit se trouver dans public/ : ${entry.audio}`);
  }

  return {
    slug,
    variant,
    entry: effectiveEntry,
    ...resolved,
    audioFile: path.relative(paths.publicDir, resolved.audio),
    outputDirectory: path.dirname(resolved.finalOutput),
  };
};

export const loadCourseFiles = async (
  course,
  {useSourceTiming = false} = {},
) => {
  const [rawPilot, timing, strictPresentationContract] = await Promise.all([
    readFile(course.content, "utf8").then(JSON.parse),
    readFile(
      useSourceTiming ? course.sourceTiming : course.timing,
      "utf8",
    ).then(JSON.parse),
    course.entry.strictPresentationContract
      ? readFile(
          insideProject(course.entry.strictPresentationContract),
          "utf8",
        ).then(JSON.parse)
      : Promise.resolve(undefined),
  ]);
  const pilot = await applyCasting(
    strictPresentationContract
      ? {...rawPilot, strictPresentationContract}
      : rawPilot,
    course,
  );
  return {pilot, timing};
};

export const writeRenderProps = async (
  course,
  {
    withNarration = false,
    withTypingAudio = false,
    withWaveform = true,
    waveformVariant = "subtle",
    motionProfile = "stable",
    audioFile = course.audioFile,
  } = {},
) => {
  const {pilot, timing} = await loadCourseFiles(course);
  const generatedDirectory = path.join(paths.projectRoot, "content/generated");
  await mkdir(generatedDirectory, {recursive: true});
  const output = path.join(
    generatedDirectory,
    `${course.slug}${course.variant ? `--${course.variant}` : ""}.render-props.generated.json`,
  );
  await writeFile(
    output,
    `${JSON.stringify(
      {
        pilot,
        timing,
        audioFile,
        withNarration,
        withTypingAudio,
        withWaveform,
        waveformVariant,
        motionProfile,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return output;
};
