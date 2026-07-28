"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import SoftwareDetailContent from "@/components/SoftwareDetailContent";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

type SoftwareDetailDialogProps = {
  tool: ToolDirectoryItem;
  onClose: () => void;
};

export default function SoftwareDetailDialog({
  tool,
  onClose,
}: SoftwareDetailDialogProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={tool.name}
      onClose={onClose}
    >
      <SoftwareDetailContent tool={tool} compact />
    </DirectoryDetailDialogShell>
  );
}
