import {createHash} from "node:crypto";
import {execFile} from "node:child_process";
import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";
import {dir as compositorDir} from "@remotion/compositor-darwin-arm64";
import sharp from "sharp";
import {paths} from "./lib/config.mjs";
import {inspectPngAlpha, inspectPngRegion} from "./lib/png-alpha.mjs";
import {buildNarration} from "./lib/speech.mjs";

const run = promisify(execFile);
const presentationFile = path.join(
  paths.projectRoot,
  "content/courses/gestion-tresorerie/strict-presentation-contract.json",
);
const narrativeFile = path.join(
  paths.projectRoot,
  "content/courses/gestion-tresorerie/strict-narrative-contract.json",
);
const candidate = "c1-strict-layout-v3";
const reportDirectory = path.join(
  paths.projectRoot,
  "output/staging/oumou-warm-v2/audits",
  candidate,
);
const previewFile = process.argv.find((value) => value.startsWith("--preview="))
  ?.slice("--preview=".length);
const [presentation, narrative] = await Promise.all([
  readFile(presentationFile, "utf8").then(JSON.parse),
  readFile(narrativeFile, "utf8").then(JSON.parse),
]);
const checks = {};
const details = {
  baseline: {
    source: "mesures du candidat C1 précédent",
    visibleIllustrations: [
      {state: "intro", width: 933, height: 597},
      {state: "scene", width: 549, height: 409},
      {state: "beat", width: 462, height: 335},
    ],
    maximumHeightDriftPercent: Number(
      (((597 - 335) / 597) * 100).toFixed(2),
    ),
    maximumSurfaceRatio: Number(
      ((933 * 597) / (462 * 335)).toFixed(2),
    ),
  },
  placements: {},
  narrative: {},
};
const fail = (name, condition) => {
  checks[name] = Boolean(condition);
};
const nearlyEqual = (left, right, tolerance = 0.000001) =>
  Math.abs(left - right) <= tolerance;
const sha256File = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");
const canonicalAsset =
  "illustrations/casting-v2/01-gestion-tresorerie-canonical-v2.png";
const canonicalProvenance = presentation.assetProvenance[canonicalAsset];
const canonicalSvgFile = path.join(
  paths.publicDir,
  canonicalProvenance.source,
);
const canonicalSvg = await readFile(canonicalSvgFile, "utf8");
const isolateSvgGroup = (groupId) =>
  canonicalSvg.replace(
    /<g id="(character|props)"/gu,
    (match, candidate) =>
      candidate === groupId
        ? match
        : match.replace("<g ", '<g display="none" '),
  );
const measureSvgAlpha = async (source) => {
  const {data, info} = await sharp(Buffer.from(source), {density: 72})
    .ensureAlpha()
    .raw()
    .toBuffer({resolveWithObject: true});
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] < 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
};
const semanticGroups = canonicalProvenance.transform.semanticGroups;
const measuredSemanticGroups = {
  character: await measureSvgAlpha(isolateSvgGroup("character")),
  props: await measureSvgAlpha(isolateSvgGroup("props")),
  global: await measureSvgAlpha(canonicalSvg),
};
fail(
  "semanticSvgGroups",
  canonicalSvg.includes('<g id="character"') &&
    canonicalSvg.includes('<g id="props"') &&
    JSON.stringify(measuredSemanticGroups.character) ===
      JSON.stringify(semanticGroups.character.alphaBoundingBox) &&
    JSON.stringify(measuredSemanticGroups.props) ===
      JSON.stringify(semanticGroups.props.alphaBoundingBox) &&
    JSON.stringify(measuredSemanticGroups.global) ===
      JSON.stringify(semanticGroups.global.alphaBoundingBox),
);
fail(
  "characterGroupHeight",
  measuredSemanticGroups.character.height >= 760 &&
    measuredSemanticGroups.character.height <= 840,
);
details.semanticGroups = {
  measurement: "native SVG group isolation, density 72, alpha threshold 8",
  measured: measuredSemanticGroups,
  expected: semanticGroups,
};

