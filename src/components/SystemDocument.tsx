"use client";

import Link from "next/link";
import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { buildBusinessBlockChecklists, type BusinessBlockChecklist } from "@/lib/business-block-checklists";
import type { SystemProcessTemplate } from "@/lib/system-process-types";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import SystemDocumentPrintButton from "@/components/SystemDocumentPrintButton";
import styles from "./SystemDocument.module.css";

type SystemDocumentProps = {
  system: EnterpriseDefinition;
  templates: SystemProcessTemplate[];
};

function cleanText(value = "") {
  return value
    .replace(/[“”]/g, "\"")
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

function getChecklistItems(example = "", limit = 7) {
  return cleanText(example)
    .replace(/^Exemple\s*:\s*/i, "")
    .replace(/\.$/, "")
    .split("->")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildBusinessBlockGroups(
  system: EnterpriseDefinition,
  templates: SystemProcessTemplate[],
): BusinessBlockChecklist[] {
  const blocks = system.businessBlocks;

  if (blocks?.length) {
    return buildBusinessBlockChecklists(blocks, { systemId: system.slug });
  }

  return templates.map((template) => ({
    title: template.title,
    checklist: getChecklistItems(system.processExamples?.[template.id] ?? ""),
  }));
}

function ChecklistBlock({ title, checklist }: { title: string; checklist: string[] }) {
  return (
    <details className={styles.process} data-print-expandable>
      <summary className={styles.processSummary}>
        <div>
          <h3>{title}</h3>
        </div>
        <ChevronDown className={styles.processChevron} aria-hidden="true" />
      </summary>
      <div className={styles.processContent}>
        <div className={styles.checks}>
          {checklist.map((item) => (
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
      </div>
    </details>
  );
}

function chunkProcessGroups(groups: BusinessBlockChecklist[], size = 4) {
  const pages: BusinessBlockChecklist[][] = [];

  for (let index = 0; index < groups.length; index += size) {
    pages.push(groups.slice(index, index + size));
  }

  return pages;
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
        <span>Plan d&apos;organisation</span>
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

function ProcessGroupsPage({
  systemName,
  pageNumber,
  groups,
}: {
  systemName: string;
  pageNumber: number;
  groups: BusinessBlockChecklist[];
}) {
  return (
    <DocumentPage
      systemName={systemName}
      title="Diagnostic opérationnel"
      intro="Cochez ce qui fonctionne déjà. Les cases restantes servent à choisir les priorités du plan d'action."
      pageNumber={pageNumber}
    >
      <div className={styles.processGrid}>
        {groups.map((group) => (
          <ChecklistBlock key={group.title} title={group.title} checklist={group.checklist} />
        ))}
      </div>
    </DocumentPage>
  );
}

export default function SystemDocument({ system, templates }: SystemDocumentProps) {
  useEffect(() => {
    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[data-print-expandable]"),
    );
    const openStates = new Map<HTMLDetailsElement, boolean>();

    const handleBeforePrint = () => {
      details.forEach((detail) => {
        openStates.set(detail, detail.open);
        detail.open = true;
      });
    };

    const handleAfterPrint = () => {
      details.forEach((detail) => {
        detail.open = openStates.get(detail) ?? false;
      });
      openStates.clear();
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const processGroups = buildBusinessBlockGroups(system, templates);
  const processPages = chunkProcessGroups(processGroups);
  const firstProcessPageNumber = 2;
  const actionPlanPageNumber = processPages.length + firstProcessPageNumber;

  return (
    <main className={styles.shell}>
      <div className={styles.screenActions}>
        <div>
          <Link className={styles.backLink} href="/">
            Retour aux systèmes
          </Link>
          <p className={styles.screenEyebrow}>Plan d&apos;organisation</p>
          <h1>{system.name}</h1>
        </div>
        <SystemDocumentPrintButton />
      </div>

      <section className={styles.page}>
        <header className={styles.topbar}>
          <span className={styles.brand}>Demaa</span>
          <span>Plan d&apos;organisation</span>
        </header>
        <h1 className={styles.coverTitle}>Plan d&apos;organisation de votre activité</h1>
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

      {processPages.map((groups, index) => (
        <ProcessGroupsPage
          key={groups.map((group) => group.title).join("-")}
          systemName={system.name}
          pageNumber={index + firstProcessPageNumber}
          groups={groups}
        />
      ))}

      <section className={styles.page}>
        <header className={styles.topbar}>
          <span className={styles.brand}>Demaa</span>
          <span>Plan d&apos;organisation</span>
        </header>
        <h2 className={styles.pageTitle}>Plan d&apos;action 3 mois</h2>
        <p className={styles.pageIntro}>
          Reprenez les cases non cochées. Gardez trois priorités maximum pour structurer sans vous disperser.
        </p>
        <div className={styles.priorityList}>
          {[1, 2, 3].map((priority) => (
            <details className={styles.priority} data-print-expandable key={priority}>
              <summary className={styles.prioritySummary}>
                <h3>Priorité {priority}</h3>
                <ChevronDown className={styles.processChevron} aria-hidden="true" />
              </summary>
              <div className={styles.priorityContent}>
                <div className={styles.priorityFields}>
                  <div className={styles.miniField}>Action</div>
                  <div className={styles.miniField}>Responsable</div>
                  <div className={styles.miniField}>Échéance</div>
                  <div className={styles.miniField}>Résultat attendu</div>
                </div>
              </div>
            </details>
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
