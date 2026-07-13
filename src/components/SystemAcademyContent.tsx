"use client";

import { useRef, useState } from "react";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import { LiveSessionCard } from "@/components/LiveSessionCard";
import { LiveSessionDialog } from "@/components/LiveSessionDialog";
import {
  getLiveTrainingsForSystem,
  type LiveTrainingSession,
} from "@/lib/live-session-catalog";

type SystemAcademyContentProps = {
  systemSlug: string;
};

export function SystemAcademyContent({ systemSlug }: SystemAcademyContentProps) {
  const [selectedTraining, setSelectedTraining] = useState<LiveTrainingSession | null>(null);
  const trainingTriggerRef = useRef<HTMLButtonElement | null>(null);
  const liveTrainings = getLiveTrainingsForSystem();

  function closeTrainingDialog() {
    setSelectedTraining(null);
    window.requestAnimationFrame(() => {
      if (trainingTriggerRef.current?.isConnected) {
        trainingTriggerRef.current.focus();
      }
    });
  }

  return (
    <>
      <section className="space-y-4" aria-labelledby="system-academy-sessions-title">
        <p
          id="system-academy-sessions-title"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted"
        >
          Sessions de formation interactives
        </p>
        <HorizontalScrollHint
          className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4">
            {liveTrainings.map((training) => (
              <div
                key={training.slug}
                className="flex w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
              >
                <LiveSessionCard
                  training={training}
                  onOpen={(event) => {
                    trainingTriggerRef.current = event.currentTarget;
                    setSelectedTraining(training);
                  }}
                />
              </div>
            ))}
          </div>
        </HorizontalScrollHint>
      </section>

      {selectedTraining ? (
        <LiveSessionDialog
          key={selectedTraining.slug}
          training={selectedTraining}
          systemSlug={systemSlug}
          onClose={closeTrainingDialog}
        />
      ) : null}
    </>
  );
}
