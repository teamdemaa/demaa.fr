import {Audio} from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {VoiceWaveform, type WaveformVariant} from "./VoiceWaveform";
import type {MotionProfile} from "./SceneView";
import type {StrictPresentationContract} from "../types";
import {StrictIllustration} from "./StrictIllustration";

const DEFAULT_TITLE = "GESTION DE LA\nTRÉSORERIE";
const TYPE_START = 24;
const FRAMES_PER_CHARACTER = 4;

export const IntroTypewriterTest: React.FC<{
  transitionPreview?: boolean;
  withTypingAudio?: boolean;
  courseTitle?: string;
  nextEyebrow?: string;
  nextLines?: string[];
  nextAsset?: string;
  nextAssetScale?: number;
  nextAssetOffsetX?: number;
  audioFile?: string;
  withWaveform?: boolean;
  waveformVariant?: WaveformVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  motionProfile?: MotionProfile;
  strictPresentationContract?: StrictPresentationContract;
}> = ({
  transitionPreview = false,
  withTypingAudio = true,
  courseTitle = DEFAULT_TITLE,
  nextEyebrow = "LE PARADOXE",
  nextLines = ["Rentable.", "Mais sans trésorerie."],
  nextAsset = "illustrations/01_commandes_pleines_cash_vide.png",
  nextAssetScale = 1,
  nextAssetOffsetX = -48,
  audioFile = "audio/narration.mp3",
  withWaveform = true,
  waveformVariant = "subtle",
  primaryLabel = "TRÉSORERIE",
  secondaryLabel = "12 SEM.",
  motionProfile = "stable",
  strictPresentationContract,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const strictNarrative =
    strictPresentationContract?.strictNarrativeEntrances === true;
  const visibleCharacters = Math.max(
    0,
    Math.min(
      courseTitle.length,
      Math.floor((frame - TYPE_START) / FRAMES_PER_CHARACTER) + 1,
    ),
  );
  const typedTitle = courseTitle.slice(0, visibleCharacters);
  const typingFinished = visibleCharacters === courseTitle.length;
  const stableEase = {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };
  const labelEntranceLegacy = spring({
    frame: frame - 4,
    fps,
    config: {damping: 20, stiffness: 115},
    durationInFrames: 18,
  });
  const labelEntrance =
    motionProfile === "stable"
      ? interpolate(frame, [4, 18], [0, 1], stableEase)
      : labelEntranceLegacy;
  const illustrationReveal = interpolate(frame, [40, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const illustrationZoom = interpolate(frame, [40, 84], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const underlineReveal = interpolate(
    frame,
    [
      TYPE_START + courseTitle.length * FRAMES_PER_CHARACTER - 8,
      TYPE_START + courseTitle.length * FRAMES_PER_CHARACTER + 14,
    ],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const transitionOut = strictNarrative
    ? 1
    : transitionPreview
    ? interpolate(frame, [174, 192], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const nextSlideReveal = strictNarrative
    ? 1
    : transitionPreview
    ? motionProfile === "stable"
      ? interpolate(frame, [203, 225], [0, 1], stableEase)
      : spring({
          frame: frame - 203,
          fps,
          config: {damping: 22, stiffness: 105, mass: 0.9},
          durationInFrames: 28,
        })
    : 0;
  const accentReveal = strictNarrative
    ? 1
    : transitionPreview
    ? motionProfile === "stable"
      ? interpolate(frame, [214, 230], [0, 1], stableEase)
      : spring({
          frame: frame - 214,
          fps,
          config: {damping: 22, stiffness: 105, mass: 0.9},
          durationInFrames: 22,
        })
    : 0;
  const trayAccent = strictNarrative
    ? 0
    : transitionPreview
    ? spring({
        frame: frame - 242,
        fps,
        config: {damping: 16, stiffness: 150},
        durationInFrames: 18,
      }) *
      interpolate(frame, [258, 274], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const paperAccent = strictNarrative
    ? 0
    : transitionPreview
    ? spring({
        frame: frame - 266,
        fps,
        config: {damping: 16, stiffness: 150},
        durationInFrames: 18,
      }) *
      interpolate(frame, [282, 298], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <AbsoluteFill className="intro-test" style={{display: "grid"}}>
      {withTypingAudio && !strictNarrative
        ? Array.from(courseTitle).map((character, index) =>
            character === " " || character === "\n" ? null : (
              <Sequence
                key={`${character}-${index}`}
                from={TYPE_START + index * FRAMES_PER_CHARACTER}
                durationInFrames={4}
              >
                <Audio
                  src={staticFile("audio/typewriter-click.wav")}
                  volume={index === courseTitle.length - 1 ? 0.22 : 0.12}
                />
              </Sequence>
            ),
          )
        : null}

      <div className="intro-test__copy">
        <div
          className="intro-test__label"
          style={{
            opacity: labelEntrance * (1 - transitionOut),
            transform: `translateY(${interpolate(
              labelEntrance,
              [0, 1],
              [motionProfile === "stable" ? 8 : 12, 0],
            ).toFixed(motionProfile === "stable" ? 0 : 3)}px) translateX(${
              motionProfile === "stable"
                ? Math.round(-12 * transitionOut)
                : -24 * transitionOut
            }px)`,
          }}
        >
          COURS
        </div>

        <div
          className="intro-test__title"
          aria-label={courseTitle.replaceAll("\n", " ")}
          style={{
            opacity: 1 - transitionOut,
            transform: `translateX(${
              motionProfile === "stable"
                ? Math.round(-16 * transitionOut)
                : -34 * transitionOut
            }px)`,
          }}
        >
          <span>{typedTitle}</span>
          <span
            className="intro-test__caret"
            style={{
              opacity:
                typingFinished && Math.floor(frame / 12) % 2 === 0 ? 0 : 1,
            }}
          />
        </div>

        <div
          className="intro-test__underline"
          style={{
            opacity: 1 - transitionOut,
            transform: `scaleX(${underlineReveal})`,
          }}
        />
      </div>

      <div
        className="intro-test__visual"
        style={{
          clipPath: transitionPreview
            ? "none"
            : `inset(0 ${100 - illustrationReveal * 100}% 0 0)`,
          opacity:
            (transitionPreview ? illustrationZoom : illustrationReveal) *
            (1 - transitionOut),
          transform: `translateX(${
            (transitionPreview
              ? -32
              : interpolate(illustrationReveal, [0, 1], [36, -32])) +
            (motionProfile === "stable" ? 32 : 88) * transitionOut
          }px) scale(${interpolate(
            transitionPreview ? illustrationZoom : illustrationReveal,
            [0, 1],
            transitionPreview ? [0.88, 1] : [0.96, 1],
          ) - 0.025 * transitionOut})`,
        }}
      >
        <div className="intro-symbol" aria-hidden="true">
          <div className="intro-symbol__account">
            <span>{primaryLabel}</span>
            <strong>€</strong>
            <i />
            <i className="short" />
          </div>
          <div className="intro-symbol__calendar">
            <span>{secondaryLabel}</span>
            <div className="intro-symbol__calendar-grid">
              {Array.from({length: 12}).map((_, index) => (
                <i key={index} className={index === 8 ? "low" : ""} />
              ))}
            </div>
          </div>
          <div className="intro-symbol__coin">€</div>
        </div>
      </div>

      {transitionPreview ? (
        <>
          <AbsoluteFill
            className="scene split intro-transition__next"
            data-course={strictPresentationContract?.course}
            style={{
              display: "grid",
              gridTemplateColumns: "0.95fr 1.05fr",
              opacity: nextSlideReveal,
            }}
          >
            <div
              className="copy intro-transition__next-copy"
              style={{
                transform: `translateX(${interpolate(
                  nextSlideReveal,
                  [0, 1],
                  [motionProfile === "stable" ? -18 : -52, 0],
                ).toFixed(motionProfile === "stable" ? 0 : 3)}px)`,
              }}
            >
              <div className="eyebrow">{nextEyebrow}</div>
              <div className="display-stack">
                {nextLines.map((line, index) => (
                  <div
                    key={line}
                    className={`display${
                      index === nextLines.length - 1 ? " accent" : ""
                    }`}
                    style={
                      index === nextLines.length - 1
                        ? {
                            opacity: accentReveal,
                            transform: `translateY(${interpolate(
                              accentReveal,
                              [0, 1],
                              [motionProfile === "stable" ? 12 : 28, 0],
                            ).toFixed(motionProfile === "stable" ? 0 : 3)}px)`,
                          }
                        : undefined
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {strictPresentationContract?.placements[
              "intro-transition/paradoxe"
            ] ? (
              <StrictIllustration
                contract={strictPresentationContract}
                placementId="intro-transition/paradoxe"
                opacity={nextSlideReveal}
                translateX={interpolate(
                  nextSlideReveal,
                  [0, 1],
                  [motionProfile === "stable" ? 14 : 36, 0],
                )}
              />
            ) : (
              <div
                className="illustration-wrap"
                style={{opacity: nextSlideReveal}}
              >
                <div
                  className="illustration-motion"
                  style={{
                    transform: `translateX(${nextAssetOffsetX}px) scale(${interpolate(
                      nextSlideReveal,
                      [0, 1],
                      [motionProfile === "stable" ? 0.96 : 0.82, 1],
                    ) * nextAssetScale})`,
                  }}
                >
                  <Img
                    className="illustration"
                    src={staticFile(nextAsset)}
                    alt=""
                  />
                </div>
              </div>
            )}

            <div
              className="micro-accent micro-accent--paper"
              style={{
                opacity: paperAccent,
                transform: `scale(${0.82 + paperAccent * 0.18})`,
              }}
            >
              <i />
              <i />
              <i />
            </div>
            <div
              className="micro-accent micro-accent--tray"
              style={{
                opacity: trayAccent,
                transform: `scale(${0.82 + trayAccent * 0.18})`,
              }}
            >
              <i />
              <i />
              <i />
            </div>
          </AbsoluteFill>
        </>
      ) : null}

      {transitionPreview && withWaveform ? (
        <VoiceWaveform audioFile={audioFile} variant={waveformVariant} />
      ) : null}
    </AbsoluteFill>
  );
};

export const IntroTransitionVisual: React.FC<{
  withTypingAudio?: boolean;
  courseTitle?: string;
  nextEyebrow?: string;
  nextLines?: string[];
  nextAsset?: string;
  nextAssetScale?: number;
  nextAssetOffsetX?: number;
  audioFile?: string;
  withWaveform?: boolean;
  waveformVariant?: WaveformVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  motionProfile?: MotionProfile;
  strictPresentationContract?: StrictPresentationContract;
}> = (props) => (
  <IntroTypewriterTest
    transitionPreview
    {...props}
  />
);

export const IntroTransitionPreview: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("audio/narration.mp3")} />
    <IntroTransitionVisual />
  </AbsoluteFill>
);
