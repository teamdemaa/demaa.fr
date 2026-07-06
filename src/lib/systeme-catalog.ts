import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import {
  groupSystemeRowsByPillar,
  normalizeSystemePillar,
  type SystemePillar,
  type SystemeRow,
} from "@/lib/system-canon";

export type SystemeProcessItem = {
  process: string;
  document: string;
};

export type SystemePillarCard = {
  pillar: SystemePillar;
  items: SystemeProcessItem[];
};

export type SystemeDetail = {
  cards: SystemePillarCard[];
};

type SystemeTemplateRow = {
  pillar: SystemePillar;
  process: string;
  document: string;
};

type SystemeTemplate = {
  slugs: string[];
  rows: SystemeTemplateRow[];
};

function assertValidTemplateRows(rows: SystemeRow[]) {
  const seen = new Set<string>();

  for (const row of rows) {
    if (!row.pillar || !row.process || !row.document) {
      throw new Error(
        `[systeme] Ligne invalide pour ${row.sectorSlug}: pillar/process/document sont obligatoires.`,
      );
    }

    const key = `${row.sectorSlug}::${row.pillar}::${row.process}::${row.document}`;

    if (seen.has(key)) {
      throw new Error(`[systeme] Doublon exact détecté pour ${row.sectorSlug}: ${key}`);
    }

    seen.add(key);
  }
}

const BTP_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'entreprise", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Attirer et vendre un chantier", document: "Fiche devis & argumentaire" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Trame demande d'avis post-chantier" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou un litige client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Suivre l'avancement d'un chantier", document: "Fiche de suivi chantier" },
  { pillar: "Opérations", process: "Démarrer et clôturer un chantier", document: "Checklist démarrage/réception" },
  { pillar: "Opérations", process: "Tenir chaque corps de métier", document: "Fiches process par corps de métier" },
  { pillar: "Opérations", process: "Gérer un retard ou un imprévu", document: "Procédure de gestion des aléas" },
  { pillar: "Équipe", process: "Organiser les équipes, remplacer un absent", document: "Planning + Grille de polyvalence + Liste remplacement urgence" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité", document: "Fiche marge (devis vs réalisé)" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Trame de relance impayés + Suivi acomptes/situations" },
  { pillar: "Sécurité & Conformité Chantier", process: "Sécurité et couverture assurance", document: "Registre sécurité + Attestations d'assurance" },
  { pillar: "Matériel & Approvisionnement", process: "Matériel et fournisseurs", document: "Fiche suivi matériel + Grille fournisseurs (incl. contrôle réception)" },
];

const FAST_FOOD_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'entreprise", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Attirer de nouveaux clients", document: "Calendrier de publication réseaux sociaux" },
  { pillar: "Marketing et Vente", process: "Vendre (offre claire)", document: "Fiche offre & argumentaire (menu, promo)" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Grille fidélité + Trame réponse avis Google (48h)" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre des non-conformités/réclamations (usage client)" },
  { pillar: "Opérations", process: "Ouvrir et fermer le point de vente", document: "Checklist ouverture/fermeture" },
  { pillar: "Opérations", process: "Préparer les plats de façon identique", document: "Fiches recette" },
  { pillar: "Opérations", process: "Tenir chaque poste de travail", document: "Fiches de poste par station" },
  { pillar: "Opérations", process: "Ne jamais manquer de stock", document: "Seuils de stock minimum" },
  { pillar: "Opérations", process: "Vérifier la qualité en continu", document: "Contrôle qualité aléatoire (photo dressage)" },
  { pillar: "Équipe", process: "Organiser les équipes, remplacer un absent", document: "Planning + Grille de polyvalence + Liste remplacement urgence" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre l'argent et les encaissements", document: "Suivi CA quotidien + Food cost hebdo" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Hygiène & Conformité", process: "Respecter l'hygiène alimentaire", document: "Relevés température + Plan de nettoyage HACCP" },
  { pillar: "Hygiène & Conformité", process: "Traiter une non-conformité hygiène", document: "Registre des non-conformités/réclamations (usage hygiène)" },
  { pillar: "Matériel & Approvisionnement", process: "Éviter l'arrêt par panne", document: "Contrat maintenance + Checklist entretien préventif" },
];

const COMMERCE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'entreprise", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Attirer de nouveaux clients", document: "Calendrier de publication" },
  { pillar: "Marketing et Vente", process: "Vendre (mise en avant, argumentaire)", document: "Fiche offre & argumentaire" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Grille fidélité" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou un retour client", document: "Trame de traitement des réclamations/retours" },
  { pillar: "Opérations", process: "Ouvrir et fermer la boutique", document: "Checklist ouverture/fermeture" },
  { pillar: "Opérations", process: "Tenir chaque poste", document: "Fiches de poste (caisse, mise en rayon)" },
  { pillar: "Opérations", process: "Soigner la présentation", document: "Standard merchandising/vitrine" },
  { pillar: "Opérations", process: "Ne jamais manquer de stock", document: "Seuils de stock + Grille de réassort" },
  { pillar: "Opérations", process: "Faire l'inventaire", document: "Fiche inventaire" },
  { pillar: "Équipe", process: "Organiser les équipes, remplacer un absent", document: "Planning + Grille de polyvalence + Liste remplacement urgence" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre l'argent et les encaissements", document: "Suivi CA quotidien + Suivi marge produit" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
];

const SERVICES_PRO_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'entreprise", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer de nouveaux clients", document: "Fiche suivi prospect/dossier commercial" },
  { pillar: "Marketing et Vente", process: "Vendre (proposition commerciale)", document: "Fiche offre & argumentaire (grille tarifaire)" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Trame demande d'avis" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Ouvrir, suivre, clôturer un dossier", document: "Checklist dossier + Fiches process par mission" },
  { pillar: "Opérations", process: "Contrôler la qualité des livrables", document: "Grille de contrôle qualité par mission" },
  { pillar: "Équipe", process: "Organiser les équipes", document: "Grille de polyvalence" },
  { pillar: "Équipe", process: "Transmettre un dossier en cas d'absence", document: "Fiche de passation de dossier" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité", document: "Suivi CA/facturation par dossier" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Trame de relance impayés" },
  { pillar: "Conformité & obligations", process: "Se protéger juridiquement", document: "Registre RGPD + RC pro + Confidentialité" },
];

