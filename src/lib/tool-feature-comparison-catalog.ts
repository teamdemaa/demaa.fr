import { getEnterpriseBusinessModel } from "@/lib/business-models";

export type GenericToolComparisonFeature = Readonly<{
  featureId: string;
  capabilityId: string;
  label: string;
  description: string;
  matchTerms: readonly string[];
}>;

type CapabilityDefinition = Readonly<{
  label: string;
  description: string;
  matchTerms: readonly string[];
}>;

type ProfileItem =
  | string
  | Readonly<{
      capability: string;
      label: string;
      description?: string;
    }>;

function capability(
  label: string,
  matchTerms: readonly string[],
  description = `Prise en charge de la fonctionnalité « ${label.toLowerCase()} » dans l’outil.`,
): CapabilityDefinition {
  return { label, description, matchTerms };
}

const CAPABILITIES: Readonly<Record<string, CapabilityDefinition>> = {
  crm: capability("Clients et prospects", ["crm", "prospect", "pipeline commercial", "gestion client"]),
  quotes: capability("Devis et propositions", ["devis", "proposition commerciale", "chiffrage"]),
  esignature: capability("Signature électronique", ["signature électronique", "signature en ligne", "e-signature"]),
  contracts: capability("Contrats et mandats", ["contrat", "mandat", "lettre de mission"]),
  client_onboarding: capability("Onboarding client", ["onboarding", "accueil client", "entrée client", "inscription client"]),
  client_portal: capability("Portail client", ["portail client", "espace client", "extranet client", "relation locataires", "relation propriétaires", "échanges centralisés"]),
  client_requests: capability("Demandes clients", ["demandes clients", "demande client", "collecte client", "éléments attendus"]),
  email_automation: capability("E-mails et relances automatisés", ["relances automatisées", "automatisation email", "email automation", "campagne email", "marketing automation"]),
  appointments: capability("Rendez-vous et réservation", ["rendez-vous", "réservation en ligne", "prise de rendez-vous", "booking"]),
  calendar: capability("Planning et calendrier", ["planning", "calendrier", "agenda partagé", "planification"]),
  tasks: capability("Tâches et workflows", ["gestion des tâches", "tâches", "workflow", "workflows"]),
  projects: capability("Projets et missions", ["gestion de projet", "projets", "missions", "affaires"]),
  collaboration: capability("Collaboration d’équipe", ["collaboration", "travail collaboratif", "commentaires", "partage d'équipe"]),
  documents: capability("Documents et fichiers", ["gestion documentaire", "documents", "ged", "fichiers", "drive"]),
  forms: capability("Formulaires et collecte terrain", ["formulaire", "formulaires", "collecte terrain", "saisie mobile"]),
  time_tracking: capability("Temps et pointage", ["suivi des temps", "temps passé", "pointage", "feuille de temps"]),
  team_planning: capability("Planning des équipes", ["planning équipe", "planning des équipes", "planning collaborateurs", "gestion des équipes"]),
  invoicing: capability("Facturation", ["facturation", "factures", "invoice"]),
  electronic_invoicing: capability("Facturation électronique", ["facturation électronique", "facture électronique", "pdp"]),
  // "TPE" is deliberately excluded: in French product copy it usually means
  // "très petite entreprise", not "terminal de paiement".
  payments: capability("Paiements et encaissements", ["paiement", "encaissement", "terminal de paiement"]),
  payment_reminders: capability("Suivi des règlements et relances", ["relance impayé", "relances de paiement", "suivi des règlements", "recouvrement"]),
  profitability: capability("Rentabilité et marges", ["rentabilité", "marge", "coûts", "profitabilité"]),
  reporting: capability("Tableaux de bord et reporting", ["tableau de bord", "tableaux de bord", "reporting", "analytics", "indicateurs"]),
  accounting_export: capability("Export et synchronisation comptable", ["export comptable", "synchronisation comptable", "pré-comptabilité", "connexion comptable"]),
  integrations: capability("API et intégrations", ["api", "intégrations", "connecteurs", "webhook"]),
  mobile: capability("Application mobile", ["application mobile", "app mobile", "mobile", "terrain"]),
  inventory: capability("Stocks et inventaires", ["gestion des stocks", "stock", "inventaire"]),
  purchasing: capability("Achats et fournisseurs", ["achats", "fournisseurs", "commandes fournisseurs", "approvisionnement"]),
  catalog: capability("Catalogue et offres", ["catalogue", "produits", "prestations", "offres"]),
  pos: capability("Caisse et point de vente", ["logiciel de caisse", "caisse", "point de vente", "pos"]),
  loyalty: capability("Fidélité client", ["fidélité", "programme de fidélité", "carte fidélité"]),
  targeted_campaigns: capability("Campagnes clients ciblées", ["campagnes ciblées", "campagnes clients", "segmentation client"]),
  multi_site: capability("Gestion multi-sites", ["multi-site", "multi établissements", "multi boutique", "multi magasin"]),
  orders: capability("Commandes clients", ["gestion des commandes", "commandes clients", "commande en ligne"]),
  delivery: capability("Livraison et expédition", ["livraison", "expédition", "transporteur", "shipping"]),
  returns: capability("Retours et SAV", ["retours", "sav", "service après-vente", "réclamation"]),
  support: capability("Support et tickets", ["ticket", "support client", "helpdesk", "service client"]),
  knowledge_base: capability("Base de connaissances", ["base de connaissances", "knowledge base", "wiki", "documentation interne"]),
  website: capability("Site web et publication", ["site web", "cms", "publication web", "website"]),
  ecommerce: capability("Vente en ligne", ["e-commerce", "boutique en ligne", "vente en ligne", "checkout"]),
  marketplace_channels: capability("Diffusion multicanale", ["multicanal", "marketplace", "canaux de vente", "channel manager", "multidiffusion", "diffusion d’annonces", "ota", "distribution hôtelière"]),
  reviews: capability("Avis et réputation", ["avis clients", "e-réputation", "réputation", "reviews"]),
  analytics: capability("Mesure et analyse", ["analytics", "analyse", "mesure de performance", "conversion"]),
  content: capability("Contenus et supports", ["création de contenu", "contenu", "vidéo", "design", "visuel"]),
  design: capability("Maquettes et design", ["maquette", "prototypage", "design", "wireframe"]),
  code: capability("Code et versions", ["gestion de code", "versioning", "git", "dépôt de code"]),
  roadmap: capability("Roadmap et backlog", ["roadmap", "backlog", "sprint", "kanban"]),
  deployment: capability("Déploiement et hébergement", ["déploiement", "hébergement", "hosting", "ci/cd"]),
  monitoring: capability("Suivi technique et incidents", ["monitoring", "observabilité", "erreurs", "incidents"]),
  subscriptions: capability("Abonnements et revenus récurrents", ["abonnement", "revenus récurrents", "subscription", "mrr"]),
  site_tracking: capability("Suivi de chantier", ["suivi de chantier", "avancement chantier", "chantier", "journal de chantier"]),
  site_documents: capability("Photos et rapports terrain", ["photos chantier", "rapport de chantier", "documents terrain", "photos terrain"]),
  quality: capability("Qualité et contrôles", ["qualité", "contrôle qualité", "checklist", "non-conformité"]),
  compliance: capability("Conformité et traçabilité", ["conformité", "traçabilité", "audit", "registre"]),
  maintenance: capability("Maintenance et interventions", ["maintenance", "intervention", "gmao", "dépannage"]),
  routes: capability("Tournées et itinéraires", ["tournée", "itinéraire", "optimisation de tournée", "route planning"]),
  gps: capability("Géolocalisation et flotte", ["géolocalisation", "gps", "gestion de flotte", "télématique"]),
  proof_of_service: capability("Preuves d’intervention ou de livraison", ["preuve de livraison", "preuve d'intervention", "signature client", "pod"]),
  incidents: capability("Incidents et litiges", ["incident", "litige", "sinistre", "casse"]),
  reservations: capability("Réservations", ["réservations", "réservation en ligne", "booking engine"]),
  menu: capability("Carte et menus", ["gestion de menu", "carte restaurant", "menu digital", "menu"]),
  kitchen: capability("Cuisine et production", ["écran cuisine", "kds", "production cuisine", "fiches techniques"]),
  food_cost: capability("Recettes et food cost", ["food cost", "fiches recettes", "coût matière", "recettes"]),
  haccp: capability("Hygiène et HACCP", ["haccp", "hygiène", "traçabilité alimentaire", "plan sanitaire"]),
  admissions: capability("Admissions et inscriptions", ["admission", "inscription", "candidature", "dossier apprenant"]),
  funding: capability("Financements et prises en charge", ["opco", "financement formation", "prise en charge", "cpf"]),
  lms: capability("Plateforme pédagogique", ["lms", "e-learning", "formation en ligne", "parcours pédagogique"]),
  attendance: capability("Présences et émargement", ["émargement", "présence", "assiduité", "attendance"]),
  assessments: capability("Évaluations et certifications", ["évaluation", "quiz", "certification", "attestation"]),
  production_planning: capability("Planification de production", ["planification de production", "ordonnancement", "mrp", "planning production"]),
  bom: capability("Nomenclatures et gammes", ["nomenclature", "gamme de fabrication", "bom"]),
  work_orders: capability("Ordres de fabrication", ["ordre de fabrication", "of", "work order"]),
  machines: capability("Machines et équipements", ["machines", "équipements", "oee", "trs"]),
  traceability: capability("Lots et traçabilité", ["lot", "numéro de série", "traçabilité", "date d'expiration"]),
  vehicles: capability("Véhicules et historique", ["véhicule", "immatriculation", "historique véhicule", "parc automobile"]),
  diagnosis: capability("Diagnostic et ordre de réparation", ["diagnostic", "ordre de réparation", "or atelier"]),
  parts: capability("Pièces détachées", ["pièces détachées", "catalogue pièces", "pièces automobile"]),
  workshop: capability("Planning atelier", ["planning atelier", "atelier", "charge atelier"]),
  pms: capability("PMS et gestion des séjours", ["pms", "gestion hôtelière", "gestion d’établissement", "séjour", "réception hôtel"]),
  channel_manager: capability("Channel manager", ["channel manager", "ota", "booking.com", "expedia"]),
  revenue_management: capability("Tarifs et revenue management", ["revenue management", "tarification dynamique", "yield", "prix des chambres"]),
  housekeeping: capability("Ménage et chambres", ["housekeeping", "ménage", "statut des chambres"]),
  patient_records: capability("Dossiers patients", ["dossier patient", "dmp", "dossier médical", "fiche patient"]),
  clinical_notes: capability("Consultations et notes cliniques", ["consultation", "notes cliniques", "compte rendu médical", "suivi patient"]),
  prescriptions: capability("Ordonnances et prescriptions", ["ordonnance", "prescription", "e-prescription"]),
  teleconsultation: capability("Téléconsultation", ["téléconsultation", "consultation vidéo", "télémédecine"]),
  secure_messaging: capability("Messagerie sécurisée", ["messagerie sécurisée", "mssanté", "message patient"]),
  health_billing: capability("Facturation et télétransmission", ["télétransmission", "feuille de soins", "sesam-vitale", "facturation santé"]),
  consent: capability("Consentements et documents signés", ["consentement", "signature patient", "documents signés"]),
  prescriptions_fulfillment: capability("Ordonnances et délivrance", ["délivrance", "ordonnance", "dispensation"]),
  third_party_payer: capability("Tiers payant", ["tiers payant", "mutuelle", "assurance maladie"]),
  memberships: capability("Adhésions et membres", ["adhésion", "adhérent", "membres", "cotisation"]),
  donations: capability("Dons et collectes", ["don", "collecte de fonds", "fundraising", "mécénat"]),
  events: capability("Événements et billetterie", ["événement", "billetterie", "inscription événement"]),
  volunteers: capability("Bénévoles", ["bénévole", "volontariat", "planning bénévoles"]),
  governance: capability("Gouvernance et votes", ["assemblée générale", "vote", "gouvernance", "conseil d'administration"]),
  grants: capability("Subventions et budgets", ["subvention", "budget", "financement public"]),
  family_registration: capability("Inscriptions des familles", ["inscription famille", "préinscription", "dossier famille"]),
  child_records: capability("Dossiers enfants", ["dossier enfant", "fiche enfant", "informations enfant"]),
  attendance_children: capability("Présences des enfants", ["présence enfant", "pointage enfant", "planning enfant"]),
  transmissions: capability("Transmissions aux familles", ["transmission", "journal de l'enfant", "cahier de liaison"]),
  health_children: capability("Santé, allergies et protocoles", ["allergie", "protocole santé", "pai", "santé enfant"]),
  parent_portal: capability("Portail familles", ["portail famille", "espace parent", "application parents"]),
  property_management: capability("Gestion locative", ["gestion locative", "locataire", "propriétaire", "bail", "loyer"]),
  training_management: capability("Gestion des formations", ["gestion de formation", "organisme de formation", "erp formation", "qualiopi", "apprenant"]),
  legal_calculations: capability("Actes et calculs juridiques", ["actes", "calculs juridiques", "droit de la famille", "donation", "fiscalité"]),
  investment_analysis: capability("Analyse des investissements", ["allocation", "fonds", "portefeuille", "investissement", "analyse financière"]),
  land_registry: capability("Données foncières et parcelles", ["foncier", "parcelle", "géomètre", "cadastre"]),
  seo_keywords: capability("Recherche de mots-clés", ["recherche de mots-clés", "mots-clés", "keyword research"]),
  seo_audit: capability("Audit SEO technique", ["audit technique", "audit seo", "alertes techniques"]),
  seo_backlinks: capability("Analyse des backlinks", ["backlinks", "liens externes", "analyse de liens"]),
  seo_rank_tracking: capability("Suivi des positions", ["suivi des positions", "positions seo", "rank tracking"]),
  search_performance: capability("Requêtes et performance organique", ["requêtes et clics organiques", "performance organique", "search performance"]),
  search_indexing: capability("Indexation du site", ["couverture de l’index", "indexation", "indexing"]),
  url_inspection: capability("Inspection des URL", ["inspection d’url", "url inspection"]),
  cyber_assets: capability("Découverte des actifs", ["découverte des actifs", "inventaire des actifs", "asset discovery"]),
  cyber_vulnerabilities: capability("Scan des vulnérabilités", ["scans de vulnérabilités", "vulnérabilités", "vulnerability scanning"]),
  cyber_endpoint: capability("Protection des terminaux", ["protection des terminaux", "endpoint protection", "terminaux"]),
  cyber_attack_surface: capability("Réduction de la surface d’attaque", ["surface d’attaque", "attack surface"]),
  cyber_investigation: capability("Investigation des incidents", ["investigation", "détection des menaces", "threat detection"]),
  cyber_remediation: capability("Remédiation de sécurité", ["remédiation", "suivi de la remédiation", "remédiation automatisée"]),
  legal_research: capability("Recherche juridique", ["recherche juridique", "ia juridique", "recherche documentaire", "jurisprudence"]),
  audio_video_editing: capability("Montage audio et vidéo", ["montage audio", "montage vidéo", "montage audio et video", "transcription", "podcast"]),
  transport_visibility: capability("Suivi des expéditions en temps réel", ["visibilité transport", "suivi multimodal", "suivi des livraisons", "tracking", "eta"]),
  credit_case_management: capability("Dossiers de financement", ["dossier de financement", "courtier", "crédit", "iobsp", "partenaires bancaires"]),
  driving_learning: capability("Pédagogie et suivi des élèves", ["pédagogie", "code de la route", "suivi élèves", "auto-école"]),
  webinars: capability("Webinaires et événements en ligne", ["webinaire", "événement en ligne", "formation live", "démo produit"]),
  notarial_workflows: capability("Formalités et parcours notariaux", ["formalités", "notaire", "échanges sécurisés", "services office"]),
  veterinary_management: capability("Gestion de clinique vétérinaire", ["vétérinaire", "dossiers animaux", "activité clinique", "clinique vétérinaire"]),
  laundry_management: capability("Suivi du linge et des opérations", ["blanchisserie", "pressing", "suivi linge", "scan"]),
  ride_management: capability("Courses, chauffeurs et commissions", ["chauffeurs", "courses", "commissions", "vtc"]),
  coaching_management: capability("Programmes et suivi de coaching", ["coaching", "programmes", "objectifs", "suivi des progrès", "suivi client"]),
  business_intelligence: capability("Business intelligence et datavisualisation", ["business intelligence", "bi", "modélisation", "visualisations interactives", "sources de données"]),
  ad_campaigns: capability("Création et pilotage des campagnes", ["campagnes search", "création de campagnes", "performance max", "social ads", "publicité"]),
  ad_audiences: capability("Audiences et ciblage publicitaire", ["gestion des audiences", "ciblage", "audiences"]),
  conversion_tracking: capability("Suivi des conversions", ["suivi des conversions", "mesure des résultats", "conversion"]),
  ad_budgets: capability("Budgets et enchères", ["pilotage des budgets", "budgets et enchères", "budget publicitaire"]),
  rent_tracking: capability("Suivi des loyers et quittances", ["suivi des loyers", "loyers", "quittances", "charges locatives"]),
  rental_documents: capability("Baux et documents locatifs", ["documents locatifs", "baux", "bail", "quittance"]),
  syndic_management: capability("Gestion de syndic", ["syndic", "copropriété", "appels de fonds"]),
  property_transactions: capability("Transaction immobilière", ["transaction", "mandats", "biens immobiliers"]),
  hotel_website: capability("Site internet hôtelier", ["site", "site hôtelier", "moteur de réservation direct"]),
  hotel_marketing: capability("Marketing hôtelier", ["marketing hôtelier", "acquisition voyageurs", "visibilité hôtelière"]),
  payroll_production: capability("Production des bulletins de paie", ["production des bulletins de paie", "génération des bulletins de paie", "gestion de la paie"]),
  payroll_variables: capability("Collecte et saisie des variables de paie", ["variables de paie", "éléments variables de paie"]),
  payroll_declarations: capability("DSN et déclarations sociales", ["dsn", "déclarations sociales"]),
  payroll_controls: capability("Contrôles et alertes de paie", ["contrôles de paie", "contrôle des dsn", "alertes paie", "validation des cycles de paie"]),
  payroll_legal_updates: capability("Mises à jour légales et conventionnelles", ["mises à jour légales", "évolutions légales et conventionnelles", "conventions collectives intégrées"]),
  payroll_multi_client: capability("Gestion multi-dossiers cabinet", ["gestion multi-dossiers", "portefeuille clients paie", "production sociale cabinet"]),
  payroll_accounting_entries: capability("Écritures comptables de paie", ["écritures comptables de paie", "export comptable de la paie", "od de paie"]),
  payroll_leave_absence: capability("Congés et absences", ["congés et absences", "gestion des congés", "gestion des absences"]),
  payroll_employee_portal: capability("Espace salarié", ["espace salarié", "espace employé", "application mobile salarié"]),
  payroll_distribution: capability("Distribution et archivage des bulletins", ["distribution des bulletins", "bulletins dématérialisés", "coffre-fort numérique"]),
  payroll_hr_documents: capability("Contrats et documents RH", ["documents rh", "documents administratifs", "signature électronique des contrats", "contrats et avenants"]),
  payroll_expenses: capability("Notes de frais", ["notes de frais", "gestion des notes de frais"]),
  payroll_onboarding: capability("Onboarding salarié", ["onboarding salarié", "parcours d’accueil salariés", "accueil de nouveaux collaborateurs"]),
};

