import Link from "next/link";
import type { EnterpriseDefinition, EnterpriseProcess } from "@/lib/enterprise-annuaire";
import type { BusinessModelBlock } from "@/lib/business-models";
import type { SystemProcessTemplate, SystemPillar } from "@/lib/system-process-templates";
import type { ReactNode } from "react";
import SystemDocumentPrintButton from "@/components/SystemDocumentPrintButton";
import styles from "./SystemDocument.module.css";

type DocumentProcess = {
  id: string;
  title: string;
  description: string;
  checklist: string[];
};

type DocumentProcessGroup = {
  title: string;
  intro: string;
  processes: DocumentProcess[];
};

type SystemDocumentProps = {
  system: EnterpriseDefinition;
  templates: SystemProcessTemplate[];
};

const PROCESS_PILLARS: Exclude<SystemPillar, "Opérations">[] = [
  "Stratégie",
  "Marketing & Vente",
  "Finance & administration",
  "Équipe",
];

function cleanText(value = "") {
  return value
    .replace(/[“”]/g, "\"")
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

function getChecklistItems(example = "") {
  return cleanText(example)
    .replace(/^Exemple\s*:\s*/i, "")
    .replace(/\.$/, "")
    .split("->")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function processFromTemplate(system: EnterpriseDefinition, template: SystemProcessTemplate): DocumentProcess {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    checklist: getChecklistItems(system.processExamples?.[template.id] ?? ""),
  };
}

function processFromOperation(process: EnterpriseProcess, index: number): DocumentProcess {
  return {
    id: `operations-${index}`,
    title: process.title,
    description: process.description,
    checklist: getChecklistItems(process.examples ?? ""),
  };
}

function buildPillarProcesses(
  system: EnterpriseDefinition,
  templates: SystemProcessTemplate[],
  pillar: Exclude<SystemPillar, "Opérations">,
) {
  return templates
    .filter((template) => template.pillar === pillar)
    .map((template) => processFromTemplate(system, template));
}

function getPillarForBusinessBlock(block: BusinessModelBlock): SystemPillar {
  if (block.internalPillar === "strategy") {
    return "Stratégie";
  }

  if (block.internalPillar === "sales") {
    return "Marketing & Vente";
  }

  if (block.internalPillar === "finance") {
    return "Finance & administration";
  }

  if (block.internalPillar === "team") {
    return "Équipe";
  }

  return "Opérations";
}

function buildBusinessBlockGroups(
  system: EnterpriseDefinition,
  templates: SystemProcessTemplate[],
): DocumentProcessGroup[] {
  const blocks = system.businessBlocks;

  if (!blocks?.length) {
    return [
      ...PROCESS_PILLARS.slice(0, 2).map((pillar) => ({
        title: pillar,
        intro: pillarIntros[pillar],
        processes: buildPillarProcesses(system, templates, pillar),
      })),
      {
        title: "Opérations",
        intro: pillarIntros.Opérations,
        processes: (system.operationProcesses ?? []).map(processFromOperation),
      },
      ...PROCESS_PILLARS.slice(2).map((pillar) => ({
        title: pillar,
        intro: pillarIntros[pillar],
        processes: buildPillarProcesses(system, templates, pillar),
      })),
    ];
  }

  const blockCounts = new Map<string, number>();
  const blockPositions = new Map<string, number>();
  const operationProcesses = (system.operationProcesses ?? []).map(processFromOperation);

  for (const block of blocks) {
    const key = getPillarForBusinessBlock(block);
    blockCounts.set(key, (blockCounts.get(key) ?? 0) + 1);
  }

  return blocks.map((block) => {
    const pillar = getPillarForBusinessBlock(block);
    const key = pillar;
    const position = blockPositions.get(key) ?? 0;
    const count = blockCounts.get(key) ?? 1;
    blockPositions.set(key, position + 1);

    const pillarProcesses =
      pillar === "Opérations"
        ? operationProcesses
        : buildPillarProcesses(
            system,
            templates,
            pillar as Exclude<SystemPillar, "Opérations">,
          );
    const processes =
      count > 1
        ? pillarProcesses.filter((_, index) => index % count === position)
        : pillarProcesses;

    return {
      title: block.title,
      intro: "Les points concrets à vérifier, documenter et améliorer pour structurer ce volet de l’activité.",
      processes,
    };
  });
}

function ProcessCard({ process }: { process: DocumentProcess }) {
  return (
    <article className={styles.process}>
      <h3>{process.title}</h3>
      <p>{process.description}</p>
      <div className={styles.checks}>
        {process.checklist.map((item) => (
          <div className={styles.check} key={item}>
            <span className={styles.box} aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className={styles.blockFields}>
        <div className={styles.miniField}>Responsable</div>
        <div className={styles.miniField}>Échéance</div>
      </div>
    </article>
  );
}

function DocumentPage({
  systemName,
  title,
  intro,
  pageNumber,
  children,
}: {
  systemName: string;
  title: string;
  intro: string;
  pageNumber: number;
  children: ReactNode;
}) {
  return (
    <section className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.brand}>Demaa</span>
        <span>Document de structuration</span>
      </header>
      <h2 className={styles.pageTitle}>{title}</h2>
      <p className={styles.pageIntro}>{intro}</p>
      {children}
      <footer className={styles.footer}>
        <span>{systemName}</span>
        <span>Page {pageNumber}</span>
      </footer>
    </section>
  );
}

function PillarPage({
  systemName,
  title,
  intro,
  pageNumber,
  processes,
  compact = false,
}: {
  systemName: string;
  title: string;
  intro: string;
  pageNumber: number;
  processes: DocumentProcess[];
  compact?: boolean;
}) {
  return (
    <DocumentPage systemName={systemName} title={title} intro={intro} pageNumber={pageNumber}>
      <div className={`${styles.processList} ${compact ? styles.processListTwo : ""}`}>
        {processes.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>
    </DocumentPage>
  );
}

function ReferencePage({
  systemName,
  pageNumber,
  documents,
  indicators,
}: {
  systemName: string;
  pageNumber: number;
  documents: string[];
  indicators: string[];
}) {
  return (
    <DocumentPage
      systemName={systemName}
      title="Repères métier"
      intro="Les documents et indicateurs à garder visibles pour piloter l’activité avec les bons réflexes."
      pageNumber={pageNumber}
    >
      <div className={styles.referenceGrid}>
        <article className={styles.referencePanel}>
          <h3>Documents à suivre</h3>
          <div className={styles.referenceList}>
            {documents.map((document) => (
              <div className={styles.referenceItem} key={document}>
                {document}
              </div>
            ))}
          </div>
        </article>
        <article className={styles.referencePanel}>
          <h3>Indicateurs métier</h3>
          <div className={styles.referenceList}>
            {indicators.map((indicator) => (
              <div className={styles.referenceItem} key={indicator}>
                {indicator}
              </div>
            ))}
          </div>
        </article>
      </div>
    </DocumentPage>
  );
}

const pillarIntros: Record<SystemPillar, string> = {
  Stratégie: "Clarifiez la cible, les objectifs et les actions à suivre avant d'empiler les outils ou les automatisations.",
  "Marketing & Vente": "Rendez la décision d'achat plus simple : confiance, clarté, suivi et relance utile.",
  Opérations: "Le cœur du système métier : les étapes concrètes qui font avancer l'activité, protègent la qualité et évitent les oublis.",
  "Finance & administration": "Sécurisez les revenus, la marge, les obligations et les traces utiles.",
  Équipe: "Clarifiez les rôles, les relais et les informations importantes pour éviter la charge mentale.",
};

export default function SystemDocument({ system, templates }: SystemDocumentProps) {
  const processGroups = buildBusinessBlockGroups(system, templates);
  const hasBusinessSignals = Boolean(system.businessSignals);
  const firstProcessPageNumber = hasBusinessSignals ? 3 : 2;
  const actionPlanPageNumber = processGroups.length + firstProcessPageNumber;

  return (
    <main className={styles.shell}>
      <div className={styles.screenActions}>
        <div>
          <Link className={styles.backLink} href="/">
            Retour à Demaa
          </Link>
          <p className={styles.screenEyebrow}>Document de structuration</p>
          <h1>{system.name}</h1>
        </div>
        <SystemDocumentPrintButton />
      </div>

      <section className={styles.page}>
        <header className={styles.topbar}>
          <span className={styles.brand}>Demaa</span>
          <span>Document de structuration</span>
        </header>
        <h1 className={styles.coverTitle}>Structurer votre activité</h1>
        <div className={styles.coverLabel}>{system.name}</div>
        <p className={styles.lead}>{system.description}</p>
        <div className={styles.startPanel}>
          <div>
            <div className={styles.panelTitle}>Objectif</div>
            <p className={styles.panelCopy}>
              Vérifier ce qui est déjà en place, repérer les manques, puis lancer les trois actions les plus utiles.
            </p>
          </div>
          <div>
            <div className={styles.panelTitle}>Mode d&apos;emploi</div>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span>Cochez uniquement ce qui fonctionne vraiment.</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span>Ajoutez un responsable pour les manques importants.</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span>Gardez trois priorités dans le plan d&apos;action 3 mois.</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.fields}>
          <div className={styles.field}>Entreprise</div>
          <div className={styles.field}>Date</div>
        </div>
        <footer className={styles.footer}>
          <span>{system.name}</span>
          <span>Page 1</span>
        </footer>
      </section>

      {system.businessSignals ? (
        <ReferencePage
          systemName={system.name}
          pageNumber={2}
          documents={system.businessSignals.documents}
          indicators={system.businessSignals.indicators}
        />
      ) : null}

      {processGroups.map((group, index) => (
        <PillarPage
          key={group.title}
          systemName={system.name}
          title={group.title}
          intro={group.intro}
          pageNumber={index + firstProcessPageNumber}
          processes={group.processes}
          compact={group.processes.length > 3}
        />
      ))}

      <section className={styles.page}>
        <header className={styles.topbar}>
          <span className={styles.brand}>Demaa</span>
          <span>Document de structuration</span>
        </header>
        <h2 className={styles.pageTitle}>Plan d&apos;action 3 mois</h2>
        <p className={styles.pageIntro}>
          Reprenez les cases non cochées. Gardez trois priorités maximum pour structurer sans vous disperser.
        </p>
        <div className={styles.priorityList}>
          {[1, 2, 3].map((priority) => (
            <article className={styles.priority} key={priority}>
              <h3>Priorité {priority}</h3>
              <div className={styles.priorityFields}>
                <div className={styles.miniField}>Action</div>
                <div className={styles.miniField}>Responsable</div>
                <div className={styles.miniField}>Échéance</div>
                <div className={styles.miniField}>Résultat attendu</div>
              </div>
            </article>
          ))}
        </div>
        <footer className={styles.footer}>
          <span>{system.name}</span>
          <span>Page {actionPlanPageNumber}</span>
        </footer>
      </section>
    </main>
  );
}
