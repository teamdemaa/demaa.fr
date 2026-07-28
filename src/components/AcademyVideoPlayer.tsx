"use client";

import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import AcademyVideoArtwork from "@/components/AcademyVideoArtwork";
import { trackAcademyEvent } from "@/lib/academy-analytics-client";
import type { AcademyVideoEntry } from "@/lib/academy-video-catalog";

export default function AcademyVideoPlayer({
  video,
}: {
  video: AcademyVideoEntry;
}) {
  const [hasStarted, setHasStarted] = useState(false);

  if (hasStarted) {
    return (
      <div className="aspect-video overflow-hidden rounded-[1.5rem] bg-black shadow-[0_22px_55px_rgba(23,35,29,0.09)]">
        <iframe
          src={video.publication.embedUrl}
          title={video.publication.youtubeTitle}
          allow="encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative" aria-label={video.thumbnailAlt}>
      <AcademyVideoArtwork video={video} priority />
      <button
        type="button"
        onClick={() => {
          setHasStarted(true);
          trackAcademyEvent("academy_player_started", {
            category: video.category,
            videoSlug: video.slug,
          });
        }}
        className="absolute left-1/2 top-1/2 z-20 inline-flex min-h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-blue shadow-[0_15px_45px_rgba(23,35,29,0.24)] transition hover:scale-[1.02]"
      >
        <Play className="h-5 w-5 fill-current" aria-hidden="true" />
        Lire la vidéo
      </button>
      <a
        href={video.publication.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackAcademyEvent("academy_youtube_opened", {
            category: video.category,
            videoSlug: video.slug,
          })
        }
        className="absolute bottom-4 right-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-blue/88 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-brand-blue"
      >
        Ouvrir sur YouTube
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      <noscript>
        <p>
          <a href={video.publication.youtubeUrl}>Voir la vidéo sur YouTube</a>
        </p>
      </noscript>
    </div>
  );
}