export function isKnownToolComparisonCapabilityId(
  capabilityId: string,
): boolean {
  return Object.hasOwn(CAPABILITIES, capabilityId);
}

const SYSTEM_PROFILE_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  "gestionnaire-paie-independant": [
    "payroll_production",
    "payroll_variables",
    "payroll_declarations",
    "payroll_controls",
    "payroll_legal_updates",
    "payroll_multi_client",
    "payroll_accounting_entries",
    "payroll_leave_absence",
    "payroll_employee_portal",
    "payroll_distribution",
    "payroll_hr_documents",
    "payroll_expenses",
    "payroll_onboarding",
    "reporting",
    "integrations",
  ],
  restaurant: [
    "pos",
    "menu",
    "reservations",
    "orders",
    "kitchen",
    "delivery",
    "marketplace_channels",
    "inventory",
    "food_cost",
    "team_planning",
    "crm",
    "loyalty",
    "targeted_campaigns",
    "payments",
    "reporting",
  ],
};

const SYSTEM_PROFILE_ADDITIONS: Readonly<Record<string, readonly string[]>> = {
  "cabinet-davocat": ["legal_research"],
  "agence-marketing": ["website", "content", "analytics"],
  "creation-de-contenu": ["audio_video_editing", "content"],
  marketplace: ["ecommerce", "marketplace_channels", "payments"],
  media: ["content", "website", "analytics"],
  "agence-immobiliere": ["marketplace_channels"],
  syndic: ["property_management"],
  "gestion-locative": ["property_management"],
  "conciergerie-airbnb": ["reservations", "channel_manager"],
  "investissement-locatif": ["rent_tracking", "rental_documents", "syndic_management", "property_transactions", "property_management", "investment_analysis"],
  "investissement-immobilier": ["property_management", "investment_analysis"],
  "investissement-financier": ["investment_analysis"],
  "investissement-entreprise": ["projects", "time_tracking", "investment_analysis"],
  "transport-de-marchandise": ["transport_visibility", "delivery", "gps"],
  "hotel-hebergement-independant": ["hotel_website", "hotel_marketing", "marketplace_channels", "reservations", "channel_manager", "pms"],
  "fast-food": ["loyalty"],
  traiteur: ["content", "website"],
  boulangerie: ["content", "website"],
  "food-truck": ["content"],
  esthetique: ["content", "website"],
  "organisme-de-formation": ["training_management", "forms"],
  cfa: ["training_management", "forms"],
  "formation-en-ligne": ["training_management", "forms"],
  "reparation-informatique-mobile": ["pos", "payments"],
  "photographe-videaste": ["content", "documents"],
  "courtier-credit-assurance": ["credit_case_management", "documents", "crm"],
  "auto-ecole": ["driving_learning", "calendar", "client_portal"],
  evenementiel: ["events", "webinars", "reservations", "payments"],
  notaire: ["notarial_workflows", "legal_calculations", "esignature", "documents"],
  veterinaire: ["veterinary_management", "appointments", "invoicing", "inventory"],
  "agence-de-voyage": ["content", "website"],
  "diagnostiqueur-immobilier": ["land_registry", "forms", "team_planning", "mobile"],
  pressing: ["laundry_management", "invoicing", "inventory", "crm"],
  vtc: ["ride_management", "reservations", "appointments", "gps"],
  "coach-professionnel": ["coaching_management", "appointments", "crm", "documents"],
  "coach-sportif": ["coaching_management", "appointments", "invoicing", "client_portal"],
  geometre: ["land_registry"],
  "gestionnaire-de-patrimoine": ["investment_analysis"],
  "office-manager-externalise": ["forms", "tasks", "documents", "collaboration"],
  "secretariat-externalise": ["forms", "calendar", "documents"],
  "cabinet-qhse-conformite": ["forms", "tasks", "documents", "compliance"],
  "cabinet-etudes": ["business_intelligence", "analytics", "forms", "reporting"],
  "consultant-data-bi": ["business_intelligence", "analytics", "reporting", "integrations"],
  "infogerance-informatique": ["monitoring", "support", "maintenance"],
  "cybersecurite-pme": ["cyber_assets", "cyber_vulnerabilities", "cyber_endpoint", "cyber_attack_surface", "cyber_investigation", "cyber_remediation", "reporting", "compliance"],
  "integrateur-crm-erp": ["crm", "integrations", "projects"],
  "agence-seo": ["seo_keywords", "seo_audit", "seo_backlinks", "seo_rank_tracking", "search_performance", "search_indexing", "url_inspection", "analytics", "reporting", "content", "website"],
  "agence-acquisition-paid-ads": ["ad_campaigns", "ad_audiences", "conversion_tracking", "ad_budgets", "analytics", "reporting"],
};

