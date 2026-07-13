"use client";

import type { MouseEvent } from "react";
import {
  formatLiveSessionDate,
  type LiveTrainingSession,
} from "@/lib/live-session-catalog";

type LiveSessionCardProps = {
  training: LiveTrainingSession;
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function LiveSessionCard({ training, onOpen }: LiveSessionCardProps) {
  const nextSlot = training.slots[0];

  if (!nextSlot) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="demaa-card group flex h-full min-h-[17rem] w-full flex-col rounded-[1.15rem] p-5 text-left"
      aria-haspopup="dialog"
    >
      <h3 className="line-clamp-3 text-lg font-semibold leading-snug text-brand-blue">
        {training.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dema-muted">
        {training.description}
      </p>
      <span className="mt-4 inline-flex w-fit rounded-full bg-dema-sage px-3 py-1 text-[11px] font-medium text-dema-forest">
        En direct · {training.duration}
      </span>

      <div className="mt-6 text-sm">
        <p className="text-dema-muted">Prochaine session</p>
        <p className="mt-1 font-medium text-dema-forest transition group-hover:text-brand-blue">
          {formatLiveSessionDate(nextSlot.startsAt)}
        </p>
      </div>
    </button>
  );
}
