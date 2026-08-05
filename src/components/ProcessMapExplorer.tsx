"use client";

import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  GraduationCap,
  MapPin,
  MessageSquareText,
  Star,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

type GroupKey = "attirer" | "choisir" | "fideliser";

type ProcessExample = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  groups: Record<GroupKey, readonly string[]>;
  preview: {
    visibilityLabel: string;
    visibilityTitle: string;
    visibilityMeta: string;
    webTitle: string;
    webDescription: string;
    webAction: string;
    messageTitle: string;
    messageBody: string;
    messageAction: string;
  };
};

const processExamples: readonly ProcessExample[] = [
  {
    id: "batiment",
    label: "Bâtiment",
    title: "Du premier besoin au prochain chantier recommandé",
    description:
      "Le système rend les réalisations visibles, facilite la demande de devis et poursuit la relation après le chantier.",
    icon: Building2,
    groups: {
      attirer: [
        "Fiche Google et présence locale structurées",
        "Photos, réalisations et contenus de chantier",
        "Première diffusion locale ciblée",
      ],
      choisir: [
        "Offre travaux et services prioritaires",
        "Espace web : zones, réalisations, avis et FAQ",
        "Demande de devis avec commune et photos",
        "Confirmation et tableau de suivi",
      ],
      fideliser: [
        "Relance des devis en attente",
        "Message envoyé après le chantier",
        "Demande d’avis avec lien direct",
        "Recommandation ou reprise de contact",
      ],
    },
    preview: {
      visibilityLabel: "Exemple de présence locale",
      visibilityTitle: "Atelier Martin",
      visibilityMeta: "Travaux & rénovation · Lyon et alentours",
      webTitle: "Vos travaux, expliqués clairement",
      webDescription:
        "Services, zones d’intervention, réalisations et demande de devis.",
      webAction: "Demander un devis",
      messageTitle: "Votre chantier est terminé",
      messageBody:
        "Merci pour votre confiance. Votre retour aidera d’autres clients à choisir sereinement.",
      messageAction: "Donner mon avis",
    },
  },
  {
    id: "services",
    label: "Services",
    title: "De votre expertise à une relation commerciale bien suivie",
    description:
      "L’expertise devient plus facile à comprendre, le rendez-vous est mieux préparé et aucune opportunité utile ne se perd.",
    icon: BriefcaseBusiness,
    groups: {
      attirer: [
        "Positionnement et offre principale clarifiés",
        "Articles ou vidéos sur les questions clients",
        "Diffusion Google, LinkedIn ou canal prioritaire",
      ],
      choisir: [
        "Périmètre, déroulement et prix de l’offre",
        "Espace web avec méthode, preuves et cas clients",
        "Formulaire de qualification et rendez-vous",
        "Confirmation et préparation automatiques",
      ],
      fideliser: [
        "Suivi après le rendez-vous ou la mission",
        "Relance des opportunités en attente",
        "Modèle de newsletter",
        "Demande de recommandation",
      ],
    },
    preview: {
      visibilityLabel: "Exemple de contenu d’expertise",
      visibilityTitle: "Cabinet Horizon",
      visibilityMeta: "Conseil financier pour dirigeants de TPE",
      webTitle: "Un accompagnement au périmètre clair",
      webDescription:
        "Méthode, livrables, cas clients, tarif et prise de rendez-vous.",
      webAction: "Choisir un créneau",
      messageTitle: "Votre rendez-vous est confirmé",
      messageBody:
        "Voici les trois informations utiles pour préparer notre échange.",
      messageAction: "Préparer mon rendez-vous",
    },
  },
  {
    id: "food",
    label: "Food",
    title: "De la découverte locale à l’envie de revenir",
    description:
      "Les produits sont faciles à découvrir, la commande ou la réservation devient évidente et le contact continue après l’achat.",
    icon: UtensilsCrossed,
    groups: {
      attirer: [
        "Fiche Google et informations pratiques à jour",
        "Photos, produits et savoir-faire visibles",
        "Première campagne ou diffusion locale",
      ],
      choisir: [
        "Offre, carte ou menu simplifiés",
        "Espace web avec produits, prix et horaires",
        "Réservation, commande ou renseignement",
        "Confirmation automatique",
      ],
      fideliser: [
        "Demande d’avis après l’achat",
        "Message pour annoncer une nouveauté",
        "Communication pour faire revenir",
        "Routine mensuelle de contenu et de suivi",
      ],
    },
    preview: {
      visibilityLabel: "Exemple de découverte locale",
      visibilityTitle: "L’Atelier du goût",
      visibilityMeta: "Cuisine maison · Sur place et à emporter",
      webTitle: "La carte, les horaires, la réservation",
      webDescription:
        "Les informations essentielles et la bonne action au même endroit.",
      webAction: "Réserver une table",
      messageTitle: "Merci pour votre visite",
      messageBody:
        "Une nouvelle carte arrive la semaine prochaine. Souhaitez-vous la découvrir ?",
      messageAction: "Voir les nouveautés",
    },
  },
  {
    id: "digital",
    label: "Produit digital",
    title: "De la première question à une utilisation accompagnée",
    description:
      "Le contenu aide à comprendre le sujet, l’offre permet de choisir sereinement et l’accueil aide le client à réellement utiliser le produit.",
    icon: GraduationCap,
    groups: {
      attirer: [
        "Contenus pédagogiques sur le problème principal",
        "Ressource utile pour découvrir le sujet",
        "Première diffusion ou campagne",
      ],
      choisir: [
        "Contenu, public, tarif et conditions de l’offre",
        "Espace web avec démonstration, preuves et FAQ",
        "Paiement, inscription ou démonstration",
        "Confirmation automatique",
      ],
      fideliser: [
        "Séquence d’accueil client",
        "Ressource de prise en main",
        "Modèle de newsletter",
        "Recommandation ou réactivation",
      ],
    },
    preview: {
      visibilityLabel: "Exemple de contenu pédagogique",
      visibilityTitle: "Cap Gestion",
      visibilityMeta: "Des ressources simples pour piloter son activité",
      webTitle: "Maîtrisez votre pilotage financier",
      webDescription:
        "Programme, démonstration, réponses aux questions et inscription.",
      webAction: "Découvrir le programme",
      messageTitle: "Bienvenue dans votre espace",
      messageBody:
        "Commencez par cette première étape pour prendre l’outil en main.",
      messageAction: "Commencer",
    },
  },
] as const;