const PROFILES: Readonly<Record<string, readonly ProfileItem[]>> = {
  "services-b2b-conseil": ["crm", "quotes", "esignature", "client_onboarding", "projects", "tasks", "calendar", "documents", "collaboration", "time_tracking", "invoicing", "payments", "profitability", "email_automation", "reporting"],
  "cabinet-reglemente": ["crm", "client_onboarding", "contracts", "esignature", "client_portal", "client_requests", "documents", "tasks", "calendar", "compliance", "time_tracking", "invoicing", "payments", "profitability", "reporting"],
  "tech-produit-digital": ["crm", "quotes", "design", "roadmap", "projects", "code", "deployment", "monitoring", "support", "knowledge_base", "analytics", "invoicing", "subscriptions", "collaboration", "integrations"],
  "formation-education": ["catalog", "crm", "admissions", "esignature", "documents", "funding", "calendar", "lms", "content", "attendance", "assessments", "compliance", "invoicing", "payments", "reporting"],
  restauration: ["pos", "menu", "reservations", "orders", "kitchen", "delivery", "inventory", "purchasing", "food_cost", "haccp", "team_planning", "loyalty", "payments", "profitability", "reporting"],
  "commerce-physique": ["pos", "catalog", "inventory", "purchasing", "orders", "loyalty", "ecommerce", "payments", "electronic_invoicing", "team_planning", "email_automation", "reporting", "profitability", "multi_site", "accounting_export"],
  ecommerce: ["ecommerce", "catalog", "payments", "orders", "inventory", "delivery", "returns", "support", "email_automation", "crm", "marketplace_channels", "reviews", "analytics", "invoicing", "integrations"],
  "beaute-bien-etre": ["appointments", "calendar", "crm", "email_automation", "payments", "pos", "contracts", "inventory", "forms", "loyalty", "team_planning", "time_tracking", "profitability", "reporting", "client_portal"],
  "industrie-production": ["crm", "orders", "production_planning", "bom", "work_orders", "machines", "inventory", "purchasing", "traceability", "quality", "maintenance", "profitability", "forms", "delivery", "integrations"],
  "btp-artisans": ["crm", "quotes", "esignature", "calendar", "mobile", "forms", "time_tracking", "inventory", "purchasing", "compliance", "invoicing", "payments", "profitability", "returns", "accounting_export"],
  "btp-projets": ["crm", "quotes", "esignature", "projects", "calendar", "team_planning", "site_documents", "site_tracking", "quality", "purchasing", "inventory", "time_tracking", "invoicing", "profitability", "mobile"],
  "services-domicile": ["crm", "contracts", "quotes", "calendar", "team_planning", "routes", "mobile", "forms", "time_tracking", "proof_of_service", "quality", "incidents", "client_portal", "invoicing", "profitability"],
  "immobilier-transaction": ["crm", "quotes", "contracts", "esignature", "catalog", "marketplace_channels", "appointments", "client_requests", "documents", "compliance", "email_automation", "client_portal", "invoicing", "profitability", "reporting"],
  "immobilier-gestion": ["crm", "contracts", "esignature", "documents", "client_portal", "invoicing", "payments", "accounting_export", "maintenance", "incidents", "purchasing", "governance", "email_automation", "reporting", "mobile"],
  "transport-mobilite": ["crm", "quotes", "orders", "calendar", "routes", "gps", "vehicles", "mobile", "proof_of_service", "documents", "maintenance", "incidents", "invoicing", "profitability", "integrations"],
  "automobile-reparation": ["crm", "vehicles", "appointments", "diagnosis", "quotes", "workshop", "parts", "inventory", "purchasing", "documents", "invoicing", "payments", "email_automation", "returns", "reporting"],
  "hebergement-tourisme": ["reservations", "channel_manager", "pms", "revenue_management", "crm", "client_portal", "payments", "housekeeping", "maintenance", "email_automation", "reviews", "catalog", "invoicing", "reporting", "integrations"],
  "sante-cabinet": ["appointments", "patient_records", "clinical_notes", "prescriptions", "teleconsultation", "secure_messaging", "consent", "documents", "health_billing", "payments", "email_automation", "compliance", "team_planning", "reporting", "integrations"],
  "sante-commerce-reglemente": ["pos", "crm", "prescriptions_fulfillment", "inventory", "purchasing", "traceability", "third_party_payer", "health_billing", "payments", "ecommerce", "appointments", "compliance", "team_planning", "reporting", "integrations"],
  "exploitation-autonome": ["pos", "crm", "orders", "forms", "tasks", "machines", "inventory", "email_automation", "payments", "delivery", "incidents", "maintenance", "accounting_export", "reporting", "multi_site"],
  association: ["memberships", "donations", "payments", "events", "email_automation", "crm", "volunteers", "projects", "tasks", "documents", "accounting_export", "grants", "governance", "website", "reporting"],
  "accueil-petite-enfance": ["family_registration", "child_records", "attendance_children", "calendar", "team_planning", "transmissions", "health_children", "parent_portal", "secure_messaging", "invoicing", "payments", "contracts", "esignature", "compliance", "reporting"],
};