const CABINETS_REGLEMENTES_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va le cabinet", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les dossiers", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur la charge", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les dossiers et recommandations", document: "Fiche suivi prospects, prescripteurs et relances" },
  { pillar: "Marketing et Vente", process: "Vendre une mission ou un accompagnement", document: "Fiche offre & argumentaire + Lettre de mission type" },
  { pillar: "Marketing et Vente", process: "Fidéliser les clients du cabinet", document: "Trame de suivi client + Demande d'avis" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Ouvrir et tenir un dossier client", document: "Checklist ouverture dossier + Pièces attendues" },
  { pillar: "Opérations", process: "Produire et contrôler les livrables", document: "Grille de contrôle qualité + Fiches process par mission" },
  { pillar: "Opérations", process: "Gérer les échéances et relances", document: "Calendrier échéances + Suivi relances" },
  { pillar: "Opérations", process: "Tracer les validations et décisions", document: "Journal dossier + Historique validations" },
  { pillar: "Équipe", process: "Organiser les collaborateurs et remplacements", document: "Planning charge + Grille de polyvalence" },
  { pillar: "Équipe", process: "Transmettre un dossier en cas d'absence", document: "Fiche de passation de dossier" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité des dossiers", document: "Suivi temps passé, honoraires et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Trame de relance impayés" },
  { pillar: "Conformité & obligations", process: "Sécuriser confidentialité et obligations métier", document: "Registre RGPD + RC pro + Procédure confidentialité" },
];

const CONSEIL_EXPERT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans tout reprendre soi-même", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur les missions", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les opportunités", document: "Fiche suivi prospects, devis et recommandations" },
  { pillar: "Marketing et Vente", process: "Vendre une mission claire", document: "Fiche offre & argumentaire + Proposition commerciale type" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Trame de suivi post-mission + Relances" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Cadrer une mission ou une étude", document: "Note de cadrage + Checklist lancement" },
  { pillar: "Opérations", process: "Collecter les informations utiles", document: "Liste de pièces / données attendues + Relances" },
  { pillar: "Opérations", process: "Produire l'analyse ou le livrable", document: "Trame de livrable + Standard qualité" },
  { pillar: "Opérations", process: "Restituer et suivre les décisions", document: "Compte rendu de restitution + Plan d'actions" },
  { pillar: "Équipe", process: "Organiser les missions et remplacements", document: "Planning charge + Grille de polyvalence" },
  { pillar: "Équipe", process: "Transmettre une mission en cas d'absence", document: "Fiche de passation de mission" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la marge des missions", document: "Suivi devis, facturation, temps passé et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Trame de relance impayés" },
  { pillar: "Conformité & obligations", process: "Sécuriser contrats et confidentialité", document: "Dossier contractuel + RGPD + NDA si besoin" },
];

const AGENCES_DIGITALES_CREATION_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'agence", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer la production", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur la charge", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les prospects et briefs", document: "Fiche prospection + Qualification brief" },
  { pillar: "Marketing et Vente", process: "Vendre une prestation créative ou digitale", document: "Proposition commerciale + Cadre de validation" },
  { pillar: "Marketing et Vente", process: "Faire revenir les clients", document: "Trame de suivi post-livraison + Plan de récurrence" },
  { pillar: "Marketing et Vente", process: "Traiter un retour ou une réclamation client", document: "Registre retours client + Trame de réponse" },
  { pillar: "Opérations", process: "Cadrer un brief et un périmètre", document: "Brief projet + Checklist lancement" },
  { pillar: "Opérations", process: "Produire les livrables", document: "Planning production + Fiches process par type de livrable" },
  { pillar: "Opérations", process: "Faire valider et livrer", document: "Circuit de validation + Bon de livraison" },
  { pillar: "Opérations", process: "Mesurer les performances ou retours", document: "Reporting performance + Journal d'itérations" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning charge + Grille de rôles" },
  { pillar: "Équipe", process: "Transmettre un projet en cas d'absence", document: "Fiche de passation de projet" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la marge projet", document: "Suivi devis, temps passé, achats et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi acomptes, facturation et relances" },
  { pillar: "Conformité & obligations", process: "Sécuriser droits, contrats et accès", document: "Dossier contrats, cession de droits et accès outils" },
];

const SERVICES_RH_SUPPORT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer le quotidien", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur les demandes", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Qualifier la demande client", document: "Fiche besoin client + Niveau de service attendu" },
  { pillar: "Marketing et Vente", process: "Vendre la bonne prestation de support", document: "Fiche offre & argumentaire + Grille tarifaire" },
  { pillar: "Marketing et Vente", process: "Fidéliser les comptes", document: "Trame de suivi client + Point récurrent" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Prendre et qualifier une demande", document: "Checklist entrée de demande + Priorisation" },
  { pillar: "Opérations", process: "Traiter le dossier, ticket ou recrutement", document: "Workflow opérationnel + Checklist d'exécution" },
  { pillar: "Opérations", process: "Suivre les délais et relances", document: "Tableau suivi SLA / étapes + Relances" },
  { pillar: "Opérations", process: "Tracer les échanges et la résolution", document: "Journal dossier + Base de connaissance" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning + Grille de polyvalence" },
  { pillar: "Équipe", process: "Transmettre un dossier en cas d'absence", document: "Fiche de passation de dossier" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité des comptes", document: "Suivi facturation, temps et marge par compte" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Trame de relance impayés" },
];

const SERVICES_FINANCE_ASSURANCE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les dossiers", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur le portefeuille", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Qualifier le besoin et le profil client", document: "Fiche découverte client + Pièces attendues" },
  { pillar: "Marketing et Vente", process: "Vendre une solution ou un contrat", document: "Fiche offre & argumentaire + Devis/mandat type" },
  { pillar: "Marketing et Vente", process: "Fidéliser les clients", document: "Trame de suivi portefeuille + Revue périodique" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Constituer un dossier complet", document: "Checklist dossier client + Pièces et validations" },
  { pillar: "Opérations", process: "Coordonner partenaires, contrats ou placements", document: "Journal partenaires/contrats + Points de validation" },
  { pillar: "Opérations", process: "Suivre les échéances, commissions ou encours", document: "Tableau de suivi échéances, primes, encours ou commissions" },
  { pillar: "Opérations", process: "Traiter un incident, une alerte ou un sinistre", document: "Procédure incident/sinistre + Historique décisions" },
  { pillar: "Équipe", process: "Organiser les portefeuilles et remplacements", document: "Planning charge + Grille de polyvalence" },
  { pillar: "Équipe", process: "Transmettre un dossier en cas d'absence", document: "Fiche de passation de dossier" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité du portefeuille", document: "Suivi commissions, honoraires, encours et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation, primes ou honoraires + Relances" },
  { pillar: "Conformité & obligations", process: "Sécuriser conformité réglementaire", document: "Dossier conformité métier + RGPD + Contrôles périodiques" },
];

const SERVICES_TECH_B2B_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer la production", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sur le parc ou les projets", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Qualifier le besoin technique", document: "Fiche découverte + Périmètre technique" },
  { pillar: "Marketing et Vente", process: "Vendre une prestation ou un abonnement", document: "Fiche offre & argumentaire + Proposition commerciale" },
  { pillar: "Marketing et Vente", process: "Fidéliser les comptes clients", document: "Trame de suivi client + Revue périodique" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre incidents client + Trame de réponse" },
  { pillar: "Opérations", process: "Cadrer un parc, un projet ou une intervention", document: "Checklist cadrage + Inventaire initial" },
  { pillar: "Opérations", process: "Déployer, paramétrer ou intervenir", document: "Plan d'intervention + Checklist exécution" },
  { pillar: "Opérations", process: "Suivre incidents, maintenance et support", document: "Tableau tickets/incidents + Procédure escalade" },
  { pillar: "Opérations", process: "Documenter et sécuriser les accès", document: "Base documentaire + Registre accès et sauvegardes" },
  { pillar: "Équipe", process: "Organiser l'équipe et les astreintes", document: "Planning charge + Grille de rôles" },
  { pillar: "Équipe", process: "Transmettre un dossier en cas d'absence", document: "Fiche de passation + Checklist reprise" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre la marge projet ou récurrente", document: "Suivi temps, licences, achats et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi abonnements/facturation + Relances" },
  { pillar: "Conformité & obligations", process: "Sécuriser contrats, données et continuité", document: "Dossier sécurité, RGPD, sauvegardes et PCA" },
];

const IMMOBILIER_TRANSACTION_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les transactions", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Développer le portefeuille et les mandats", document: "Fiche prospection mandats + Prescripteurs" },
  { pillar: "Marketing et Vente", process: "Qualifier un acquéreur ou un projet", document: "Fiche découverte client + Critères de recherche" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Constituer un dossier bien ou mandat", document: "Checklist mandat/bien + Pièces obligatoires" },
  { pillar: "Opérations", process: "Organiser visites et retours", document: "Planning visites + Compte rendu standardisé" },
  { pillar: "Opérations", process: "Suivre négociation et signature", document: "Journal offre/contre-offre + Étapes signature" },
  { pillar: "Équipe", process: "Organiser les agents et remplacements", document: "Planning équipe + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre commissions et encaissements", document: "Suivi mandats, commissions et règlements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir les dossiers et affichages en règle", document: "Contrôle pièces, mandats, diagnostics et affichages" },
];

const IMMOBILIER_EXPERTISE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les missions", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Qualifier la mission et le périmètre", document: "Fiche besoin client + Contraintes mission" },
  { pillar: "Marketing et Vente", process: "Vendre une mission d'expertise", document: "Proposition commerciale + Devis type" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Préparer la mission terrain", document: "Checklist préparation mission + Pièces d'entrée" },
  { pillar: "Opérations", process: "Réaliser relevés, plans ou constats", document: "Fiche terrain + Procédure de relevé/mesure" },
  { pillar: "Opérations", process: "Produire rapport ou livrable final", document: "Trame de rapport/livrable + Contrôle qualité" },
  { pillar: "Équipe", process: "Organiser les missions et remplacements", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre la marge et la facturation", document: "Suivi devis, temps passé, factures et marge" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation, règlements et relances" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir les pièces et assurances en règle", document: "Dossier mission + Attestations + Contrôle conformité" },
];

const ACCUEIL_MEMBRES_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exploitation", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Qualifier un besoin ou une réservation", document: "Fiche découverte client + Disponibilités" },
  { pillar: "Marketing et Vente", process: "Vendre un contrat, service ou séjour", document: "Fiche offre & argumentaire + Conditions" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Ouvrir et tenir un dossier client ou membre", document: "Checklist entrée client + Contrat/adhésion" },
  { pillar: "Opérations", process: "Gérer réservations, courrier ou services", document: "Planning réservations/services + Procédure exécution" },
  { pillar: "Opérations", process: "Traiter incidents et renouvellements", document: "Journal incidents + Suivi renouvellements" },
  { pillar: "Équipe", process: "Organiser l'accueil et les remplacements", document: "Planning équipe + Grille de rôles" },
  { pillar: "Finance et Admin", process: "Suivre encaissements et abonnements", document: "Suivi contrats, paiements et relances" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité & obligations", process: "Sécuriser contrats et obligations d'accueil", document: "Dossier conformité, CGV, RGPD et justificatifs" },
];

const INVESTISSEMENT_IMMOBILIER_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va le portefeuille", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les arbitrages", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Sourcer des opportunités", document: "Fiche sourcing biens/opérations + Critères" },
  { pillar: "Marketing et Vente", process: "Traiter un litige ou une réclamation", document: "Registre incidents/réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Analyser la rentabilité et le montage", document: "Checklist analyse, financement et risques" },
  { pillar: "Opérations", process: "Suivre acquisition, travaux ou mise en location", document: "Tableau d'avancement opération + Planning" },
  { pillar: "Opérations", process: "Piloter exploitation, revente ou arbitrage", document: "Suivi performance + Journal décisions d'arbitrage" },
  { pillar: "Équipe", process: "Organiser partenaires et remplacements", document: "Liste partenaires + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre trésorerie, rendement et marge", document: "Tableau cash-flow, rendement et coûts" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi loyers, ventes ou refacturations + Relances" },
  { pillar: "Conformité métier", process: "Tenir les pièces, actes et diagnostics en règle", document: "Dossier actes, diagnostics, baux et justificatifs" },
];

const INVESTISSEMENT_FINANCIER_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va le portefeuille", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les arbitrages", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Sourcer opportunités et investisseurs", document: "Fiche sourcing + Qualification opportunité" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation investisseur ou partenaire", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Analyser risque, allocation ou due diligence", document: "Checklist analyse risque / due diligence" },
  { pillar: "Opérations", process: "Suivre décisions d'investissement", document: "Journal décisions + Mandats/validations" },
  { pillar: "Opérations", process: "Piloter reporting et performance", document: "Reporting portefeuille + Suivi indicateurs" },
  { pillar: "Équipe", process: "Organiser analyses et remplacements", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre encours, frais et revenus", document: "Tableau encours, frais, commissions et performance" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi honoraires, commissions ou appels de fonds + Relances" },
  { pillar: "Conformité & obligations", process: "Sécuriser conformité et documentation", document: "Dossier conformité, KYC, RGPD et pièces réglementaires" },
];

const GESTION_LOCATIVE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exploitation", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Développer les mandats de gestion", document: "Fiche prospection mandats + Prescripteurs" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation propriétaire ou locataire", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Entrer un bien et préparer la mise en location", document: "Checklist bien/mandat + Dossier location" },
  { pillar: "Opérations", process: "Suivre loyers, quittances et incidents", document: "Tableau loyers, quittances, impayés et tickets" },
  { pillar: "Opérations", process: "Gérer départs, travaux et relocation", document: "Checklist sortie + Procédure relocation/travaux" },
  { pillar: "Équipe", process: "Organiser les gestionnaires et remplacements", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre flux, honoraires et encaissements", document: "Tableau flux locatifs, honoraires et règlements" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi honoraires et relances impayés" },
  { pillar: "Conformité métier", process: "Tenir baux, états des lieux et obligations en règle", document: "Dossier bail + État des lieux + Pièces réglementaires" },
];

const CONCIERGERIE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exploitation", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Développer les biens et voyageurs", document: "Fiche prospection propriétaires + Canaux de réservation" },
  { pillar: "Marketing et Vente", process: "Traiter un avis ou une réclamation", document: "Journal avis/réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Gérer annonces, réservations et calendrier", document: "Checklist annonce + Planning réservations" },
  { pillar: "Opérations", process: "Organiser préparation, arrivées et départs", document: "Checklist ménage/check-in/check-out" },
  { pillar: "Opérations", process: "Traiter maintenance et incidents voyageurs", document: "Procédure incident + Liste prestataires" },
  { pillar: "Équipe", process: "Organiser équipes terrain et remplacements", document: "Planning ménage/interventions + Passation" },
  { pillar: "Finance et Admin", process: "Suivre revenus, commissions et frais", document: "Suivi réservations, commissions et dépenses" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi versements plateformes/propriétaires + Relances" },
  { pillar: "Conformité métier", process: "Tenir règlements, accès et justificatifs en règle", document: "Dossier logement, accès, règlement intérieur et preuves" },
];

