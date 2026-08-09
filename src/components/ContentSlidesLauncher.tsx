"use client";

import { useState } from "react";
import { Presentation } from "lucide-react";
import GuideSlidesDialog from "@/components/GuideSlidesDialog";

type ContentSlidesLauncherProps = Readonly<{
  title: string;
  slides: readonly string[];
}>;

export default function ContentSlidesLauncher({
  title,
  slides,
}: ContentSlidesLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="demaa-primary-button min-h-12 gap-2 px-6 text-base"
      >
        <Presentation className="h-5 w-5" aria-hidden="true" />
        Voir le diaporama ({slides.length} slides)
      </button>
      {isOpen ? (
        <GuideSlidesDialog title={title} slides={slides} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
