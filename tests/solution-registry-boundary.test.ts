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
      references.push({ kind: "re-export", specifier: statement.moduleSpecifier.text, typeOnly: false });
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
      endsWithModule(reference.specifier, "solution-registry.server") ||
      endsWithModule(reference.specifier, "solution-registry-contract");
    if (isRuntime) return [`${reference.kind}:${reference.specifier}`];
    if (endsWithModule(reference.specifier, "solution-registry-dto")) {
      return reference.kind === "import" && reference.typeOnly
        ? []
        : [`${reference.kind}:${reference.specifier}`];
    }
    return [];
  });
}

describe("Solutions server and DTO boundaries", () => {
  it("marks both runtime contract and product registry server-only", () => {
    for (const relative of ["lib/solution-registry-contract.ts", "lib/solution-registry.server.ts"]) {
      const source = readFileSync(`${root}/${relative}`, "utf8");
      expect(source).toMatch(/^import "server-only";/);
      expect(source).not.toMatch(/export\s+(?:const|function)\s+(?:raw|getAll)/i);
    }
  });

  it("keeps the public DTO module type-only and permits only import type", () => {
    const source = readFileSync(`${root}/lib/solution-registry-dto.ts`, "utf8");
    expect(source).not.toContain("server-only");
    expect(source).not.toMatch(/\b(?:const|let|var|function|class|enum)\b/);
    expect(clientImportViolations(
      '"use client";\nimport type { PublishedSolutionPlacementDto } from "@/lib/solution-registry-dto";',
    )).toEqual([]);
    expect(clientImportViolations(
      '"use client";\nimport { PublishedSolutionPlacementDto } from "../lib/solution-registry-dto";',
    )).toEqual(["import:../lib/solution-registry-dto"]);
  });

  it("blocks relative imports, re-exports and dynamic imports of Solutions runtime modules", () => {
    const source = `
      "use client";
      import value from "../../src/lib/solution-registry.server";
      export { validateSolutionRegistries } from "../lib/solution-registry-contract.ts";
      const lazy = import("./nested/../solution-registry.server");
    `;
    expect(clientImportViolations(source)).toEqual([
      "import:../../src/lib/solution-registry.server",
      "re-export:../lib/solution-registry-contract.ts",
      "dynamic-import:./nested/../solution-registry.server",
    ]);
  });

  it("prevents current client modules from importing protected Solutions modules", () => {
    const violations = sourceFiles(root).flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return clientImportViolations(source).map((violation) => `${path}:${violation}`);
    });
    expect(violations).toEqual([]);
  });
});
