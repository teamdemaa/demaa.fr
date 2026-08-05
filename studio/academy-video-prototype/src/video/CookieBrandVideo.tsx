import {Audio} from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type CookieScene = {
  id: string;
  step?: string;
  eyebrow: string;
  title: string;
  caption: string;
  narration: string;
  assets: string[];
};

type CookiePilot = {
  brand: {
    name: string;
    tagline: string;
    caseLabel: string;
  };
  scenes: CookieScene[];
};

type SceneTiming = {
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
};

type CookieTiming = {
  totalDurationSeconds: number;
  scenes: Record<string, SceneTiming>;
};

const palette = {
  cream: "#F4EDDF",
  creamLight: "#FBF7EF",
  cocoa: "#2B1914",
  cocoaSoft: "#50352D",
  butter: "#F2BC52",
  sage: "#819584",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BrandWordmark: React.FC<{light?: boolean; compact?: boolean}> = ({
  light = false,
  compact = false,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      color: light ? palette.creamLight : palette.cocoa,
      fontSize: compact ? 34 : 48,
      fontWeight: 700,
      letterSpacing: "-0.055em",
      lineHeight: 1,
    }}
  >
    JUSTE
    <span style={{color: palette.butter}}>.</span>
  </div>
);

const StepRail: React.FC<{active?: string}> = ({active}) => (
  <div style={{display: "flex", gap: 8}}>
    {["01", "02", "03"].map((step) => {
      const isActive = step === active;
      return (
        <div
          key={step}
          style={{
            width: 46,
            height: 12,
            borderRadius: 999,
            background: isActive ? palette.butter : "rgba(43,25,20,0.16)",
          }}
        />
      );
    })}
  </div>
);

const PhotoLayer: React.FC<{
  asset: string;
  index: number;
  from: number;
  duration: number;
  sceneDuration: number;
}> = ({asset, index, from, duration, sceneDuration}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;
  const enter = interpolate(localFrame, [0, 5], [0, 1], clamp);
  const exit =
    from + duration >= sceneDuration
      ? 1
      : interpolate(localFrame, [duration - 5, duration], [1, 0], clamp);
  const movement = interpolate(
    localFrame,
    [0, Math.max(1, duration)],
    [0, 1],
    clamp,
  );
  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, exit),
        transform: `scale(${1.025 + movement * 0.035}) translate3d(${direction * (1.2 - movement * 2.4)}%, ${0.8 - movement * 1.6}%, 0)`,
      }}
    >
      <Img
        src={staticFile(asset)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "saturate(0.82) contrast(0.97) brightness(1.02)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(43,25,20,0.04) 0%, transparent 42%, rgba(43,25,20,0.22) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BrandedScene: React.FC<{
  scene: CookieScene;
  durationInFrames: number;
  index: number;
}> = ({scene, durationInFrames, index}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 9], [0, 1], clamp);
  const titleRise = interpolate(frame, [0, 12], [26, 0], clamp);
  const isClose = scene.id === "close";
  const isHook = scene.id === "hook";
  const segment = durationInFrames / scene.assets.length;

  return (
    <AbsoluteFill
      style={{
        background: isClose ? palette.cocoa : palette.cream,
        color: isClose ? palette.creamLight : palette.cocoa,
        fontFamily: "Satoshi, Avenir Next, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          top: 52,
          height: 72,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <BrandWordmark light={isClose} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: isClose
                ? "rgba(251,247,239,0.66)"
                : palette.cocoaSoft,
            }}
          >
            DEMAA — CAS 01
          </div>
          <StepRail active={scene.step} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 42,
          right: 42,
          top: 148,
          height: 1240,
          borderRadius: 44,
          overflow: "hidden",
          background: palette.cocoaSoft,
          boxShadow: isClose
            ? "0 28px 70px rgba(0,0,0,0.28)"
            : "0 24px 65px rgba(43,25,20,0.18)",
        }}
      >
        {scene.assets.map((asset, assetIndex) => {
          const from = Math.floor(assetIndex * segment);
          const end = Math.ceil((assetIndex + 1) * segment);
          return (
            <PhotoLayer
              key={`${scene.id}-${asset}`}
              asset={asset}
              index={assetIndex + index}
              from={from}
              duration={end - from}
              sceneDuration={durationInFrames}
            />
          );
        })}

        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            zIndex: 12,
            padding: "16px 20px 14px",
            borderRadius: 999,
            background: "rgba(244,237,223,0.94)",
            boxShadow: "0 8px 28px rgba(43,25,20,0.12)",
          }}
        >
          <BrandWordmark compact />
        </div>

        {scene.step ? (
          <div
            style={{
              position: "absolute",
              right: 30,
              top: 30,
              zIndex: 12,
              display: "grid",
              placeItems: "center",
              width: 78,
              height: 78,
              borderRadius: "50%",
              color: palette.cocoa,
              background: palette.butter,
              fontSize: 27,
              fontWeight: 700,
            }}
          >
            {scene.step}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 1442,
          opacity: reveal,
          transform: `translateY(${titleRise}px)`,
        }}
      >
        <div
          style={{
            color: isClose ? palette.butter : palette.cocoaSoft,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            marginBottom: 16,
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            whiteSpace: "pre-line",
            fontSize: isHook ? 70 : 66,
            lineHeight: 0.96,
            fontWeight: 700,
            letterSpacing: "-0.055em",
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: 920,
            color: isClose
              ? "rgba(251,247,239,0.72)"
              : "rgba(43,25,20,0.68)",
            fontSize: 29,
            lineHeight: 1.2,
            fontWeight: 500,
          }}
        >
          {scene.caption}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 12,
          background: isClose
            ? "rgba(251,247,239,0.14)"
            : "rgba(43,25,20,0.10)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(frame, [0, durationInFrames], [0, 100], clamp)}%`,
            background: palette.butter,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const CookieBrandVideo: React.FC<{
  pilot: CookiePilot;
  timing: CookieTiming;
  withAudio?: boolean;
}> = ({pilot, timing, withAudio = true}) => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{background: palette.cream}}>
      {withAudio ? (
        <Audio
          src={staticFile("audio/cookie-v1-grandfather-1.2x.mp3")}
          volume={1}
        />
      ) : null}
      {pilot.scenes.map((scene, index) => {
        const sceneTiming = timing.scenes[scene.id];
        const from = Math.round(sceneTiming.startSeconds * fps);
        const durationInFrames = Math.max(
          1,
          Math.round(sceneTiming.durationSeconds * fps),
        );

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={durationInFrames}
            premountFor={fps}
          >
            <BrandedScene
              scene={scene}
              durationInFrames={durationInFrames}
              index={index}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
