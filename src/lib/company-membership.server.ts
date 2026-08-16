import "server-only";

import { createHash } from "node:crypto";
import type { Transaction } from "firebase-admin/firestore";
import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  FRANCE_CONTEXT,
  type InternationalContext,
  type MarketCode,
} from "@/lib/international-context";

export const COMPANIES_COLLECTION = "companies";
export const COMPANY_MEMBERSHIPS_COLLECTION = "company_memberships";

export type CompanyMembershipRole = "owner";
export type CompanyStatus = "active" | "archived";
export type CompanyMembershipStatus = "active" | "suspended";

export type CompanyIdentity = Readonly<{
  companyId: string;
  membershipId: string;
}>;

type CompanyDocument = {
  schema_version?: unknown;
  display_name?: unknown;
  status?: unknown;
  created_by_uid?: unknown;
  country_code?: unknown;
  currency_code?: unknown;
  market_code?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export type CompanyInternationalContext = Pick<
  InternationalContext,
  "countryCode" | "currencyCode" | "marketCode"
>;

type CompanyMembershipDocument = {
  schema_version?: unknown;
  company_id?: unknown;
  member_uid?: unknown;
  role?: unknown;
  status?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

function normalizeUid(value: string) {
  const uid = value.trim();
  if (!uid || uid.length > 160) throw new Error("A valid Firebase UID is required.");
  return uid;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function buildDefaultCompanyId(uid: string) {
  return `cmp_${digest(`default-company:${normalizeUid(uid)}`).slice(0, 32)}`;
}

export function buildCompanyMembershipId(companyId: string, uid: string) {
  const normalizedCompanyId = companyId.trim();
  if (!normalizedCompanyId || normalizedCompanyId.length > 160) {
    throw new Error("A valid company ID is required.");
  }
  return `cpm_${digest(`company-membership:${normalizedCompanyId}:${normalizeUid(uid)}`).slice(0, 32)}`;
}

export function getDefaultCompanyIdentity(uid: string): CompanyIdentity {
  const companyId = buildDefaultCompanyId(uid);
  return {
    companyId,
    membershipId: buildCompanyMembershipId(companyId, uid),
  };
}

export async function getActiveDefaultCompanyIdentity(
  uidValue: string,
): Promise<CompanyIdentity | null> {
  const uid = normalizeUid(uidValue);
  const companyIdentity = getDefaultCompanyIdentity(uid);
  const hasMembership = await hasActiveCompanyMembership({
    companyId: companyIdentity.companyId,
    uid,
  });
  return hasMembership ? companyIdentity : null;
}

export async function getActiveDefaultCompanyIdentityInTransaction(
  transaction: Transaction,
  uidValue: string,
): Promise<CompanyIdentity | null> {
  const uid = normalizeUid(uidValue);
  const companyIdentity = getDefaultCompanyIdentity(uid);
  const database = getAdminFirestore();
  const companyReference = database
    .collection(COMPANIES_COLLECTION)
    .doc(companyIdentity.companyId);
  const membershipReference = database
    .collection(COMPANY_MEMBERSHIPS_COLLECTION)
    .doc(companyIdentity.membershipId);
  const [companySnapshot, membershipSnapshot] = await Promise.all([
    transaction.get(companyReference),
    transaction.get(membershipReference),
  ]);

  return isActiveCompany(companySnapshot.data() as CompanyDocument | undefined)
    && isActiveMembership(
      membershipSnapshot.data() as CompanyMembershipDocument | undefined,
      { companyId: companyIdentity.companyId, uid },
    )
    ? companyIdentity
    : null;
}

function isActiveCompany(document: CompanyDocument | undefined) {
  return document?.status === "active";
}

export function readCompanyInternationalContext(
  document: CompanyDocument | undefined,
): CompanyInternationalContext {
  const marketCode: MarketCode = document?.market_code === "global-en-beta"
    ? "global-en-beta"
    : "fr-fr";
  return {
    countryCode: typeof document?.country_code === "string"
      && /^[A-Z]{2}$/.test(document.country_code)
      ? document.country_code
      : null,
    currencyCode: "EUR",
    marketCode,
  };
}

function isActiveMembership(
  document: CompanyMembershipDocument | undefined,
  input: { companyId: string; uid: string },
) {
  return document?.status === "active"
    && document.company_id === input.companyId
    && document.member_uid === input.uid
    && document.role === "owner";
}

export async function ensureDefaultCompanyForIdentity(
  identity: CustomerSessionIdentity,
): Promise<CompanyIdentity> {
  const uid = normalizeUid(identity.uid);
  const companyIdentity = getDefaultCompanyIdentity(uid);
  const database = getAdminFirestore();
  const companyReference = database
    .collection(COMPANIES_COLLECTION)
    .doc(companyIdentity.companyId);
  const membershipReference = database
    .collection(COMPANY_MEMBERSHIPS_COLLECTION)
    .doc(companyIdentity.membershipId);

  return database.runTransaction(async (transaction) => {
    const [companySnapshot, membershipSnapshot] = await Promise.all([
      transaction.get(companyReference),
      transaction.get(membershipReference),
    ]);
    const company = companySnapshot.data() as CompanyDocument | undefined;
    const membership = membershipSnapshot.data() as CompanyMembershipDocument | undefined;
    const now = new Date().toISOString();

    if (companySnapshot.exists && !isActiveCompany(company)) {
      throw new Error("The default company is not active.");
    }
    if (
      membershipSnapshot.exists
      && !isActiveMembership(membership, {
        companyId: companyIdentity.companyId,
        uid,
      })
    ) {
      throw new Error("The default company membership is not active.");
    }

    if (!companySnapshot.exists) {
      transaction.set(companyReference, {
        schema_version: "1",
        display_name: null,
        country_code: FRANCE_CONTEXT.countryCode,
        currency_code: FRANCE_CONTEXT.currencyCode,
        market_code: FRANCE_CONTEXT.marketCode,
        status: "active",
        created_by_uid: uid,
        created_at: now,
        updated_at: now,
      });
    }
    if (!membershipSnapshot.exists) {
      transaction.set(membershipReference, {
        schema_version: "1",
        company_id: companyIdentity.companyId,
        member_uid: uid,
        role: "owner" satisfies CompanyMembershipRole,
        status: "active",
        created_at: now,
        updated_at: now,
      });
    }

    return companyIdentity;
  });
}

export async function hasActiveCompanyMembership(input: {
  companyId: string;
  uid: string;
}) {
  const uid = normalizeUid(input.uid);
  const companyId = input.companyId.trim();
  if (!companyId) return false;
  const database = getAdminFirestore();
  const [companySnapshot, membershipSnapshot] = await Promise.all([
    database.collection(COMPANIES_COLLECTION).doc(companyId).get(),
    database
      .collection(COMPANY_MEMBERSHIPS_COLLECTION)
      .doc(buildCompanyMembershipId(companyId, uid))
      .get(),
  ]);
  return isActiveCompany(companySnapshot.data() as CompanyDocument | undefined)
    && isActiveMembership(
      membershipSnapshot.data() as CompanyMembershipDocument | undefined,
      { companyId, uid },
    );
}
