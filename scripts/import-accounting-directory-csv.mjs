import fs from "node:fs";
import path from "node:path";

const INPUT_PATH =
  process.argv[2] || path.resolve("/Users/oumougory/Apps/Demaa.fr/annuaire-aurea-complet.csv");
const OUTPUT_PATH = path.resolve(
  "/Users/oumougory/Apps/Demaa.fr/src/lib/generated-accounting-directory-firms.ts"
);

const DEPARTMENT_TO_REGION = {
  "01": "Auvergne-Rhone-Alpes",
  "06": "Provence-Alpes-Cote d'Azur",
  "13": "Provence-Alpes-Cote d'Azur",
  "14": "Normandie",
  "26": "Auvergne-Rhone-Alpes",
  "31": "Occitanie",
  "33": "Nouvelle-Aquitaine",
  "35": "Bretagne",
  "44": "Pays de la Loire",
  "45": "Centre-Val de Loire",
  "57": "Grand Est",
  "59": "Hauts-de-France",
  "69": "Auvergne-Rhone-Alpes",
  "72": "Pays de la Loire",
  "75": "Ile-de-France",
  "76": "Normandie",
  "78": "Ile-de-France",
  "85": "Pays de la Loire",
  "88": "Grand Est",
  "93": "Ile-de-France",
};

const LOCATION_NORMALIZATIONS = {
  "Châtillon-sur-Cha... (01)": "Chatillon-sur-Chalaronne (01)",
  "La Chapelle-sur-E... (44)": "La Chapelle-sur-Erdre (44)",
  "Les Sables-d'Olon... (85)": "Les Sables-d'Olonne (85)",
  "Le Chesnay-Rocque... (78)": "Le Chesnay-Rocquencourt (78)",
  "Bois Guillaume - ... (76)": "Bois-Guillaume (76)",
  "Le Pré-Saint-Gerv... (93)": "Le Pre-Saint-Gervais (93)",
};

const DEFAULT_SERVICES = ["Expertise comptable", "Pilotage"];
const DEFAULT_INDUSTRIES = ["Services"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (character !== "\r") {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u{1F3AF}/gu, "")
    .replace(/\u{1F3E2}/gu, "")
    .replace(/\u{1F50E}/gu, "")
    .replace(/\r/g, "")
    .trim();
}

function normalizeLocation(rawLocation) {
  const normalized = LOCATION_NORMALIZATIONS[rawLocation] || rawLocation;
  const match = normalized.match(/^(.*?)(?:\s+\(([\w-]+)\))?$/);
  const city = (match?.[1] || "").trim();
  const department = (match?.[2] || "").trim().padStart(2, "0");

  return {
    city,
    department,
    region: DEPARTMENT_TO_REGION[department] || "",
  };
}

function compactDescription(text) {
  if (!text) return "";
  const sanitized = cleanText(text)
    .replace(/\n{2,}/g, "\n")
    .replace(/\n\*/g, " *")
    .replace(/\s+/g, " ")
    .trim();

  if (sanitized.length <= 420) return sanitized;

  const sentences = sanitized.split(/(?<=[.!?])\s+/);
  let excerpt = "";
  for (const sentence of sentences) {
    if ((excerpt + " " + sentence).trim().length > 420) break;
    excerpt = `${excerpt} ${sentence}`.trim();
  }

  return excerpt || sanitized.slice(0, 420).trim();
}

function inferServices(description) {
  const content = description.toLowerCase();
  const services = new Set();

  if (/compta|expertise comptable/.test(content)) {
    services.add("Expertise comptable");
  }
  if (/fiscal/.test(content)) {
    services.add("Fiscalité");
  }
  if (/audit|commissariat/.test(content)) {
    services.add("Audit");
  }
  if (/juridique|droit/.test(content)) {
    services.add("Juridique");
  }
  if (/social|paie|rh/.test(content)) {
    services.add("Paie / social");
  }
  if (/conseil|pilotage|direction financi/.test(content)) {
    services.add("Pilotage");
  }
  if (/creation|cession|transmission/.test(content)) {
    services.add("Création d'entreprise");
  }

  return [...services];
}

function inferIndustries(description) {
  const content = description.toLowerCase();
  const industries = new Set();

  if (/restauration|hcr|chr/.test(content)) industries.add("CHR / restauration");
  if (/artisan/.test(content)) industries.add("Artisanat");
  if (/industrie/.test(content)) industries.add("Industrie");
  if (/immobili/.test(content)) industries.add("Immobilier");
  if (/sante|médecin|medecin/.test(content)) industries.add("Santé");
  if (/association|publique|public/.test(content)) industries.add("Associations");
  if (/startup|saas|tech/.test(content)) industries.add("Startups / SaaS");
  if (/btp|batiment/.test(content)) industries.add("BTP");
  if (/commerce/.test(content)) industries.add("Commerce");
  if (/profession lib/.test(content)) industries.add("Professions libérales");

  return [...industries];
}

