"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";

export default function ServiceRouteDialog({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const closeDialog = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <DirectoryDetailDialogShell
      ariaLabel={ariaLabel}
      maxWidthClassName="max-w-6xl"
      onClose={closeDialog}
    >
      {children}
    </DirectoryDetailDialogShell>
  );
}