const EVENT_PRESTATAIRES_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les événements", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Qualifier le brief et le budget", document: "Fiche brief client + Budget cible" },
  { pillar: "Marketing et Vente", process: "Vendre une prestation événementielle", document: "Proposition commerciale + Périmètre prestation" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Préparer planning, prestataires et logistique", document: "Planning projet + Checklist logistique/prestataires" },
  { pillar: "Opérations", process: "Piloter le jour J et les imprévus", document: "Conducteur opérationnel + Procédure aléas" },
  { pillar: "Opérations", process: "Clôturer, faire le bilan et relancer", document: "Compte rendu final + Retour client + Plan de relance" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre marge, acomptes et règlements", document: "Suivi budget, prestataires, acomptes et marge" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Relance solde" },
  { pillar: "Conformité & obligations", process: "Sécuriser contrats et assurances", document: "Dossier contrats, assurances et autorisations" },
];

const ECOMMERCE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exécution", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Attirer du trafic qualifié", document: "Calendrier acquisition + Plan campagnes" },
  { pillar: "Marketing et Vente", process: "Convertir les visiteurs", document: "Fiche offre, argumentaire et parcours de conversion" },
  { pillar: "Marketing et Vente", process: "Traiter un retour ou une réclamation client", document: "Procédure SAV/retours + Trame de réponse" },
  { pillar: "Opérations", process: "Maintenir le catalogue et la boutique en ligne", document: "Checklist catalogue, fiches produit et prix" },
  { pillar: "Opérations", process: "Préparer commandes et expéditions", document: "Workflow commande, picking, emballage et expédition" },
  { pillar: "Opérations", process: "Gérer retours, support et litiges", document: "Journal retours/support + Procédure de traitement" },
  { pillar: "Équipe", process: "Organiser support et exécution", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre ventes, panier et marge", document: "Tableau CA, panier moyen, marge et remboursements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Sécuriser les encaissements", document: "Suivi paiements, litiges et remboursements" },
];

