"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import SupplierDetailContent from "@/components/SupplierDetailContent";
import type { DemaaSupplier } from "@/lib/supplier-catalog";

type SupplierDetailDialogProps = {
  supplier: DemaaSupplier;
  onClose: () => void;
};

export default function SupplierDetailDialog({
  supplier,
  onClose,
}: SupplierDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={supplier.name}
      onClose={onClose}
    >
      <SupplierDetailContent supplier={supplier} compact />
    </DirectoryDetailDialogShell>
  );
}
