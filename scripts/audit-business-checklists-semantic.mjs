import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import vm from "node:vm";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");
const strict = process.argv.includes("--strict");
const failOnWarning = process.argv.includes("--fail-on-warning");

function loadTsModule(relativePath) {
  const absolutePath = resolve(rootDir, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const sandbox = {
    module: loadedModule,
    exports: loadedModule.exports,
    require(id) {
      throw new Error(`Unexpected require while auditing checklists: ${id}`);
    },
  };

  vm.runInNewContext(output, sandbox, { filename: absolutePath });

  return loadedModule.exports;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, terms) {
  return terms.some((term) => normalizeText(text).includes(normalizeText(term)));
}

function hasMinimumHits(text, terms, minimum) {
  return terms.filter((term) => normalizeText(text).includes(normalizeText(term))).length >= minimum;
}

function createAlert(rule, row, detail) {
  return {
    rule: rule.id,
    severity: rule.severity,
    systemId: row.system.id,
    systemLabel: row.system.label,
    blockTitle: row.block.title,
    detail,
    checklist: row.checklist,
  };
}

const regulatedComplianceExpectations = [
  {
    systemId: "cabinet-reglemente",
    title: /echeances|conformite/i,
    terms: ["mandat", "lettre de mission", "rgpd", "confidentialite", "declaratif", "dossier client"],
  },
  {
    systemId: "cabinet-comptable",
    title: /echeances|conformite/i,
    terms: ["mandat", "lettre de mission", "rgpd", "confidentialite", "declaratif", "dossier client"],
  },
  {
    systemId: "btp-projets",
    title: /conformite|assurances/i,
    terms: ["decennale", "assurance chantier", "sous-traitants", "reception", "chantier"],
  },
  {
    systemId: "association",
    title: /gouvernance|conformite/i,
    terms: ["statuts", "bureau", "assemblee generale", "pv", "subventions", "assurances"],
  },
  {
    systemId: "services-a-la-personne",
    title: /agrement|documents/i,
    terms: ["agrement", "autorisation", "beneficiaire", "intervenants", "famille", "financeur"],
  },
  {
    systemId: "entreprise-de-securite",
    title: /agrement|conformite/i,
    terms: ["cnaps", "cartes professionnelles", "agent", "site", "habilitation", "securite"],
  },
  {
    systemId: "plomberie-chauffage",
    title: /attestations|conformite/i,
    terms: ["gaz", "fluides", "mise en service", "securite", "chantier", "attestations"],
  },
  {
    systemId: "electricite-generale",
    title: /conformite electrique/i,
    terms: ["nf c 15-100", "consuel", "terre", "habilitation", "mesures", "chantier"],
  },
  {
    systemId: "maconnerie-gros-oeuvre",
    title: /securite|reception/i,
    terms: ["ppsps", "protections collectives", "engins", "beton", "chantier", "pv"],
  },
  {
    systemId: "couvreur",
    title: /securite|reception/i,
    terms: ["echafaudage", "ancrages", "epi", "toiture", "infiltration", "chantier"],
  },
  {
    systemId: "geometre",
    title: /bornage|conformite/i,
    terms: ["cadastre", "limites", "foncieres", "proces-verbal", "bornage", "proprietaire"],
  },
  {
    systemId: "commerce-alimentaire",
    title: /hygiene|tracabilite/i,
    terms: ["haccp", "temperatures", "dlc", "lots", "allergenes", "chaine du froid"],
  },
  {
    systemId: "tabac-presse-point-relais",
    title: /regles|tracabilite/i,
    terms: ["tabac", "jeux", "colis", "identite", "age", "registre"],
  },
  {
    systemId: "sante-cabinet",
    title: /conformite.*confidentialite|confidentialite.*conformite/i,
    terms: ["patient", "consentement", "confidentialite", "donnees sante", "secret medical", "prescriptions"],
  },
  {
    systemId: "cabinet-medical",
    title: /confidentialite.*conformite|conformite.*confidentialite/i,
    terms: ["patient", "consentement", "confidentialite", "donnees sante", "secret medical", "prescriptions"],
  },
  {
    systemId: "cabinet-paramedical",
    title: /confidentialite.*cadre|cadre.*confidentialite/i,
    terms: ["patient", "consentement", "confidentialite", "donnees sante", "secret medical", "prescriptions"],
  },
  {
    systemId: "infirmier-liberal",
    title: /conformite|tracabilite/i,
    terms: ["patient", "prescriptions", "soins", "donnees de sante", "confidentialite", "feuilles de soins"],
  },
  {
    systemId: "osteopathe",
    title: /cadre.*confidentialite|confidentialite.*cadre/i,
    terms: ["patient", "consentement", "confidentialite", "donnees sante", "secret medical", "prescriptions"],
  },
  {
    systemId: "psychologue",
    title: /confidentialite.*cadre|cadre.*confidentialite/i,
    terms: ["patient", "consentement", "confidentialite", "donnees sante", "secret medical", "prescriptions"],
  },
  {
    systemId: "sante-commerce-reglemente",
    title: /conformite metier/i,
    terms: ["ordonnances", "delivrances", "lots", "produits reglementes", "tracabilite", "registres"],
  },
  {
    systemId: "coach-professionnel",
    title: /cadre.*confidentialite|confidentialite.*cadre/i,
    terms: ["contrat", "consentement", "confidentialite", "donnees personnelles", "conflit d'interet", "accompagnement"],
  },
  {
    systemId: "immobilier-transaction",
    title: /pieces|conformite/i,
    terms: ["mandat", "diagnostics", "vendeur", "bail", "copropriete", "dossier immobilier"],
  },
  {
    systemId: "agence-immobiliere",
    title: /pieces|conformite/i,
    terms: ["mandat", "diagnostics", "vendeur", "bail", "copropriete", "dossier immobilier"],
  },
  {
    systemId: "immobilier-gestion",
    title: /documents|conformite/i,
    terms: ["mandat", "diagnostics", "vendeur", "bail", "copropriete", "dossier immobilier"],
  },
  {
    systemId: "syndic",
    title: /documents|conformite/i,
    terms: ["pv d'ag", "copropriete", "appels de fonds", "conseil syndical", "immeuble", "sinistres"],
  },
  {
    systemId: "gestion-locative",
    title: /conformite locative/i,
    terms: ["bail", "diagnostics", "depot de garantie", "locataire", "bailleur", "etat des lieux"],
  },
  {
    systemId: "marchand-de-biens",
    title: /dossiers|conformite/i,
    terms: ["titre", "urbanisme", "diagnostics", "revente", "notaire", "operation"],
  },
  {
    systemId: "diagnostiqueur-immobilier",
    title: /normes|assurances/i,
    terms: ["certifications", "amiante", "dpe", "plomb", "diagnostic", "certificateur"],
  },
  {
    systemId: "courtier-credit-assurance",
    title: /conformite courtage/i,
    terms: ["orias", "kyc", "devoir de conseil", "lcb-ft", "banque", "assureur"],
  },
  {
    systemId: "cabinet-assurance",
    title: /conformite distribution/i,
    terms: ["orias", "dda", "ipid", "devoir de conseil", "garanties", "assureur"],
  },
  {
    systemId: "gestionnaire-de-patrimoine",
    title: /conformite|profil risque/i,
    terms: ["connaissance client", "profil risque", "adequation", "kyc", "lcb-ft", "investissement"],
  },
  {
    systemId: "investissement-financier",
    title: /conformite investisseur/i,
    terms: ["connaissance client", "profil risque", "adequation", "kyc", "lcb-ft", "investissement"],
  },
  {
    systemId: "investissement-entreprise",
    title: /conformite investisseur/i,
    terms: ["connaissance client", "profil risque", "adequation", "kyc", "lcb-ft", "investissement"],
  },
];

const businessModelsModule = loadTsModule("src/lib/business-models.ts");
const checklistModule = loadTsModule("src/lib/business-block-checklists.ts");

const systems = [
  ...businessModelsModule.businessModels.map((model) => ({
    id: model.id,
    label: model.label,
    blocks: model.blocks,
  })),
  ...Object.entries(businessModelsModule.enterpriseBusinessBlockOverrides).map(([slug, blocks]) => ({
    id: slug,
    label: slug,
    blocks,
  })),
];

const rows = systems.flatMap((system) => (
  system.blocks.map((block) => {
    const checklist = checklistModule.buildChecklistForBusinessBlock(block, { systemId: system.id });

    return {
      system,
      block,
      checklist,
      text: normalizeText(`${block.title}\n${checklist.join("\n")}`),
    };
  })
));

const rules = [
  {
    id: "association-finance-client-wording",
    severity: "warning",
    applies(row) {
      return row.system.id === "association" && /financements|budget/i.test(row.block.title);
    },
    check(row) {
      if (!/\bclients?\b/i.test(row.checklist.join("\n"))) {
        return null;
      }

      return "La checklist finance association emploie 'client', alors que le vocabulaire attendu est plutôt adhérents, donateurs, financeurs, collectivités ou partenaires.";
    },
  },
  {
    id: "btp-stock-needs-chantier-context",
    severity: "warning",
    applies(row) {
      const btpSystems = [
        "btp-artisans",
        "plomberie-chauffage",
        "batiment",
        "electricite-generale",
        "maconnerie-gros-oeuvre",
        "couvreur",
        "peintre-en-batiment",
        "carreleur",
        "serrurier",
      ];

      return btpSystems.includes(row.system.id)
        && /mat[eé]riaux|mat[eé]riel|fournitures|fournisseurs|engins/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.text, ["chantier", "devis", "lot", "intervention"])) {
        return null;
      }

      return "Le bloc stock/fournisseurs BTP manque de contexte chantier/devis/lot/intervention.";
    },
  },
  {
    id: "repair-it-parts-needs-device-context",
    severity: "warning",
    applies(row) {
      return row.system.id === "reparation-informatique-mobile" && /pi[eè]ces|fournisseurs/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.text, ["appareil", "modele", "compatibilite", "garantie", "diagnostic"])) {
        return null;
      }

      return "Les pièces de réparation informatique devraient mentionner appareil, modèle, compatibilité, garantie ou diagnostic.";
    },
  },
  {
    id: "transport-equipment-needs-fleet-context",
    severity: "warning",
    applies(row) {
      return row.system.id === "transport-mobilite" && /v[eé]hicules|mat[eé]riel/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.text, ["vehicule", "flotte", "entretien", "controle", "immobilisation"])) {
        return null;
      }

      return "Le bloc véhicules/matériel transport devrait mentionner flotte, véhicule, entretien, contrôle ou immobilisation.";
    },
  },
  {
    id: "training-compliance-needs-quality-proof-context",
    severity: "warning",
    applies(row) {
      const trainingSystems = ["formation-education", "organisme-de-formation", "cfa"];

      return trainingSystems.includes(row.system.id) && /qualit[eé]|conformit[eé]/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.text, ["qualiopi", "emargement", "evaluation", "attestation", "preuve pedagogique", "apprenant"])) {
        return null;
      }

      return "La conformité formation devrait citer Qualiopi, émargements, évaluations, attestations ou preuves pédagogiques.";
    },
  },
  {
    id: "childcare-compliance-needs-care-context",
    severity: "warning",
    applies(row) {
      return ["accueil-petite-enfance", "creche"].includes(row.system.id)
        && /cadre|conformit[eé]/i.test(row.block.title);
    },
    check(row) {
      const checklistText = row.checklist.join("\n");
      const hasAdministrativeContext = hasAny(checklistText, ["agrement", "autorisation", "protocole"]);
      const hasCareContext = hasAny(checklistText, ["encadrement", "famille", "sante", "securite", "enfant"]);

      if (hasAdministrativeContext && hasCareContext) {
        return null;
      }

      return "La conformité petite enfance devrait citer à la fois un repère administratif (agrément, autorisation, protocole) et un repère d'accueil (encadrement, familles, santé, sécurité ou enfant).";
    },
  },
  {
    id: "transport-compliance-needs-regulatory-context",
    severity: "warning",
    applies(row) {
      const transportSystems = ["transport-mobilite", "transport-de-marchandise", "transport-de-personnes", "vtc"];

      return transportSystems.includes(row.system.id) && /conformit[eé]|cmr|s[eé]curit[eé]/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.checklist.join("\n"), ["licence", "carte pro", "cmr", "assurance", "controle technique", "vehicule", "conducteur"])) {
        return null;
      }

      return "La conformité transport devrait citer licence, carte pro, CMR, assurance, contrôle technique, véhicule ou conducteur.";
    },
  },
  {
    id: "auto-school-finance-needs-student-context",
    severity: "warning",
    applies(row) {
      return row.system.id === "auto-ecole" && /paiements|pilotage|finance|facturation/i.test(row.block.title);
    },
    check(row) {
      if (hasAny(row.text, ["eleve", "forfait", "heure", "cpf", "permis", "examen"])) {
        return null;
      }

      return "Le pilotage financier auto-école devrait citer élèves, forfaits, heures, CPF/permis ou examens.";
    },
  },
  {
    id: "generic-stock-rayon-service-leak",
    severity: "warning",
    applies(row) {
      return /rayon ou service/i.test(row.checklist.join("\n"));
    },
    check(row) {
      const acceptableRetail = [
        "commerce-physique",
        "commerce-de-detail",
        "commerce-alimentaire",
        "boutique-specialisee",
        "sante-commerce-reglemente",
      ];

      if (acceptableRetail.includes(row.system.id)) {
        return null;
      }

      return "La formule 'rayon ou service' apparaît hors commerce général et peut indiquer une checklist stock trop générique.";
    },
  },
  {
    id: "generic-finance-margin-leak",
    severity: "warning",
    applies(row) {
      return /marge|rentabilit[eé]|facturation|budget|honoraires|commissions|tr[eé]sorerie|co[uû]ts|encaissements|loyers|charges|paiements|primes|d[eé]bours|revenus/i.test(row.block.title);
    },
    check(row) {
      if (!row.checklist.includes("Suivre montants engagés, facturés et encaissés")) {
        return null;
      }

      return "Le bloc finance/marge utilise encore la checklist financière générique et devrait être contextualisé au métier.";
    },
  },
  {
    id: "regulated-compliance-needs-specific-context",
    severity: "warning",
    applies(row) {
      return regulatedComplianceExpectations.some((expectation) => (
        row.system.id === expectation.systemId && expectation.title.test(normalizeText(row.block.title))
      ));
    },
    check(row) {
      const expectation = regulatedComplianceExpectations.find((candidate) => (
        row.system.id === candidate.systemId && candidate.title.test(normalizeText(row.block.title))
      ));

      if (!expectation || hasMinimumHits(row.checklist.join("\n"), expectation.terms, 2)) {
        return null;
      }

      return `La conformité réglementée devrait citer au moins deux repères métier concrets (${expectation.terms.join(", ")}).`;
    },
  },
];

const alerts = rows.flatMap((row) => (
  rules.flatMap((rule) => {
    if (!rule.applies(row)) {
      return [];
    }

    const detail = rule.check(row);

    return detail ? [createAlert(rule, row, detail)] : [];
  })
));

const summaryByRule = alerts.reduce((summary, alert) => {
  summary[alert.rule] = (summary[alert.rule] ?? 0) + 1;
  return summary;
}, {});

const summaryBySeverity = alerts.reduce((summary, alert) => {
  summary[alert.severity] = (summary[alert.severity] ?? 0) + 1;
  return summary;
}, {});

const result = {
  systems: systems.length,
  blocks: rows.length,
  alerts,
  summary: {
    alertCount: alerts.length,
    bySeverity: summaryBySeverity,
    byRule: summaryByRule,
  },
};

console.log(JSON.stringify(result, null, 2));

const hasStrictFailure = alerts.some((alert) => alert.severity === "error")
  || (failOnWarning && alerts.some((alert) => alert.severity === "warning"));

if (strict && hasStrictFailure) {
  process.exit(1);
}
