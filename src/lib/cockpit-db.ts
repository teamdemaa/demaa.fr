import "server-only";

import { createHash } from "node:crypto";
import type { CockpitRemoteState } from "@/lib/cockpit-types";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";

const COCKPIT_SPACES_COLLECTION = "cockpit_spaces";

function getCockpitSpaceId(email: string) {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

export async function getCockpitStateByEmail(
  email: string,
): Promise<CockpitRemoteState | null> {
  try {
    const snapshot = await getAdminFirestore()
      .collection(COCKPIT_SPACES_COLLECTION)
      .doc(getCockpitSpaceId(email))
      .get();

    if (!snapshot.exists) return null;

    const data = snapshot.data() as Partial<CockpitRemoteState> | undefined;

    if (
      !data ||
      typeof data.activitySlug !== "string" ||
      !Array.isArray(data.tasks)
    ) {
      return null;
    }

    return {
      activitySlug: data.activitySlug,
      tasks: data.tasks,
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
    };
  } catch (error) {
    console.warn("[cockpit] Unable to load remote state.", error);
    return null;
  }
}

export async function saveCockpitStateByEmail(
  email: string,
  state: Omit<CockpitRemoteState, "updatedAt">,
) {
  const updatedAt = new Date().toISOString();
  const document: CockpitRemoteState = {
    ...state,
    updatedAt,
  };

  await getAdminFirestore()
    .collection(COCKPIT_SPACES_COLLECTION)
    .doc(getCockpitSpaceId(email))
    .set(document, { merge: true });

  return { ...state, updatedAt };
}
