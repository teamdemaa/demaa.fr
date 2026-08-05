"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";

type SoftwareDetailModalProps = {
  children: React.ReactNode;
};

export default function SoftwareDetailModal({ children }: SoftwareDetailModalProps) {
  const router = useRouter();

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <DirectoryDetailDialogShell
      ariaLabel="Détail de l’outil"
      onClose={closeModal}
    >
      {children}
    </DirectoryDetailDialogShell>
  );
}
