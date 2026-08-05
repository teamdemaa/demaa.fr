import {Audio} from "@remotion/media";
import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import type {GeneratedTiming, Pilot} from "../types";
import {CourseVideo} from "./CourseVideo";
import {IntroTransitionVisual} from "./IntroTypewriterTest";
import type {MotionProfile} from "./SceneView";
import type {WaveformVariant} from "./VoiceWaveform";

const INTRO_DURATION_IN_FRAMES = 300;

export const MasterCourseVideo: React.FC<{
  pilot: Pilot;
  timing: GeneratedTiming;
  withNarration: boolean;
  withTypingAudio: boolean;
  audioFile?: string;
  withWaveform?: boolean;
  waveformVariant?: WaveformVariant;
  motionProfile?: MotionProfile;
}> = ({
  pilot,
  timing,
  withNarration,
  withTypingAudio,
  audioFile = "audio/narration.mp3",
  withWaveform = true,
  waveformVariant = "subtle",
  motionProfile = "stable",
}) => (
  <AbsoluteFill>
    {withNarration ? <Audio src={staticFile(audioFile)} /> : null}
    <CourseVideo
      pilot={pilot}
      timing={timing}
      withAudio={false}
      useTiming
      audioFile={audioFile}
      withWaveform={withWaveform}
      waveformVariant={waveformVariant}
      motionProfile={motionProfile}
    />
      <Sequence durationInFrames={INTRO_DURATION_IN_FRAMES}>
        <IntroTransitionVisual
          withTypingAudio={withTypingAudio}
          courseTitle={pilot.courseTitle ?? pilot.title.toUpperCase()}
          nextEyebrow={pilot.scenes[0]?.title.toUpperCase()}
          nextLines={pilot.scenes[0]?.onScreen}
          nextAsset={pilot.scenes[0]?.visual.asset}
          nextAssetScale={pilot.scenes[0]?.visual.assetScale}
          nextAssetOffsetX={pilot.scenes[0]?.visual.assetOffsetX}
          audioFile={audioFile}
          withWaveform={withWaveform}
          waveformVariant={waveformVariant}
          primaryLabel={pilot.introVisual?.primaryLabel}
          secondaryLabel={pilot.introVisual?.secondaryLabel}
          motionProfile={motionProfile}
          strictPresentationContract={pilot.strictPresentationContract}
        />
      </Sequence>
  </AbsoluteFill>
);