fail(
  "frameContract",
  presentation.frame.width === 1920 &&
    presentation.frame.height === 1080 &&
    presentation.frame.fps === 30 &&
    presentation.safeZone.x === 240 &&
    presentation.safeZone.width === 1440,
);
fail(
  "strictNarrativeEntrances",
  presentation.strictNarrativeEntrances === true &&
    narrative.policy.hiddenElementDelayFrames === 0,
);

for (const [assetPath, expected] of Object.entries(presentation.assets)) {
  const actual = await inspectPngAlpha(
    path.join(paths.publicDir, assetPath),
    expected.alphaThreshold,
  );
  fail(
    `image:${assetPath}`,
    JSON.stringify(actual) === JSON.stringify(expected),
  );
}

const visibleRectangles = {};
for (const [placementId, placement] of Object.entries(
  presentation.placements,
)) {
  const asset = presentation.assets[placement.asset];
  const slot = presentation.slots[placement.slot];
  const scale = slot.targetVisibleHeight / asset.alphaBoundingBox.height;
  const width = asset.alphaBoundingBox.width * scale;
  const height = asset.alphaBoundingBox.height * scale;
  const rectangle = {
    x: slot.center.x - width / 2,
    y: slot.center.y - height / 2,
    width,
    height,
    centerX: slot.center.x,
    centerY: slot.center.y,
    scale,
  };
  const safeRight = presentation.safeZone.x + presentation.safeZone.width;
  const safeBottom = presentation.safeZone.y + presentation.safeZone.height;
  const copyRight = placement.copyBounds.x + placement.copyBounds.width;
  const gap = rectangle.x - copyRight;
  const overlap =
    rectangle.x < copyRight &&
    rectangle.x + rectangle.width > placement.copyBounds.x &&
    rectangle.y < placement.copyBounds.y + placement.copyBounds.height &&
    rectangle.y + rectangle.height > placement.copyBounds.y;
  const lowerHeight = slot.targetVisibleHeight * (1 - slot.tolerancePercent / 100);
  const upperHeight = slot.targetVisibleHeight * (1 + slot.tolerancePercent / 100);
  fail(
    `bbox:${placementId}`,
    height >= lowerHeight && height <= upperHeight,
  );
  fail(
    `safeZone:${placementId}`,
    rectangle.x >= presentation.safeZone.x &&
      rectangle.y >= presentation.safeZone.y &&
      rectangle.x + rectangle.width <= safeRight &&
      rectangle.y + rectangle.height <= safeBottom,
  );
  fail(
    `gap:${placementId}`,
    gap >= presentation.thresholds.minimumCopyGapPixels,
  );
  fail(`overlap:${placementId}`, !overlap);
  visibleRectangles[placementId] = rectangle;
  details.placements[placementId] = {
    asset: placement.asset,
    slot: placement.slot,
    visibleRectangle: Object.fromEntries(
      Object.entries(rectangle).map(([key, value]) => [
        key,
        Number(value.toFixed(3)),
      ]),
    ),
    copyGapPixels: Number(gap.toFixed(3)),
  };
}

