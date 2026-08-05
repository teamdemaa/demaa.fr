import {bundle} from "@remotion/bundler";
import {
  openBrowser,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {argumentValue, loadCourseFiles, resolveCourse} from "./lib/course.mjs";
import {paths} from "./lib/config.mjs";

const SAFE_ZONE = {
  canvasWidth: 1920,
  canvasHeight: 1080,
  left: 240,
  right: 1680,
  width: 1440,
  height: 1080,
};

const checkpoint = argumentValue("checkpoint", "before");
if (!/^[a-z0-9-]+$/u.test(checkpoint)) {
  throw new Error(`Checkpoint invalide : ${checkpoint}`);
}

const requestedCourses = argumentValue(
  "courses",
  "gestion-tresorerie,chiffre-affaires-benefice",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const requestedTemplates = argumentValue("templates", "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const castingOnly = process.argv.includes("--casting-only");
const useSourceTiming = process.argv.includes("--source-timing");

const makeSamples = (pilot, timing) => {
  const fps = pilot.format.fps;
  const introTitle = pilot.courseTitle ?? pilot.title.toUpperCase();
  const samples = [
    {
      id: "intro-title",
      frame: Math.min(173, 24 + introTitle.length * 4 + 1),
      kind: "intro",
      casting: false,
    },
    {
      id: "intro-transition",
      frame: 250,
      kind: "intro",
      casting: pilot.scenes[0]?.visual.asset?.includes("casting-v2/") ?? false,
    },
  ];
  let sceneStartFrame = 0;

  for (const scene of pilot.scenes) {
    const sceneTiming = timing.scenes[scene.id];
    const durationInFrames = Math.max(
      1,
      Math.round(sceneTiming.durationSeconds * fps),
    );
    const beats = scene.beats ?? [];

    if (beats.length === 0) {
      let frame =
        sceneStartFrame +
        Math.max(
          fps,
          Math.min(durationInFrames - 1, Math.round(durationInFrames * 0.72)),
        );
      if (frame < 305) {
        frame = Math.min(sceneStartFrame + durationInFrames - 1, 330);
      }
      samples.push({
        id: `${scene.id}--scene`,
        frame,
        kind: "scene",
        sceneId: scene.id,
      });
    } else {
      const beatStarts = beats.map((beat, index) =>
        index === 0
          ? 0
          : Math.max(
              1,
              Math.min(
                durationInFrames - 1,
                Math.round(
                  (sceneTiming.beats?.[beat.id]?.startSeconds ??
                    beat.startSeconds) * fps,
                ),
              ),
            ),
      );

      beats.forEach((beat, index) => {
        const from = beatStarts[index];
        const until = beatStarts[index + 1] ?? durationInFrames;
        const segmentDuration = Math.max(1, until - from);
        const localFrame = Math.min(
          until - 1,
          from + Math.max(1, Math.round(segmentDuration * 0.95)),
        );
        samples.push({
          id: `${scene.id}--${beat.id}`,
          frame: sceneStartFrame + localFrame,
          kind: "beat",
          sceneId: scene.id,
          beatId: beat.id,
          template: beat.template,
          casting: Boolean(beat.illustration),
        });
      });
    }

    sceneStartFrame += durationInFrames;
  }

  return samples;
};

const safeZoneOverlay = Buffer.from(`
  <svg width="${SAFE_ZONE.canvasWidth}" height="${SAFE_ZONE.canvasHeight}">
    <rect x="0" y="0" width="${SAFE_ZONE.left}" height="${SAFE_ZONE.height}"
      fill="#ef4444" fill-opacity="0.20"/>
    <rect x="${SAFE_ZONE.right}" y="0"
      width="${SAFE_ZONE.canvasWidth - SAFE_ZONE.right}"
      height="${SAFE_ZONE.height}" fill="#ef4444" fill-opacity="0.20"/>
    <line x1="${SAFE_ZONE.left}" y1="0" x2="${SAFE_ZONE.left}"
      y2="${SAFE_ZONE.height}" stroke="#ffdf5d" stroke-width="5"/>
    <line x1="${SAFE_ZONE.right}" y1="0" x2="${SAFE_ZONE.right}"
      y2="${SAFE_ZONE.height}" stroke="#ffdf5d" stroke-width="5"/>
  </svg>
`);

const makeContactSheet = async ({items, output}) => {
  const rowWidth = 840;
  const rowHeight = 300;
  const labelHeight = 30;
  const composites = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const top = index * rowHeight;
    const label = Buffer.from(`
      <svg width="${rowWidth}" height="${labelHeight}">
        <rect width="${rowWidth}" height="${labelHeight}" fill="#111827"/>
        <text x="10" y="21" fill="#ffffff"
          font-family="Arial, sans-serif" font-size="15">
          ${item.id.replaceAll("&", "&amp;")} · frame ${item.frame}
        </text>
        <text x="490" y="21" fill="#d1d5db"
          font-family="Arial, sans-serif" font-size="14">
          CROP CENTRAL 4:3
        </text>
      </svg>
    `);
    const overlay = await sharp(item.overlay)
      .resize(480, 270, {fit: "fill"})
      .png()
      .toBuffer();
    const crop = await sharp(item.crop)
      .resize(360, 270, {fit: "fill"})
      .png()
      .toBuffer();

    composites.push(
      {input: label, left: 0, top},
      {input: overlay, left: 0, top: top + labelHeight},
      {input: crop, left: 480, top: top + labelHeight},
    );
  }

  await sharp({
    create: {
      width: rowWidth,
      height: rowHeight * items.length,
      channels: 4,
      background: "#111827",
    },
  })
    .composite(composites)
    .png()
    .toFile(output);
};

const serveUrl = await bundle({
  entryPoint: path.join(paths.projectRoot, "src/index.ts"),
  publicDir: paths.publicDir,
  onProgress: () => undefined,
});
const browser = await openBrowser("chrome", {logLevel: "error"});

try {
  for (const slug of requestedCourses) {
    const course = await resolveCourse(slug);
    const {pilot, timing} = await loadCourseFiles(course, {useSourceTiming});
    const inputProps = {
      pilot,
      timing,
      audioFile: course.audioFile,
      withNarration: false,
      withTypingAudio: false,
      withWaveform: false,
    };
    const composition = await selectComposition({
      serveUrl,
      id: "CourseMasterVideoOnly",
      inputProps,
      puppeteerInstance: browser,
      logLevel: "error",
    });
    const samples = makeSamples(pilot, timing).filter(
      (sample) =>
        sample.frame < composition.durationInFrames &&
        (!castingOnly || sample.casting) &&
        (requestedTemplates.length === 0 ||
          requestedTemplates.includes(sample.template)),
    );
    const root = path.join(
      paths.projectRoot,
      "output",
      "safe-zone-audit",
      checkpoint,
      slug,
    );
    const rawDirectory = path.join(root, "raw-16x9");
    const overlayDirectory = path.join(root, "safe-overlay");
    const cropDirectory = path.join(root, "crop-4x3");
    await Promise.all([
      mkdir(rawDirectory, {recursive: true}),
      mkdir(overlayDirectory, {recursive: true}),
      mkdir(cropDirectory, {recursive: true}),
    ]);

    const rendered = [];
    for (const sample of samples) {
      const raw = path.join(rawDirectory, `${sample.id}.png`);
      const overlay = path.join(overlayDirectory, `${sample.id}.png`);
      const crop = path.join(cropDirectory, `${sample.id}.png`);
      await renderStill({
        composition,
        serveUrl,
        output: raw,
        frame: sample.frame,
        inputProps,
        imageFormat: "png",
        puppeteerInstance: browser,
        logLevel: "error",
      });
      await sharp(raw)
        .composite([{input: safeZoneOverlay, left: 0, top: 0}])
        .png()
        .toFile(overlay);
      await sharp(raw)
        .extract({
          left: SAFE_ZONE.left,
          top: 0,
          width: SAFE_ZONE.width,
          height: SAFE_ZONE.height,
        })
        .png()
        .toFile(crop);
      rendered.push({...sample, raw, overlay, crop});
      console.log(`${checkpoint}/${slug}: ${sample.id} · frame ${sample.frame}`);
    }

    const contactSheet = path.join(root, `${slug}-${checkpoint}-contact.png`);
    await makeContactSheet({items: rendered, output: contactSheet});
    await writeFile(
      path.join(root, "manifest.json"),
      `${JSON.stringify(
        {
          checkpoint,
          course: slug,
          composition: "CourseMasterVideoOnly",
          safeZone: SAFE_ZONE,
          templates: requestedTemplates,
          castingOnly,
          useSourceTiming,
          samples: samples.map((sample) => ({
            ...sample,
            seconds: sample.frame / pilot.format.fps,
          })),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    console.log(`Planche : ${contactSheet}`);
  }
} finally {
  await browser.close({silent: true});
}