const MARKETPLACE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va la plateforme", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer la plateforme", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Recruter vendeurs et acheteurs", document: "Fiche acquisition vendeurs/acheteurs + Plan d'activation" },
  { pillar: "Marketing et Vente", process: "Traiter un litige ou une réclamation", document: "Registre litiges + Trame de médiation" },
  { pillar: "Opérations", process: "Publier et contrôler les offres", document: "Checklist catalogue vendeurs + Règles de publication" },
  { pillar: "Opérations", process: "Modérer la plateforme et les incidents", document: "Procédure modération + Journal incidents" },
  { pillar: "Opérations", process: "Suivre commandes, retours et coordination vendeurs", document: "Tableau commandes/retours + Suivi vendeurs" },
  { pillar: "Équipe", process: "Organiser support et modération", document: "Planning équipe + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre commissions, paiements et performance", document: "Tableau commissions, flux et indicateurs marketplace" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer et reverser", document: "Suivi encaissements, reversements vendeurs et litiges paiements" },
];

const PRESSING_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'atelier", document: "Grille d'autorité" },
  { pillar: "Marketing et Vente", process: "Fidéliser les clients", document: "Trame fidélité + Demande d'avis" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre litiges textile + Trame de réponse" },
  { pillar: "Opérations", process: "Enregistrer le dépôt client", document: "Fiche dépôt + Consignes article" },
  { pillar: "Opérations", process: "Traiter et contrôler les pièces", document: "Checklist traitement + Contrôle qualité" },
  { pillar: "Opérations", process: "Restituer et tracer la livraison", document: "Fiche restitution + Historique client" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre caisse, paniers et marge", document: "Suivi tickets, panier moyen et marge" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi encaissements, acomptes et relances" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Hygiène & Conformité", process: "Sécuriser machines, produits et traçabilité", document: "Registre machines/produits + Procédure sécurité" },
];

const LAVERIE_AUTOMATIQUE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exploitation", document: "Grille d'autorité" },
  { pillar: "Marketing et Vente", process: "Informer et rassurer les clients", document: "Guide d'usage + Affichage prix/services" },
  { pillar: "Marketing et Vente", process: "Traiter un incident ou une réclamation client", document: "Journal incidents client + Trame de réponse" },
  { pillar: "Opérations", process: "Surveiller machines et consommables", document: "Checklist contrôle machines + Seuils consommables" },
  { pillar: "Opérations", process: "Gérer paiements, pannes et maintenance", document: "Procédure panne/paiement + Contrats maintenance" },
  { pillar: "Opérations", process: "Maintenir propreté et sécurité", document: "Planning nettoyage + Registre sécurité" },
  { pillar: "Équipe", process: "Organiser interventions et remplacements", document: "Planning interventions + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre encaissements et rentabilité", document: "Suivi paiements, dépenses et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir contrôles et affichages en règle", document: "Registre contrôles, affichages et incidents" },
];

const SYNDIC_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va le portefeuille copropriété", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'exploitation", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Développer ou renouveler des mandats", document: "Fiche prospection/renouvellement mandats" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation copropriétaire ou occupant", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Tenir la copropriété et ses lots", document: "Dossier copropriété + Carnet d'entretien" },
  { pillar: "Opérations", process: "Préparer assemblées générales et décisions", document: "Checklist AG + Journal décisions" },
  { pillar: "Opérations", process: "Suivre appels de fonds, travaux et incidents", document: "Tableau appels de fonds/travaux + Tickets incidents" },
  { pillar: "Équipe", process: "Organiser gestionnaires et remplacements", document: "Planning charge + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre flux, appels de fonds et impayés", document: "Tableau flux copropriété, appels et impayés" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi règlements copropriétaires + Relances" },
  { pillar: "Conformité métier", process: "Tenir procès-verbaux, contrats et obligations en règle", document: "Dossier AG, contrats et pièces réglementaires" },
];

