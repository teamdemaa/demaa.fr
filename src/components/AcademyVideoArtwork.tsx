import Image from "next/image";
import type { AcademyVideoEntry } from "@/lib/academy-video-catalog";

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
  const artworkScale = video.artworkScale ?? 1;
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
        <div className="relative z-10 min-w-0">
          <p
            className={`text-[clamp(0.46rem,1.1vw,0.68rem)] font-semibold uppercase tracking-[0.16em] ${
              isForest ? "text-white/72" : "text-dema-forest/58"
            }`}
          >
            {video.thumbnailEyebrow}
          </p>
          <p className="mt-[7%] text-[clamp(1rem,3.2vw,2rem)] font-medium leading-[0.98] tracking-[-0.045em]">
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
          </p>
        </div>
        <div className="relative h-full min-w-0">
          {isForest ? (
            <Image
              src={video.artworkPath}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 767px) 42vw, (max-width: 1279px) 32vw, 350px"
              className="object-contain object-center opacity-85"
              style={artworkTransformStyle}
            />
          ) : (
            <span
              aria-hidden="true"
              data-academy-artwork-tone="forest"
              className="absolute inset-0 bg-[#315f46]"
              style={artworkMaskStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
