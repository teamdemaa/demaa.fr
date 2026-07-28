"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import RecruitmentDetailContent from "@/components/RecruitmentDetailContent";
import type { DemaaRecruitmentItem } from "@/lib/recruitment-catalog";

type RecruitmentDetailDialogProps = {
  item: DemaaRecruitmentItem;
  onClose: () => void;
};

export default function RecruitmentDetailDialog({
  item,
  onClose,
}: RecruitmentDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={item.name}
      onClose={onClose}
    >
      <RecruitmentDetailContent item={item} compact />
    </DirectoryDetailDialogShell>
  );
}