const SPORT_ACCOMPAGNEMENT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les séances", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Attirer de nouveaux adhérents ou clients", document: "Calendrier acquisition + Fiche découverte" },
  { pillar: "Marketing et Vente", process: "Vendre un abonnement ou accompagnement", document: "Fiche offre & argumentaire + Conditions" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Planifier cours, séances ou programmes", document: "Planning séances/cours + Trame programme" },
  { pillar: "Opérations", process: "Suivre progression et assiduité", document: "Fiche suivi client/adhérent + Journal séances" },
  { pillar: "Opérations", process: "Entretenir équipements et locaux", document: "Checklist matériel/locaux + Registre entretien" },
  { pillar: "Équipe", process: "Organiser coachs et remplacements", document: "Planning équipe + Liste de remplacement" },
  { pillar: "Finance et Admin", process: "Suivre abonnements, paiements et marge", document: "Suivi abonnements, encaissements et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir consignes, assurances et affichages en règle", document: "Dossier sécurité, assurances et affichages" },
];

const SANTE_CABINET_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les consultations", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Organiser prise de rendez-vous et accueil", document: "Parcours patient/bénéficiaire + Standard accueil" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou un signalement", document: "Registre réclamations/signalements + Trame de réponse" },
  { pillar: "Opérations", process: "Tenir dossier, consentements et documents", document: "Checklist dossier patient + Consentements + Pièces" },
  { pillar: "Opérations", process: "Dérouler consultation, soin ou suivi", document: "Fiche déroulé consultation/soin + Journal de suivi" },
  { pillar: "Opérations", process: "Gérer matériel, stérilisation ou stock médical", document: "Checklist matériel/stérilisation + Registre stock" },
  { pillar: "Équipe", process: "Organiser praticiens et remplacements", document: "Planning cabinet + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre facturation et encaissements", document: "Suivi actes, facturation, tiers payant ou règlements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Sécuriser confidentialité et obligations santé", document: "Dossier confidentialité, affichages et obligations métier" },
];

const PHARMACIE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'officine", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer le comptoir", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Accueillir et orienter les clients", document: "Parcours comptoir + Fiche conseil" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Servir ordonnances et demandes comptoir", document: "Checklist délivrance + Contrôle ordonnance" },
  { pillar: "Opérations", process: "Suivre stock, commandes et ruptures", document: "Seuils stock + Tableau commandes/ruptures" },
  { pillar: "Opérations", process: "Piloter missions santé et traçabilité", document: "Journal missions santé + Registre traçabilité" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning officine + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre encaissements et tiers payant", document: "Suivi encaissements, tiers payant et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir l'officine et les obligations en règle", document: "Dossier officine, contrôles, affichages et obligations" },
];

const DOMICILE_ACCOMPAGNEMENT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer les tournées", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Accueillir un nouveau bénéficiaire ou patient", document: "Fiche découverte + Besoins + Cadre d'intervention" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou signalement", document: "Registre réclamations/signalements + Trame de réponse" },
  { pillar: "Opérations", process: "Planifier interventions, tournées ou soins", document: "Planning interventions/tournées + Priorités" },
  { pillar: "Opérations", process: "Transmettre consignes et observations", document: "Fiche consignes + Journal d'intervention/soin" },
  { pillar: "Opérations", process: "Suivre matériel et incidents", document: "Registre matériel + Procédure incident" },
  { pillar: "Équipe", process: "Organiser remplacements et continuité", document: "Planning + Liste remplacement + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre facturation et encaissements", document: "Suivi heures/interventions, facturation et règlements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir droits, prescriptions et justificatifs en règle", document: "Dossier bénéficiaire/patient + Pièces et justificatifs" },
];

const PETITE_ENFANCE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va la structure", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'accueil", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Gérer préinscriptions et familles", document: "Fiche préinscription + Parcours famille" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou un signalement", document: "Registre réclamations/signalements + Trame de réponse" },
  { pillar: "Opérations", process: "Organiser accueil, présences et transmissions", document: "Planning accueil + Journal transmissions" },
  { pillar: "Opérations", process: "Suivre repas, soins et sécurité", document: "Checklist quotidienne + Registre incidents" },
  { pillar: "Opérations", process: "Préparer activités et continuité", document: "Planning activités + Procédure remplacement" },
  { pillar: "Équipe", process: "Organiser l'équipe et les remplacements", document: "Planning équipe + Liste remplacement" },
  { pillar: "Finance et Admin", process: "Suivre contrats, facturation et aides", document: "Suivi contrats familles, facturation et encaissements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Conformité métier", process: "Tenir agréments, protocoles et obligations en règle", document: "Dossier agréments, protocoles et affichages" },
];

const SANTE_BIEN_ETRE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'entreprise", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Attirer les clients", document: "Calendrier de publication" },
  { pillar: "Marketing et Vente", process: "Vendre (offre de prestation claire)", document: "Fiche offre & argumentaire (grille tarifaire)" },
  { pillar: "Marketing et Vente", process: "Gérer les rendez-vous, fidéliser", document: "Système de réservation + Relance no-show" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Ouvrir et fermer l'établissement", document: "Checklist ouverture/fermeture" },
  { pillar: "Opérations", process: "Standardiser une prestation", document: "Fiches process par prestation" },
  { pillar: "Équipe", process: "Organiser les équipes, remplacer un absent", document: "Planning + Grille polyvalence + Liste remplacement" },
  { pillar: "Équipe", process: "Intégrer un nouvel employé", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre l'argent", document: "Suivi CA quotidien" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Hygiène & Conformité", process: "Respecter l'hygiène", document: "Fiche traçabilité produits + Protocole stérilisation" },
  { pillar: "Hygiène & Conformité", process: "Être couvert et en règle", document: "Dossier RC pro + Diplômes/qualifications obligatoires + Affichages réglementaires" },
];

const CFA_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va le CFA", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans le dirigeant", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les entreprises partenaires (employeurs)", document: "Fiche suivi prospection entreprises" },
  { pillar: "Marketing et Vente", process: "Recruter des apprentis", document: "Fiche offre & argumentaire (parcours proposés)" },
  { pillar: "Marketing et Vente", process: "Fidéliser employeurs et apprentis", document: "Questionnaire satisfaction employeur + apprenti" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation apprenti ou employeur", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Construire un contenu de formation", document: "Trame de programme pédagogique" },
  { pillar: "Opérations", process: "Dérouler une session/année de formation", document: "Checklist rentrée/session + Fiche déroulé type" },
  { pillar: "Opérations", process: "Planifier cours, salles et intervenants", document: "Planning pédagogique + Procédure de remplacement d'un formateur absent" },
  { pillar: "Opérations", process: "Suivre l'alternance employeur-apprenti", document: "Fiche de suivi tripartite (CFA-apprenti-employeur)" },
  { pillar: "Équipe", process: "Gérer les formateurs et intervenants", document: "Fiche gestion intervenants (contrats, évaluation)" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre l'argent", document: "Suivi CA par contrat d'apprentissage/financement OPCO" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer (sécuriser les financements)", document: "Checklist dossier OPCO complet + Trame de relance financements" },
  { pillar: "Conformité Qualiopi", process: "Rester certifié", document: "Dossier Qualiopi à jour + Registre réclamations" },
  { pillar: "Conformité Qualiopi", process: "Publier et suivre les résultats (obligation légale)", document: "Suivi taux de réussite examen + taux d'insertion" },
  { pillar: "Protection des apprentis mineurs", process: "Respecter les obligations spécifiques", document: "Registre des mineurs + Procédure de signalement" },
];

