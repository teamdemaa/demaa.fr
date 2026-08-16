import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Document = Record<string, unknown>;
const firestore = vi.hoisted(() => {
  const documents = new Map<string, Document>();

  function reference(path: string) {
    return { path };
  }

  function collection(name: string) {
    return {
      doc(id: string) {
        return reference(`${name}/${id}`);
      },
      where(field: string, _operator: string, value: unknown) {
        return {
          limit(count: number) {
            return {
              async get() {
                const docs = [...documents.entries()]
                  .filter(([path, document]) => (
                    path.startsWith(`${name}/`)
                    && path.slice(name.length + 1).split("/").length === 1
                    && document[field] === value
                  ))
                  .slice(0, count)
                  .map(([path]) => ({ ref: reference(path) }));
                return { docs, empty: docs.length === 0, size: docs.length };
              },
            };
          },
        };
      },
    };
  }

  const database = {
    collection,
    batch() {
      const deletions: string[] = [];
      return {
        delete(ref: ReturnType<typeof reference>) {
          deletions.push(ref.path);
        },
        async commit() {
          for (const path of deletions) documents.delete(path);
        },
      };
    },
    async recursiveDelete(ref: ReturnType<typeof reference>) {
      for (const path of [...documents.keys()]) {
        if (path === ref.path || path.startsWith(`${ref.path}/`)) {
          documents.delete(path);
        }
      }
    },
  };

  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

import { deleteCompanyPilotageData } from "@/lib/company-pilotage-maintenance.server";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("company Pilotage maintenance", () => {
  beforeEach(() => firestore.documents.clear());

  it("deletes all company metrics plus the Strategy root and its cycles only", async () => {
    firestore.documents.set("company_monthly_metrics/cmp_owner__2026-07", { company_id: "cmp_owner" });
    firestore.documents.set("company_monthly_metrics/cmp_owner__2026-08", { company_id: "cmp_owner" });
    firestore.documents.set("company_monthly_metrics/cmp_other__2026-08", { company_id: "cmp_other" });
    firestore.documents.set("company_strategies/cmp_owner", { company_id: "cmp_owner" });
    firestore.documents.set("company_strategies/cmp_owner/cycles/cycle_1", { company_id: "cmp_owner" });
    firestore.documents.set("company_strategies/cmp_owner/cycles/cycle_2", { company_id: "cmp_owner" });
    firestore.documents.set("company_strategies/cmp_other", { company_id: "cmp_other" });
    firestore.documents.set("company_strategies/cmp_other/cycles/cycle_1", { company_id: "cmp_other" });

    await expect(deleteCompanyPilotageData("cmp_owner")).resolves.toEqual({
      metricsDeleted: 2,
      strategyDeleted: true,
    });
    expect([...firestore.documents.keys()].sort()).toEqual([
      "company_monthly_metrics/cmp_other__2026-08",
      "company_strategies/cmp_other",
      "company_strategies/cmp_other/cycles/cycle_1",
    ]);
  });

  it("is not wired to any member-departure workflow", () => {
    const sourceRoot = new URL("../src", import.meta.url).pathname;
    const usages = sourceFiles(sourceRoot)
      .filter((path) => readFileSync(path, "utf8").includes("deleteCompanyPilotageData"))
      .map((path) => relative(sourceRoot, path));
    expect(usages).toEqual(["lib/company-pilotage-maintenance.server.ts"]);

    const maintenance = readFileSync(
      new URL("../src/lib/company-pilotage-maintenance.server.ts", import.meta.url),
      "utf8",
    );
    expect(maintenance).toContain("never for a member departure");
  });
});