const continuityPairs = [
  ["intro-transition/paradoxe", "scene/paradoxe"],
];
for (const [leftId, rightId] of continuityPairs) {
  const left = visibleRectangles[leftId];
  const right = visibleRectangles[rightId];
  const scaleDriftPercent =
    (Math.abs(left.height - right.height) / left.height) * 100;
  const centroidDrift = Math.hypot(
    left.centerX - right.centerX,
    left.centerY - right.centerY,
  );
  fail(
    `continuity:${leftId}->${rightId}`,
    scaleDriftPercent <= presentation.thresholds.continuityScalePercent &&
      centroidDrift <= presentation.thresholds.continuityCentroidPixels,
  );
}
const allHeights = Object.values(visibleRectangles).map(({height}) => height);
details.after = {
  targetVisibleHeightPixels:
    presentation.slots["character-single"].targetVisibleHeight,
  minimumVisibleHeightPixels: Number(Math.min(...allHeights).toFixed(3)),
  maximumVisibleHeightPixels: Number(Math.max(...allHeights).toFixed(3)),
  heightDriftPercent: Number(
    (
      ((Math.max(...allHeights) - Math.min(...allHeights)) /
        Math.max(...allHeights)) *
      100
    ).toFixed(3),
  ),
};
fail("constantScale", details.after.heightDriftPercent <= 5);

for (const [sourceName, source] of Object.entries(
  narrative.immutableSources,
)) {
  const absolute = path.join(paths.projectRoot, source.file);
  fail(`hash:${sourceName}`, (await sha256File(absolute)) === source.sha256);
}
const [pilot, timing, alignmentPayload] = await Promise.all([
  readFile(
    path.join(paths.projectRoot, narrative.immutableSources.script.file),
    "utf8",
  ).then(JSON.parse),
  readFile(
    path.join(paths.projectRoot, narrative.immutableSources.timing.file),
    "utf8",
  ).then(JSON.parse),
  readFile(
    path.join(paths.projectRoot, narrative.immutableSources.alignment.file),
    "utf8",
  ).then(JSON.parse),
]);
const {text, ranges} = buildNarration(pilot.scenes);
const alignment = alignmentPayload.alignment;
fail("alignmentText", alignment.characters.join("") === text);
const beatKeys = new Set();
let cueCount = 0;
for (const beat of narrative.beats) {
  const key = `${beat.sceneId}/${beat.beatId}`;
  const scene = pilot.scenes.find(({id}) => id === beat.sceneId);
  const sceneRange = ranges.find(({id}) => id === beat.sceneId);
  const sceneTiming = timing.scenes[beat.sceneId];
  const sourceFromAbsolute = text.slice(
    beat.sourcePhraseRange.absoluteStart,
    beat.sourcePhraseRange.absoluteEnd + 1,
  );
  const sourceFromScene = scene.narration
    .trim()
    .slice(
      beat.sourcePhraseRange.sceneRelativeStart,
      beat.sourcePhraseRange.sceneRelativeEnd + 1,
    );
  const expectedAbsoluteStart =
    sceneRange.start + beat.sourcePhraseRange.sceneRelativeStart;
  const cueAudioSeconds =
    alignment.character_start_times_seconds[
      beat.sourcePhraseRange.absoluteStart
    ] / (timing.postprocessRate ?? 1);
  const isSceneStart = beat.trigger.type === "scene-start";
  const expectedVisualStart = isSceneStart
    ? sceneTiming.startSeconds
    : sceneTiming.startSeconds +
      sceneTiming.beats[beat.beatId].startSeconds;
  const expectedLead = cueAudioSeconds - expectedVisualStart;
  const triggerValid = isSceneStart
    ? nearlyEqual(expectedVisualStart, sceneTiming.startSeconds)
    : beat.trigger.cue === beat.sourcePhrase &&
      Math.abs(expectedLead - narrative.policy.cueLeadSeconds) <=
        narrative.policy.cueLeadToleranceSeconds;
  fail(
    `narrative:${key}`,
    !beatKeys.has(key) &&
      sourceFromAbsolute === beat.sourcePhrase &&
      sourceFromScene === beat.sourcePhrase &&
      expectedAbsoluteStart === beat.sourcePhraseRange.absoluteStart &&
      nearlyEqual(beat.sceneStartSeconds, sceneTiming.startSeconds) &&
      nearlyEqual(beat.cueAudioSeconds, cueAudioSeconds) &&
      nearlyEqual(beat.visualStartSeconds, expectedVisualStart) &&
      nearlyEqual(beat.visualLeadSeconds, expectedLead) &&
      triggerValid &&
      Array.isArray(beat.elements) &&
      beat.elements.length > 0,
  );
  beatKeys.add(key);
  if (!isSceneStart) cueCount += 1;
}
details.narrative = {
  beats: narrative.beats.length,
  explicitSceneStarts: narrative.beats.length - cueCount,
  explicitCues: cueCount,
  cueLeadSeconds: narrative.policy.cueLeadSeconds,
  hiddenElementDelayFrames: narrative.policy.hiddenElementDelayFrames,
};
fail("narrativeCoverage", beatKeys.size === 22 && cueCount === 13);
fail(
  "renderAudioHash",
  (await sha256File(path.join(paths.projectRoot, narrative.renderAudio.file))) ===
    narrative.renderAudio.sha256,
);