const ORGANISME_FORMATION_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'organisme", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans tout centraliser", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les inscriptions", document: "Fiche suivi prospects, entreprises et financeurs" },
  { pillar: "Marketing et Vente", process: "Vendre une formation", document: "Fiche offre & argumentaire (programme, prérequis, financement)" },
  { pillar: "Marketing et Vente", process: "Fidéliser apprenants et clients", document: "Questionnaire satisfaction + Trame de suivi post-formation" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation apprenant ou client", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Construire et mettre à jour une formation", document: "Trame de programme pédagogique + Versionning supports" },
  { pillar: "Opérations", process: "Planifier sessions, formateurs et ressources", document: "Planning sessions + Affectation formateurs/salles" },
  { pillar: "Opérations", process: "Suivre présences, évaluations et attestations", document: "Checklist session + Émargements + Attestations" },
  { pillar: "Opérations", process: "Gérer dossiers clients et financeurs", document: "Checklist dossier convention/financement + Relances" },
  { pillar: "Équipe", process: "Gérer les formateurs et intervenants", document: "Fiche gestion intervenants (contrats, habilitations, évaluation)" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur et remplacer un formateur absent", document: "Parcours d'intégration + Procédure de remplacement formateur" },
  { pillar: "Finance et Admin", process: "Suivre l'activité et la marge", document: "Suivi CA, remplissage, heures vendues et marge par session" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation/financement + Trame de relance" },
  { pillar: "Qualité & conformité formation", process: "Maintenir la conformité qualité", document: "Dossier qualité formation + Registre réclamations + Plan d'actions" },
];

const FORMATION_EN_LIGNE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans tout centraliser", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Attirer de nouveaux apprenants", document: "Fiche acquisition + Calendrier de lancement" },
  { pillar: "Marketing et Vente", process: "Vendre un parcours en ligne", document: "Fiche offre & argumentaire (programme, promesse, FAQ)" },
  { pillar: "Marketing et Vente", process: "Traiter une demande ou une réclamation apprenant", document: "Trame support apprenant + Registre incidents" },
  { pillar: "Opérations", process: "Créer et publier un contenu pédagogique", document: "Checklist production module + Validation publication" },
  { pillar: "Opérations", process: "Gérer la plateforme et les accès", document: "Procédure LMS + Checklist inscription/activation" },
  { pillar: "Opérations", process: "Suivre progression, évaluations et certificats", document: "Tableau progression apprenants + Attestations/certificats" },
  { pillar: "Opérations", process: "Mettre à jour les contenus", document: "Journal de mise à jour + Revue qualité contenu" },
  { pillar: "Équipe", process: "Coordonner formateurs, support et production", document: "Rôles équipe + Fiche de passation" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre revenus, abonnements et marge", document: "Suivi ventes, abonnements, remboursements et marge" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Gérer remboursements et litiges", document: "Suivi paiements, remboursements et relances" },
  { pillar: "Qualité & conformité formation", process: "Maintenir qualité et conformité", document: "Référentiel qualité contenu + RGPD + CGV/attestations" },
];

const AUTO_ECOLE_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans tout centraliser", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Direction", process: "Garder une visibilité sans reprendre la main", document: "Point de pilotage mensuel" },
  { pillar: "Marketing et Vente", process: "Développer les inscriptions", document: "Fiche suivi prospects/élèves + Offres CPF ou forfaits" },
  { pillar: "Marketing et Vente", process: "Vendre une formule de conduite", document: "Fiche offre & argumentaire (forfaits, examens, financement)" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation élève", document: "Registre réclamations + Trame de réponse" },
  { pillar: "Opérations", process: "Gérer inscriptions et dossiers élèves", document: "Checklist inscription + Dossier élève" },
  { pillar: "Opérations", process: "Planifier heures, moniteurs et véhicules", document: "Planning conduite + Affectation moniteurs/véhicules" },
  { pillar: "Opérations", process: "Suivre progression et examens", document: "Fiche progression élève + Suivi convocations/résultats" },
  { pillar: "Opérations", process: "Suivre véhicules et incidents", document: "Carnet véhicule + Procédure incident/sinistre" },
  { pillar: "Équipe", process: "Organiser les moniteurs et remplacements", document: "Planning équipe + Liste de remplacement + Consignes" },
  { pillar: "Équipe", process: "Intégrer un nouveau collaborateur", document: "Parcours d'intégration écrit" },
  { pillar: "Finance et Admin", process: "Suivre paiements, forfaits et heures", document: "Suivi encaissements, heures consommées et reste à facturer" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
  { pillar: "Finance et Admin", process: "Suivre financements et relances", document: "Checklist financement/CPF + Trame de relance" },
  { pillar: "Conformité métier", process: "Tenir dossiers élèves et véhicules en règle", document: "Contrôle pièces élèves + Documents véhicules + Registre incidents" },
];

const IMMOBILIER_EXPLOITATION_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer le quotidien", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Donner accès à l'essentiel", document: "Fiche accès & informations critiques" },
  { pillar: "Marketing et Vente", process: "Développer le portefeuille", document: "Fiche suivi prospects, mandats ou biens" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client ou occupant", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Ouvrir, suivre et clôturer un dossier", document: "Checklist dossier + Fiche de suivi d'actif ou d'immeuble" },
  { pillar: "Opérations", process: "Gérer un incident, un sinistre ou un travaux urgent", document: "Procédure de gestion des incidents et prestataires" },
  { pillar: "Équipe", process: "Assurer la continuité en cas d'absence", document: "Fiche de passation + Grille de polyvalence" },
  { pillar: "Finance et Admin", process: "Suivre les flux financiers", document: "Tableau de suivi encaissements, décaissements et rentabilité" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Trame de relance impayés + Suivi des échéances" },
];

