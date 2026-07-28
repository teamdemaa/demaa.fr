"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ProNetworkDetailContent from "@/components/ProNetworkDetailContent";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";

type ProNetworkDetailDialogProps = {
  network: DemaaProNetwork;
  onClose: () => void;
};

export default function ProNetworkDetailDialog({
  network,
  onClose,
}: ProNetworkDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={network.name}
      onClose={onClose}
    >
      <ProNetworkDetailContent network={network} compact />
    </DirectoryDetailDialogShell>
  );
}