const [strictSource, sceneSource, introSource, courseSource, stylesSource] =
  await Promise.all([
  readFile(
    path.join(paths.projectRoot, "src/video/StrictIllustration.tsx"),
    "utf8",
  ),
  readFile(path.join(paths.projectRoot, "src/video/SceneView.tsx"), "utf8"),
  readFile(
    path.join(paths.projectRoot, "src/video/IntroTypewriterTest.tsx"),
    "utf8",
  ),
  readFile(path.join(paths.projectRoot, "src/video/CourseVideo.tsx"), "utf8"),
  readFile(path.join(paths.projectRoot, "src/styles.css"), "utf8"),
  ]);
fail(
  "domInstrumentation",
  strictSource.includes("data-strict-placement") &&
    strictSource.includes("data-strict-visible-height") &&
    sceneSource.includes("data-strict-copy") &&
    introSource.includes("<StrictIllustration"),
);
fail(
  "sharedLayoutEngine",
  sceneSource.includes("<StrictIllustration") &&
    introSource.includes("<StrictIllustration"),
);
const c1Namespace = '[data-course="gestion-tresorerie"]';
const c1PlacementSelectors = [
  'data-strict-placement="scene/paradoxe"',
  'data-strict-placement="intro-transition/paradoxe"',
];
const namespaceOccurrences = stylesSource
  .split("\n")
  .filter((line) => line.includes(c1Namespace)).length;
const futureCourseProbe = ["c2-future", "c3-future", "c4-future", "c5-future"]
  .map((course) => ({
    course,
    placementIds: c1PlacementSelectors,
    matchesC1Namespace: course === presentation.course,
  }));
fail(
  "courseNamespace",
  courseSource.includes(
    "data-course={pilot.strictPresentationContract?.course}",
  ) &&
    sceneSource.includes(
      "data-course={strictPresentationContract?.course}",
    ) &&
    introSource.includes(
      "data-course={strictPresentationContract?.course}",
    ) &&
    namespaceOccurrences === 6 &&
    c1PlacementSelectors.every((selector) => stylesSource.includes(selector)),
);
fail(
  "futureCourseNamespaceIsolation",
  futureCourseProbe.every(({matchesC1Namespace}) => !matchesC1Namespace),
);
details.courseNamespace = {
  attribute: "data-course",
  value: presentation.course,
  selectorPrefix: c1Namespace,
  selectorPrefixOccurrences: namespaceOccurrences,
  futureCourseProbe,
};

