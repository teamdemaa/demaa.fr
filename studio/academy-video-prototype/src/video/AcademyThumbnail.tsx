import React from "react";
import {AbsoluteFill, staticFile} from "remotion";

export const ACADEMY_THUMBNAIL_COLORS = {
  forest: "#315f46",
  sage: "#eef2ed",
  light: "#ffffff",
} as const;

export type AcademyThumbnailTheme = "forest" | "sage";

export type AcademyThumbnailComposition = {
  artwork?: {
    offsetXPercent?: number;
    offsetYPercent?: number;
    scale?: number;
  };
  title?: {
    offsetXPercent?: number;
    offsetYPercent?: number;
    scale?: number;
  };
  safeZone?: {
    minimumSafeAspectRatio?: number;
    targetAspectRatio?: number;
  };
};

export type AcademyThumbnailProps = {
  artwork: string;
  composition?: AcademyThumbnailComposition;
  eyebrow: string;
  lines: readonly string[];
  renderLayer?: "all" | "artwork" | "title";
  theme: AcademyThumbnailTheme;
};

export const AcademyThumbnail: React.FC<AcademyThumbnailProps> = ({
  artwork,
  composition,
  eyebrow,
  lines,
  renderLayer = "all",
  theme,
}) => {
  const artworkOffsetXPercent = composition?.artwork?.offsetXPercent ?? 0;
  const artworkOffsetYPercent = composition?.artwork?.offsetYPercent ?? 0;
  const artworkScale = composition?.artwork?.scale ?? 1;
  const thumbnailTextScale = composition?.title?.scale ?? 1;
  const thumbnailTitleOffsetXPercent =
    composition?.title?.offsetXPercent ?? 0;
  const thumbnailTitleOffsetYPercent =
    composition?.title?.offsetYPercent ?? 0;
  const isLightBackground = theme === "sage";
  const backgroundColor = isLightBackground
    ? ACADEMY_THUMBNAIL_COLORS.sage
    : ACADEMY_THUMBNAIL_COLORS.forest;
  const foregroundColor = isLightBackground
    ? ACADEMY_THUMBNAIL_COLORS.forest
    : ACADEMY_THUMBNAIL_COLORS.light;
  const artworkColor = isLightBackground
    ? ACADEMY_THUMBNAIL_COLORS.forest
    : ACADEMY_THUMBNAIL_COLORS.light;
  const artworkUrl = staticFile(artwork);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        color: foregroundColor,
        fontFamily: '"Satoshi", "Avenir Next", Arial, sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          alignItems: "center",
          padding: "70px 82px",
        }}
      >
        <div
          data-academy-title-block
          style={{
            visibility: renderLayer === "artwork" ? "hidden" : "visible",
            position: "relative",
            zIndex: 1,
            minWidth: 0,
            left: `${thumbnailTitleOffsetXPercent}%`,
            top: `${thumbnailTitleOffsetYPercent}%`,
            transform: `scale(${thumbnailTextScale})`,
            transformOrigin: "left center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: foregroundColor,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.16em",
              lineHeight: 1.2,
              opacity: isLightBackground ? 0.64 : 0.74,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </p>
          <p
            style={{
              margin: "44px 0 0",
              color: foregroundColor,
              fontSize: 72,
              fontWeight: 500,
              letterSpacing: "-0.045em",
              lineHeight: 0.98,
            }}
          >
            {lines.map((line) => (
              <span key={line} style={{display: "block"}}>
                {line}
              </span>
            ))}
          </p>
        </div>
        <div
          style={{
            visibility: renderLayer === "title" ? "hidden" : "visible",
            position: "relative",
            width: "100%",
            height: "86%",
            left: `${artworkOffsetXPercent}%`,
            top: `${artworkOffsetYPercent}%`,
          }}
        >
          <div
            aria-hidden="true"
            data-academy-artwork-tone={
              isLightBackground ? "forest" : "light"
            }
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: artworkColor,
              WebkitMaskImage: `url("${artworkUrl}")`,
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskImage: `url("${artworkUrl}")`,
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              opacity: isLightBackground ? 1 : 0.85,
              transform: `scale(${artworkScale})`,
              transformOrigin: "right center",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
