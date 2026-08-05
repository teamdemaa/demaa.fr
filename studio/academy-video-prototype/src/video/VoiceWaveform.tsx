import {useAudioData, visualizeAudioWaveform} from "@remotion/media-utils";
import React from "react";
import {staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const BAR_COUNT = 128;
const WAVEFORM_SAMPLES = 128;
const STANDARD_SMOOTHING_WEIGHTS = [0.36, 0.25, 0.18, 0.13, 0.08];
const SUBTLE_SMOOTHING_WEIGHTS = [
  0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.07, 0.06,
];

export type WaveformVariant = "standard" | "subtle";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const VoiceWaveform: React.FC<{
  audioFile?: string;
  variant?: WaveformVariant;
}> = ({audioFile = "audio/narration.mp3", variant = "subtle"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const src = staticFile(audioFile);
  const audioData = useAudioData(src, {sampleRate: 16000});
  const smoothingWeights =
    variant === "subtle"
      ? SUBTLE_SMOOTHING_WEIGHTS
      : STANDARD_SMOOTHING_WEIGHTS;
  const waveforms = audioData
    ? smoothingWeights.map((_, lookback) =>
        visualizeAudioWaveform({
          audioData,
          frame: Math.max(0, frame - lookback),
          fps,
          windowInSeconds: variant === "subtle" ? 0.12 : 1 / fps,
          numberOfSamples: WAVEFORM_SAMPLES,
          normalize: false,
        }),
      )
    : smoothingWeights.map(() => new Array(WAVEFORM_SAMPLES).fill(0));
  const waveform = new Array(WAVEFORM_SAMPLES).fill(0).map((_, index) =>
    waveforms.reduce(
      (total, samples, lookback) =>
        total +
        Math.abs(samples[index] ?? 0) * smoothingWeights[lookback],
      0,
    ),
  );
  const rms = Math.sqrt(
    waveform.reduce((total, sample) => total + sample * sample, 0) /
      waveform.length,
  );
  const voicePresence = clamp((rms - 0.004) / 0.045, 0, 1);
  const peak = Math.max(...waveform.map((sample) => Math.abs(sample)), 0.001);

  return (
    <div className="voice-waveform" aria-hidden="true">
      {new Array(BAR_COUNT).fill(true).map((_, index) => {
        const sampleIndex = Math.round(
          (index / (BAR_COUNT - 1)) * (WAVEFORM_SAMPLES - 1),
        );
        const amplitude = waveform[sampleIndex] ?? 0;
        const relativeAmplitude = clamp(amplitude / peak, 0, 1);
        const compressedAmplitude = Math.pow(relativeAmplitude, 0.58);
        const calculatedHeight =
          variant === "subtle"
            ? 5 + voicePresence * (6 + compressedAmplitude * 25)
            : 6 + voicePresence * (14 + compressedAmplitude * 58);
        const height = Math.round(calculatedHeight);

        return (
          <i
            key={index}
            style={{
              height,
              opacity:
                variant === "subtle"
                  ? Number((0.18 + voicePresence * 0.1).toFixed(3))
                  : Number((0.58 + voicePresence * 0.34).toFixed(3)),
            }}
          />
        );
      })}
    </div>
  );
};
