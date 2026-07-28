"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import TrainingDetailContent from "@/components/TrainingDetailContent";
import type { DemaaTraining } from "@/lib/training-catalog";

type TrainingDetailDialogProps = {
  training: DemaaTraining;
  onClose: () => void;
};

export default function TrainingDetailDialog({
  training,
  onClose,
}: TrainingDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={training.name}
      onClose={onClose}
    >
      <TrainingDetailContent training={training} compact />
    </DirectoryDetailDialogShell>
  );
}
