import type { SystemeRoutine } from "@/lib/systeme-catalog";
import { getPublishedCopyableModelForOrganiserSlug } from "@/lib/copyable-model-catalog";
import { ORGANISER_PROCESS_GUIDES } from "@/lib/organiser-process-guides";
import { findCuratedSystemProcessRoutines } from "@/lib/system-process-routines";

const SYSTEM_PROCESS_GUIDE_SOURCE_PROCESS_IDS = {
  "organiser-entreprise-plomberie":
    "process.btp.marketing-vente.attirer-et-vendre-un-chantier",
  "demandes-clients-cabinet-comptable":
    "process.cabinets-reglementes.operations.ouvrir-et-tenir-un-dossier-client",
  "organiser-demandes-devis-renovation":
    "process.btp.marketing-vente.attirer-et-vendre-un-chantier",
  "organiser-chantier-menuiserie":
    "process.btp.operations.demarrer-et-cloturer-un-chantier",
  "organiser-interventions-nettoyage":
    "process.securite-services-terrain.operations.planifier-les-interventions-ou-rondes",
  "organiser-parcours-client-garage":
    "process.production-atelier.operations.ouvrir-suivre-et-cloturer-un-ordre-de-fabrication-ou-dintervention",
  "organiser-commandes-stocks-restaurant":
    "process.fast-food.operations.ne-jamais-manquer-de-stock",
  "organiser-suivi-administratif-formation":
    "process.organisme-formation.operations.planifier-sessions-formateurs-et-ressources",
  "organiser-mission-agence":
    "process.agences-digitales-creation.operations.cadrer-un-brief-et-un-perimetre",
  "centraliser-demandes-telephone-sms-whatsapp":
    "process.btp.marketing-vente.attirer-et-vendre-un-chantier",
  "organiser-planning-plusieurs-techniciens":
    "process.btp.equipe.organiser-les-equipes-remplacer-un-absent",
  "bon-intervention-facture-sans-ressaisie":
    "process.btp.operations.demarrer-et-cloturer-un-chantier",
} as const;

export type OperationalOrganiserGuideSlug =
  keyof typeof SYSTEM_PROCESS_GUIDE_SOURCE_PROCESS_IDS;

export type SystemProcessGuideDetail = Readonly<{
  model: null | Readonly<{
    href: string;
    title: string;
  }>;
  result: string;
  routineId: string;
  slug: OperationalOrganiserGuideSlug;
  steps: readonly Readonly<{
    label: string;
    title: string;
    output: string;
  }>[];
  title: string;
  tools: readonly Readonly<{
    href: string;
    name: string;
  }>[];
}>;

function getRoutineSourceProcessIds(
  systemSlug: string,
  routine: SystemeRoutine,
): readonly string[] {
  const curatedRoutine = findCuratedSystemProcessRoutines(systemSlug)?.find(
    (candidate) => candidate.routineId === routine.routineId,
  );

  if (curatedRoutine) return curatedRoutine.sourceProcessIds;

  const derivedRoutinePrefix = `routine.${systemSlug}.`;
  return routine.routineId.startsWith(derivedRoutinePrefix)
    ? [routine.routineId.slice(derivedRoutinePrefix.length)]
    : [];
}

export function getOperationalOrganiserProcessGuides() {
  return ORGANISER_PROCESS_GUIDES.filter(
    (content): content is typeof content & {
      identity: typeof content.identity & { slug: OperationalOrganiserGuideSlug };
    } => content.identity.slug in SYSTEM_PROCESS_GUIDE_SOURCE_PROCESS_IDS,
  );
}

export function getSystemProcessGuideDetails(
  systemSlug: string,
  routines: readonly SystemeRoutine[],
): SystemProcessGuideDetail[] {
  const routineBySourceProcessId = new Map<string, SystemeRoutine>();

  for (const routine of routines) {
    for (const sourceProcessId of getRoutineSourceProcessIds(systemSlug, routine)) {
      if (!routineBySourceProcessId.has(sourceProcessId)) {
        routineBySourceProcessId.set(sourceProcessId, routine);
      }
    }
  }

  return getOperationalOrganiserProcessGuides().flatMap((content) => {
    const guide = content.processGuide;
    if (!guide || guide.system.slug !== systemSlug) return [];

    const sourceProcessId =
      SYSTEM_PROCESS_GUIDE_SOURCE_PROCESS_IDS[content.identity.slug];
    const routine = routineBySourceProcessId.get(sourceProcessId);
    if (!routine) return [];

    const model = getPublishedCopyableModelForOrganiserSlug(content.identity.slug);

    return [{
      model: model
        ? { href: `/modeles/${model.slug}`, title: model.title }
        : null,
      result: content.identity.promise,
      routineId: routine.routineId,
      slug: content.identity.slug,
      steps: guide.steps.map((step) => ({
        label: step.label,
        title: step.title,
        output: step.output,
      })),
      title: content.identity.title,
      tools: guide.tools.map((tool) => ({
        href: `/annuaire-outils/${tool.slug}`,
        name: tool.name,
      })),
    }];
  });
}
