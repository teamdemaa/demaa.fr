"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useState } from "react";
import GuestDiagnosticControl from "@/components/GuestDiagnosticControl";

export default function OrganiserProjectDiscussionButton({
  className,
}: {
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const openDiscussion = useCallback(() => setOpen(true), []);
  const closeDiscussion = useCallback(() => setOpen(false), []);

  return (
    <>
      <GuestDiagnosticControl
        access={null}
        dialogDescription="Décrivez ce que vous souhaitez améliorer. L’équipe Demaa vous répond pour préciser la prochaine étape et vérifier comment nous pouvons vous accompagner."
        dialogTitle="Discuter de votre projet"
        onClose={closeDiscussion}
        onOpen={openDiscussion}
        open={open}
        requirePhone
        showCallbackAvailability
        showNavbarTrigger={false}
        situation=""
      />
      <button type="button" onClick={openDiscussion} className={className}>
        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Discuter de votre projet</span>
      </button>
    </>
  );
}
