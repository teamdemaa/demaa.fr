"use client";

import AccountingFirmDetailContent from "@/components/AccountingFirmDetailContent";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingDirectoryProfileModalProps = {
  firm: AccountingFirm;
  onClose: () => void;
  similarFirms?: AccountingFirm[];
};

export default function AccountingDirectoryProfileModal({
  firm,
  onClose,
  similarFirms = [],
}: AccountingDirectoryProfileModalProps) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel={firm.name}
      maxWidthClassName="max-w-6xl"
      onClose={onClose}
    >
      <AccountingFirmDetailContent
        firm={firm}
        similarFirms={similarFirms}
        showBackLink={false}
      />
    </DirectoryDetailDialogShell>
  );
}