const LOGISTIQUE_TRANSPORT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider au quotidien sans tout centraliser", document: "Grille d'autorité" },
  { pillar: "Direction", process: "Garder une visibilité d'exploitation", document: "Point de pilotage hebdomadaire" },
  { pillar: "Marketing et Vente", process: "Prendre et qualifier une demande client", document: "Fiche devis, mission ou tournée" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Planifier les tournées, trajets ou missions", document: "Planning d'exploitation + Affectation véhicules/chauffeurs" },
  { pillar: "Opérations", process: "Suivre l'exécution et gérer les aléas", document: "Fiche incident, retard ou imprévu" },
  { pillar: "Opérations", process: "Clôturer une mission avec preuve", document: "Checklist de fin de mission + Preuve de livraison/service" },
  { pillar: "Équipe", process: "Remplacer un absent", document: "Planning + Liste de remplacement urgence + Consignes terrain" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité", document: "Suivi CA, coûts carburant, kilomètres ou marge par mission" },
  { pillar: "Finance et Admin", process: "Payer et encaisser à temps", document: "Calendrier des échéances + Trame de relance impayés" },
];

const PRODUCTION_ATELIER_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer l'atelier", document: "Grille d'autorité" },
  { pillar: "Marketing et Vente", process: "Qualifier un besoin et établir un devis", document: "Fiche devis & argumentaire" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Ouvrir, suivre et clôturer un ordre de fabrication ou d'intervention", document: "Ordre de fabrication/intervention + Checklist de clôture" },
  { pillar: "Opérations", process: "Garantir la qualité de sortie", document: "Grille de contrôle qualité + Registre non-conformités" },
  { pillar: "Opérations", process: "Éviter la rupture de pièces ou matières", document: "Seuils de stock + Grille de réapprovisionnement" },
  { pillar: "Équipe", process: "Organiser les postes, remplacer un absent et transmettre les consignes", document: "Planning atelier + Fiches de poste" },
  { pillar: "Finance et Admin", process: "Suivre la marge", document: "Suivi coûts matière, main-d'oeuvre et marge" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Trame de relance impayés" },
  { pillar: "Matériel & Approvisionnement", process: "Entretenir les équipements critiques", document: "Checklist maintenance préventive + Contrats de maintenance" },
];

const HEBERGEMENT_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans reprendre toutes les opérations", document: "Grille d'autorité" },
  { pillar: "Marketing et Vente", process: "Gérer les réservations et la relation client", document: "Fiche réservation + Standard de confirmation" },
  { pillar: "Marketing et Vente", process: "Traiter un avis négatif ou une réclamation", document: "Trame de réponse avis et réclamations" },
  { pillar: "Opérations", process: "Organiser arrivées, départs et ménage", document: "Checklist check-in/check-out + Planning ménage" },
  { pillar: "Opérations", process: "Traiter un incident sur site", document: "Procédure incident client ou maintenance" },
  { pillar: "Équipe", process: "Remplacer un absent et transmettre les consignes", document: "Planning + Liste remplacement + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre le chiffre et les encaissements", document: "Suivi occupation, panier moyen et encaissements" },
  { pillar: "Finance et Admin", process: "Payer à temps", document: "Calendrier des échéances" },
];

const SECURITE_SERVICES_TERRAIN_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'activité", document: "Fiche vision & objectifs annuels" },
  { pillar: "Direction", process: "Décider sans bloquer le terrain", document: "Grille d'autorité" },
  { pillar: "Marketing et Vente", process: "Prendre un nouveau contrat", document: "Fiche offre, devis et cahier des charges client" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation client", document: "Trame de traitement des réclamations" },
  { pillar: "Opérations", process: "Planifier les interventions ou rondes", document: "Planning d'intervention + Consignes site" },
  { pillar: "Opérations", process: "Contrôler la bonne exécution", document: "Fiche de contrôle qualité ou main courante" },
  { pillar: "Équipe", process: "Remplacer un absent", document: "Planning + Liste remplacement urgence + Grille de polyvalence" },
  { pillar: "Finance et Admin", process: "Suivre la rentabilité des contrats", document: "Suivi heures, coûts et marge par contrat" },
  { pillar: "Finance et Admin", process: "Se faire payer", document: "Suivi facturation + Trame de relance impayés" },
];

const ASSOCIATION_ROWS: SystemeTemplateRow[] = [
  { pillar: "Direction", process: "Savoir où va l'association", document: "Fiche vision, priorités et objectifs annuels" },
  { pillar: "Direction", process: "Répartir les rôles de gouvernance", document: "Grille de responsabilités bureau/équipe" },
  { pillar: "Marketing et Vente", process: "Recruter et fidéliser membres, bénéficiaires ou partenaires", document: "Fiche suivi adhésions, partenariats ou dons" },
  { pillar: "Marketing et Vente", process: "Traiter une réclamation ou un signalement", document: "Trame de traitement des réclamations ou signalements" },
  { pillar: "Opérations", process: "Organiser une action, un événement ou un accompagnement", document: "Checklist événement ou action + Fiche de suivi" },
  { pillar: "Équipe", process: "Coordonner salariés et bénévoles", document: "Planning + Grille de rôles + Fiche de passation" },
  { pillar: "Finance et Admin", process: "Suivre budget, encaissements, subventions et trésorerie", document: "Tableau budget, subventions et trésorerie" },
  { pillar: "Finance et Admin", process: "Payer à temps et justifier les dépenses", document: "Calendrier des échéances + Dossier justificatifs" },
];

const SYSTEME_TEMPLATES: SystemeTemplate[] = [
  {
    slugs: [
      "batiment",
      "plomberie-chauffage",
      "electricite-generale",
      "renovation-interieur",
      "menuiserie-agencement",
      "maconnerie-gros-oeuvre",
      "paysagiste",
      "pisciniste",
      "couvreur",
      "peintre-en-batiment",
      "carreleur",
      "climatisation",
      "serrurier",
    ],
    rows: BTP_ROWS,
  },
  {
    slugs: ["restaurant", "fast-food", "dark-kitchen", "boulangerie", "bar-cafe", "food-truck"],
    rows: FAST_FOOD_ROWS,
  },
  {
    slugs: [
      "commerce-de-detail",
      "commerce-alimentaire",
      "boutique-specialisee",
      "tabac-presse-point-relais",
      "opticien",
      "librairie",
      "fleuriste",
    ],
    rows: COMMERCE_ROWS,
  },
  {
    slugs: [
      "cabinet-comptable",
      "cabinet-davocat",
      "notaire",
      "gestionnaire-paie-independant",
    ],
    rows: CABINETS_REGLEMENTES_ROWS,
  },
  {
    slugs: [
      "cabinet-de-conseil",
      "freelance",
      "consultant-independant",
      "coach-professionnel",
      "cabinet-qhse-conformite",
      "bureau-etudes",
      "cabinet-etudes",
      "consultant-data-bi",
      "daf-externalise",
      "office-manager-externalise",
      "assistant-administratif-externalise",
      "secretariat-externalise",
    ],
    rows: CONSEIL_EXPERT_ROWS,
  },
  {
    slugs: [
      "agence-marketing",
      "agence-web",
      "creation-de-contenu",
      "photographe-videaste",
      "studio-branding-design",
      "agence-seo",
      "agence-acquisition-paid-ads",
      "media",
    ],
    rows: AGENCES_DIGITALES_CREATION_ROWS,
  },
  {
    slugs: [
      "agence-de-recrutement",
      "cabinet-rh-externalise",
      "centre-appels-support-client",
    ],
    rows: SERVICES_RH_SUPPORT_ROWS,
  },
  {
    slugs: [
      "courtier-credit-assurance",
      "cabinet-assurance",
      "gestionnaire-de-patrimoine",
      "societe-recouvrement",
    ],
    rows: SERVICES_FINANCE_ASSURANCE_ROWS,
  },
  {
    slugs: [
      "integrateur-crm-erp",
      "infogerance-informatique",
      "cybersecurite-pme",
      "reparation-informatique-mobile",
      "saas",
    ],
    rows: SERVICES_TECH_B2B_ROWS,
  },
  {
    slugs: [
      "agence-immobiliere",
      "chasseur-immobilier",
    ],
    rows: IMMOBILIER_TRANSACTION_ROWS,
  },
  {
    slugs: [
      "diagnostiqueur-immobilier",
      "geometre",
      "architecte-maitre-oeuvre",
    ],
    rows: IMMOBILIER_EXPERTISE_ROWS,
  },
  {
    slugs: [
      "agence-de-voyage",
      "societe-domiciliation",
      "centre-affaires-coworking",
    ],
    rows: ACCUEIL_MEMBRES_ROWS,
  },
  {
    slugs: [
      "marchand-de-biens",
      "investissement-immobilier",
    ],
    rows: INVESTISSEMENT_IMMOBILIER_ROWS,
  },
  {
    slugs: [
      "investissement-financier",
      "investissement-entreprise",
    ],
    rows: INVESTISSEMENT_FINANCIER_ROWS,
  },
  {
    slugs: [
      "gestion-locative",
    ],
    rows: GESTION_LOCATIVE_ROWS,
  },
  {
    slugs: [
      "conciergerie-airbnb",
    ],
    rows: CONCIERGERIE_ROWS,
  },
  {
    slugs: [
      "evenementiel",
    ],
    rows: EVENT_PRESTATAIRES_ROWS,
  },
  {
    slugs: [
      "institut-de-beaute",
      "salon-de-coiffure",
      "esthetique",
    ],
    rows: SANTE_BIEN_ETRE_ROWS,
  },
  {
    slugs: [
      "salle-de-sport",
      "coach-sportif",
    ],
    rows: SPORT_ACCOMPAGNEMENT_ROWS,
  },
  {
    slugs: [
      "cabinet-medical",
      "cabinet-paramedical",
      "dentiste",
      "veterinaire",
      "osteopathe",
      "psychologue",
    ],
    rows: SANTE_CABINET_ROWS,
  },
  {
    slugs: [
      "pharmacie",
    ],
    rows: PHARMACIE_ROWS,
  },
  {
    slugs: [
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "infirmier-liberal",
    ],
    rows: DOMICILE_ACCOMPAGNEMENT_ROWS,
  },
  {
    slugs: [
      "creche",
    ],
    rows: PETITE_ENFANCE_ROWS,
  },
  {
    slugs: ["cfa"],
    rows: CFA_ROWS,
  },
  {
    slugs: ["organisme-de-formation"],
    rows: ORGANISME_FORMATION_ROWS,
  },
  {
    slugs: ["formation-en-ligne"],
    rows: FORMATION_EN_LIGNE_ROWS,
  },
  {
    slugs: ["auto-ecole"],
    rows: AUTO_ECOLE_ROWS,
  },
  {
    slugs: ["e-commerce"],
    rows: ECOMMERCE_ROWS,
  },
  {
    slugs: ["pressing"],
    rows: PRESSING_ROWS,
  },
  {
    slugs: ["laverie-automatique"],
    rows: LAVERIE_AUTOMATIQUE_ROWS,
  },
  {
    slugs: ["traiteur"],
    rows: FAST_FOOD_ROWS,
  },
  {
    slugs: ["marketplace"],
    rows: MARKETPLACE_ROWS,
  },
  {
    slugs: ["syndic"],
    rows: SYNDIC_ROWS,
  },
  {
    slugs: ["investissement-locatif"],
    rows: INVESTISSEMENT_IMMOBILIER_ROWS,
  },
  {
    slugs: ["demenagement", "livraison-dernier-kilometre", "transport-de-marchandise", "transport-de-personnes", "vtc"],
    rows: LOGISTIQUE_TRANSPORT_ROWS,
  },
  {
    slugs: ["production-industrie", "garage-automobile", "carrosserie"],
    rows: PRODUCTION_ATELIER_ROWS,
  },
  {
    slugs: ["hotel-hebergement-independant"],
    rows: HEBERGEMENT_ROWS,
  },
  {
    slugs: ["nettoyage-professionnel", "entreprise-de-securite"],
    rows: SECURITE_SERVICES_TERRAIN_ROWS,
  },
  {
    slugs: ["association"],
    rows: ASSOCIATION_ROWS,
  },
];

function getTemplateForSlug(slug: string) {
  return SYSTEME_TEMPLATES.find((template) => template.slugs.includes(slug)) ?? null;
}

function dedupeRows(rows: SystemeRow[]) {
  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = `${row.sectorSlug}::${row.pillar}::${row.process}::${row.document}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildSystemeDetail(enterprise: EnterpriseDefinition): SystemeDetail | null {
  const template = getTemplateForSlug(enterprise.slug);

  if (!template) {
    return null;
  }

  const rows = dedupeRows(
    template.rows.map((row) => ({
      sectorSlug: enterprise.slug,
      sectorName: enterprise.name,
      pillar: normalizeSystemePillar(row.pillar),
      process: row.process,
      document: row.document,
    })),
  );
  assertValidTemplateRows(rows);

  const cards = Array.from(groupSystemeRowsByPillar(rows).entries()).map(([pillar, groupedRows]) => ({
    pillar,
    items: groupedRows.map((row) => ({
      process: row.process,
      document: row.document,
    })),
  }));

  return { cards };
}
