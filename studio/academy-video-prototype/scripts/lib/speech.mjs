import {writeFile} from "node:fs/promises";

export const buildNarration = (scenes) => {
  let cursor = 0;
  const ranges = [];
  const parts = [];

  for (const scene of scenes) {
    if (parts.length > 0) {
      const separator = "\n\n";
      parts.push(separator);
      cursor += separator.length;
    }

    const text = scene.narration.trim();
    const start = cursor;
    parts.push(text);
    cursor += text.length;
    ranges.push({id: scene.id, start, end: cursor - 1});
  }

  return {text: parts.join(""), ranges};
};

const assertAlignment = (text, alignment) => {
  const characters = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;

  if (!Array.isArray(characters) || !Array.isArray(starts) || !Array.isArray(ends)) {
    throw new Error("La réponse ElevenLabs ne contient pas d’alignement exploitable.");
  }

  if (characters.length !== starts.length || characters.length !== ends.length) {
    throw new Error("Les tableaux d’alignement ElevenLabs n’ont pas la même longueur.");
  }

  if (characters.join("") !== text) {
    throw new Error(
      "Le texte renvoyé par ElevenLabs diffère du texte envoyé. Aucun calage approximatif n’a été appliqué.",
    );
  }
};

export const deriveTiming = ({pilot, text, ranges, alignment}) => {
  assertAlignment(text, alignment);

  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;
  const speechRanges = ranges.map((range) => ({
    ...range,
    speechStart: starts[range.start],
    speechEnd: ends[range.end],
  }));

  const boundaries = [0];
  for (let index = 1; index < speechRanges.length; index += 1) {
    const previousEnd = speechRanges[index - 1].speechEnd;
    const nextStart = speechRanges[index].speechStart;
    boundaries.push((previousEnd + nextStart) / 2);
  }

  const audioDurationSeconds = ends.at(-1) ?? 0;
  const totalDurationSeconds = audioDurationSeconds + 1.2;
  boundaries.push(totalDurationSeconds);

  const scenes = Object.fromEntries(
    speechRanges.map((range, index) => {
      const startSeconds = boundaries[index];
      const endSeconds = boundaries[index + 1];
      return [
        range.id,
        {
          startSeconds,
          endSeconds,
          durationSeconds: endSeconds - startSeconds,
          speechStartSeconds: range.speechStart,
          speechEndSeconds: range.speechEnd,
          beats: Object.fromEntries(
            (pilot.scenes[index].beats ?? [])
              .filter((beat) => beat.cue)
              .map((beat) => {
                const localIndex = pilot.scenes[index].narration
                  .trim()
                  .indexOf(beat.cue);
                if (localIndex === -1) {
                  throw new Error(
                    `${range.id}/${beat.id}: cue introuvable : ${beat.cue}`,
                  );
                }
                const cueStartSeconds = starts[range.start + localIndex];
                const leadSeconds = beat.leadSeconds ?? 0.25;
                return [
                  beat.id,
                  {
                    startSeconds: Math.max(
                      0,
                      cueStartSeconds - startSeconds - leadSeconds,
                    ),
                    cueStartSeconds,
                    leadSeconds,
                  },
                ];
              }),
          ),
        },
      ];
    }),
  );

  return {
    source: "elevenlabs-character-alignment",
    modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    fps: pilot.format.fps,
    audioDurationSeconds,
    totalDurationSeconds,
    scenes,
  };
};

export const writeJson = async (file, value) => {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
