"use client";

import { Check, CircleAlert, Clipboard, FolderPlus, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  buildCompanyDriveFolderTemplate,
  formatDriveFolderTree,
  selectDriveFolderSections,
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
  const [yearInput, setYearInput] = useState(String(year));
  const parsedYear = Number(yearInput);
  const isYearValid = Number.isInteger(parsedYear) && parsedYear >= 2020 && parsedYear <= 2100;
  const accountingYear = isYearValid ? parsedYear : year;
  const template = useMemo(
    () => buildCompanyDriveFolderTemplate(accountingYear),
    [accountingYear],
  );
  const [rootName, setRootName] = useState(template.defaultRootName);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<DriveFeedback | null>(null);
  const [selectedIds, setSelectedIds] = useState(() =>
    template.sections.filter((section) => section.id !== "team").map((section) => section.id),
  );
  const selectedSections = selectDriveFolderSections(template, selectedIds);

  const oauthErrorMessage = DRIVE_ERROR_MESSAGES[searchParams.get("drive") || ""] || null;
  const visibleFeedback = feedback ?? (
    oauthErrorMessage ? { message: oauthErrorMessage, tone: "error" as const } : null
  );

  async function copyStructure() {
    const tree = formatDriveFolderTree(rootName.trim() || template.defaultRootName, selectedSections);
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
      <input type="hidden" name="sectionIds" value="inbox" />
      <label className="block text-sm font-medium text-brand-blue" htmlFor="drive-root-name">
        Nom du dossier principal
      </label>
      <input
        id="drive-root-name"
        name="rootName"
        value={rootName}
        onChange={(event) => {
          setRootName(event.target.value);
          setFeedback(null);
        }}
        maxLength={120}
        required
        className="mt-2 min-h-11 w-full rounded-xl border border-dema-line bg-white px-3 text-sm text-brand-blue outline-none transition focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/10"
      />
      <label className="mt-5 block text-sm font-medium text-brand-blue" htmlFor="drive-accounting-year">
        Premier exercice comptable
      </label>
      <input
        id="drive-accounting-year"
        name="year"
        type="number"
        inputMode="numeric"
        min={2020}
        max={2100}
        value={yearInput}
        onChange={(event) => {
          setYearInput(event.target.value);
          setFeedback(null);
        }}
        required
        aria-invalid={!isYearValid}
        aria-describedby={!isYearValid ? "drive-accounting-year-error" : undefined}
        className="mt-2 min-h-11 w-full rounded-xl border border-dema-line bg-white px-3 text-sm text-brand-blue outline-none transition focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/10"
      />
      {!isYearValid ? (
        <p id="drive-accounting-year-error" className="mt-2 text-xs text-red-700" role="alert">
          Indiquez une année comprise entre 2020 et 2100.
        </p>
      ) : null}
      <fieldset className="mt-5 space-y-2">
        <legend className="mb-2 text-sm font-medium text-brand-blue">Dossiers à créer</legend>
        <p className="text-xs leading-5 text-dema-muted">« À classer » est toujours inclus. Cochez uniquement les domaines utiles.</p>
        {template.sections.filter((section) => section.id !== "inbox").map((section) => (
          <label key={section.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-brand-blue">
            <input
              type="checkbox"
              name="sectionIds"
              value={section.id}
              checked={selectedIds.includes(section.id)}
              onChange={(event) => {
                const checked = event.target.checked;
                setSelectedIds((ids) => checked ? [...ids, section.id] : ids.filter((id) => id !== section.id));
                setFeedback(null);
              }}
              className="h-4 w-4 accent-dema-forest"
            />
            {section.name}{section.id === "team" ? " (facultatif)" : ""}
          </label>
        ))}
      </fieldset>
      <p className="mt-3 text-xs leading-5 text-dema-muted">
        {selectedSections.length} dossiers principaux sélectionnés.
        {selectedSections.some((section) => section.id === "finance")
          ? ` La comptabilité commencera par l’exercice ${accountingYear}.`
          : ""}
        {" "}L’aperçu présente tous les domaines possibles ; seuls ceux cochés seront créés ou copiés.
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={pending || !rootName.trim() || !isYearValid}
          className="demaa-secondary-button min-h-12 w-full gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : configured ? (
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Clipboard className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? "Connexion à Google…" : configured ? "Créer automatiquement dans mon Drive" : "Copier la liste des dossiers"}
        </button>

        {configured ? (
          <button
            type="button"
            disabled={pending || !rootName.trim() || !isYearValid}
            onClick={() => void copyStructure()}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-5 text-sm font-semibold text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage/35 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            Copier la liste des dossiers
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-center text-xs leading-5 text-dema-muted">
        {configured
          ? "La première option crée les dossiers sélectionnés après votre autorisation Google. La seconde copie seulement leur liste : aucun dossier n’est créé et aucun accès à votre Drive n’est nécessaire."
          : "La liste des dossiers est copiée sans connexion à Google. Aucun dossier n’est créé automatiquement."}
      </p>
      <p className="mt-3 text-xs leading-5 text-dema-muted">
        Les droits d’accès ne sont pas configurés automatiquement. Avant de déposer des documents,
        vérifiez les accès aux dossiers financiers et RH. Ne partagez pas toute la racine avec l’équipe.
      </p>
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
