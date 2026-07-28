"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import FinanceDetailContent from "@/components/FinanceDetailContent";
import type { DemaaFinanceItem } from "@/lib/finance-catalog";

type FinanceDetailDialogProps = {
  item: DemaaFinanceItem;
  onClose: () => void;
};

export default function FinanceDetailDialog({
  item,
  onClose,
}: FinanceDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={item.name}
      onClose={onClose}
    >
      <FinanceDetailContent item={item} compact />
    </DirectoryDetailDialogShell>
  );
}
