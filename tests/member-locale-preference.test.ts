import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type StoredDocument = Record<string, unknown>;
const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();
  return {
    documents,
    database: {
      collection(name: string) {
        return {
          doc(id: string) {
            const path = `${name}/${id}`;
            return {
              async get() {
                const value = documents.get(path);
                return { exists: Boolean(value), data: () => value };
              },
              async set(value: StoredDocument, options?: { merge?: boolean }) {
                documents.set(path, options?.merge
                  ? { ...documents.get(path), ...structuredClone(value) }
                  : structuredClone(value));
              },
            };
          },
        };
      },
    },
  };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  readMemberLocalePreference,
  saveMemberLocalePreference,
} from "@/lib/member-locale-preference.server";

describe("member locale preference", () => {
  beforeEach(() => firestore.documents.clear());

  it("stores one preference per Firebase member without exposing the UID in the path", async () => {
    await saveMemberLocalePreference({ localeCode: "en", uid: "member-uid" });
    const [path, document] = [...firestore.documents.entries()][0];
    expect(path).toMatch(/^member_preferences\/mpr_/);
    expect(path).not.toContain("member-uid");
    expect(document).toMatchObject({
      member_uid: "member-uid",
      preferred_locale_code: "en",
      schema_version: "1",
    });
    await expect(readMemberLocalePreference("member-uid")).resolves.toBe("en");
  });

  it("updates the preference and rejects a document owned by another UID", async () => {
    await saveMemberLocalePreference({ localeCode: "en", uid: "member-uid" });
    await saveMemberLocalePreference({ localeCode: "fr", uid: "member-uid" });
    await expect(readMemberLocalePreference("member-uid")).resolves.toBe("fr");
    const [path, document] = [...firestore.documents.entries()][0];
    firestore.documents.set(path, { ...document, member_uid: "other-uid" });
    await expect(readMemberLocalePreference("member-uid")).resolves.toBeNull();
  });
});
