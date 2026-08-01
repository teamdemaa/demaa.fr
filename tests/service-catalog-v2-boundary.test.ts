import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../src", import.meta.url));

type ModuleReference = Readonly<{
  kind: "import" | "re-export" | "dynamic-import";
  specifier: string;
  typeOnly: boolean;
}>;

function sourceFiles(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const child = `${path}/${entry}`;
    if (statSync(child).isDirectory()) return sourceFiles(child);
    return /\.(?:ts|tsx)$/.test(entry) ? [child] : [];
  });
}

function parseClientModule(source: string) {
  const sourceFile = ts.createSourceFile("client.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const isClient = sourceFile.statements.some(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === "use client",
  );
  const references: ModuleReference[] = [];
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier)) {
      references.push({
        kind: "import",
        specifier: statement.moduleSpecifier.text,
        typeOnly: statement.importClause?.isTypeOnly === true,
      });
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      references.push({
        kind: "re-export",
        specifier: statement.moduleSpecifier.text,
        typeOnly: false,
      });
    }
  }
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      references.push({ kind: "dynamic-import", specifier: node.arguments[0].text, typeOnly: false });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { isClient, references };
}

function normalizedSpecifier(specifier: string): string {
  let decoded = specifier;
  try {
    decoded = decodeURIComponent(specifier);
  } catch {
    // An invalid escape cannot be a valid allowlisted DTO import.
  }
  const withoutSuffix = decoded.replace(/\\/g, "/").split(/[?#]/, 1)[0];
  const parts: string[] = [];
  for (const part of withoutSuffix.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/").replace(/\.(?:[cm]?[jt]sx?)$/, "");
}

function endsWithModule(specifier: string, moduleName: string): boolean {
  const normalized = normalizedSpecifier(specifier);
  return normalized === moduleName || normalized.endsWith(`/${moduleName}`);
}

function clientImportViolations(source: string): string[] {
  const parsed = parseClientModule(source);
  if (!parsed.isClient) return [];
  return parsed.references.flatMap((reference) => {
    const isRuntime =
      endsWithModule(reference.specifier, "service-catalog-v2") ||
      endsWithModule(reference.specifier, "service-catalog-v2-contract") ||
      endsWithModule(reference.specifier, "service-catalog-v2.generated.json");
    if (isRuntime) return [`${reference.kind}:${reference.specifier}`];
    if (endsWithModule(reference.specifier, "service-catalog-v2-dto")) {
      return reference.kind === "import" && reference.typeOnly
        ? []
        : [`${reference.kind}:${reference.specifier}`];
    }
    return [];
  });
}

describe("Services server and DTO boundaries", () => {
  it("marks runtime/data modules server-only and exposes no raw/getAll accessor", () => {
    for (const relative of ["lib/service-catalog-v2-contract.ts", "lib/service-catalog-v2.ts"]) {
      const source = readFileSync(`${root}/${relative}`, "utf8");
      expect(source).toMatch(/^import "server-only";/);
      expect(source).not.toMatch(/export\s+(?:const|function)\s+(?:raw|getAll)/i);
      expect(source).not.toContain("export function toPublishedServiceOfferDto");
    }
  });

  it("keeps the public DTO module type-only and permits only import type", () => {
    const source = readFileSync(`${root}/lib/service-catalog-v2-dto.ts`, "utf8");
    expect(source).not.toContain("server-only");
    expect(source).not.toMatch(/\b(?:const|let|var|function|class|enum)\b/);
    expect(clientImportViolations(
      '"use client";\nimport type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";',
    )).toEqual([]);
    expect(clientImportViolations(
      '"use client";\nimport { PublishedServiceOfferDto } from "../lib/service-catalog-v2-dto";',
    )).toEqual(["import:../lib/service-catalog-v2-dto"]);
  });

  it("blocks aliases, relative imports, re-exports and dynamic imports of runtime data", () => {
    const source = `
      "use client";
      import value from "../../src/lib/service-catalog-v2";
      import "@/lib/service-catalog-v2.generated.json";
      export { validateServiceCatalogV2 } from "../lib/service-catalog-v2-contract.ts";
      const lazy = import("./nested/../service-catalog-v2.generated.json");
    `;
    expect(clientImportViolations(source)).toEqual([
      "import:../../src/lib/service-catalog-v2",
      "import:@/lib/service-catalog-v2.generated.json",
      "re-export:../lib/service-catalog-v2-contract.ts",
      "dynamic-import:./nested/../service-catalog-v2.generated.json",
    ]);
    expect(clientImportViolations(
      '"use client";\nexport type { PublishedServiceOfferDto } from "./service-catalog-v2-dto";',
    )).toEqual(["re-export:./service-catalog-v2-dto"]);
    expect(clientImportViolations(
      '"use client";\nconst dto = import("./service-catalog-v2-dto");',
    )).toEqual(["dynamic-import:./service-catalog-v2-dto"]);
  });

  it("prevents current client modules from importing protected Services modules", () => {
    const violations = sourceFiles(root).flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return clientImportViolations(source).map((violation) => `${path}:${violation}`);
    });
    expect(violations).toEqual([]);
  });
});
