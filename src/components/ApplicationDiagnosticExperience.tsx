"use client";

import { ClipboardCheck } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import GuestDiagnosticControl from "@/components/GuestDiagnosticControl";

const ApplicationDiagnosticContext = createContext<(() => void) | null>(null);

export function ApplicationDiagnosticProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDiagnostic = useCallback(() => setOpen(true), []);
  const closeDiagnostic = useCallback(() => setOpen(false), []);

  return (
    <ApplicationDiagnosticContext.Provider value={openDiagnostic}>
      <GuestDiagnosticControl
        access={null}
        onClose={closeDiagnostic}
        onOpen={openDiagnostic}
        open={open}
        showNavbarTrigger={false}
        situation=""
      />
      {children}
    </ApplicationDiagnosticContext.Provider>
  );
}

export function ApplicationDiagnosticButton({
  className,
}: {
  className: string;
}) {
  const openDiagnostic = useContext(ApplicationDiagnosticContext);

  if (!openDiagnostic) {
    throw new Error("ApplicationDiagnosticButton must be used inside ApplicationDiagnosticProvider.");
  }

  return (
    <button type="button" onClick={openDiagnostic} className={className}>
      <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Diagnostic organisation</span>
    </button>
  );
}
