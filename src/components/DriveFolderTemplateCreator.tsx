"use client";

import { Check, CircleAlert, Clipboard, FolderPlus, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  buildCompanyDriveFolderTemplate,
  formatDriveFolderTree,
} from "@/lib/drive-folder-templates";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

const DRIVE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  access_denied: "La connexion à Google Drive a été annulée.",
  configuration: "La connexion Google Drive n’est pas encore configurée.",
  creation: "La structure n’a pas pu être créée. Vérifiez votre Drive avant de recommencer.",
  creation_cleaned: "La structure n’a pas pu être créée. Le dossier incomplet de cet essai a été supprimé.",
  creation_cleanup: "La structure n’a pas pu être créée et son nettoyage n’a pas pu être confirmé. Vérifiez votre Drive et supprimez le dossier incomplet si nécessaire.",
  expired: "La demande a expiré. Vous pouvez recommencer.",
};

type DriveFeedback = Readonly<{
  message: string;
  tone: "error" | "success";
}>;

export default function DriveFolderTemplateCreator({
  configured,
  modelSlug,
  year,
}: {
  configured: boolean;
  modelSlug: string;
  year: number;
}) {
  const searchParams = useSearchParams();
  const template = buildCompanyDriveFolderTemplate(year);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<DriveFeedback | null>(null);
  const sectionIds = template.sections.map((section) => section.id);

  const oauthErrorMessage = DRIVE_ERROR_MESSAGES[searchParams.get("drive") || ""] || null;
  const visibleFeedback = feedback ?? (
    oauthErrorMessage ? { message: oauthErrorMessage, tone: "error" as const } : null
  );

  async function copyStructure() {
    const tree = formatDriveFolderTree(template.defaultRootName, template.sections);
    try {
      await navigator.clipboard.writeText(tree);
      setFeedback({
        message: "Arborescence copiée. Aucun accès à votre Drive n’a été nécessaire.",
        tone: "success",
      });
      trackCopyableModelEvent("copyable_model_copy_clicked", {
        modelSlug,
        platform: "google-drive",
        surface: "model_detail",
      });
    } catch {
      setFeedback({
        message: "La copie automatique n’est pas disponible dans ce navigateur.",
        tone: "error",
      });
    }
  }

  return (
    <form
      action="/api/modeles/structure-google-drive-entreprise/drive/authorize"
      method="post"
      className="mt-7 border-t border-dema-line pt-6"
      onSubmit={(event) => {
        if (!configured) {
          event.preventDefault();
          void copyStructure();
          return;
        }
        setPending(true);
        setFeedback(null);
        trackCopyableModelEvent("copyable_model_copy_clicked", {
          modelSlug,
          platform: "google-drive",
          surface: "model_detail",
        });
      }}
    >
      <input type="hidden" name="rootName" value={template.defaultRootName} />
      <input type="hidden" name="year" value={year} />
      {sectionIds.map((sectionId) => (
        <input key={sectionId} type="hidden" name="sectionIds" value={sectionId} />
      ))}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="demaa-secondary-button min-h-12 w-full gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : configured ? (
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Clipboard className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? "Connexion à Google…" : configured ? "Créer dans mon Drive" : "Copier la structure"}
        </button>
      </div>
      {visibleFeedback ? (
        <p
          className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-5 ${
            visibleFeedback.tone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-dema-sage/45 text-dema-forest"
          }`}
          role={visibleFeedback.tone === "error" ? "alert" : "status"}
        >
          {visibleFeedback.tone === "error" ? (
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {visibleFeedback.message}
        </p>
      ) : null}
    </form>
  );
}
