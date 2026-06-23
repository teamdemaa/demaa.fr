import type { ToolDirectoryItem, ToolScope } from "./tool-directory";
import type { SystemPillar } from "./system-process-types";
import type { System } from "./types";
import {
  getEnterpriseBusinessModel,
  type BusinessModelBlock,
  type BusinessModelSignals,
} from "./business-models";
import rawEnterpriseAnnuaire from "./enterprise-annuaire.json";

export type EnterpriseTool = {
  slug?: string;
  name: string;
  type: string;
  usage: string;
  url?: string;
  scope?: ToolScope;
  detail?: ToolDirectoryItem;
};

export type EnterpriseToolReference = {
  slug: string;
  usage?: string;
  scope?: ToolScope;
};

export type EnterpriseProcess = {
  pillar: SystemPillar | "Finance & Juridique";
  title: string;
  description: string;
  examples?: string;
};

export type EnterpriseDefinition = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  icon: string;
  price: string;
  sectorLabel: string;
  imageTitle: string;
  imageSubtitle: string;
  processes?: EnterpriseProcess[];
  operationProcesses?: EnterpriseProcess[];
  processExamples?: Record<string, string>;
  tools?: EnterpriseTool[];
  toolRefs?: EnterpriseToolReference[];
  businessModelId?: string;
  businessVariant?: string;
  businessBlocks?: BusinessModelBlock[];
  businessSignals?: BusinessModelSignals;
  audience?: "b2b" | "b2c" | "mixed";
  offerType?: "service" | "product" | "commerce" | "platform" | "investment" | "production";
  visibility?: "primary" | "secondary" | "hidden";
};

type EnterpriseAnnuairePayload = {
  enterprises: EnterpriseDefinition[];
};

const enterpriseAnnuaire = rawEnterpriseAnnuaire as EnterpriseAnnuairePayload;

export const enterpriseCatalog = enterpriseAnnuaire.enterprises;

export const enterpriseCatalogBySlug = Object.fromEntries(
  enterpriseCatalog.map((enterprise) => [enterprise.slug, enterprise]),
);

export function enterpriseToSystem(enterprise: EnterpriseDefinition): System {
  return {
    id: enterprise.id,
    slug: enterprise.slug,
    name: enterprise.name,
    category: enterprise.category,
    description: enterprise.description,
    tags: enterprise.tags,
    icon: enterprise.icon,
    price: enterprise.price,
  };
}

export function enrichEnterpriseBusinessModel(enterprise: EnterpriseDefinition): EnterpriseDefinition {
  const businessModel = getEnterpriseBusinessModel(enterprise.slug);

  if (!businessModel) {
    return enterprise;
  }

  return {
    ...enterprise,
    businessModelId: enterprise.businessModelId || businessModel.businessModelId,
    businessVariant: enterprise.businessVariant || businessModel.variant,
    businessBlocks: enterprise.businessBlocks?.length
      ? enterprise.businessBlocks
      : businessModel.blocks,
    businessSignals: enterprise.businessSignals || businessModel.signals,
  };
}
