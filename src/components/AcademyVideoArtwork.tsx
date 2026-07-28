import Image from "next/image";
import {
  DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION,
  type AcademyVideoEntry,
} from "@/lib/academy-video-catalog";

export default function AcademyVideoArtwork({
  video,
  priority = false,
  className = "",
}: {
  video: AcademyVideoEntry;
  priority?: boolean;
  className?: string;
}) {
  const isForest = video.artworkTheme === "forest";
  const composition =
    video.thumbnailComposition ?? DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION;
  const artworkScale = composition.artwork.scale;
  const artworkOffsetXPercent = composition.artwork.offsetXPercent;
  const artworkOffsetYPercent = composition.artwork.offsetYPercent;
  const thumbnailTextScale = composition.title.scale;
  const thumbnailTitleOffsetXPercent = composition.title.offsetXPercent;
  const thumbnailTitleOffsetYPercent = composition.title.offsetYPercent;
  const thumbnailTitleSizeClass =
    thumbnailTextScale < 1
      ? "text-[clamp(1.25rem,4.1vw,2.3rem)]"
      : "text-[clamp(1rem,3.2vw,2rem)]";
  const artworkTransformStyle = {
    transform: `scale(${artworkScale})`,
    transformOrigin: "right center",
  };
  const artworkMaskStyle = {
    WebkitMaskImage: `url("${video.artworkPath}")`,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskImage: `url("${video.artworkPath}")`,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "contain",
    ...artworkTransformStyle,
  };

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-[1.4rem] ${
        isForest ? "bg-[#315f46] text-white" : "bg-[#eef2ed] text-dema-forest"
      } ${className}`}
    >
      <div className="absolute inset-0 grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-center gap-1 px-[6.5%] py-[7%] sm:gap-3">
        <div
          className="relative z-10 min-w-0"
          data-academy-title-block
          data-thumbnail-title-scale={thumbnailTextScale}
          data-thumbnail-title-offset-x={thumbnailTitleOffsetXPercent}
          data-thumbnail-title-offset-y={thumbnailTitleOffsetYPercent}
          style={{
            left: `${thumbnailTitleOffsetXPercent}%`,
            top: `${thumbnailTitleOffsetYPercent}%`,
            transform: `scale(${thumbnailTextScale})`,
            transformOrigin: "left center",
          }}
        >
          <p
            className={`text-[clamp(0.46rem,1.1vw,0.68rem)] font-semibold uppercase tracking-[0.16em] ${
              isForest ? "text-white/72" : "text-dema-forest/58"
            }`}
          >
            {video.thumbnailEyebrow}
          </p>
          <p
            className={`mt-[7%] font-medium leading-[0.98] tracking-[-0.045em] ${thumbnailTitleSizeClass}`}
          >
            <span data-academy-title-copy className="inline-block">
              {video.thumbnailLines.map((line, index) => (
                <span
                  key={line}
                  className={`block ${
                    isForest && index > 0 ? "text-[#9eb7a7]" : ""
                  }`}
                >
                  {line}
                </span>
              ))}
            </span>
          </p>
        </div>
        <div
          className="relative h-full min-w-0"
          data-academy-artwork-block
          data-thumbnail-artwork-scale={artworkScale}
          data-thumbnail-artwork-offset-x={artworkOffsetXPercent}
          data-thumbnail-artwork-offset-y={artworkOffsetYPercent}
          style={{
            left: `${artworkOffsetXPercent}%`,
            top: `${artworkOffsetYPercent}%`,
          }}
        >
          {isForest ? (
            <Image
              src={video.artworkPath}
              alt=""
              fill
              priority={priority}
              data-academy-artwork-visual
              sizes="(max-width: 767px) 42vw, (max-width: 1279px) 32vw, 350px"
              className="object-contain object-center opacity-85"
              style={artworkTransformStyle}
            />
          ) : (
            <span
              aria-hidden="true"
              data-academy-artwork-tone="forest"
              data-academy-artwork-visual
              className="absolute inset-0 bg-[#315f46]"
              style={artworkMaskStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
