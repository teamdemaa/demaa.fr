import "server-only";

import type { CanonicalService } from "@/lib/canonical-service-catalog";
import { getCoachBusinessSubscriptionForUid } from "@/lib/coach-business-subscription.server";
import { getAdminFirestore } from "@/lib/firebase-admin";

const BENEFITS_COLLECTION = "customer_accompaniment_benefits";
export const MONTHLY_ACCOMPANIMENT_DISCOUNT_PERCENT = 12 as const;

type StoredBenefit = {
  expert_accountant_active?: unknown;
  expert_accountant_valid_until?: unknown;
};

export type MonthlyAccompanimentBenefitSource =
  | "coach_business"
  | "expert_accountant";

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isFutureDate(value: unknown, now = Date.now()) {
  const date = Date.parse(cleanString(value, 40));
  return Number.isFinite(date) && date > now;
}

export async function getMonthlyAccompanimentBenefitForUid(uid: string) {
  const normalizedUid = cleanString(uid, 160);
  if (!normalizedUid) {
    return { active: false, source: null, validUntil: null } as const;
  }

  const [coachBusiness, manualSnapshot] = await Promise.all([
    getCoachBusinessSubscriptionForUid(normalizedUid),
    getAdminFirestore().collection(BENEFITS_COLLECTION).doc(normalizedUid).get(),
  ]);
  if (coachBusiness.active) {
    return {
      active: true,
      source: "coach_business" as const,
      validUntil: coachBusiness.currentPeriodEnd,
    };
  }

  const manual = manualSnapshot.data() as StoredBenefit | undefined;
  const validUntil = cleanString(manual?.expert_accountant_valid_until, 40) || null;
  const active = manual?.expert_accountant_active === true
    && isFutureDate(validUntil);
  return {
    active,
    source: active ? "expert_accountant" as const : null,
    validUntil: active ? validUntil : null,
  };
}

export async function setExpertAccountantBenefitForUid(input: {
  active: boolean;
  uid: string;
  validUntil?: string;
}) {
  const uid = cleanString(input.uid, 160);
  if (!uid) throw new Error("A valid UID is required.");
  const now = new Date();
  const requestedExpiry = cleanString(input.validUntil, 40);
  const validUntil = input.active
    ? new Date(
        isFutureDate(requestedExpiry, now.getTime())
          ? requestedExpiry
          : new Date(now).setUTCFullYear(now.getUTCFullYear() + 1),
      ).toISOString()
    : null;
  await getAdminFirestore().collection(BENEFITS_COLLECTION).doc(uid).set({
    expert_accountant_active: input.active,
    expert_accountant_activated_at: input.active ? now.toISOString() : null,
    expert_accountant_activated_by: "team_demaa",
    expert_accountant_valid_until: validUntil,
    updated_at: now.toISOString(),
  }, { merge: true });
  return { active: input.active, source: input.active ? "expert_accountant" as const : null, validUntil };
}

export function isMonthlyAccompanimentDiscountEligible(service: CanonicalService) {
  return service.monthlyAccompanimentDiscountEligible
    && service.delivery === "demaa"
    && service.slug !== "coach-business"
    && service.slug !== "expert-comptable";
}

export async function resolveMonthlyAccompanimentDiscount(input: {
  service: CanonicalService;
  uid?: string | null;
}) {
  const eligible = isMonthlyAccompanimentDiscountEligible(input.service);
  const benefit = eligible && input.uid
    ? await getMonthlyAccompanimentBenefitForUid(input.uid)
    : { active: false, source: null, validUntil: null } as const;
  return {
    apply: eligible && benefit.active,
    eligible,
    percent: eligible && benefit.active ? MONTHLY_ACCOMPANIMENT_DISCOUNT_PERCENT : 0,
    source: benefit.source,
    validUntil: benefit.validUntil,
  } as const;
}
