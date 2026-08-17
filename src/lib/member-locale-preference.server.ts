import "server-only";

import { createHash } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  type InterfaceLocaleCode,
  normalizeInterfaceLocaleCode,
} from "@/lib/international-context";

export const MEMBER_PREFERENCES_COLLECTION = "member_preferences";

type MemberPreferenceDocument = {
  member_uid?: unknown;
  preferred_locale_code?: unknown;
};

function normalizeUid(value: string) {
  const uid = value.trim();
  if (!uid || uid.length > 160) throw new Error("A valid Firebase UID is required.");
  return uid;
}

function buildMemberPreferenceId(uid: string) {
  return `mpr_${createHash("sha256")
    .update(`member-preferences:${normalizeUid(uid)}`)
    .digest("base64url")
    .slice(0, 32)}`;
}

export async function readMemberLocalePreference(
  uidValue: string,
): Promise<InterfaceLocaleCode | null> {
  const uid = normalizeUid(uidValue);
  const snapshot = await getAdminFirestore()
    .collection(MEMBER_PREFERENCES_COLLECTION)
    .doc(buildMemberPreferenceId(uid))
    .get();
  if (!snapshot.exists) return null;
  const document = snapshot.data() as MemberPreferenceDocument | undefined;
  if (document?.member_uid !== uid) return null;
  return normalizeInterfaceLocaleCode(document.preferred_locale_code);
}

export async function saveMemberLocalePreference(input: {
  localeCode: InterfaceLocaleCode;
  uid: string;
}) {
  const uid = normalizeUid(input.uid);
  const reference = getAdminFirestore()
    .collection(MEMBER_PREFERENCES_COLLECTION)
    .doc(buildMemberPreferenceId(uid));
  const now = new Date().toISOString();
  const existing = await reference.get();
  await reference.set({
    schema_version: "1",
    member_uid: uid,
    preferred_locale_code: input.localeCode,
    ...(existing.exists ? {} : { created_at: now }),
    updated_at: now,
  }, { merge: true });
}