export function getGenericToolComparisonFeatures(
  systemSlug: string,
): readonly GenericToolComparisonFeature[] | null {
  const businessModel = getEnterpriseBusinessModel(systemSlug);
  if (!businessModel) return null;

  const profile = PROFILES[businessModel.businessModelId];
  if (!profile?.length) return null;

  const override = SYSTEM_PROFILE_OVERRIDES[systemSlug];
  const additions = SYSTEM_PROFILE_ADDITIONS[systemSlug] ?? [];
  const orderedProfile: readonly ProfileItem[] =
    override ??
    [
      ...additions,
      ...profile.filter((item) => {
        const capabilityId = typeof item === "string" ? item : item.capability;
        return !additions.includes(capabilityId);
      }),
    ];
  const profileFeatures = orderedProfile.map((item) => {
    const capabilityId = typeof item === "string" ? item : item.capability;
    const definition = CAPABILITIES[capabilityId];
    if (!definition) {
      throw new Error(
        `Fonctionnalité de comparaison inconnue : ${businessModel.businessModelId}/${capabilityId}`,
      );
    }

    return {
      featureId: `${businessModel.businessModelId}.${capabilityId}`,
      capabilityId,
      label: typeof item === "string" ? definition.label : item.label,
      description:
        typeof item === "string"
          ? definition.description
          : item.description ?? definition.description,
      matchTerms: definition.matchTerms,
    };
  });

  return profileFeatures.slice(0, 15);
}

export function getToolComparisonBusinessModelIds(): readonly string[] {
  return Object.keys(PROFILES);
}