const groupLabels: Record<GroupKey, string> = {
  attirer: "Attirer",
  choisir: "Faciliter le choix",
  fideliser: "Fidéliser",
};

function ProcessGroup({
  groupKey,
  steps,
}: {
  groupKey: GroupKey;
  steps: readonly string[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-dema-forest/15 bg-dema-positive p-5">
      <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-dema-forest">
        {groupLabels[groupKey]}
      </p>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-dema-line/80 bg-white/80 px-4 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dema-paper text-xs font-bold text-dema-forest">
              {index + 1}
            </span>
            <p className="text-base font-medium leading-6 text-brand-blue/72">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewGallery({ example }: { example: ProcessExample }) {
  const preview = example.preview;

  return (
    <div className="mt-16">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="text-balance text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl">
          Voici à quoi{" "}
          <span className="demaa-section-title text-dema-forest">
            votre système peut ressembler.
          </span>
        </h3>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-dema-muted">
          Trois aperçus concrets adaptés au métier sélectionné.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <article className="overflow-hidden rounded-[1.7rem] border border-dema-line bg-dema-paper shadow-[0_20px_55px_rgba(23,35,29,0.06)]">
          <div className="border-b border-dema-line bg-dema-canvas px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-dema-forest">
              Visibilité
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-dema-muted">{preview.visibilityLabel}</p>
            <div className="mt-4 rounded-2xl border border-dema-line bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dema-positive text-dema-forest">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-lg font-medium text-brand-blue">
                    {preview.visibilityTitle}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-dema-muted">
                    {preview.visibilityMeta}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-dema-forest">
                <span className="font-semibold">4,9</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />
                ))}
                <span className="text-dema-muted">Avis clients</span>
              </div>
              <div className="mt-4 h-20 rounded-xl bg-dema-sage/55" />
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.7rem] border border-dema-line bg-dema-paper shadow-[0_20px_55px_rgba(23,35,29,0.06)]">
          <div className="border-b border-dema-line bg-dema-canvas px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-dema-forest">
              Espace web
            </p>
          </div>
          <div className="p-5">
            <div className="overflow-hidden rounded-2xl border border-dema-line bg-white">
              <div className="flex h-8 items-center gap-1.5 border-b border-dema-line px-3">
                <span className="h-1.5 w-1.5 rounded-full bg-dema-muted/35" />
                <span className="h-1.5 w-1.5 rounded-full bg-dema-muted/35" />
                <span className="h-1.5 w-1.5 rounded-full bg-dema-muted/35" />
              </div>
              <div className="p-5">
                <p className="text-2xl font-light leading-tight tracking-[-0.035em] text-brand-blue">
                  {preview.webTitle}
                </p>
                <p className="mt-3 text-sm leading-5 text-dema-muted">
                  {preview.webDescription}
                </p>
                <span className="mt-5 inline-flex rounded-full bg-dema-forest px-4 py-2 text-xs font-semibold text-white">
                  {preview.webAction}
                </span>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((block) => (
                    <div
                      key={block}
                      className="h-10 rounded-lg bg-dema-positive"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.7rem] border border-dema-line bg-dema-paper shadow-[0_20px_55px_rgba(23,35,29,0.06)]">
          <div className="border-b border-dema-line bg-dema-canvas px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-dema-forest">
              Suivi
            </p>
          </div>
          <div className="p-5">
            <div className="rounded-2xl border border-dema-line bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-medium text-brand-blue">
                {preview.messageTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-dema-muted">
                {preview.messageBody}
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-dema-forest">
                {preview.messageAction}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-dema-line pt-4 text-xs text-dema-muted">
                <Check className="h-3.5 w-3.5 text-dema-forest" />
                Envoi relié au parcours client
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function ProcessMapExplorer() {
  const [activeId, setActiveId] = useState(processExamples[0].id);
  const activeExample =
    processExamples.find((example) => example.id === activeId) ??
    processExamples[0];

  return (
    <section
      id="exemples"
      className="scroll-mt-10 bg-dema-paper py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="text-balance font-light tracking-[-0.05em] text-brand-blue"
            style={{ fontSize: "clamp(2.7rem, 5vw, 4.9rem)", lineHeight: 0.98 }}
          >
            Chaque activité a{" "}
            <span className="demaa-section-title text-dema-forest">
              son propre système.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-dema-muted">
            Choisissez une activité pour voir concrètement ce qui peut être mis
            en place.
          </p>
        </div>

        <div
          className="mt-12 grid gap-2 rounded-[1.5rem] border border-dema-line bg-dema-paper p-2 shadow-[0_16px_45px_rgba(23,35,29,0.04)] sm:grid-cols-2 lg:grid-cols-4"
          role="tablist"
          aria-label="Exemples selon l’activité"
        >
          {processExamples.map((example) => {
            const Icon = example.icon;
            const active = example.id === activeExample.id;

            return (
              <button
                key={example.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`process-panel-${example.id}`}
                onClick={() => setActiveId(example.id)}
                className={`flex min-h-16 items-center justify-center gap-3 rounded-[1.1rem] px-4 py-3 text-center transition ${
                  active
                    ? "bg-dema-forest text-white"
                    : "text-brand-blue/62 hover:bg-dema-positive"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-base font-medium">{example.label}</span>
              </button>
            );
          })}
        </div>

        <div
          id={`process-panel-${activeExample.id}`}
          role="tabpanel"
          className="mt-5 overflow-hidden rounded-[2rem] border border-dema-line bg-dema-paper shadow-[0_22px_70px_rgba(23,35,29,0.05)]"
        >
          <div className="grid gap-6 border-b border-dema-line p-7 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <h3
              className="max-w-2xl text-balance font-light tracking-[-0.045em] text-brand-blue"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3.45rem)", lineHeight: 1 }}
            >
              {activeExample.title}
            </h3>
            <p className="max-w-2xl text-base leading-7 text-dema-muted">
              {activeExample.description}
            </p>
          </div>

          <div className="grid items-stretch gap-3 bg-white p-5 sm:p-7 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <ProcessGroup
              groupKey="attirer"
              steps={activeExample.groups.attirer}
            />
            <div className="hidden items-center lg:flex">
              <ArrowRight
                className="h-5 w-5 text-dema-forest/35"
                aria-hidden="true"
              />
            </div>
            <ProcessGroup
              groupKey="choisir"
              steps={activeExample.groups.choisir}
            />
            <div className="hidden items-center lg:flex">
              <ArrowRight
                className="h-5 w-5 text-dema-forest/35"
                aria-hidden="true"
              />
            </div>
            <ProcessGroup
              groupKey="fideliser"
              steps={activeExample.groups.fideliser}
            />
          </div>
        </div>

        <PreviewGallery example={activeExample} />
      </div>
    </section>
  );
}