function inferClientTypes(description, teamSize) {
  const content = description.toLowerCase();
  const clientTypes = new Set();

  if (/tpe|independant|freelance/.test(content)) clientTypes.add("TPE");
  if (/pme|pmi/.test(content)) clientTypes.add("PME");
  if (/eti/.test(content)) clientTypes.add("ETI");
  if (/groupe|international/.test(content)) clientTypes.add("Grands groupes");
  if (/startup/.test(content)) clientTypes.add("Startups");
  if (/association/.test(content)) clientTypes.add("Associations");

  if (clientTypes.size === 0) {
    if (teamSize.includes("1 à 9")) {
      clientTypes.add("TPE");
      clientTypes.add("Indépendants");
    } else if (teamSize.includes("10 à 19") || teamSize.includes("20 à 49")) {
      clientTypes.add("TPE");
      clientTypes.add("PME");
    } else if (teamSize.includes("50 à 99") || teamSize.includes("100 à 199")) {
      clientTypes.add("PME");
      clientTypes.add("ETI");
    } else {
      clientTypes.add("PME");
      clientTypes.add("ETI");
    }
  }

  return [...clientTypes];
}

function inferLanguages(description) {
  const content = description.toLowerCase();
  const languages = new Set(["Français"]);

  if (/international|allemagne|autriche|suisse|english|anglais/.test(content)) {
    languages.add("Anglais");
  }

  return [...languages];
}

function inferOfficeCount(teamSize) {
  if (teamSize.includes("2 000")) return 8;
  if (teamSize.includes("200 à 499")) return 4;
  if (teamSize.includes("100 à 199")) return 3;
  if (teamSize.includes("50 à 99")) return 2;
  return 1;
}

function fallbackDescription(name, city, region, tool) {
  const place = [city, region].filter(Boolean).join(", ");
  const placeText = place ? `basé à ${place}` : "référencé sur Demaa";
  const toolText = tool ? ` avec une affinite pour ${tool}` : "";

  return `Cabinet d'expertise comptable ${placeText}, utile pour accompagner les dirigeants sur la comptabilité, le pilotage et les obligations courantes${toolText}.`;
}

function toTsLiteral(value, indent = 0) {
  const spacing = " ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value
      .map((item) => `${spacing}  ${toTsLiteral(item, indent + 2)}`)
      .join(",\n")}\n${spacing}]`;
  }

  if (value && typeof value === "object") {
    return `{\n${Object.entries(value)
      .map(([key, item]) => `${spacing}  ${key}: ${toTsLiteral(item, indent + 2)}`)
      .join(",\n")}\n${spacing}}`;
  }

  return JSON.stringify(value);
}

const rows = parseCsv(fs.readFileSync(INPUT_PATH, "utf8"));
const headers = rows[0];
const records = rows.slice(1).filter((row) => row.some(Boolean));

const firms = records.map((row) => {
  const record = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
  const name = cleanText(record.Nom);
  const location = normalizeLocation(cleanText(record.Localisation));
  const rawDescription = compactDescription(record.Description);
  const services = inferServices(rawDescription);
  const industries = inferIndustries(rawDescription);
  const clientTypes = inferClientTypes(rawDescription, cleanText(record.Taille));
  const tool = cleanText(record.Outil).replace(/Pennylanne/gi, "Pennylane");

  return {
    id: cleanText(record.id) || slugify(name),
    slug: slugify(name),
    name,
    description:
      rawDescription ||
      fallbackDescription(name, location.city, location.region, tool),
    city: location.city || "Ville non renseignée",
    regions: location.region ? [location.region] : [],
    isOecVerified: false,
    tools: tool ? [tool] : [],
    services: services.length ? services : DEFAULT_SERVICES,
    industries: industries.length ? industries : DEFAULT_INDUSTRIES,
    clientTypes,
    languages: inferLanguages(rawDescription),
    hasCreationOffer: /création|creation|transmission|cession/.test(rawDescription.toLowerCase())
      ? "likely"
      : "unknown",
    acceptsNewClients: "likely",
    teamSize: cleanText(record.Taille) || "A completer",
    officeCount: inferOfficeCount(cleanText(record.Taille)),
    dataQuality:
      rawDescription && location.city ? "Donnees solides" : "A completer",
  };
});

const fileContents = `import type { AccountingFirm } from "@/lib/accounting-directory";

export const generatedAccountingDirectoryFirms: AccountingFirm[] = ${toTsLiteral(
  firms,
  0
)};
`;

fs.writeFileSync(OUTPUT_PATH, fileContents);
console.log(`Generated ${firms.length} firms in ${OUTPUT_PATH}`);
