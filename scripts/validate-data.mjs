import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");
const toolDirectoryPath = resolve(rootDir, "src/lib/tool-directory.json");
const enterpriseAnnuairePath = resolve(rootDir, "src/lib/enterprise-annuaire.json");
const customerDealsPath = resolve(rootDir, "src/lib/customer-deals.ts");
const systemResourcesPath = resolve(rootDir, "src/lib/system-resources.ts");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function resolveToolScope(tool, ref) {
  return ref?.scope ?? tool?.scope;
}

function extractCustomerDealToolSlugs() {
  if (!fs.existsSync(customerDealsPath)) {
    return [];
  }

  const source = fs.readFileSync(customerDealsPath, "utf8");
  return [...source.matchAll(/toolSlug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

function extractSystemResourceSlugs() {
  const source = fs.readFileSync(systemResourcesPath, "utf8");
  const match = source.match(/const flexibleSystemSlugs = \[([\s\S]*?)\];/);

  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((slugMatch) => slugMatch[1]);
}

const toolPayload = readJson(toolDirectoryPath);
const enterprisePayload = readJson(enterpriseAnnuairePath);

if (!Array.isArray(toolPayload.tools)) {
  throw new Error("Invalid tool-directory.json: expected tools array.");
}

if (!Array.isArray(enterprisePayload.enterprises)) {
  throw new Error("Invalid enterprise-annuaire.json: expected enterprises array.");
}

const errors = [];
const warnings = [];
const toolSlugs = new Set();
const activeToolSlugs = new Set();

for (const tool of toolPayload.tools) {
  if (!tool.slug) {
    addUnique(errors, `Tool without slug: ${tool.name ?? "<unknown>"}`);
    continue;
  }

  if (toolSlugs.has(tool.slug)) {
    addUnique(errors, `Duplicate tool slug: ${tool.slug}`);
  }

  toolSlugs.add(tool.slug);

  const requiredFields = ["name", "url", "category", "description", "bestFor", "pricingHint"];
  for (const field of requiredFields) {
    if (!tool[field]) {
      addUnique(errors, `Tool ${tool.slug} is missing ${field}.`);
    }
  }

  if (!Array.isArray(tool.sectors) || !tool.sectors.length) {
    addUnique(errors, `Tool ${tool.slug} needs at least one sector.`);
  }

  if (!Array.isArray(tool.tags)) {
    addUnique(errors, `Tool ${tool.slug} needs tags array.`);
  }

  if (tool.scope && !["business", "transverse"].includes(tool.scope)) {
    addUnique(errors, `Tool ${tool.slug} has invalid scope: ${tool.scope}`);
  }

  if (!tool.scope) {
    addUnique(warnings, `Tool ${tool.slug} has no scope.`);
  }

  if (tool.status !== "hidden" && tool.status !== "deprecated") {
    activeToolSlugs.add(tool.slug);
  }
}

const enterpriseSlugs = new Set();
const onlyTransverseSystems = [];

for (const enterprise of enterprisePayload.enterprises) {
  if (!enterprise.slug) {
    addUnique(errors, `Enterprise without slug: ${enterprise.name ?? "<unknown>"}`);
    continue;
  }

  if (enterpriseSlugs.has(enterprise.slug)) {
    addUnique(errors, `Duplicate enterprise slug: ${enterprise.slug}`);
  }

  enterpriseSlugs.add(enterprise.slug);

  const refs = Array.isArray(enterprise.toolRefs) ? enterprise.toolRefs : [];
  if (!refs.length) {
    addUnique(errors, `Enterprise ${enterprise.slug} has no toolRefs.`);
    continue;
  }

  let businessCount = 0;

  for (const ref of refs) {
    if (!ref.slug) {
      addUnique(errors, `Enterprise ${enterprise.slug} has a toolRef without slug.`);
      continue;
    }

    if (ref.scope && !["business", "transverse"].includes(ref.scope)) {
      addUnique(errors, `Enterprise ${enterprise.slug} toolRef ${ref.slug} has invalid scope: ${ref.scope}`);
    }

    if (!toolSlugs.has(ref.slug)) {
      addUnique(errors, `Enterprise ${enterprise.slug} references unknown tool ${ref.slug}.`);
      continue;
    }

    if (!activeToolSlugs.has(ref.slug)) {
      addUnique(errors, `Enterprise ${enterprise.slug} references inactive tool ${ref.slug}.`);
      continue;
    }

    const tool = toolPayload.tools.find((item) => item.slug === ref.slug);
    if (resolveToolScope(tool, ref) !== "transverse") {
      businessCount += 1;
    }
  }

  if (businessCount === 0) {
    onlyTransverseSystems.push(`${enterprise.slug} (${enterprise.name})`);
  }
}

const dealToolSlugs = extractCustomerDealToolSlugs();
for (const slug of dealToolSlugs) {
  if (!toolSlugs.has(slug)) {
    addUnique(errors, `Customer deal references unknown tool ${slug}.`);
  }
}

for (const tool of toolPayload.tools.filter((item) => item.memberDealLabel)) {
  if (!dealToolSlugs.includes(tool.slug)) {
    addUnique(warnings, `Tool ${tool.slug} has memberDealLabel but no customer deal toolSlug.`);
  }
}

const resourceSystemSlugs = extractSystemResourceSlugs();
for (const slug of resourceSystemSlugs) {
  if (!enterpriseSlugs.has(slug)) {
    addUnique(errors, `System resource references unknown enterprise ${slug}.`);
  }
}

for (const slug of onlyTransverseSystems) {
  addUnique(warnings, `System has only transverse tools: ${slug}`);
}

const result = {
  tools: toolPayload.tools.length,
  activeTools: activeToolSlugs.size,
  enterprises: enterprisePayload.enterprises.length,
  customerDealToolSlugs: dealToolSlugs.length,
  resourceSystemSlugs: resourceSystemSlugs.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
