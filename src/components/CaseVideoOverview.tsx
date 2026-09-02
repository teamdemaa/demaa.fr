import Image from "next/image";
import { ListChecks, Play } from "lucide-react";

type CaseVideoOverviewProps = Readonly<{
  hideMedia?: boolean;
  items: readonly string[];
  thumbnail?: string | null;
  title: string;
}>;

export default function CaseVideoOverview({
  hideMedia = false,
  items,
  thumbnail,
  title,
}: CaseVideoOverviewProps) {
  return (
    <section className="mt-12 sm:mt-14" aria-labelledby="case-video-outline-title">
      {hideMedia ? null : thumbnail ? (
        <div className="relative aspect-video overflow-hidden rounded-[1.4rem] border border-dema-line bg-dema-sage shadow-[0_18px_44px_rgba(31,72,52,0.08)]">
          <Image
            src={thumbnail}
            alt={`Miniature de la vidéo : ${title}`}
            fill
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div
          className="flex aspect-video items-center justify-center rounded-[1.4rem] border border-dema-forest bg-dema-forest px-6 text-center shadow-[0_18px_44px_rgba(31,72,52,0.12)]"
          aria-label="Emplacement de la future vidéo"
        >
          <div className="max-w-md">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dema-cream text-dema-forest shadow-[0_10px_28px_rgba(16,43,30,0.22)]">
              <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-dema-sage">
              Vidéo à venir
            </p>
            <p className="mt-2 line-clamp-2 text-base leading-7 text-white/90 sm:text-lg">
              {title}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-[1.2rem] border border-dema-line bg-white px-6 py-6 sm:px-7">
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-dema-forest" aria-hidden="true" />
          <h2 id="case-video-outline-title" className="text-xl font-semibold tracking-[-0.02em] text-[#25352C]">
            Au programme
          </h2>
        </div>
        <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={item} className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm leading-6 text-brand-blue">
              <span className="pt-px text-xs font-semibold text-dema-forest/65" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
