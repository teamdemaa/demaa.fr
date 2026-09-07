import { ChevronRight, Folder, LockKeyhole } from "lucide-react";
import type {
  DriveFolderNode,
  DriveFolderTemplate,
} from "@/lib/drive-folder-templates";
import { COMPANY_DRIVE_DOSSIER_GUIDES } from "@/lib/drive-folder-templates";

function FolderNodes({ nodes, depth = 0 }: { nodes: readonly DriveFolderNode[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? "space-y-2" : "ml-5 mt-1.5 space-y-1.5 border-l border-dema-line pl-3"}>
      {nodes.map((node) => {
        const label = (
          <>
            {node.children?.length ? (
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue/35 transition group-open:rotate-90" aria-hidden="true" />
            ) : null}
            <Folder className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dema-forest/65" aria-hidden="true" />
            <span>{node.name}</span>
            {"restricted" in node && node.restricted ? (
              <span title="Accès restreint recommandé">
                <LockKeyhole className="mt-0.5 h-3.5 w-3.5 text-dema-muted" aria-hidden="true" />
                <span className="sr-only">Accès restreint recommandé</span>
              </span>
            ) : null}
          </>
        );

        return (
          <li key={`${depth}-${node.name}`}>
            {node.children?.length ? (
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start gap-2 text-xs leading-5 text-brand-blue/72 marker:hidden sm:text-sm [&::-webkit-details-marker]:hidden">
                  {label}
                </summary>
                <FolderNodes nodes={node.children} depth={depth + 1} />
              </details>
            ) : (
              <div className="flex items-start gap-2 pl-[1.375rem] text-xs leading-5 text-brand-blue/72 sm:text-sm">
                {label}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function DriveFolderTreePreview({ template }: { template: DriveFolderTemplate }) {
  return (
    <div className="h-full min-h-[25rem] max-h-[40rem] overflow-auto p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-2 border-b border-dema-line pb-4 text-sm font-medium text-brand-blue">
        <Folder className="h-4 w-4 text-dema-forest" aria-hidden="true" />
        {template.defaultRootName}
      </div>
      <FolderNodes nodes={template.sections} />
      <div className="mt-6 border-t border-dema-line pt-5 text-xs leading-5 text-dema-muted">
        <h3 className="text-sm font-medium text-brand-blue">À ajouter au fil des besoins</h3>
        <p className="mt-2">Ces exemples ne sont pas créés automatiquement. Créez un dossier uniquement lorsqu’un client, fournisseur, recrutement ou collaborateur existe.</p>
        <div className="mt-3 space-y-3">
          {COMPANY_DRIVE_DOSSIER_GUIDES.map((guide) => (
            <details key={guide.title}>
              <summary className="min-h-9 cursor-pointer font-medium text-brand-blue">{guide.title}</summary>
              <p className="mb-2">Dans {guide.location}</p>
              <FolderNodes nodes={[{ name: guide.rootName, children: guide.children }]} />
            </details>
          ))}
        </div>
        <p className="mt-4">Plusieurs missions pour un client ? Ajoutez un niveau par mission seulement si nécessaire.</p>
        <p className="mt-3">Drive conserve les fichiers. Notion porte le pilotage, les tâches, les réunions et les procédures. La facturation reste dans votre outil de facturation : conservez ici les exports utiles, sans double saisie.</p>
        <p className="mt-3">Gardez les exercices comptables dans Comptabilité. Les factures fournisseurs et relevés bancaires vont dans l’exercice concerné ; les contrats fournisseurs et documents de financement restent dans leurs dossiers dédiés.</p>
        <p className="mt-3">Pas de dossier « Modèles » général : les modèles restent dans l’outil où ils servent. Une présentation réutilisable peut rester dans Présentations ; un contrat type client utilisé dans Drive, directement dans Dossiers clients.</p>
      </div>
    </div>
  );
}
