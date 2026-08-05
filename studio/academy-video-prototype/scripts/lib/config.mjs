import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const loadLocalEnv = async () => {
  try {
    const source = await readFile(path.join(projectRoot, ".env.local"), "utf8");
    for (const rawLine of source.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separator = line.indexOf("=");
      if (separator === -1) {
        continue;
      }

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
};

await loadLocalEnv();

const numberSetting = (name, fallback) => {
  const cliName = name
    .replace(/^ELEVENLABS_/u, "")
    .toLowerCase()
    .replaceAll("_", "-");
  const prefix = `--${cliName}=`;
  const cliValue = process.argv
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length);
  const value = Number(cliValue ?? process.env[name] ?? fallback);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} doit être un nombre.`);
  }
  return value;
};

const stringSetting = (name, fallback) => {
  const cliName = name
    .replace(/^ELEVENLABS_/u, "")
    .toLowerCase()
    .replaceAll("_", "-");
  const prefix = `--${cliName}=`;
  return (
    process.argv
      .find((argument) => argument.startsWith(prefix))
      ?.slice(prefix.length)
      .trim() ||
    process.env[name]?.trim() ||
    fallback
  );
};

const booleanSetting = (name, fallback) => {
  const rawValue = stringSetting(name, String(fallback)).toLowerCase();
  if (["1", "true", "yes", "on"].includes(rawValue)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(rawValue)) {
    return false;
  }
  throw new Error(`${name} doit être un booléen.`);
};

export const paths = {
  projectRoot,
  publicDir: path.join(projectRoot, "public"),
  courseCatalog: path.join(projectRoot, "content/course-catalog.json"),
  courseCasting: path.join(projectRoot, "content/course-casting.json"),
  pilot: path.join(projectRoot, "content/pilot.json"),
  shortPilot: path.join(projectRoot, "content/pilot-short.json"),
  castingText: path.join(projectRoot, "content/voice-casting.txt"),
  audioDir: path.join(projectRoot, "public/audio"),
  narrationSourceAudio: path.join(
    projectRoot,
    "public/audio/narration-source.mp3",
  ),
  narrationAudio: path.join(projectRoot, "public/audio/narration.mp3"),
  shortNarrationSourceAudio: path.join(
    projectRoot,
    "public/audio/narration-short-source.mp3",
  ),
  shortNarrationAudio: path.join(
    projectRoot,
    "public/audio/narration-short.mp3",
  ),
  alignment: path.join(projectRoot, "public/audio/alignment.json"),
  shortAlignment: path.join(
    projectRoot,
    "public/audio/alignment-short.json",
  ),
  timing: path.join(projectRoot, "content/timing.generated.json"),
  sourceTiming: path.join(
    projectRoot,
    "content/timing-source.generated.json",
  ),
  shortTiming: path.join(
    projectRoot,
    "content/timing-short.generated.json",
  ),
  shortSourceTiming: path.join(
    projectRoot,
    "content/timing-short-source.generated.json",
  ),
};

export const requireApiKey = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY manque. Copiez .env.example vers .env.local, puis ajoutez la clé localement.",
    );
  }
  return apiKey;
};

export const requireVoiceId = () => {
  const voiceId = stringSetting("ELEVENLABS_VOICE_ID", "");
  if (!voiceId) {
    throw new Error(
      "ELEVENLABS_VOICE_ID manque. Lancez `npm run voices`, choisissez une voix, puis ajoutez son identifiant dans .env.local.",
    );
  }
  return voiceId;
};

export const voiceSettings = {
  modelId: stringSetting(
    "ELEVENLABS_MODEL_ID",
    "eleven_multilingual_v2",
  ),
  stability: numberSetting("ELEVENLABS_STABILITY", 0.62),
  similarityBoost: numberSetting("ELEVENLABS_SIMILARITY_BOOST", 0.78),
  style: numberSetting("ELEVENLABS_STYLE", 0.08),
  speed: numberSetting("ELEVENLABS_SPEED", 0.96),
  useSpeakerBoost: booleanSetting("ELEVENLABS_SPEAKER_BOOST", true),
};

export const elevenLabsRequest = async (url, init = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "xi-api-key": requireApiKey(),
      ...(init.body ? {"content-type": "application/json"} : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1000);
    throw new Error(
      `ElevenLabs a répondu ${response.status} ${response.statusText}: ${details}`,
    );
  }

  return response;
};