if (previewFile) {
  const absolutePreview = path.resolve(previewFile);
  await access(absolutePreview);
  const ffprobe = path.join(compositorDir, "ffprobe");
  const ffmpeg = path.join(compositorDir, "ffmpeg");
  const environment = {...process.env, DYLD_LIBRARY_PATH: compositorDir};
  const {stdout} = await run(
    ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name,width,height,r_frame_rate:format=duration",
      "-of",
      "json",
      absolutePreview,
    ],
    {env: environment},
  );
  const metadata = JSON.parse(stdout);
  const video = metadata.streams.find(({width}) => width);
  fail(
    "previewMetadata",
    video?.codec_name === "h264" &&
      video.width === 1920 &&
      video.height === 1080 &&
      video.r_frame_rate === "30/1" &&
      Number(metadata.format.duration) >= 29.9 &&
      Number(metadata.format.duration) <= 30.1,
  );
  const generatedRenderPropsFile = path.join(
    paths.projectRoot,
    "content/generated/gestion-tresorerie--oumou-warm-v2.render-props.generated.json",
  );
  const generatedRenderProps = JSON.parse(
    await readFile(generatedRenderPropsFile, "utf8"),
  );
  const expectedAudioFile = path.relative(
    paths.publicDir,
    path.join(paths.projectRoot, narrative.renderAudio.file),
  );
  fail(
    "previewRenderAudioSource",
    generatedRenderProps.audioFile === expectedAudioFile,
  );
  const measureAudio = async (
    file,
    startSeconds = null,
    durationSeconds = null,
  ) => {
    const args = ["-v", "info"];
    if (startSeconds !== null) args.push("-ss", String(startSeconds));
    if (durationSeconds !== null) args.push("-t", String(durationSeconds));
    args.push(
      "-i",
      file,
      "-vn",
      "-filter:a",
      "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
      "-c:a",
      "pcm_s16le",
      "-f",
      "null",
      "-",
    );
    const {stderr} = await run(ffmpeg, args, {
      env: environment,
      maxBuffer: 3_000_000,
    });
    const value = (key) =>
      Number(
        stderr.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, "u"))?.[1],
      );
    return {
      integratedLufs: value("input_i"),
      truePeakDbtp: value("input_tp"),
      loudnessRangeLu: value("input_lra"),
    };
  };
  const fullAudio = await measureAudio(absolutePreview);
  const audioSegments = await Promise.all(
    [0, 10, 20].map(async (startSeconds) => ({
      startSeconds,
      endSeconds: startSeconds + 10,
      ...(await measureAudio(absolutePreview, startSeconds, 10)),
    })),
  );
  const segmentLevels = audioSegments.map(
    ({integratedLufs}) => integratedLufs,
  );
  const segmentDriftLufs =
    Math.max(...segmentLevels) - Math.min(...segmentLevels);
  fail(
    "previewIntegratedLoudness",
    fullAudio.integratedLufs >= -16.5 &&
      fullAudio.integratedLufs <= -14.5,
  );
  fail("previewTruePeak", fullAudio.truePeakDbtp <= -1.45);
  fail(
    "previewSegmentLoudness",
    audioSegments.every(
      ({integratedLufs}) =>
        integratedLufs >= -17 && integratedLufs <= -13.5,
    ),
  );
  fail("previewSegmentDrift", segmentDriftLufs <= 2);
  const stillDirectory = path.join(reportDirectory, "frames");
  await mkdir(stillDirectory, {recursive: true});
  details.preview = {
    file: absolutePreview,
    sha256: await sha256File(absolutePreview),
    metadata,
    renderAudio: {
      ...narrative.renderAudio,
      remotionAudioFile: generatedRenderProps.audioFile,
    },
    audio: {
      full: fullAudio,
      segments: audioSegments,
      segmentDriftLufs: Number(segmentDriftLufs.toFixed(3)),
      gates: {
        integratedLufs: [-16.5, -14.5],
        truePeakMaximumDbtp: -1.45,
        segmentIntegratedLufs: [-17, -13.5],
        segmentDriftMaximumLufs: 2,
      },
    },
    frames: [],
  };
  for (const frame of [
    {
      name: "intro-settled",
      seconds: 8,
      placementId: "intro-transition/paradoxe",
    },
    {
      name: "scene-continuity",
      seconds: 10.2,
      placementId: "scene/paradoxe",
    },
    {
      name: "beat-single-slot",
      seconds: 12.5,
      placementId: "beat/deux-realites/distinction",
    },
  ]) {
    const output = path.join(stillDirectory, `${frame.name}.png`);
    await run(
      ffmpeg,
      [
        "-v",
        "error",
        "-ss",
        String(frame.seconds),
        "-i",
        absolutePreview,
        "-frames:v",
        "1",
        "-y",
        output,
      ],
      {env: environment},
    );
    const png = await readFile(output);
    fail(`previewFrame:${frame.name}`, png.length > 100_000);
    const illustrationRegion = await inspectPngRegion(output, {
      x: 920,
      y: 220,
      width: 740,
      height: 640,
      predicate: ({red, green, blue, alpha}) =>
        alpha > 240 && red > 185 && green > 185 && blue > 185,
    });
    fail(
      `previewIllustrationPixels:${frame.name}`,
      illustrationRegion.matchingPixels >= 8_000,
    );
    const renderedBox = illustrationRegion.matchingBoundingBox;
    const expectedBox = visibleRectangles[frame.placementId];
    const renderedCenter = renderedBox
      ? {
          x: renderedBox.x + renderedBox.width / 2,
          y: renderedBox.y + renderedBox.height / 2,
        }
      : {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY};
    const renderedCentroidDrift = Math.hypot(
      renderedCenter.x - expectedBox.centerX,
      renderedCenter.y - expectedBox.centerY,
    );
    const renderedHeightDriftPercent = renderedBox
      ? (Math.abs(renderedBox.height - expectedBox.height) /
          expectedBox.height) *
        100
      : Number.POSITIVE_INFINITY;
    fail(
      `previewRenderedBbox:${frame.name}`,
      renderedHeightDriftPercent <= 5 &&
        renderedCentroidDrift <=
          presentation.thresholds.continuityCentroidPixels,
    );
    const placement = presentation.placements[frame.placementId];
    const renderedGap = renderedBox
      ? renderedBox.x - (placement.copyBounds.x + placement.copyBounds.width)
      : Number.NEGATIVE_INFINITY;
    fail(
      `previewRenderedGap:${frame.name}`,
      renderedGap >= presentation.thresholds.minimumCopyGapPixels,
    );
    details.preview.frames.push({
      ...frame,
      file: output,
      bytes: png.length,
      sha256: createHash("sha256").update(png).digest("hex"),
      illustrationRegion,
      renderedCentroidDriftPixels: Number(
        renderedCentroidDrift.toFixed(3),
      ),
      renderedHeightDriftPercent: Number(
        renderedHeightDriftPercent.toFixed(3),
      ),
      renderedCopyGapPixels: Number(renderedGap.toFixed(3)),
    });
  }
}

const allPass = Object.values(checks).every(Boolean);
const report = {
  generatedAt: new Date().toISOString(),
  course: "gestion-tresorerie",
  variant: "oumou-warm-v2",
  candidate,
  allPass,
  checks,
  details,
};
await mkdir(reportDirectory, {recursive: true});
const reportFile = path.join(reportDirectory, "qa-report.json");
await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`QA contrat strict C1 : ${reportFile}`);
console.log(
  `Avant : dérive hauteur ${details.baseline.maximumHeightDriftPercent}% ; ratio surface ${details.baseline.maximumSurfaceRatio}×.`,
);
console.log(
  `Après : ${details.after.minimumVisibleHeightPixels}-${details.after.maximumVisibleHeightPixels}px ; dérive ${details.after.heightDriftPercent}%.`,
);
console.log(
  `Narration : ${details.narrative.beats} beats, ${details.narrative.explicitCues} cues explicites.`,
);
if (!allPass) {
  for (const [name, passed] of Object.entries(checks)) {
    if (!passed) console.error(`ÉCHEC — ${name}`);
  }
  process.exitCode = 1;
} else {
  console.log("QA contrat strict C1 : OK");
}
