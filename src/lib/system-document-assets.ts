type DocumentAsset = {
  csvHref?: string;
  downloadHref?: string;
};

const SYSTEM_DOCUMENT_GROUP_ALIASES: Record<string, string> = {
  "plomberie-chauffage": "batiment",
  "electricite-generale": "batiment",
  "renovation-interieur": "batiment",
  "menuiserie-agencement": "batiment",
  "maconnerie-gros-oeuvre": "batiment",
  paysagiste: "batiment",
  pisciniste: "batiment",
  couvreur: "batiment",
  "peintre-en-batiment": "batiment",
  carreleur: "batiment",
  climatisation: "batiment",
  serrurier: "batiment",
  "commerce-de-detail": "commerce",
  "commerce-alimentaire": "commerce",
  "boutique-specialisee": "commerce",
  "tabac-presse-point-relais": "commerce",
  opticien: "commerce",
  librairie: "commerce",
  fleuriste: "commerce",
  restaurant: "restauration",
  "fast-food": "restauration",
  "dark-kitchen": "restauration",
  boulangerie: "restauration",
  "bar-cafe": "restauration",
  "food-truck": "restauration",
  traiteur: "restauration",
  "cabinet-medical": "sante-cabinet",
  "cabinet-paramedical": "sante-cabinet",
  dentiste: "sante-cabinet",
  veterinaire: "sante-cabinet",
  osteopathe: "sante-cabinet",
  psychologue: "sante-cabinet",
  demenagement: "logistique-transport",
  "livraison-dernier-kilometre": "logistique-transport",
  "transport-de-marchandise": "logistique-transport",
  "transport-de-personnes": "logistique-transport",
  vtc: "logistique-transport",
  "agence-de-voyage": "accueil-membres",
  "centre-affaires-coworking": "accueil-membres",
  "services-a-la-personne": "domicile-accompagnement",
  "aide-a-domicile-menage": "domicile-accompagnement",
  "infirmier-liberal": "domicile-accompagnement",
  "institut-de-beaute": "sante-bien-etre",
  "salon-de-coiffure": "sante-bien-etre",
  esthetique: "sante-bien-etre",
  "production-industrie": "production-atelier",
  "garage-automobile": "production-atelier",
  carrosserie: "production-atelier",
  "nettoyage-professionnel": "securite-services-terrain",
  "entreprise-de-securite": "securite-services-terrain",
  "salle-de-sport": "sport-accompagnement",
  "coach-sportif": "sport-accompagnement",
  freelance: "cabinet-de-conseil",
  "consultant-independant": "cabinet-de-conseil",
  "coach-professionnel": "cabinet-de-conseil",
  "cabinet-qhse-conformite": "cabinet-de-conseil",
  "bureau-etudes": "cabinet-de-conseil",
  "cabinet-etudes": "cabinet-de-conseil",
  "consultant-data-bi": "cabinet-de-conseil",
  "daf-externalise": "cabinet-de-conseil",
  "office-manager-externalise": "cabinet-de-conseil",
  "assistant-administratif-externalise": "cabinet-de-conseil",
  "secretariat-externalise": "cabinet-de-conseil",
  notaire: "cabinet-davocat",
  "gestionnaire-paie-independant": "cabinet-comptable",
  "agence-marketing": "agence-digitale",
  "agence-web": "agence-digitale",
  "creation-de-contenu": "agence-digitale",
  "photographe-videaste": "agence-digitale",
  "studio-branding-design": "agence-digitale",
  "agence-seo": "agence-digitale",
  "agence-acquisition-paid-ads": "agence-digitale",
  media: "agence-digitale",
  "agence-de-recrutement": "services-rh-support",
  "cabinet-rh-externalise": "services-rh-support",
  "centre-appels-support-client": "services-rh-support",
  "courtier-credit-assurance": "services-finance-assurance",
  "cabinet-assurance": "services-finance-assurance",
  "gestionnaire-de-patrimoine": "services-finance-assurance",
  "societe-recouvrement": "services-finance-assurance",
  "integrateur-crm-erp": "services-tech-b2b",
  "infogerance-informatique": "services-tech-b2b",
  "cybersecurite-pme": "services-tech-b2b",
  "reparation-informatique-mobile": "services-tech-b2b",
  saas: "services-tech-b2b",
  "agence-immobiliere": "immobilier-transaction",
  "chasseur-immobilier": "immobilier-transaction",
  "diagnostiqueur-immobilier": "immobilier-expertise",
  geometre: "immobilier-expertise",
  "architecte-maitre-oeuvre": "immobilier-expertise",
  "marchand-de-biens": "investissement-immobilier",
  "investissement-locatif": "investissement-immobilier",
  "investissement-entreprise": "investissement-financier",
  "conciergerie-airbnb": "conciergerie",
};

function normalizeDocumentLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const SYSTEM_DOCUMENT_ASSETS: Record<string, Record<string, DocumentAsset>> = {
  batiment: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/batiment/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/batiment/01-vision-objectifs-annuels.xlsx",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/batiment/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/batiment/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/batiment/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/batiment/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/batiment/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/batiment/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche devis & argumentaire")]: {
      csvHref: "/systeme-documents/batiment/05-devis-argumentaire.csv",
      downloadHref: "/systeme-documents/batiment/05-devis-argumentaire.csv",
    },
    [normalizeDocumentLabel("Trame demande d'avis post-chantier")]: {
      csvHref: "/systeme-documents/batiment/06-demande-avis-post-chantier.csv",
      downloadHref: "/systeme-documents/batiment/06-demande-avis-post-chantier.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations")]: {
      csvHref: "/systeme-documents/batiment/07-traitement-reclamations.csv",
      downloadHref: "/systeme-documents/batiment/07-traitement-reclamations.csv",
    },
    [normalizeDocumentLabel("Fiche de suivi chantier")]: {
      csvHref: "/systeme-documents/batiment/08-suivi-chantier.csv",
      downloadHref: "/systeme-documents/batiment/08-suivi-chantier.csv",
    },
    [normalizeDocumentLabel("Checklist démarrage/réception")]: {
      csvHref: "/systeme-documents/batiment/09-demarrage-reception.csv",
      downloadHref: "/systeme-documents/batiment/09-demarrage-reception.csv",
    },
    [normalizeDocumentLabel("Fiches process par corps de métier")]: {
      csvHref: "/systeme-documents/batiment/10-process-corps-metier.csv",
      downloadHref: "/systeme-documents/batiment/10-process-corps-metier.csv",
    },
    [normalizeDocumentLabel("Procédure de gestion des aléas")]: {
      csvHref: "/systeme-documents/batiment/11-gestion-aleas.csv",
      downloadHref: "/systeme-documents/batiment/11-gestion-aleas.csv",
    },
    [normalizeDocumentLabel("Planning + Grille de polyvalence + Liste remplacement urgence")]: {
      csvHref: "/systeme-documents/batiment/12-planning-polyvalence-remplacement.csv",
      downloadHref: "/systeme-documents/batiment/12-planning-polyvalence-remplacement.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/batiment/13-integration-ecrit.csv",
      downloadHref: "/systeme-documents/batiment/13-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Fiche marge (devis vs réalisé)")]: {
      csvHref: "/systeme-documents/batiment/14-marge-devis-realise.csv",
      downloadHref: "/systeme-documents/batiment/14-marge-devis-realise.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/batiment/15-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/batiment/15-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Trame de relance impayés + Suivi acomptes/situations")]: {
      csvHref: "/systeme-documents/batiment/16-relance-impayes-acomptes-situations.csv",
      downloadHref: "/systeme-documents/batiment/16-relance-impayes-acomptes-situations.csv",
    },
    [normalizeDocumentLabel("Registre sécurité + Attestations d'assurance")]: {
      csvHref: "/systeme-documents/batiment/17-securite-assurances.csv",
      downloadHref: "/systeme-documents/batiment/17-securite-assurances.csv",
    },
    [normalizeDocumentLabel("Fiche suivi matériel + Grille fournisseurs (incl. contrôle réception)")]: {
      csvHref: "/systeme-documents/batiment/18-materiel-fournisseurs-reception.csv",
      downloadHref: "/systeme-documents/batiment/18-materiel-fournisseurs-reception.csv",
    },
  },
  commerce: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/commerce/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/commerce/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/commerce/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/commerce/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/commerce/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/commerce/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/commerce/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/commerce/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Calendrier de publication")]: {
      csvHref: "/systeme-documents/commerce/05-calendrier-publication.csv",
      downloadHref: "/systeme-documents/commerce/05-calendrier-publication.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire")]: {
      csvHref: "/systeme-documents/commerce/06-offre-argumentaire.csv",
      downloadHref: "/systeme-documents/commerce/06-offre-argumentaire.csv",
    },
    [normalizeDocumentLabel("Grille fidélité")]: {
      csvHref: "/systeme-documents/commerce/07-grille-fidelite.csv",
      downloadHref: "/systeme-documents/commerce/07-grille-fidelite.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations/retours")]: {
      csvHref: "/systeme-documents/commerce/08-reclamations-retours.csv",
      downloadHref: "/systeme-documents/commerce/08-reclamations-retours.csv",
    },
    [normalizeDocumentLabel("Checklist ouverture/fermeture")]: {
      csvHref: "/systeme-documents/commerce/09-ouverture-fermeture.csv",
      downloadHref: "/systeme-documents/commerce/09-ouverture-fermeture.csv",
    },
    [normalizeDocumentLabel("Fiches de poste (caisse, mise en rayon)")]: {
      csvHref: "/systeme-documents/commerce/10-postes-caisse-mise-en-rayon.csv",
      downloadHref: "/systeme-documents/commerce/10-postes-caisse-mise-en-rayon.csv",
    },
    [normalizeDocumentLabel("Standard merchandising/vitrine")]: {
      csvHref: "/systeme-documents/commerce/11-merchandising-vitrine.csv",
      downloadHref: "/systeme-documents/commerce/11-merchandising-vitrine.csv",
    },
    [normalizeDocumentLabel("Seuils de stock + Grille de réassort")]: {
      csvHref: "/systeme-documents/commerce/12-stocks-reassort.csv",
      downloadHref: "/systeme-documents/commerce/12-stocks-reassort.csv",
    },
    [normalizeDocumentLabel("Fiche inventaire")]: {
      csvHref: "/systeme-documents/commerce/13-inventaire.csv",
      downloadHref: "/systeme-documents/commerce/13-inventaire.csv",
    },
    [normalizeDocumentLabel("Planning + Grille de polyvalence + Liste remplacement urgence")]: {
      csvHref: "/systeme-documents/commerce/14-planning-polyvalence-remplacement.csv",
      downloadHref: "/systeme-documents/commerce/14-planning-polyvalence-remplacement.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/commerce/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/commerce/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi CA quotidien + Suivi marge produit")]: {
      csvHref: "/systeme-documents/commerce/16-ca-marge-produit.csv",
      downloadHref: "/systeme-documents/commerce/16-ca-marge-produit.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/commerce/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/commerce/17-calendrier-echeances.csv",
    },
  },
  restauration: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/restauration/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/restauration/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/restauration/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/restauration/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/restauration/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/restauration/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/restauration/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/restauration/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Calendrier de publication réseaux sociaux")]: {
      csvHref: "/systeme-documents/restauration/05-calendrier-publication-reseaux.csv",
      downloadHref: "/systeme-documents/restauration/05-calendrier-publication-reseaux.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (menu, promo)")]: {
      csvHref: "/systeme-documents/restauration/06-offre-argumentaire-menu-promo.csv",
      downloadHref: "/systeme-documents/restauration/06-offre-argumentaire-menu-promo.csv",
    },
    [normalizeDocumentLabel("Grille fidélité + Trame réponse avis Google (48h)")]: {
      csvHref: "/systeme-documents/restauration/07-fidelite-reponse-avis.csv",
      downloadHref: "/systeme-documents/restauration/07-fidelite-reponse-avis.csv",
    },
    [normalizeDocumentLabel("Registre des non-conformités/réclamations (usage client)")]: {
      csvHref: "/systeme-documents/restauration/08-non-conformites-reclamations-client.csv",
      downloadHref: "/systeme-documents/restauration/08-non-conformites-reclamations-client.csv",
    },
    [normalizeDocumentLabel("Checklist ouverture/fermeture")]: {
      csvHref: "/systeme-documents/restauration/09-ouverture-fermeture.csv",
      downloadHref: "/systeme-documents/restauration/09-ouverture-fermeture.csv",
    },
    [normalizeDocumentLabel("Fiches recette")]: {
      csvHref: "/systeme-documents/restauration/10-fiches-recette.csv",
      downloadHref: "/systeme-documents/restauration/10-fiches-recette.csv",
    },
    [normalizeDocumentLabel("Fiches de poste par station")]: {
      csvHref: "/systeme-documents/restauration/11-fiches-poste-station.csv",
      downloadHref: "/systeme-documents/restauration/11-fiches-poste-station.csv",
    },
    [normalizeDocumentLabel("Seuils de stock minimum")]: {
      csvHref: "/systeme-documents/restauration/12-seuils-stock-minimum.csv",
      downloadHref: "/systeme-documents/restauration/12-seuils-stock-minimum.csv",
    },
    [normalizeDocumentLabel("Contrôle qualité aléatoire (photo dressage)")]: {
      csvHref: "/systeme-documents/restauration/13-controle-qualite-dressage.csv",
      downloadHref: "/systeme-documents/restauration/13-controle-qualite-dressage.csv",
    },
    [normalizeDocumentLabel("Planning + Grille de polyvalence + Liste remplacement urgence")]: {
      csvHref: "/systeme-documents/restauration/14-planning-polyvalence-remplacement.csv",
      downloadHref: "/systeme-documents/restauration/14-planning-polyvalence-remplacement.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/restauration/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/restauration/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi CA quotidien + Food cost hebdo")]: {
      csvHref: "/systeme-documents/restauration/16-ca-food-cost.csv",
      downloadHref: "/systeme-documents/restauration/16-ca-food-cost.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/restauration/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/restauration/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Relevés température + Plan de nettoyage HACCP")]: {
      csvHref: "/systeme-documents/restauration/18-temperatures-nettoyage-haccp.csv",
      downloadHref: "/systeme-documents/restauration/18-temperatures-nettoyage-haccp.csv",
    },
    [normalizeDocumentLabel("Registre des non-conformités/réclamations (usage hygiène)")]: {
      csvHref: "/systeme-documents/restauration/19-non-conformites-hygiene.csv",
      downloadHref: "/systeme-documents/restauration/19-non-conformites-hygiene.csv",
    },
    [normalizeDocumentLabel("Contrat maintenance + Checklist entretien préventif")]: {
      csvHref: "/systeme-documents/restauration/20-maintenance-entretien-preventif.csv",
      downloadHref: "/systeme-documents/restauration/20-maintenance-entretien-preventif.csv",
    },
  },
  "sante-cabinet": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/sante-cabinet/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/sante-cabinet/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/sante-cabinet/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/sante-cabinet/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/sante-cabinet/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/sante-cabinet/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Parcours patient/bénéficiaire + Standard accueil")]: {
      csvHref: "/systeme-documents/sante-cabinet/04-parcours-patient-accueil.csv",
      downloadHref: "/systeme-documents/sante-cabinet/04-parcours-patient-accueil.csv",
    },
    [normalizeDocumentLabel("Registre réclamations/signalements + Trame de réponse")]: {
      csvHref: "/systeme-documents/sante-cabinet/05-reclamations-signalements-reponse.csv",
      downloadHref: "/systeme-documents/sante-cabinet/05-reclamations-signalements-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist dossier patient + Consentements + Pièces")]: {
      csvHref: "/systeme-documents/sante-cabinet/06-dossier-patient-consentements-pieces.csv",
      downloadHref: "/systeme-documents/sante-cabinet/06-dossier-patient-consentements-pieces.csv",
    },
    [normalizeDocumentLabel("Fiche déroulé consultation/soin + Journal de suivi")]: {
      csvHref: "/systeme-documents/sante-cabinet/07-deroule-consultation-soin-suivi.csv",
      downloadHref: "/systeme-documents/sante-cabinet/07-deroule-consultation-soin-suivi.csv",
    },
    [normalizeDocumentLabel("Checklist matériel/stérilisation + Registre stock")]: {
      csvHref: "/systeme-documents/sante-cabinet/08-materiel-sterilisation-stock.csv",
      downloadHref: "/systeme-documents/sante-cabinet/08-materiel-sterilisation-stock.csv",
    },
    [normalizeDocumentLabel("Planning cabinet + Fiche de passation")]: {
      csvHref: "/systeme-documents/sante-cabinet/09-planning-cabinet-passation.csv",
      downloadHref: "/systeme-documents/sante-cabinet/09-planning-cabinet-passation.csv",
    },
    [normalizeDocumentLabel("Suivi actes, facturation, tiers payant ou règlements")]: {
      csvHref: "/systeme-documents/sante-cabinet/10-actes-facturation-tiers-payant-reglements.csv",
      downloadHref: "/systeme-documents/sante-cabinet/10-actes-facturation-tiers-payant-reglements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/sante-cabinet/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/sante-cabinet/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier confidentialité, affichages et obligations métier")]: {
      csvHref: "/systeme-documents/sante-cabinet/12-confidentialite-affichages-obligations.csv",
      downloadHref: "/systeme-documents/sante-cabinet/12-confidentialite-affichages-obligations.csv",
    },
  },
  "logistique-transport": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/logistique-transport/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/logistique-transport/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/logistique-transport/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/logistique-transport/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Point de pilotage hebdomadaire")]: {
      csvHref: "/systeme-documents/logistique-transport/03-point-pilotage-hebdomadaire.csv",
      downloadHref: "/systeme-documents/logistique-transport/03-point-pilotage-hebdomadaire.csv",
    },
    [normalizeDocumentLabel("Fiche devis, mission ou tournée")]: {
      csvHref: "/systeme-documents/logistique-transport/04-devis-mission-tournee.csv",
      downloadHref: "/systeme-documents/logistique-transport/04-devis-mission-tournee.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations")]: {
      csvHref: "/systeme-documents/logistique-transport/05-traitement-reclamations.csv",
      downloadHref: "/systeme-documents/logistique-transport/05-traitement-reclamations.csv",
    },
    [normalizeDocumentLabel("Planning d'exploitation + Affectation véhicules/chauffeurs")]: {
      csvHref: "/systeme-documents/logistique-transport/06-planning-exploitation-affectation.csv",
      downloadHref: "/systeme-documents/logistique-transport/06-planning-exploitation-affectation.csv",
    },
    [normalizeDocumentLabel("Fiche incident, retard ou imprévu")]: {
      csvHref: "/systeme-documents/logistique-transport/07-incident-retard-imprevu.csv",
      downloadHref: "/systeme-documents/logistique-transport/07-incident-retard-imprevu.csv",
    },
    [normalizeDocumentLabel("Checklist de fin de mission + Preuve de livraison/service")]: {
      csvHref: "/systeme-documents/logistique-transport/08-fin-mission-preuve-livraison.csv",
      downloadHref: "/systeme-documents/logistique-transport/08-fin-mission-preuve-livraison.csv",
    },
    [normalizeDocumentLabel("Planning + Liste de remplacement urgence + Consignes terrain")]: {
      csvHref: "/systeme-documents/logistique-transport/09-remplacement-urgence-consignes-terrain.csv",
      downloadHref: "/systeme-documents/logistique-transport/09-remplacement-urgence-consignes-terrain.csv",
    },
    [normalizeDocumentLabel("Suivi CA, coûts carburant, kilomètres ou marge par mission")]: {
      csvHref: "/systeme-documents/logistique-transport/10-ca-couts-kilometres-marge.csv",
      downloadHref: "/systeme-documents/logistique-transport/10-ca-couts-kilometres-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/logistique-transport/11-echeances-relance-impayes.csv",
      downloadHref: "/systeme-documents/logistique-transport/11-echeances-relance-impayes.csv",
    },
  },
  "accueil-membres": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/accueil-membres/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/accueil-membres/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/accueil-membres/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/accueil-membres/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/accueil-membres/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/accueil-membres/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche découverte client + Disponibilités")]: {
      csvHref: "/systeme-documents/accueil-membres/04-decouverte-client-disponibilites.csv",
      downloadHref: "/systeme-documents/accueil-membres/04-decouverte-client-disponibilites.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Conditions")]: {
      csvHref: "/systeme-documents/accueil-membres/05-offre-argumentaire-conditions.csv",
      downloadHref: "/systeme-documents/accueil-membres/05-offre-argumentaire-conditions.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/accueil-membres/06-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/accueil-membres/06-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist entrée client + Contrat/adhésion")]: {
      csvHref: "/systeme-documents/accueil-membres/07-entree-client-contrat-adhesion.csv",
      downloadHref: "/systeme-documents/accueil-membres/07-entree-client-contrat-adhesion.csv",
    },
    [normalizeDocumentLabel("Planning réservations/services + Procédure exécution")]: {
      csvHref: "/systeme-documents/accueil-membres/08-reservations-services-execution.csv",
      downloadHref: "/systeme-documents/accueil-membres/08-reservations-services-execution.csv",
    },
    [normalizeDocumentLabel("Journal incidents + Suivi renouvellements")]: {
      csvHref: "/systeme-documents/accueil-membres/09-incidents-renouvellements.csv",
      downloadHref: "/systeme-documents/accueil-membres/09-incidents-renouvellements.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Grille de rôles")]: {
      csvHref: "/systeme-documents/accueil-membres/10-planning-equipe-grille-roles.csv",
      downloadHref: "/systeme-documents/accueil-membres/10-planning-equipe-grille-roles.csv",
    },
    [normalizeDocumentLabel("Suivi contrats, paiements et relances")]: {
      csvHref: "/systeme-documents/accueil-membres/11-contrats-paiements-relances.csv",
      downloadHref: "/systeme-documents/accueil-membres/11-contrats-paiements-relances.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/accueil-membres/12-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/accueil-membres/12-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier conformité, CGV, RGPD et justificatifs")]: {
      csvHref: "/systeme-documents/accueil-membres/13-conformite-cgv-rgpd-justificatifs.csv",
      downloadHref: "/systeme-documents/accueil-membres/13-conformite-cgv-rgpd-justificatifs.csv",
    },
  },
  "domicile-accompagnement": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche découverte + Besoins + Cadre d'intervention")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/04-decouverte-besoins-cadre-intervention.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/04-decouverte-besoins-cadre-intervention.csv",
    },
    [normalizeDocumentLabel("Registre réclamations/signalements + Trame de réponse")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/05-reclamations-signalements-reponse.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/05-reclamations-signalements-reponse.csv",
    },
    [normalizeDocumentLabel("Planning interventions/tournées + Priorités")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/06-planning-interventions-tournees-priorites.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/06-planning-interventions-tournees-priorites.csv",
    },
    [normalizeDocumentLabel("Fiche consignes + Journal d'intervention/soin")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/07-consignes-journal-intervention-soin.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/07-consignes-journal-intervention-soin.csv",
    },
    [normalizeDocumentLabel("Registre matériel + Procédure incident")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/08-materiel-procedure-incident.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/08-materiel-procedure-incident.csv",
    },
    [normalizeDocumentLabel("Planning + Liste remplacement + Fiche de passation")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/09-remplacement-passation.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/09-remplacement-passation.csv",
    },
    [normalizeDocumentLabel("Suivi heures/interventions, facturation et règlements")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/10-heures-interventions-facturation-reglements.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/10-heures-interventions-facturation-reglements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier bénéficiaire/patient + Pièces et justificatifs")]: {
      csvHref: "/systeme-documents/domicile-accompagnement/12-beneficiaire-patient-pieces-justificatifs.csv",
      downloadHref: "/systeme-documents/domicile-accompagnement/12-beneficiaire-patient-pieces-justificatifs.csv",
    },
  },
  "sante-bien-etre": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/sante-bien-etre/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/sante-bien-etre/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/sante-bien-etre/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/sante-bien-etre/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Calendrier de publication")]: {
      csvHref: "/systeme-documents/sante-bien-etre/05-calendrier-publication.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/05-calendrier-publication.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (grille tarifaire)")]: {
      csvHref: "/systeme-documents/sante-bien-etre/06-offre-argumentaire-grille-tarifaire.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/06-offre-argumentaire-grille-tarifaire.csv",
    },
    [normalizeDocumentLabel("Système de réservation + Relance no-show")]: {
      csvHref: "/systeme-documents/sante-bien-etre/07-reservation-relance-no-show.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/07-reservation-relance-no-show.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations")]: {
      csvHref: "/systeme-documents/sante-bien-etre/08-traitement-reclamations.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/08-traitement-reclamations.csv",
    },
    [normalizeDocumentLabel("Checklist ouverture/fermeture")]: {
      csvHref: "/systeme-documents/sante-bien-etre/09-ouverture-fermeture.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/09-ouverture-fermeture.csv",
    },
    [normalizeDocumentLabel("Fiches process par prestation")]: {
      csvHref: "/systeme-documents/sante-bien-etre/10-process-prestations.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/10-process-prestations.csv",
    },
    [normalizeDocumentLabel("Planning + Grille polyvalence + Liste remplacement")]: {
      csvHref: "/systeme-documents/sante-bien-etre/11-planning-polyvalence-remplacement.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/11-planning-polyvalence-remplacement.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/sante-bien-etre/12-integration-ecrit.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/12-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi CA quotidien")]: {
      csvHref: "/systeme-documents/sante-bien-etre/13-suivi-ca-quotidien.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/13-suivi-ca-quotidien.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/sante-bien-etre/14-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/14-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Fiche traçabilité produits + Protocole stérilisation")]: {
      csvHref: "/systeme-documents/sante-bien-etre/15-tracabilite-produits-sterilisation.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/15-tracabilite-produits-sterilisation.csv",
    },
    [normalizeDocumentLabel("Dossier RC pro + Diplômes/qualifications obligatoires + Affichages réglementaires")]: {
      csvHref: "/systeme-documents/sante-bien-etre/16-rc-pro-diplomes-affichages.csv",
      downloadHref: "/systeme-documents/sante-bien-etre/16-rc-pro-diplomes-affichages.csv",
    },
  },
  "production-atelier": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/production-atelier/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/production-atelier/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/production-atelier/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/production-atelier/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche devis & argumentaire")]: {
      csvHref: "/systeme-documents/production-atelier/03-devis-argumentaire.csv",
      downloadHref: "/systeme-documents/production-atelier/03-devis-argumentaire.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations")]: {
      csvHref: "/systeme-documents/production-atelier/04-traitement-reclamations.csv",
      downloadHref: "/systeme-documents/production-atelier/04-traitement-reclamations.csv",
    },
    [normalizeDocumentLabel("Ordre de fabrication/intervention + Checklist de clôture")]: {
      csvHref: "/systeme-documents/production-atelier/05-ordre-fabrication-intervention-cloture.csv",
      downloadHref: "/systeme-documents/production-atelier/05-ordre-fabrication-intervention-cloture.csv",
    },
    [normalizeDocumentLabel("Grille de contrôle qualité + Registre non-conformités")]: {
      csvHref: "/systeme-documents/production-atelier/06-controle-qualite-non-conformites.csv",
      downloadHref: "/systeme-documents/production-atelier/06-controle-qualite-non-conformites.csv",
    },
    [normalizeDocumentLabel("Seuils de stock + Grille de réapprovisionnement")]: {
      csvHref: "/systeme-documents/production-atelier/07-stocks-reapprovisionnement.csv",
      downloadHref: "/systeme-documents/production-atelier/07-stocks-reapprovisionnement.csv",
    },
    [normalizeDocumentLabel("Planning atelier + Fiches de poste")]: {
      csvHref: "/systeme-documents/production-atelier/08-planning-atelier-fiches-poste.csv",
      downloadHref: "/systeme-documents/production-atelier/08-planning-atelier-fiches-poste.csv",
    },
    [normalizeDocumentLabel("Suivi coûts matière, main-d'oeuvre et marge")]: {
      csvHref: "/systeme-documents/production-atelier/09-couts-matiere-main-oeuvre-marge.csv",
      downloadHref: "/systeme-documents/production-atelier/09-couts-matiere-main-oeuvre-marge.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/production-atelier/10-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/production-atelier/10-facturation-relance-impayes.csv",
    },
    [normalizeDocumentLabel("Checklist maintenance préventive + Contrats de maintenance")]: {
      csvHref: "/systeme-documents/production-atelier/11-maintenance-preventive-contrats.csv",
      downloadHref: "/systeme-documents/production-atelier/11-maintenance-preventive-contrats.csv",
    },
  },
  "securite-services-terrain": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/securite-services-terrain/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/securite-services-terrain/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche offre, devis et cahier des charges client")]: {
      csvHref: "/systeme-documents/securite-services-terrain/03-offre-devis-cahier-charges-client.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/03-offre-devis-cahier-charges-client.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations")]: {
      csvHref: "/systeme-documents/securite-services-terrain/04-traitement-reclamations.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/04-traitement-reclamations.csv",
    },
    [normalizeDocumentLabel("Planning d'intervention + Consignes site")]: {
      csvHref: "/systeme-documents/securite-services-terrain/05-planning-intervention-consignes-site.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/05-planning-intervention-consignes-site.csv",
    },
    [normalizeDocumentLabel("Fiche de contrôle qualité ou main courante")]: {
      csvHref: "/systeme-documents/securite-services-terrain/06-controle-qualite-main-courante.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/06-controle-qualite-main-courante.csv",
    },
    [normalizeDocumentLabel("Planning + Liste remplacement urgence + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/securite-services-terrain/07-remplacement-urgence-polyvalence.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/07-remplacement-urgence-polyvalence.csv",
    },
    [normalizeDocumentLabel("Suivi heures, coûts et marge par contrat")]: {
      csvHref: "/systeme-documents/securite-services-terrain/08-heures-couts-marge-contrat.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/08-heures-couts-marge-contrat.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/securite-services-terrain/09-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/securite-services-terrain/09-facturation-relance-impayes.csv",
    },
  },
  "sport-accompagnement": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/sport-accompagnement/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/sport-accompagnement/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/sport-accompagnement/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Calendrier acquisition + Fiche découverte")]: {
      csvHref: "/systeme-documents/sport-accompagnement/04-acquisition-decouverte.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/04-acquisition-decouverte.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Conditions")]: {
      csvHref: "/systeme-documents/sport-accompagnement/05-offre-argumentaire-conditions.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/05-offre-argumentaire-conditions.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/sport-accompagnement/06-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/06-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Planning séances/cours + Trame programme")]: {
      csvHref: "/systeme-documents/sport-accompagnement/07-seances-cours-programme.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/07-seances-cours-programme.csv",
    },
    [normalizeDocumentLabel("Fiche suivi client/adhérent + Journal séances")]: {
      csvHref: "/systeme-documents/sport-accompagnement/08-suivi-client-adherent-journal-seances.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/08-suivi-client-adherent-journal-seances.csv",
    },
    [normalizeDocumentLabel("Checklist matériel/locaux + Registre entretien")]: {
      csvHref: "/systeme-documents/sport-accompagnement/09-materiel-locaux-entretien.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/09-materiel-locaux-entretien.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Liste de remplacement")]: {
      csvHref: "/systeme-documents/sport-accompagnement/10-planning-equipe-remplacement.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/10-planning-equipe-remplacement.csv",
    },
    [normalizeDocumentLabel("Suivi abonnements, encaissements et marge")]: {
      csvHref: "/systeme-documents/sport-accompagnement/11-abonnements-encaissements-marge.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/11-abonnements-encaissements-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/sport-accompagnement/12-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/12-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier sécurité, assurances et affichages")]: {
      csvHref: "/systeme-documents/sport-accompagnement/13-securite-assurances-affichages.csv",
      downloadHref: "/systeme-documents/sport-accompagnement/13-securite-assurances-affichages.csv",
    },
  },
  "cabinet-comptable": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/cabinet-comptable/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/cabinet-comptable/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/cabinet-comptable/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/cabinet-comptable/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospects, prescripteurs et relances")]: {
      csvHref: "/systeme-documents/cabinet-comptable/05-suivi-prospects-prescripteurs-relances.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/05-suivi-prospects-prescripteurs-relances.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Lettre de mission type")]: {
      csvHref: "/systeme-documents/cabinet-comptable/06-offre-argumentaire-lettre-mission.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/06-offre-argumentaire-lettre-mission.csv",
    },
    [normalizeDocumentLabel("Trame de suivi client + Demande d'avis")]: {
      csvHref: "/systeme-documents/cabinet-comptable/07-suivi-client-demande-avis.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/07-suivi-client-demande-avis.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/cabinet-comptable/08-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/08-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist ouverture dossier + Pièces attendues")]: {
      csvHref: "/systeme-documents/cabinet-comptable/09-ouverture-dossier-pieces-attendues.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/09-ouverture-dossier-pieces-attendues.csv",
    },
    [normalizeDocumentLabel("Grille de contrôle qualité + Fiches process par mission")]: {
      csvHref: "/systeme-documents/cabinet-comptable/10-controle-qualite-process-mission.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/10-controle-qualite-process-mission.csv",
    },
    [normalizeDocumentLabel("Calendrier échéances + Suivi relances")]: {
      csvHref: "/systeme-documents/cabinet-comptable/11-echeances-suivi-relances.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/11-echeances-suivi-relances.csv",
    },
    [normalizeDocumentLabel("Journal dossier + Historique validations")]: {
      csvHref: "/systeme-documents/cabinet-comptable/12-journal-dossier-validations.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/12-journal-dossier-validations.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/cabinet-comptable/13-planning-charge-polyvalence.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/13-planning-charge-polyvalence.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de dossier")]: {
      csvHref: "/systeme-documents/cabinet-comptable/14-passation-dossier.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/14-passation-dossier.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/cabinet-comptable/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi temps passé, honoraires et marge")]: {
      csvHref: "/systeme-documents/cabinet-comptable/16-rentabilite-dossiers.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/16-rentabilite-dossiers.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/cabinet-comptable/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/cabinet-comptable/18-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/18-facturation-relance-impayes.csv",
    },
    [normalizeDocumentLabel("Registre RGPD + RC pro + Procédure confidentialité")]: {
      csvHref: "/systeme-documents/cabinet-comptable/19-conformite-confidentialite.csv",
      downloadHref: "/systeme-documents/cabinet-comptable/19-conformite-confidentialite.csv",
    },
  },
  "cabinet-davocat": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/cabinet-davocat/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/cabinet-davocat/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/cabinet-davocat/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/cabinet-davocat/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospects, prescripteurs et relances")]: {
      csvHref: "/systeme-documents/cabinet-davocat/05-suivi-prospects-prescripteurs-relances.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/05-suivi-prospects-prescripteurs-relances.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Lettre de mission type")]: {
      csvHref: "/systeme-documents/cabinet-davocat/06-offre-argumentaire-lettre-mission.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/06-offre-argumentaire-lettre-mission.csv",
    },
    [normalizeDocumentLabel("Trame de suivi client + Demande d'avis")]: {
      csvHref: "/systeme-documents/cabinet-davocat/07-suivi-client-demande-avis.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/07-suivi-client-demande-avis.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/cabinet-davocat/08-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/08-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist ouverture dossier + Pièces attendues")]: {
      csvHref: "/systeme-documents/cabinet-davocat/09-ouverture-dossier-pieces-attendues.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/09-ouverture-dossier-pieces-attendues.csv",
    },
    [normalizeDocumentLabel("Grille de contrôle qualité + Fiches process par mission")]: {
      csvHref: "/systeme-documents/cabinet-davocat/10-controle-qualite-process-mission.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/10-controle-qualite-process-mission.csv",
    },
    [normalizeDocumentLabel("Calendrier échéances + Suivi relances")]: {
      csvHref: "/systeme-documents/cabinet-davocat/11-echeances-suivi-relances.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/11-echeances-suivi-relances.csv",
    },
    [normalizeDocumentLabel("Journal dossier + Historique validations")]: {
      csvHref: "/systeme-documents/cabinet-davocat/12-journal-dossier-validations.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/12-journal-dossier-validations.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/cabinet-davocat/13-planning-charge-polyvalence.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/13-planning-charge-polyvalence.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de dossier")]: {
      csvHref: "/systeme-documents/cabinet-davocat/14-passation-dossier.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/14-passation-dossier.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/cabinet-davocat/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi temps passé, honoraires et marge")]: {
      csvHref: "/systeme-documents/cabinet-davocat/16-rentabilite-dossiers.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/16-rentabilite-dossiers.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/cabinet-davocat/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/cabinet-davocat/18-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/18-facturation-relance-impayes.csv",
    },
    [normalizeDocumentLabel("Registre RGPD + RC pro + Procédure confidentialité")]: {
      csvHref: "/systeme-documents/cabinet-davocat/19-conformite-confidentialite.csv",
      downloadHref: "/systeme-documents/cabinet-davocat/19-conformite-confidentialite.csv",
    },
  },
  "cabinet-de-conseil": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospects, devis et recommandations")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/05-suivi-prospects-devis-recommandations.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/05-suivi-prospects-devis-recommandations.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Proposition commerciale type")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/06-offre-argumentaire-proposition-commerciale.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/06-offre-argumentaire-proposition-commerciale.csv",
    },
    [normalizeDocumentLabel("Trame de suivi post-mission + Relances")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/07-suivi-post-mission-relances.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/07-suivi-post-mission-relances.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/08-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/08-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Note de cadrage + Checklist lancement")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/09-cadrage-checklist-lancement.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/09-cadrage-checklist-lancement.csv",
    },
    [normalizeDocumentLabel("Liste de pièces / données attendues + Relances")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/10-pieces-donnees-relances.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/10-pieces-donnees-relances.csv",
    },
    [normalizeDocumentLabel("Trame de livrable + Standard qualité")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/11-livrable-standard-qualite.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/11-livrable-standard-qualite.csv",
    },
    [normalizeDocumentLabel("Compte rendu de restitution + Plan d'actions")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/12-restitution-plan-actions.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/12-restitution-plan-actions.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/13-planning-charge-polyvalence.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/13-planning-charge-polyvalence.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de mission")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/14-passation-mission.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/14-passation-mission.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi devis, facturation, temps passé et marge")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/16-marge-missions.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/16-marge-missions.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/18-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/18-facturation-relance-impayes.csv",
    },
    [normalizeDocumentLabel("Dossier contractuel + RGPD + NDA si besoin")]: {
      csvHref: "/systeme-documents/cabinet-de-conseil/19-conformite-contrats-rgpd.csv",
      downloadHref: "/systeme-documents/cabinet-de-conseil/19-conformite-contrats-rgpd.csv",
    },
  },
  "agence-digitale": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/agence-digitale/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/agence-digitale/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/agence-digitale/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/agence-digitale/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/agence-digitale/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/agence-digitale/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/agence-digitale/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/agence-digitale/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche prospection + Qualification brief")]: {
      csvHref: "/systeme-documents/agence-digitale/05-prospection-qualification-brief.csv",
      downloadHref: "/systeme-documents/agence-digitale/05-prospection-qualification-brief.csv",
    },
    [normalizeDocumentLabel("Proposition commerciale + Cadre de validation")]: {
      csvHref: "/systeme-documents/agence-digitale/06-proposition-commerciale-validation.csv",
      downloadHref: "/systeme-documents/agence-digitale/06-proposition-commerciale-validation.csv",
    },
    [normalizeDocumentLabel("Trame de suivi post-livraison + Plan de récurrence")]: {
      csvHref: "/systeme-documents/agence-digitale/07-suivi-post-livraison-recurrence.csv",
      downloadHref: "/systeme-documents/agence-digitale/07-suivi-post-livraison-recurrence.csv",
    },
    [normalizeDocumentLabel("Registre retours client + Trame de réponse")]: {
      csvHref: "/systeme-documents/agence-digitale/08-retours-client-reponse.csv",
      downloadHref: "/systeme-documents/agence-digitale/08-retours-client-reponse.csv",
    },
    [normalizeDocumentLabel("Brief projet + Checklist lancement")]: {
      csvHref: "/systeme-documents/agence-digitale/09-brief-projet-lancement.csv",
      downloadHref: "/systeme-documents/agence-digitale/09-brief-projet-lancement.csv",
    },
    [normalizeDocumentLabel("Planning production + Fiches process par type de livrable")]: {
      csvHref: "/systeme-documents/agence-digitale/10-planning-production-livrables.csv",
      downloadHref: "/systeme-documents/agence-digitale/10-planning-production-livrables.csv",
    },
    [normalizeDocumentLabel("Circuit de validation + Bon de livraison")]: {
      csvHref: "/systeme-documents/agence-digitale/11-validation-livraison.csv",
      downloadHref: "/systeme-documents/agence-digitale/11-validation-livraison.csv",
    },
    [normalizeDocumentLabel("Reporting performance + Journal d'itérations")]: {
      csvHref: "/systeme-documents/agence-digitale/12-reporting-iterations.csv",
      downloadHref: "/systeme-documents/agence-digitale/12-reporting-iterations.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de rôles")]: {
      csvHref: "/systeme-documents/agence-digitale/13-planning-charge-roles.csv",
      downloadHref: "/systeme-documents/agence-digitale/13-planning-charge-roles.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de projet")]: {
      csvHref: "/systeme-documents/agence-digitale/14-passation-projet.csv",
      downloadHref: "/systeme-documents/agence-digitale/14-passation-projet.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/agence-digitale/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/agence-digitale/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi devis, temps passé, achats et marge")]: {
      csvHref: "/systeme-documents/agence-digitale/16-marge-projet.csv",
      downloadHref: "/systeme-documents/agence-digitale/16-marge-projet.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/agence-digitale/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/agence-digitale/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi acomptes, facturation et relances")]: {
      csvHref: "/systeme-documents/agence-digitale/18-facturation-relances.csv",
      downloadHref: "/systeme-documents/agence-digitale/18-facturation-relances.csv",
    },
    [normalizeDocumentLabel("Dossier contrats, cession de droits et accès outils")]: {
      csvHref: "/systeme-documents/agence-digitale/19-contrats-droits-acces.csv",
      downloadHref: "/systeme-documents/agence-digitale/19-contrats-droits-acces.csv",
    },
  },
  "services-rh-support": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/services-rh-support/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/services-rh-support/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/services-rh-support/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/services-rh-support/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/services-rh-support/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/services-rh-support/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/services-rh-support/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/services-rh-support/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche besoin client + Niveau de service attendu")]: {
      csvHref: "/systeme-documents/services-rh-support/05-besoin-client-niveau-service.csv",
      downloadHref: "/systeme-documents/services-rh-support/05-besoin-client-niveau-service.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Grille tarifaire")]: {
      csvHref: "/systeme-documents/services-rh-support/06-offre-argumentaire-grille-tarifaire.csv",
      downloadHref: "/systeme-documents/services-rh-support/06-offre-argumentaire-grille-tarifaire.csv",
    },
    [normalizeDocumentLabel("Trame de suivi client + Point récurrent")]: {
      csvHref: "/systeme-documents/services-rh-support/07-suivi-client-point-recurrent.csv",
      downloadHref: "/systeme-documents/services-rh-support/07-suivi-client-point-recurrent.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/services-rh-support/08-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/services-rh-support/08-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist entrée de demande + Priorisation")]: {
      csvHref: "/systeme-documents/services-rh-support/09-entree-demande-priorisation.csv",
      downloadHref: "/systeme-documents/services-rh-support/09-entree-demande-priorisation.csv",
    },
    [normalizeDocumentLabel("Workflow opérationnel + Checklist d'exécution")]: {
      csvHref: "/systeme-documents/services-rh-support/10-workflow-execution.csv",
      downloadHref: "/systeme-documents/services-rh-support/10-workflow-execution.csv",
    },
    [normalizeDocumentLabel("Tableau suivi SLA / étapes + Relances")]: {
      csvHref: "/systeme-documents/services-rh-support/11-suivi-sla-relances.csv",
      downloadHref: "/systeme-documents/services-rh-support/11-suivi-sla-relances.csv",
    },
    [normalizeDocumentLabel("Journal dossier + Base de connaissance")]: {
      csvHref: "/systeme-documents/services-rh-support/12-journal-base-connaissance.csv",
      downloadHref: "/systeme-documents/services-rh-support/12-journal-base-connaissance.csv",
    },
    [normalizeDocumentLabel("Planning + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/services-rh-support/13-planning-polyvalence.csv",
      downloadHref: "/systeme-documents/services-rh-support/13-planning-polyvalence.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de dossier")]: {
      csvHref: "/systeme-documents/services-rh-support/14-passation-dossier.csv",
      downloadHref: "/systeme-documents/services-rh-support/14-passation-dossier.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/services-rh-support/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/services-rh-support/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi facturation, temps et marge par compte")]: {
      csvHref: "/systeme-documents/services-rh-support/16-rentabilite-comptes.csv",
      downloadHref: "/systeme-documents/services-rh-support/16-rentabilite-comptes.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/services-rh-support/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/services-rh-support/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Trame de relance impayés")]: {
      csvHref: "/systeme-documents/services-rh-support/18-facturation-relance-impayes.csv",
      downloadHref: "/systeme-documents/services-rh-support/18-facturation-relance-impayes.csv",
    },
  },
  "services-finance-assurance": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/services-finance-assurance/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/services-finance-assurance/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/services-finance-assurance/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/services-finance-assurance/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche découverte client + Pièces attendues")]: {
      csvHref: "/systeme-documents/services-finance-assurance/05-decouverte-client-pieces.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/05-decouverte-client-pieces.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Devis/mandat type")]: {
      csvHref: "/systeme-documents/services-finance-assurance/06-offre-argumentaire-mandat.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/06-offre-argumentaire-mandat.csv",
    },
    [normalizeDocumentLabel("Trame de suivi portefeuille + Revue périodique")]: {
      csvHref: "/systeme-documents/services-finance-assurance/07-suivi-portefeuille-revue.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/07-suivi-portefeuille-revue.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/services-finance-assurance/08-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/08-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist dossier client + Pièces et validations")]: {
      csvHref: "/systeme-documents/services-finance-assurance/09-dossier-client-validations.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/09-dossier-client-validations.csv",
    },
    [normalizeDocumentLabel("Journal partenaires/contrats + Points de validation")]: {
      csvHref: "/systeme-documents/services-finance-assurance/10-partenaires-contrats-validations.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/10-partenaires-contrats-validations.csv",
    },
    [normalizeDocumentLabel("Tableau de suivi échéances, primes, encours ou commissions")]: {
      csvHref: "/systeme-documents/services-finance-assurance/11-echeances-primes-commissions.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/11-echeances-primes-commissions.csv",
    },
    [normalizeDocumentLabel("Procédure incident/sinistre + Historique décisions")]: {
      csvHref: "/systeme-documents/services-finance-assurance/12-incident-sinistre-decisions.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/12-incident-sinistre-decisions.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de polyvalence")]: {
      csvHref: "/systeme-documents/services-finance-assurance/13-planning-charge-polyvalence.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/13-planning-charge-polyvalence.csv",
    },
    [normalizeDocumentLabel("Fiche de passation de dossier")]: {
      csvHref: "/systeme-documents/services-finance-assurance/14-passation-dossier.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/14-passation-dossier.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/services-finance-assurance/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi commissions, honoraires, encours et marge")]: {
      csvHref: "/systeme-documents/services-finance-assurance/16-rentabilite-portefeuille.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/16-rentabilite-portefeuille.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/services-finance-assurance/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation, primes ou honoraires + Relances")]: {
      csvHref: "/systeme-documents/services-finance-assurance/18-facturation-primes-relances.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/18-facturation-primes-relances.csv",
    },
    [normalizeDocumentLabel("Dossier conformité métier + RGPD + Contrôles périodiques")]: {
      csvHref: "/systeme-documents/services-finance-assurance/19-conformite-rgpd-controles.csv",
      downloadHref: "/systeme-documents/services-finance-assurance/19-conformite-rgpd-controles.csv",
    },
  },
  "services-tech-b2b": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/services-tech-b2b/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/services-tech-b2b/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/services-tech-b2b/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/services-tech-b2b/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche découverte + Périmètre technique")]: {
      csvHref: "/systeme-documents/services-tech-b2b/05-decouverte-perimetre-technique.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/05-decouverte-perimetre-technique.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire + Proposition commerciale")]: {
      csvHref: "/systeme-documents/services-tech-b2b/06-offre-argumentaire-proposition.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/06-offre-argumentaire-proposition.csv",
    },
    [normalizeDocumentLabel("Trame de suivi client + Revue périodique")]: {
      csvHref: "/systeme-documents/services-tech-b2b/07-suivi-client-revue.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/07-suivi-client-revue.csv",
    },
    [normalizeDocumentLabel("Registre incidents client + Trame de réponse")]: {
      csvHref: "/systeme-documents/services-tech-b2b/08-incidents-client-reponse.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/08-incidents-client-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist cadrage + Inventaire initial")]: {
      csvHref: "/systeme-documents/services-tech-b2b/09-cadrage-inventaire-initial.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/09-cadrage-inventaire-initial.csv",
    },
    [normalizeDocumentLabel("Plan d'intervention + Checklist exécution")]: {
      csvHref: "/systeme-documents/services-tech-b2b/10-plan-intervention-execution.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/10-plan-intervention-execution.csv",
    },
    [normalizeDocumentLabel("Tableau tickets/incidents + Procédure escalade")]: {
      csvHref: "/systeme-documents/services-tech-b2b/11-tickets-incidents-escalade.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/11-tickets-incidents-escalade.csv",
    },
    [normalizeDocumentLabel("Base documentaire + Registre accès et sauvegardes")]: {
      csvHref: "/systeme-documents/services-tech-b2b/12-documentation-acces-sauvegardes.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/12-documentation-acces-sauvegardes.csv",
    },
    [normalizeDocumentLabel("Planning charge + Grille de rôles")]: {
      csvHref: "/systeme-documents/services-tech-b2b/13-planning-charge-roles.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/13-planning-charge-roles.csv",
    },
    [normalizeDocumentLabel("Fiche de passation + Checklist reprise")]: {
      csvHref: "/systeme-documents/services-tech-b2b/14-passation-checklist-reprise.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/14-passation-checklist-reprise.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/services-tech-b2b/15-integration-ecrit.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/15-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi temps, licences, achats et marge")]: {
      csvHref: "/systeme-documents/services-tech-b2b/16-marge-technique.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/16-marge-technique.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/services-tech-b2b/17-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/17-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi abonnements/facturation + Relances")]: {
      csvHref: "/systeme-documents/services-tech-b2b/18-abonnements-facturation-relances.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/18-abonnements-facturation-relances.csv",
    },
    [normalizeDocumentLabel("Dossier sécurité, RGPD, sauvegardes et PCA")]: {
      csvHref: "/systeme-documents/services-tech-b2b/19-securite-rgpd-sauvegardes-pca.csv",
      downloadHref: "/systeme-documents/services-tech-b2b/19-securite-rgpd-sauvegardes-pca.csv",
    },
  },
  "immobilier-transaction": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/immobilier-transaction/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/immobilier-transaction/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/immobilier-transaction/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche prospection mandats + Prescripteurs")]: {
      csvHref: "/systeme-documents/immobilier-transaction/04-prospection-mandats-prescripteurs.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/04-prospection-mandats-prescripteurs.csv",
    },
    [normalizeDocumentLabel("Fiche découverte client + Critères de recherche")]: {
      csvHref: "/systeme-documents/immobilier-transaction/05-decouverte-client-criteres.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/05-decouverte-client-criteres.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/immobilier-transaction/06-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/06-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist mandat/bien + Pièces obligatoires")]: {
      csvHref: "/systeme-documents/immobilier-transaction/07-mandat-bien-pieces-obligatoires.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/07-mandat-bien-pieces-obligatoires.csv",
    },
    [normalizeDocumentLabel("Planning visites + Compte rendu standardisé")]: {
      csvHref: "/systeme-documents/immobilier-transaction/08-visites-compte-rendu.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/08-visites-compte-rendu.csv",
    },
    [normalizeDocumentLabel("Journal offre/contre-offre + Étapes signature")]: {
      csvHref: "/systeme-documents/immobilier-transaction/09-offres-signature.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/09-offres-signature.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Fiche de passation")]: {
      csvHref: "/systeme-documents/immobilier-transaction/10-equipe-passation.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/10-equipe-passation.csv",
    },
    [normalizeDocumentLabel("Suivi mandats, commissions et règlements")]: {
      csvHref: "/systeme-documents/immobilier-transaction/11-mandats-commissions-reglements.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/11-mandats-commissions-reglements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/immobilier-transaction/12-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/12-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Contrôle pièces, mandats, diagnostics et affichages")]: {
      csvHref: "/systeme-documents/immobilier-transaction/13-controle-pieces-mandats-diagnostics.csv",
      downloadHref: "/systeme-documents/immobilier-transaction/13-controle-pieces-mandats-diagnostics.csv",
    },
  },
  "immobilier-expertise": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/immobilier-expertise/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/immobilier-expertise/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/immobilier-expertise/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche besoin client + Contraintes mission")]: {
      csvHref: "/systeme-documents/immobilier-expertise/04-besoin-client-contraintes-mission.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/04-besoin-client-contraintes-mission.csv",
    },
    [normalizeDocumentLabel("Proposition commerciale + Devis type")]: {
      csvHref: "/systeme-documents/immobilier-expertise/05-proposition-commerciale-devis.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/05-proposition-commerciale-devis.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/immobilier-expertise/06-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/06-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist préparation mission + Pièces d'entrée")]: {
      csvHref: "/systeme-documents/immobilier-expertise/07-preparation-mission-pieces-entree.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/07-preparation-mission-pieces-entree.csv",
    },
    [normalizeDocumentLabel("Fiche terrain + Procédure de relevé/mesure")]: {
      csvHref: "/systeme-documents/immobilier-expertise/08-terrain-releve-mesure.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/08-terrain-releve-mesure.csv",
    },
    [normalizeDocumentLabel("Trame de rapport/livrable + Contrôle qualité")]: {
      csvHref: "/systeme-documents/immobilier-expertise/09-rapport-livrable-controle-qualite.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/09-rapport-livrable-controle-qualite.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/immobilier-expertise/10-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/10-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Suivi devis, temps passé, factures et marge")]: {
      csvHref: "/systeme-documents/immobilier-expertise/11-devis-temps-factures-marge.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/11-devis-temps-factures-marge.csv",
    },
    [normalizeDocumentLabel("Suivi facturation, règlements et relances")]: {
      csvHref: "/systeme-documents/immobilier-expertise/12-facturation-reglements-relances.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/12-facturation-reglements-relances.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/immobilier-expertise/13-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/13-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier mission + Attestations + Contrôle conformité")]: {
      csvHref: "/systeme-documents/immobilier-expertise/14-mission-attestations-conformite.csv",
      downloadHref: "/systeme-documents/immobilier-expertise/14-mission-attestations-conformite.csv",
    },
  },
  "gestion-locative": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/gestion-locative/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/gestion-locative/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/gestion-locative/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/gestion-locative/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/gestion-locative/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/gestion-locative/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche prospection mandats + Prescripteurs")]: {
      csvHref: "/systeme-documents/gestion-locative/04-prospection-mandats-prescripteurs.csv",
      downloadHref: "/systeme-documents/gestion-locative/04-prospection-mandats-prescripteurs.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/gestion-locative/05-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/gestion-locative/05-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist bien/mandat + Dossier location")]: {
      csvHref: "/systeme-documents/gestion-locative/06-bien-mandat-dossier-location.csv",
      downloadHref: "/systeme-documents/gestion-locative/06-bien-mandat-dossier-location.csv",
    },
    [normalizeDocumentLabel("Tableau loyers, quittances, impayés et tickets")]: {
      csvHref: "/systeme-documents/gestion-locative/07-loyers-quittances-impayes-tickets.csv",
      downloadHref: "/systeme-documents/gestion-locative/07-loyers-quittances-impayes-tickets.csv",
    },
    [normalizeDocumentLabel("Checklist sortie + Procédure relocation/travaux")]: {
      csvHref: "/systeme-documents/gestion-locative/08-sortie-relocation-travaux.csv",
      downloadHref: "/systeme-documents/gestion-locative/08-sortie-relocation-travaux.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/gestion-locative/09-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/gestion-locative/09-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Tableau flux locatifs, honoraires et règlements")]: {
      csvHref: "/systeme-documents/gestion-locative/10-flux-locatifs-honoraires-reglements.csv",
      downloadHref: "/systeme-documents/gestion-locative/10-flux-locatifs-honoraires-reglements.csv",
    },
    [normalizeDocumentLabel("Suivi honoraires et relances impayés")]: {
      csvHref: "/systeme-documents/gestion-locative/11-honoraires-relances-impayes.csv",
      downloadHref: "/systeme-documents/gestion-locative/11-honoraires-relances-impayes.csv",
    },
    [normalizeDocumentLabel("Dossier bail + État des lieux + Pièces réglementaires")]: {
      csvHref: "/systeme-documents/gestion-locative/12-bail-etat-des-lieux-pieces-reglementaires.csv",
      downloadHref: "/systeme-documents/gestion-locative/12-bail-etat-des-lieux-pieces-reglementaires.csv",
    },
  },
  "investissement-immobilier": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/investissement-immobilier/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/investissement-immobilier/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/investissement-immobilier/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche sourcing biens/opérations + Critères")]: {
      csvHref: "/systeme-documents/investissement-immobilier/04-sourcing-biens-criteres.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/04-sourcing-biens-criteres.csv",
    },
    [normalizeDocumentLabel("Registre incidents/réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/investissement-immobilier/05-incidents-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/05-incidents-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist analyse, financement et risques")]: {
      csvHref: "/systeme-documents/investissement-immobilier/06-analyse-financement-risques.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/06-analyse-financement-risques.csv",
    },
    [normalizeDocumentLabel("Tableau d'avancement opération + Planning")]: {
      csvHref: "/systeme-documents/investissement-immobilier/07-avancement-operation-planning.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/07-avancement-operation-planning.csv",
    },
    [normalizeDocumentLabel("Suivi performance + Journal décisions d'arbitrage")]: {
      csvHref: "/systeme-documents/investissement-immobilier/08-performance-decisions-arbitrage.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/08-performance-decisions-arbitrage.csv",
    },
    [normalizeDocumentLabel("Liste partenaires + Fiche de passation")]: {
      csvHref: "/systeme-documents/investissement-immobilier/09-partenaires-passation.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/09-partenaires-passation.csv",
    },
    [normalizeDocumentLabel("Tableau cash-flow, rendement et coûts")]: {
      csvHref: "/systeme-documents/investissement-immobilier/10-cashflow-rendement-couts.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/10-cashflow-rendement-couts.csv",
    },
    [normalizeDocumentLabel("Suivi loyers, ventes ou refacturations + Relances")]: {
      csvHref: "/systeme-documents/investissement-immobilier/11-loyers-ventes-refacturations-relances.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/11-loyers-ventes-refacturations-relances.csv",
    },
    [normalizeDocumentLabel("Dossier actes, diagnostics, baux et justificatifs")]: {
      csvHref: "/systeme-documents/investissement-immobilier/12-actes-diagnostics-baux-justificatifs.csv",
      downloadHref: "/systeme-documents/investissement-immobilier/12-actes-diagnostics-baux-justificatifs.csv",
    },
  },
  "investissement-financier": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/investissement-financier/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/investissement-financier/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/investissement-financier/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/investissement-financier/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/investissement-financier/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/investissement-financier/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche sourcing + Qualification opportunité")]: {
      csvHref: "/systeme-documents/investissement-financier/04-sourcing-qualification-opportunite.csv",
      downloadHref: "/systeme-documents/investissement-financier/04-sourcing-qualification-opportunite.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/investissement-financier/05-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/investissement-financier/05-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist analyse risque / due diligence")]: {
      csvHref: "/systeme-documents/investissement-financier/06-analyse-risque-due-diligence.csv",
      downloadHref: "/systeme-documents/investissement-financier/06-analyse-risque-due-diligence.csv",
    },
    [normalizeDocumentLabel("Journal décisions + Mandats/validations")]: {
      csvHref: "/systeme-documents/investissement-financier/07-decisions-mandats-validations.csv",
      downloadHref: "/systeme-documents/investissement-financier/07-decisions-mandats-validations.csv",
    },
    [normalizeDocumentLabel("Reporting portefeuille + Suivi indicateurs")]: {
      csvHref: "/systeme-documents/investissement-financier/08-reporting-portefeuille-indicateurs.csv",
      downloadHref: "/systeme-documents/investissement-financier/08-reporting-portefeuille-indicateurs.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/investissement-financier/09-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/investissement-financier/09-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Tableau encours, frais, commissions et performance")]: {
      csvHref: "/systeme-documents/investissement-financier/10-encours-frais-commissions-performance.csv",
      downloadHref: "/systeme-documents/investissement-financier/10-encours-frais-commissions-performance.csv",
    },
    [normalizeDocumentLabel("Suivi honoraires, commissions ou appels de fonds + Relances")]: {
      csvHref: "/systeme-documents/investissement-financier/11-honoraires-commissions-appels-relances.csv",
      downloadHref: "/systeme-documents/investissement-financier/11-honoraires-commissions-appels-relances.csv",
    },
    [normalizeDocumentLabel("Dossier conformité, KYC, RGPD et pièces réglementaires")]: {
      csvHref: "/systeme-documents/investissement-financier/12-conformite-kyc-rgpd-pieces.csv",
      downloadHref: "/systeme-documents/investissement-financier/12-conformite-kyc-rgpd-pieces.csv",
    },
  },
  "organisme-de-formation": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/organisme-de-formation/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/organisme-de-formation/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/organisme-de-formation/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/organisme-de-formation/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospects, entreprises et financeurs")]: {
      csvHref: "/systeme-documents/organisme-de-formation/05-prospects-entreprises-financeurs.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/05-prospects-entreprises-financeurs.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (programme, prérequis, financement)")]: {
      csvHref: "/systeme-documents/organisme-de-formation/06-offre-argumentaire-programme-financement.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/06-offre-argumentaire-programme-financement.csv",
    },
    [normalizeDocumentLabel("Questionnaire satisfaction + Trame de suivi post-formation")]: {
      csvHref: "/systeme-documents/organisme-de-formation/07-satisfaction-suivi-post-formation.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/07-satisfaction-suivi-post-formation.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/organisme-de-formation/08-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/08-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Trame de programme pédagogique + Versionning supports")]: {
      csvHref: "/systeme-documents/organisme-de-formation/09-programme-pedagogique-versionning.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/09-programme-pedagogique-versionning.csv",
    },
    [normalizeDocumentLabel("Planning sessions + Affectation formateurs/salles")]: {
      csvHref: "/systeme-documents/organisme-de-formation/10-planning-sessions-formateurs-salles.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/10-planning-sessions-formateurs-salles.csv",
    },
    [normalizeDocumentLabel("Checklist session + Émargements + Attestations")]: {
      csvHref: "/systeme-documents/organisme-de-formation/11-session-emargements-attestations.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/11-session-emargements-attestations.csv",
    },
    [normalizeDocumentLabel("Checklist dossier convention/financement + Relances")]: {
      csvHref: "/systeme-documents/organisme-de-formation/12-dossier-convention-financement-relances.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/12-dossier-convention-financement-relances.csv",
    },
    [normalizeDocumentLabel("Fiche gestion intervenants (contrats, habilitations, évaluation)")]: {
      csvHref: "/systeme-documents/organisme-de-formation/13-gestion-intervenants-contrats-habilitations.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/13-gestion-intervenants-contrats-habilitations.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration + Procédure de remplacement formateur")]: {
      csvHref: "/systeme-documents/organisme-de-formation/14-integration-remplacement-formateur.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/14-integration-remplacement-formateur.csv",
    },
    [normalizeDocumentLabel("Suivi CA, remplissage, heures vendues et marge par session")]: {
      csvHref: "/systeme-documents/organisme-de-formation/15-ca-remplissage-heures-marge.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/15-ca-remplissage-heures-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/organisme-de-formation/16-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/16-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi facturation/financement + Trame de relance")]: {
      csvHref: "/systeme-documents/organisme-de-formation/17-facturation-financement-relance.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/17-facturation-financement-relance.csv",
    },
    [normalizeDocumentLabel("Dossier qualité formation + Registre réclamations + Plan d'actions")]: {
      csvHref: "/systeme-documents/organisme-de-formation/18-qualite-formation-reclamations-plan-actions.csv",
      downloadHref: "/systeme-documents/organisme-de-formation/18-qualite-formation-reclamations-plan-actions.csv",
    },
  },
  "formation-en-ligne": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/formation-en-ligne/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/formation-en-ligne/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/formation-en-ligne/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/formation-en-ligne/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche acquisition + Calendrier de lancement")]: {
      csvHref: "/systeme-documents/formation-en-ligne/05-acquisition-calendrier-lancement.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/05-acquisition-calendrier-lancement.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (programme, promesse, FAQ)")]: {
      csvHref: "/systeme-documents/formation-en-ligne/06-offre-argumentaire-programme-faq.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/06-offre-argumentaire-programme-faq.csv",
    },
    [normalizeDocumentLabel("Trame support apprenant + Registre incidents")]: {
      csvHref: "/systeme-documents/formation-en-ligne/07-support-apprenant-incidents.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/07-support-apprenant-incidents.csv",
    },
    [normalizeDocumentLabel("Checklist production module + Validation publication")]: {
      csvHref: "/systeme-documents/formation-en-ligne/08-production-module-publication.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/08-production-module-publication.csv",
    },
    [normalizeDocumentLabel("Procédure LMS + Checklist inscription/activation")]: {
      csvHref: "/systeme-documents/formation-en-ligne/09-lms-inscription-activation.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/09-lms-inscription-activation.csv",
    },
    [normalizeDocumentLabel("Tableau progression apprenants + Attestations/certificats")]: {
      csvHref: "/systeme-documents/formation-en-ligne/10-progression-attestations-certificats.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/10-progression-attestations-certificats.csv",
    },
    [normalizeDocumentLabel("Journal de mise à jour + Revue qualité contenu")]: {
      csvHref: "/systeme-documents/formation-en-ligne/11-mise-a-jour-revue-qualite.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/11-mise-a-jour-revue-qualite.csv",
    },
    [normalizeDocumentLabel("Rôles équipe + Fiche de passation")]: {
      csvHref: "/systeme-documents/formation-en-ligne/12-roles-equipe-passation.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/12-roles-equipe-passation.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/formation-en-ligne/13-integration-ecrit.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/13-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi ventes, abonnements, remboursements et marge")]: {
      csvHref: "/systeme-documents/formation-en-ligne/14-ventes-abonnements-remboursements-marge.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/14-ventes-abonnements-remboursements-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/formation-en-ligne/15-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/15-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi paiements, remboursements et relances")]: {
      csvHref: "/systeme-documents/formation-en-ligne/16-paiements-remboursements-relances.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/16-paiements-remboursements-relances.csv",
    },
    [normalizeDocumentLabel("Référentiel qualité contenu + RGPD + CGV/attestations")]: {
      csvHref: "/systeme-documents/formation-en-ligne/17-qualite-rgpd-cgv-attestations.csv",
      downloadHref: "/systeme-documents/formation-en-ligne/17-qualite-rgpd-cgv-attestations.csv",
    },
  },
  cfa: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/cfa/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/cfa/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/cfa/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/cfa/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/cfa/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/cfa/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/cfa/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/cfa/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospection entreprises")]: {
      csvHref: "/systeme-documents/cfa/05-prospection-entreprises.csv",
      downloadHref: "/systeme-documents/cfa/05-prospection-entreprises.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (parcours proposés)")]: {
      csvHref: "/systeme-documents/cfa/06-offre-argumentaire-parcours.csv",
      downloadHref: "/systeme-documents/cfa/06-offre-argumentaire-parcours.csv",
    },
    [normalizeDocumentLabel("Questionnaire satisfaction employeur + apprenti")]: {
      csvHref: "/systeme-documents/cfa/07-satisfaction-employeur-apprenti.csv",
      downloadHref: "/systeme-documents/cfa/07-satisfaction-employeur-apprenti.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/cfa/08-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/cfa/08-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Trame de programme pédagogique")]: {
      csvHref: "/systeme-documents/cfa/09-programme-pedagogique.csv",
      downloadHref: "/systeme-documents/cfa/09-programme-pedagogique.csv",
    },
    [normalizeDocumentLabel("Checklist rentrée/session + Fiche déroulé type")]: {
      csvHref: "/systeme-documents/cfa/10-rentree-session-deroule.csv",
      downloadHref: "/systeme-documents/cfa/10-rentree-session-deroule.csv",
    },
    [normalizeDocumentLabel("Planning pédagogique + Procédure de remplacement d'un formateur absent")]: {
      csvHref: "/systeme-documents/cfa/11-planning-pedagogique-remplacement.csv",
      downloadHref: "/systeme-documents/cfa/11-planning-pedagogique-remplacement.csv",
    },
    [normalizeDocumentLabel("Fiche de suivi tripartite (CFA-apprenti-employeur)")]: {
      csvHref: "/systeme-documents/cfa/12-suivi-tripartite-cfa-apprenti-employeur.csv",
      downloadHref: "/systeme-documents/cfa/12-suivi-tripartite-cfa-apprenti-employeur.csv",
    },
    [normalizeDocumentLabel("Fiche gestion intervenants (contrats, évaluation)")]: {
      csvHref: "/systeme-documents/cfa/13-gestion-intervenants-contrats-evaluation.csv",
      downloadHref: "/systeme-documents/cfa/13-gestion-intervenants-contrats-evaluation.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/cfa/14-integration-ecrit.csv",
      downloadHref: "/systeme-documents/cfa/14-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi CA par contrat d'apprentissage/financement OPCO")]: {
      csvHref: "/systeme-documents/cfa/15-ca-contrats-opco.csv",
      downloadHref: "/systeme-documents/cfa/15-ca-contrats-opco.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/cfa/16-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/cfa/16-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Checklist dossier OPCO complet + Trame de relance financements")]: {
      csvHref: "/systeme-documents/cfa/17-dossier-opco-relances.csv",
      downloadHref: "/systeme-documents/cfa/17-dossier-opco-relances.csv",
    },
    [normalizeDocumentLabel("Dossier Qualiopi à jour + Registre réclamations")]: {
      csvHref: "/systeme-documents/cfa/18-qualiopi-reclamations.csv",
      downloadHref: "/systeme-documents/cfa/18-qualiopi-reclamations.csv",
    },
    [normalizeDocumentLabel("Suivi taux de réussite examen + taux d'insertion")]: {
      csvHref: "/systeme-documents/cfa/19-reussite-insertion.csv",
      downloadHref: "/systeme-documents/cfa/19-reussite-insertion.csv",
    },
    [normalizeDocumentLabel("Registre des mineurs + Procédure de signalement")]: {
      csvHref: "/systeme-documents/cfa/20-registre-mineurs-signalement.csv",
      downloadHref: "/systeme-documents/cfa/20-registre-mineurs-signalement.csv",
    },
  },
  "e-commerce": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/e-commerce/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/e-commerce/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/e-commerce/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/e-commerce/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/e-commerce/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/e-commerce/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Calendrier acquisition + Plan campagnes")]: {
      csvHref: "/systeme-documents/e-commerce/04-acquisition-campagnes.csv",
      downloadHref: "/systeme-documents/e-commerce/04-acquisition-campagnes.csv",
    },
    [normalizeDocumentLabel("Fiche offre, argumentaire et parcours de conversion")]: {
      csvHref: "/systeme-documents/e-commerce/05-offre-argumentaire-conversion.csv",
      downloadHref: "/systeme-documents/e-commerce/05-offre-argumentaire-conversion.csv",
    },
    [normalizeDocumentLabel("Procédure SAV/retours + Trame de réponse")]: {
      csvHref: "/systeme-documents/e-commerce/06-sav-retours-reponse.csv",
      downloadHref: "/systeme-documents/e-commerce/06-sav-retours-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist catalogue, fiches produit et prix")]: {
      csvHref: "/systeme-documents/e-commerce/07-catalogue-fiches-produit-prix.csv",
      downloadHref: "/systeme-documents/e-commerce/07-catalogue-fiches-produit-prix.csv",
    },
    [normalizeDocumentLabel("Workflow commande, picking, emballage et expédition")]: {
      csvHref: "/systeme-documents/e-commerce/08-commande-picking-emballage-expedition.csv",
      downloadHref: "/systeme-documents/e-commerce/08-commande-picking-emballage-expedition.csv",
    },
    [normalizeDocumentLabel("Journal retours/support + Procédure de traitement")]: {
      csvHref: "/systeme-documents/e-commerce/09-retours-support-traitement.csv",
      downloadHref: "/systeme-documents/e-commerce/09-retours-support-traitement.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/e-commerce/10-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/e-commerce/10-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Tableau CA, panier moyen, marge et remboursements")]: {
      csvHref: "/systeme-documents/e-commerce/11-ca-panier-marge-remboursements.csv",
      downloadHref: "/systeme-documents/e-commerce/11-ca-panier-marge-remboursements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/e-commerce/12-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/e-commerce/12-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi paiements, litiges et remboursements")]: {
      csvHref: "/systeme-documents/e-commerce/13-paiements-litiges-remboursements.csv",
      downloadHref: "/systeme-documents/e-commerce/13-paiements-litiges-remboursements.csv",
    },
  },
  marketplace: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/marketplace/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/marketplace/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/marketplace/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/marketplace/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/marketplace/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/marketplace/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche acquisition vendeurs/acheteurs + Plan d'activation")]: {
      csvHref: "/systeme-documents/marketplace/04-acquisition-vendeurs-acheteurs.csv",
      downloadHref: "/systeme-documents/marketplace/04-acquisition-vendeurs-acheteurs.csv",
    },
    [normalizeDocumentLabel("Registre litiges + Trame de médiation")]: {
      csvHref: "/systeme-documents/marketplace/05-litiges-mediation.csv",
      downloadHref: "/systeme-documents/marketplace/05-litiges-mediation.csv",
    },
    [normalizeDocumentLabel("Checklist catalogue vendeurs + Règles de publication")]: {
      csvHref: "/systeme-documents/marketplace/06-catalogue-vendeurs-regles-publication.csv",
      downloadHref: "/systeme-documents/marketplace/06-catalogue-vendeurs-regles-publication.csv",
    },
    [normalizeDocumentLabel("Procédure modération + Journal incidents")]: {
      csvHref: "/systeme-documents/marketplace/07-moderation-incidents.csv",
      downloadHref: "/systeme-documents/marketplace/07-moderation-incidents.csv",
    },
    [normalizeDocumentLabel("Tableau commandes/retours + Suivi vendeurs")]: {
      csvHref: "/systeme-documents/marketplace/08-commandes-retours-suivi-vendeurs.csv",
      downloadHref: "/systeme-documents/marketplace/08-commandes-retours-suivi-vendeurs.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Fiche de passation")]: {
      csvHref: "/systeme-documents/marketplace/09-planning-equipe-passation.csv",
      downloadHref: "/systeme-documents/marketplace/09-planning-equipe-passation.csv",
    },
    [normalizeDocumentLabel("Tableau commissions, flux et indicateurs marketplace")]: {
      csvHref: "/systeme-documents/marketplace/10-commissions-flux-indicateurs.csv",
      downloadHref: "/systeme-documents/marketplace/10-commissions-flux-indicateurs.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/marketplace/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/marketplace/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Suivi encaissements, reversements vendeurs et litiges paiements")]: {
      csvHref: "/systeme-documents/marketplace/12-encaissements-reversements-litiges.csv",
      downloadHref: "/systeme-documents/marketplace/12-encaissements-reversements-litiges.csv",
    },
  },
  "auto-ecole": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/auto-ecole/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/auto-ecole/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/auto-ecole/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/auto-ecole/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/auto-ecole/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/auto-ecole/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Point de pilotage mensuel")]: {
      csvHref: "/systeme-documents/auto-ecole/04-point-pilotage-mensuel.csv",
      downloadHref: "/systeme-documents/auto-ecole/04-point-pilotage-mensuel.csv",
    },
    [normalizeDocumentLabel("Fiche suivi prospects/élèves + Offres CPF ou forfaits")]: {
      csvHref: "/systeme-documents/auto-ecole/05-prospects-eleves-offres-cpf.csv",
      downloadHref: "/systeme-documents/auto-ecole/05-prospects-eleves-offres-cpf.csv",
    },
    [normalizeDocumentLabel("Fiche offre & argumentaire (forfaits, examens, financement)")]: {
      csvHref: "/systeme-documents/auto-ecole/06-offre-argumentaire-forfaits-examens.csv",
      downloadHref: "/systeme-documents/auto-ecole/06-offre-argumentaire-forfaits-examens.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/auto-ecole/07-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/auto-ecole/07-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist inscription + Dossier élève")]: {
      csvHref: "/systeme-documents/auto-ecole/08-inscription-dossier-eleve.csv",
      downloadHref: "/systeme-documents/auto-ecole/08-inscription-dossier-eleve.csv",
    },
    [normalizeDocumentLabel("Planning conduite + Affectation moniteurs/véhicules")]: {
      csvHref: "/systeme-documents/auto-ecole/09-planning-conduite-moniteurs-vehicules.csv",
      downloadHref: "/systeme-documents/auto-ecole/09-planning-conduite-moniteurs-vehicules.csv",
    },
    [normalizeDocumentLabel("Fiche progression élève + Suivi convocations/résultats")]: {
      csvHref: "/systeme-documents/auto-ecole/10-progression-eleve-convocations-resultats.csv",
      downloadHref: "/systeme-documents/auto-ecole/10-progression-eleve-convocations-resultats.csv",
    },
    [normalizeDocumentLabel("Carnet véhicule + Procédure incident/sinistre")]: {
      csvHref: "/systeme-documents/auto-ecole/11-carnet-vehicule-incident-sinistre.csv",
      downloadHref: "/systeme-documents/auto-ecole/11-carnet-vehicule-incident-sinistre.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Liste de remplacement + Consignes")]: {
      csvHref: "/systeme-documents/auto-ecole/12-planning-equipe-remplacement-consignes.csv",
      downloadHref: "/systeme-documents/auto-ecole/12-planning-equipe-remplacement-consignes.csv",
    },
    [normalizeDocumentLabel("Parcours d'intégration écrit")]: {
      csvHref: "/systeme-documents/auto-ecole/13-integration-ecrit.csv",
      downloadHref: "/systeme-documents/auto-ecole/13-integration-ecrit.csv",
    },
    [normalizeDocumentLabel("Suivi encaissements, heures consommées et reste à facturer")]: {
      csvHref: "/systeme-documents/auto-ecole/14-encaissements-heures-reste-a-facturer.csv",
      downloadHref: "/systeme-documents/auto-ecole/14-encaissements-heures-reste-a-facturer.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/auto-ecole/15-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/auto-ecole/15-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Checklist financement/CPF + Trame de relance")]: {
      csvHref: "/systeme-documents/auto-ecole/16-financement-cpf-relance.csv",
      downloadHref: "/systeme-documents/auto-ecole/16-financement-cpf-relance.csv",
    },
    [normalizeDocumentLabel("Contrôle pièces élèves + Documents véhicules + Registre incidents")]: {
      csvHref: "/systeme-documents/auto-ecole/17-controle-pieces-documents-vehicules-incidents.csv",
      downloadHref: "/systeme-documents/auto-ecole/17-controle-pieces-documents-vehicules-incidents.csv",
    },
  },
  evenementiel: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/evenementiel/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/evenementiel/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/evenementiel/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/evenementiel/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/evenementiel/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/evenementiel/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche brief client + Budget cible")]: {
      csvHref: "/systeme-documents/evenementiel/04-brief-client-budget-cible.csv",
      downloadHref: "/systeme-documents/evenementiel/04-brief-client-budget-cible.csv",
    },
    [normalizeDocumentLabel("Proposition commerciale + Périmètre prestation")]: {
      csvHref: "/systeme-documents/evenementiel/05-proposition-commerciale-perimetre-prestation.csv",
      downloadHref: "/systeme-documents/evenementiel/05-proposition-commerciale-perimetre-prestation.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/evenementiel/06-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/evenementiel/06-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Planning projet + Checklist logistique/prestataires")]: {
      csvHref: "/systeme-documents/evenementiel/07-planning-projet-logistique-prestataires.csv",
      downloadHref: "/systeme-documents/evenementiel/07-planning-projet-logistique-prestataires.csv",
    },
    [normalizeDocumentLabel("Conducteur opérationnel + Procédure aléas")]: {
      csvHref: "/systeme-documents/evenementiel/08-conducteur-operationnel-aleas.csv",
      downloadHref: "/systeme-documents/evenementiel/08-conducteur-operationnel-aleas.csv",
    },
    [normalizeDocumentLabel("Compte rendu final + Retour client + Plan de relance")]: {
      csvHref: "/systeme-documents/evenementiel/09-compte-rendu-retour-client-relance.csv",
      downloadHref: "/systeme-documents/evenementiel/09-compte-rendu-retour-client-relance.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/evenementiel/10-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/evenementiel/10-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Suivi budget, prestataires, acomptes et marge")]: {
      csvHref: "/systeme-documents/evenementiel/11-budget-prestataires-acomptes-marge.csv",
      downloadHref: "/systeme-documents/evenementiel/11-budget-prestataires-acomptes-marge.csv",
    },
    [normalizeDocumentLabel("Suivi facturation + Relance solde")]: {
      csvHref: "/systeme-documents/evenementiel/12-facturation-relance-solde.csv",
      downloadHref: "/systeme-documents/evenementiel/12-facturation-relance-solde.csv",
    },
    [normalizeDocumentLabel("Dossier contrats, assurances et autorisations")]: {
      csvHref: "/systeme-documents/evenementiel/13-contrats-assurances-autorisations.csv",
      downloadHref: "/systeme-documents/evenementiel/13-contrats-assurances-autorisations.csv",
    },
  },
  "hotel-hebergement-independant": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche réservation + Standard de confirmation")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/03-reservation-standard-confirmation.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/03-reservation-standard-confirmation.csv",
    },
    [normalizeDocumentLabel("Trame de réponse avis et réclamations")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/04-avis-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/04-avis-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist check-in/check-out + Planning ménage")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/05-checkin-checkout-planning-menage.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/05-checkin-checkout-planning-menage.csv",
    },
    [normalizeDocumentLabel("Procédure incident client ou maintenance")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/06-incident-client-maintenance.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/06-incident-client-maintenance.csv",
    },
    [normalizeDocumentLabel("Planning + Liste remplacement + Fiche de passation")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/07-planning-remplacement-passation.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/07-planning-remplacement-passation.csv",
    },
    [normalizeDocumentLabel("Suivi occupation, panier moyen et encaissements")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/08-occupation-panier-encaissements.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/08-occupation-panier-encaissements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/hotel-hebergement-independant/09-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/hotel-hebergement-independant/09-calendrier-echeances.csv",
    },
  },
  pharmacie: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/pharmacie/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/pharmacie/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/pharmacie/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/pharmacie/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/pharmacie/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/pharmacie/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Parcours comptoir + Fiche conseil")]: {
      csvHref: "/systeme-documents/pharmacie/04-comptoir-conseil.csv",
      downloadHref: "/systeme-documents/pharmacie/04-comptoir-conseil.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/pharmacie/05-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/pharmacie/05-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist délivrance + Contrôle ordonnance")]: {
      csvHref: "/systeme-documents/pharmacie/06-delivrance-controle-ordonnance.csv",
      downloadHref: "/systeme-documents/pharmacie/06-delivrance-controle-ordonnance.csv",
    },
    [normalizeDocumentLabel("Seuils stock + Tableau commandes/ruptures")]: {
      csvHref: "/systeme-documents/pharmacie/07-stock-commandes-ruptures.csv",
      downloadHref: "/systeme-documents/pharmacie/07-stock-commandes-ruptures.csv",
    },
    [normalizeDocumentLabel("Journal missions santé + Registre traçabilité")]: {
      csvHref: "/systeme-documents/pharmacie/08-missions-sante-tracabilite.csv",
      downloadHref: "/systeme-documents/pharmacie/08-missions-sante-tracabilite.csv",
    },
    [normalizeDocumentLabel("Planning officine + Fiche de passation")]: {
      csvHref: "/systeme-documents/pharmacie/09-planning-officine-passation.csv",
      downloadHref: "/systeme-documents/pharmacie/09-planning-officine-passation.csv",
    },
    [normalizeDocumentLabel("Suivi encaissements, tiers payant et marge")]: {
      csvHref: "/systeme-documents/pharmacie/10-encaissements-tiers-payant-marge.csv",
      downloadHref: "/systeme-documents/pharmacie/10-encaissements-tiers-payant-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/pharmacie/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/pharmacie/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier officine, contrôles, affichages et obligations")]: {
      csvHref: "/systeme-documents/pharmacie/12-officine-controles-affichages-obligations.csv",
      downloadHref: "/systeme-documents/pharmacie/12-officine-controles-affichages-obligations.csv",
    },
  },
  pressing: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/pressing/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/pressing/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/pressing/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/pressing/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Trame fidélité + Demande d'avis")]: {
      csvHref: "/systeme-documents/pressing/03-fidelite-demande-avis.csv",
      downloadHref: "/systeme-documents/pressing/03-fidelite-demande-avis.csv",
    },
    [normalizeDocumentLabel("Registre litiges textile + Trame de réponse")]: {
      csvHref: "/systeme-documents/pressing/04-litiges-textile-reponse.csv",
      downloadHref: "/systeme-documents/pressing/04-litiges-textile-reponse.csv",
    },
    [normalizeDocumentLabel("Fiche dépôt + Consignes article")]: {
      csvHref: "/systeme-documents/pressing/05-depot-consignes-article.csv",
      downloadHref: "/systeme-documents/pressing/05-depot-consignes-article.csv",
    },
    [normalizeDocumentLabel("Checklist traitement + Contrôle qualité")]: {
      csvHref: "/systeme-documents/pressing/06-traitement-controle-qualite.csv",
      downloadHref: "/systeme-documents/pressing/06-traitement-controle-qualite.csv",
    },
    [normalizeDocumentLabel("Fiche restitution + Historique client")]: {
      csvHref: "/systeme-documents/pressing/07-restitution-historique-client.csv",
      downloadHref: "/systeme-documents/pressing/07-restitution-historique-client.csv",
    },
    [normalizeDocumentLabel("Planning + Fiche de passation")]: {
      csvHref: "/systeme-documents/pressing/08-planning-passation.csv",
      downloadHref: "/systeme-documents/pressing/08-planning-passation.csv",
    },
    [normalizeDocumentLabel("Suivi tickets, panier moyen et marge")]: {
      csvHref: "/systeme-documents/pressing/09-tickets-panier-marge.csv",
      downloadHref: "/systeme-documents/pressing/09-tickets-panier-marge.csv",
    },
    [normalizeDocumentLabel("Suivi encaissements, acomptes et relances")]: {
      csvHref: "/systeme-documents/pressing/10-encaissements-acomptes-relances.csv",
      downloadHref: "/systeme-documents/pressing/10-encaissements-acomptes-relances.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/pressing/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/pressing/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Registre machines/produits + Procédure sécurité")]: {
      csvHref: "/systeme-documents/pressing/12-machines-produits-securite.csv",
      downloadHref: "/systeme-documents/pressing/12-machines-produits-securite.csv",
    },
  },
  "laverie-automatique": {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/laverie-automatique/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/laverie-automatique/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/laverie-automatique/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/laverie-automatique/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Guide d'usage + Affichage prix/services")]: {
      csvHref: "/systeme-documents/laverie-automatique/03-guide-usage-affichage-prix-services.csv",
      downloadHref: "/systeme-documents/laverie-automatique/03-guide-usage-affichage-prix-services.csv",
    },
    [normalizeDocumentLabel("Journal incidents client + Trame de réponse")]: {
      csvHref: "/systeme-documents/laverie-automatique/04-incidents-client-reponse.csv",
      downloadHref: "/systeme-documents/laverie-automatique/04-incidents-client-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist contrôle machines + Seuils consommables")]: {
      csvHref: "/systeme-documents/laverie-automatique/05-controle-machines-consommables.csv",
      downloadHref: "/systeme-documents/laverie-automatique/05-controle-machines-consommables.csv",
    },
    [normalizeDocumentLabel("Procédure panne/paiement + Contrats maintenance")]: {
      csvHref: "/systeme-documents/laverie-automatique/06-panne-paiement-maintenance.csv",
      downloadHref: "/systeme-documents/laverie-automatique/06-panne-paiement-maintenance.csv",
    },
    [normalizeDocumentLabel("Planning nettoyage + Registre sécurité")]: {
      csvHref: "/systeme-documents/laverie-automatique/07-nettoyage-registre-securite.csv",
      downloadHref: "/systeme-documents/laverie-automatique/07-nettoyage-registre-securite.csv",
    },
    [normalizeDocumentLabel("Planning interventions + Fiche de passation")]: {
      csvHref: "/systeme-documents/laverie-automatique/08-interventions-passation.csv",
      downloadHref: "/systeme-documents/laverie-automatique/08-interventions-passation.csv",
    },
    [normalizeDocumentLabel("Suivi paiements, dépenses et marge")]: {
      csvHref: "/systeme-documents/laverie-automatique/09-paiements-depenses-marge.csv",
      downloadHref: "/systeme-documents/laverie-automatique/09-paiements-depenses-marge.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/laverie-automatique/10-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/laverie-automatique/10-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Registre contrôles, affichages et incidents")]: {
      csvHref: "/systeme-documents/laverie-automatique/11-controles-affichages-incidents.csv",
      downloadHref: "/systeme-documents/laverie-automatique/11-controles-affichages-incidents.csv",
    },
  },
  association: {
    [normalizeDocumentLabel("Fiche vision, priorités et objectifs annuels")]: {
      csvHref: "/systeme-documents/association/01-vision-priorites-objectifs.csv",
      downloadHref: "/systeme-documents/association/01-vision-priorites-objectifs.csv",
    },
    [normalizeDocumentLabel("Grille de responsabilités bureau/équipe")]: {
      csvHref: "/systeme-documents/association/02-responsabilites-bureau-equipe.csv",
      downloadHref: "/systeme-documents/association/02-responsabilites-bureau-equipe.csv",
    },
    [normalizeDocumentLabel("Fiche suivi adhésions, partenariats ou dons")]: {
      csvHref: "/systeme-documents/association/03-adhesions-partenariats-dons.csv",
      downloadHref: "/systeme-documents/association/03-adhesions-partenariats-dons.csv",
    },
    [normalizeDocumentLabel("Trame de traitement des réclamations ou signalements")]: {
      csvHref: "/systeme-documents/association/04-reclamations-signalements.csv",
      downloadHref: "/systeme-documents/association/04-reclamations-signalements.csv",
    },
    [normalizeDocumentLabel("Checklist événement ou action + Fiche de suivi")]: {
      csvHref: "/systeme-documents/association/05-evenement-action-suivi.csv",
      downloadHref: "/systeme-documents/association/05-evenement-action-suivi.csv",
    },
    [normalizeDocumentLabel("Planning + Grille de rôles + Fiche de passation")]: {
      csvHref: "/systeme-documents/association/06-planning-roles-passation.csv",
      downloadHref: "/systeme-documents/association/06-planning-roles-passation.csv",
    },
    [normalizeDocumentLabel("Tableau budget, subventions et trésorerie")]: {
      csvHref: "/systeme-documents/association/07-budget-subventions-tresorerie.csv",
      downloadHref: "/systeme-documents/association/07-budget-subventions-tresorerie.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances + Dossier justificatifs")]: {
      csvHref: "/systeme-documents/association/08-echeances-justificatifs.csv",
      downloadHref: "/systeme-documents/association/08-echeances-justificatifs.csv",
    },
  },
  creche: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/creche/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/creche/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/creche/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/creche/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/creche/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/creche/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche préinscription + Parcours famille")]: {
      csvHref: "/systeme-documents/creche/04-preinscription-parcours-famille.csv",
      downloadHref: "/systeme-documents/creche/04-preinscription-parcours-famille.csv",
    },
    [normalizeDocumentLabel("Registre réclamations/signalements + Trame de réponse")]: {
      csvHref: "/systeme-documents/creche/05-reclamations-signalements-reponse.csv",
      downloadHref: "/systeme-documents/creche/05-reclamations-signalements-reponse.csv",
    },
    [normalizeDocumentLabel("Planning accueil + Journal transmissions")]: {
      csvHref: "/systeme-documents/creche/06-accueil-transmissions.csv",
      downloadHref: "/systeme-documents/creche/06-accueil-transmissions.csv",
    },
    [normalizeDocumentLabel("Checklist quotidienne + Registre incidents")]: {
      csvHref: "/systeme-documents/creche/07-quotidien-incidents.csv",
      downloadHref: "/systeme-documents/creche/07-quotidien-incidents.csv",
    },
    [normalizeDocumentLabel("Planning activités + Procédure remplacement")]: {
      csvHref: "/systeme-documents/creche/08-activites-remplacement.csv",
      downloadHref: "/systeme-documents/creche/08-activites-remplacement.csv",
    },
    [normalizeDocumentLabel("Planning équipe + Liste remplacement")]: {
      csvHref: "/systeme-documents/creche/09-equipe-remplacement.csv",
      downloadHref: "/systeme-documents/creche/09-equipe-remplacement.csv",
    },
    [normalizeDocumentLabel("Suivi contrats familles, facturation et encaissements")]: {
      csvHref: "/systeme-documents/creche/10-contrats-familles-facturation-encaissements.csv",
      downloadHref: "/systeme-documents/creche/10-contrats-familles-facturation-encaissements.csv",
    },
    [normalizeDocumentLabel("Calendrier des échéances")]: {
      csvHref: "/systeme-documents/creche/11-calendrier-echeances.csv",
      downloadHref: "/systeme-documents/creche/11-calendrier-echeances.csv",
    },
    [normalizeDocumentLabel("Dossier agréments, protocoles et affichages")]: {
      csvHref: "/systeme-documents/creche/12-agrements-protocoles-affichages.csv",
      downloadHref: "/systeme-documents/creche/12-agrements-protocoles-affichages.csv",
    },
  },
  syndic: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/syndic/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/syndic/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/syndic/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/syndic/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/syndic/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/syndic/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche prospection/renouvellement mandats")]: {
      csvHref: "/systeme-documents/syndic/04-prospection-renouvellement-mandats.csv",
      downloadHref: "/systeme-documents/syndic/04-prospection-renouvellement-mandats.csv",
    },
    [normalizeDocumentLabel("Registre réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/syndic/05-registre-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/syndic/05-registre-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Dossier copropriété + Carnet d'entretien")]: {
      csvHref: "/systeme-documents/syndic/06-dossier-copropriete-carnet-entretien.csv",
      downloadHref: "/systeme-documents/syndic/06-dossier-copropriete-carnet-entretien.csv",
    },
    [normalizeDocumentLabel("Checklist AG + Journal décisions")]: {
      csvHref: "/systeme-documents/syndic/07-ag-journal-decisions.csv",
      downloadHref: "/systeme-documents/syndic/07-ag-journal-decisions.csv",
    },
    [normalizeDocumentLabel("Tableau appels de fonds/travaux + Tickets incidents")]: {
      csvHref: "/systeme-documents/syndic/08-appels-fonds-travaux-incidents.csv",
      downloadHref: "/systeme-documents/syndic/08-appels-fonds-travaux-incidents.csv",
    },
    [normalizeDocumentLabel("Planning charge + Fiche de passation")]: {
      csvHref: "/systeme-documents/syndic/09-planning-charge-passation.csv",
      downloadHref: "/systeme-documents/syndic/09-planning-charge-passation.csv",
    },
    [normalizeDocumentLabel("Tableau flux copropriété, appels et impayés")]: {
      csvHref: "/systeme-documents/syndic/10-flux-copropriete-appels-impayes.csv",
      downloadHref: "/systeme-documents/syndic/10-flux-copropriete-appels-impayes.csv",
    },
    [normalizeDocumentLabel("Suivi règlements copropriétaires + Relances")]: {
      csvHref: "/systeme-documents/syndic/11-reglements-coproprietaires-relances.csv",
      downloadHref: "/systeme-documents/syndic/11-reglements-coproprietaires-relances.csv",
    },
    [normalizeDocumentLabel("Dossier AG, contrats et pièces réglementaires")]: {
      csvHref: "/systeme-documents/syndic/12-ag-contrats-pieces-reglementaires.csv",
      downloadHref: "/systeme-documents/syndic/12-ag-contrats-pieces-reglementaires.csv",
    },
  },
  conciergerie: {
    [normalizeDocumentLabel("Fiche vision & objectifs annuels")]: {
      csvHref: "/systeme-documents/conciergerie/01-vision-objectifs-annuels.csv",
      downloadHref: "/systeme-documents/conciergerie/01-vision-objectifs-annuels.csv",
    },
    [normalizeDocumentLabel("Grille d'autorité")]: {
      csvHref: "/systeme-documents/conciergerie/02-grille-autorite.csv",
      downloadHref: "/systeme-documents/conciergerie/02-grille-autorite.csv",
    },
    [normalizeDocumentLabel("Fiche accès & informations critiques")]: {
      csvHref: "/systeme-documents/conciergerie/03-acces-informations-critiques.csv",
      downloadHref: "/systeme-documents/conciergerie/03-acces-informations-critiques.csv",
    },
    [normalizeDocumentLabel("Fiche prospection propriétaires + Canaux de réservation")]: {
      csvHref: "/systeme-documents/conciergerie/04-prospection-proprietaires-canaux.csv",
      downloadHref: "/systeme-documents/conciergerie/04-prospection-proprietaires-canaux.csv",
    },
    [normalizeDocumentLabel("Journal avis/réclamations + Trame de réponse")]: {
      csvHref: "/systeme-documents/conciergerie/05-avis-reclamations-reponse.csv",
      downloadHref: "/systeme-documents/conciergerie/05-avis-reclamations-reponse.csv",
    },
    [normalizeDocumentLabel("Checklist annonce + Planning réservations")]: {
      csvHref: "/systeme-documents/conciergerie/06-annonce-planning-reservations.csv",
      downloadHref: "/systeme-documents/conciergerie/06-annonce-planning-reservations.csv",
    },
    [normalizeDocumentLabel("Checklist ménage/check-in/check-out")]: {
      csvHref: "/systeme-documents/conciergerie/07-menage-checkin-checkout.csv",
      downloadHref: "/systeme-documents/conciergerie/07-menage-checkin-checkout.csv",
    },
    [normalizeDocumentLabel("Procédure incident + Liste prestataires")]: {
      csvHref: "/systeme-documents/conciergerie/08-incident-prestataires.csv",
      downloadHref: "/systeme-documents/conciergerie/08-incident-prestataires.csv",
    },
    [normalizeDocumentLabel("Planning ménage/interventions + Passation")]: {
      csvHref: "/systeme-documents/conciergerie/09-planning-menage-interventions-passation.csv",
      downloadHref: "/systeme-documents/conciergerie/09-planning-menage-interventions-passation.csv",
    },
    [normalizeDocumentLabel("Suivi réservations, commissions et dépenses")]: {
      csvHref: "/systeme-documents/conciergerie/10-reservations-commissions-depenses.csv",
      downloadHref: "/systeme-documents/conciergerie/10-reservations-commissions-depenses.csv",
    },
    [normalizeDocumentLabel("Suivi versements plateformes/propriétaires + Relances")]: {
      csvHref: "/systeme-documents/conciergerie/11-versements-plateformes-proprietaires-relances.csv",
      downloadHref: "/systeme-documents/conciergerie/11-versements-plateformes-proprietaires-relances.csv",
    },
    [normalizeDocumentLabel("Dossier logement, accès, règlement intérieur et preuves")]: {
      csvHref: "/systeme-documents/conciergerie/12-logement-acces-reglement-preuves.csv",
      downloadHref: "/systeme-documents/conciergerie/12-logement-acces-reglement-preuves.csv",
    },
  },
};

export function getSystemDocumentAsset(
  systemSlug: string,
  document: string,
): DocumentAsset | null {
  const assetKey = SYSTEM_DOCUMENT_GROUP_ALIASES[systemSlug] ?? systemSlug;
  const sectorAssets = SYSTEM_DOCUMENT_ASSETS[assetKey];

  if (!sectorAssets) {
    return null;
  }

  return sectorAssets[normalizeDocumentLabel(document)] ?? null;
}
