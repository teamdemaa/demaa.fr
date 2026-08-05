import React from "react";
import {Audio} from "@remotion/media";
import {AbsoluteFill, Series, staticFile, useVideoConfig} from "remotion";
import type {GeneratedTiming, Pilot} from "../types";
import {SceneView, type MotionProfile} from "./SceneView";
import {Progress} from "./Progress";
import {VoiceWaveform, type WaveformVariant} from "./VoiceWaveform";

export const CourseVideo: React.FC<{
  pilot: Pilot;
  timing: GeneratedTiming;
  withAudio: boolean;
  useTiming?: boolean;
  audioFile?: string;
  withWaveform?: boolean;
  waveformVariant?: WaveformVariant;
  motionProfile?: MotionProfile;
}> = ({
  pilot,
  timing,
  withAudio,
  useTiming,
  audioFile = "audio/narration.mp3",
  withWaveform = true,
  waveformVariant = "subtle",
  motionProfile = "stable",
}) => {
  const {durationInFrames, height, width} = useVideoConfig();
  const isPortrait = height > width;
  const shouldUseTiming = useTiming ?? withAudio;
  const sceneDurations = pilot.scenes.map((scene) =>
    shouldUseTiming && timing.scenes[scene.id]
      ? Math.max(
          1,
          Math.round(
            timing.scenes[scene.id].durationSeconds * pilot.format.fps,
          ),
        )
      : Math.round(scene.targetSeconds * pilot.format.fps),
  );
  const allocatedFrames = sceneDurations.reduce(
    (total, duration) => total + duration,
    0,
  );
  sceneDurations[sceneDurations.length - 1] +=
    durationInFrames - allocatedFrames;

  return (
    <AbsoluteFill
      className={`course ${isPortrait ? "course--portrait" : "course--landscape"}`}
      data-course={pilot.strictPresentationContract?.course}
    >
      {withAudio ? <Audio src={staticFile(audioFile)} /> : null}
      <Series>
        {pilot.scenes.map((scene, index) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={sceneDurations[index]}
            name={`${index + 1}. ${scene.title}`}
          >
            <SceneView
              scene={scene}
              durationInFrames={sceneDurations[index]}
              timing={timing.scenes[scene.id]}
              motionProfile={motionProfile}
              strictPresentationContract={pilot.strictPresentationContract}
            />
          </Series.Sequence>
        ))}
      </Series>
      {!isPortrait && withWaveform ? (
        <VoiceWaveform audioFile={audioFile} variant={waveformVariant} />
      ) : null}
      <Progress />
    </AbsoluteFill>
  );
};
