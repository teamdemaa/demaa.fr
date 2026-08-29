"use client";

import { Check, Clipboard, FolderPlus, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  buildCompanyDriveFolderTemplate,
  formatDriveFolderTree,
} from "@/lib/drive-folder-templates";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

const DRIVE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  access_denied: "La connexion à Google Drive a été annulée.",
  configuration: "La connexion Google Drive n’est pas encore configurée.",
  creation: "La structure n’a pas pu être créée. Aucun dossier incomplet n’a été conservé.",
  expired: "La demande a expiré. Vous pouvez recommencer.",
};

export default function DriveFolderTemplateCreator({
  configured,
  modelSlug,
  year,
}: {
  configured: boolean;
  modelSlug: string;
  year: number;
}) {
  const template = useMemo(() => buildCompanyDriveFolderTemplate(year), [year]);
  const searchParams = useSearchParams();
  const [rootName, setRootName] = useState(template.defaultRootName);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const oauthFeedback = DRIVE_ERROR_MESSAGES[searchParams.get("drive") || ""] || null;
  const visibleFeedback = feedback || oauthFeedback;

  async function copyStructure() {
    const tree = formatDriveFolderTree(rootName.trim() || template.defaultRootName, template.sections);
    try {
      await navigator.clipboard.writeText(tree);
      setFeedback("Arborescence copiée. Vous pouvez la conserver ou la partager.");
      trackCopyableModelEvent("copyable_model_copy_clicked", {
        modelSlug,
        platform: "google-drive",
        surface: "model_detail",
      });
    } catch {
      setFeedback("La copie automatique n’est pas disponible dans ce navigateur.");
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
      <input type="hidden" name="year" value={year} />
      {template.sections.map((section) => (
        <input key={section.id} type="hidden" name="sectionIds" value={section.id} />
      ))}
      <label className="block text-sm font-medium text-brand-blue" htmlFor="drive-root-name">
        Nom du dossier principal
      </label>
      <input
        id="drive-root-name"
        name="rootName"
        value={rootName}
        onChange={(event) => setRootName(event.target.value)}
        maxLength={120}
        required
        className="mt-2 min-h-11 w-full rounded-xl border border-dema-line bg-white px-3 text-sm text-brand-blue outline-none transition focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/10"
      />
      <p className="mt-3 text-xs leading-5 text-dema-muted">
        Toute l’arborescence affichée à gauche sera créée.
      </p>

      <button
        type="submit"
        disabled={pending || !rootName.trim()}
        className="demaa-secondary-button mt-6 min-h-12 w-full gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : configured ? (
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Clipboard className="h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Connexion à Google…" : configured ? "Créer dans mon Drive" : "Copier l’arborescence"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-dema-muted">
        {configured
          ? "Demaa accède uniquement aux dossiers qu’il crée. Aucun accès général à votre Drive."
          : "La création automatique sera disponible lorsque la connexion Google Drive sera configurée."}
      </p>
      {visibleFeedback ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-dema-sage/45 px-3 py-2.5 text-xs leading-5 text-dema-forest" role="status">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {visibleFeedback}
        </p>
      ) : null}
    </form>
  );
}
