import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type StoredDocument = { data: Record<string, unknown>; id: string };

const state = vi.hoisted(() => ({
  collections: new Map<string, Map<string, Record<string, unknown>>>(),
  updates: [] as Array<{ collection: string; id: string; value: Record<string, unknown> }>,
}));

function documents(collection: string): StoredDocument[] {
  return [...(state.collections.get(collection)?.entries() ?? [])].map(([id, data]) => ({ data, id }));
}

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => ({
    collection: (collection: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const data = state.collections.get(collection)?.get(id);
          return { data: () => data, exists: Boolean(data) };
        },
        update: async (value: Record<string, unknown>) => {
          state.updates.push({ collection, id, value });
        },
      }),
      orderBy: () => ({
        limit: (limit: number) => ({
          get: async () => ({
            docs: documents(collection)
              .sort((first, second) => String(second.data.created_at).localeCompare(String(first.data.created_at)))
              .slice(0, limit)
              .map((document) => ({ id: document.id, data: () => document.data })),
          }),
        }),
      }),
    }),
  }),
}));

import {
  getAdminRequest,
  listAdminRequests,
  updateAdminRequestStatus,
} from "@/lib/admin-request-read-model.server";

const delivery = { internal_email: { status: "sent" } };

describe("admin request read model", () => {
  beforeEach(() => {
    state.updates.length = 0;
    state.collections.clear();
    state.collections.set("lead_requests", new Map([
      ["lead-1", {
        attribution: null,
        contact: {
          company: "Atelier",
          email: "atelier@example.com",
          first_name: "Maya",
          last_name: "Martin",
          name: null,
          phone: "0600000000",
        },
        context: {
          source: "Diagnostic",
          source_url: "https://demaa.co",
          system_name: "Menuiserie",
        },
        created_at: "2026-08-22T12:00:00.000Z",
        fields: [{ label: "Blocage", value: "Organisation" }],
        notification_status: delivery,
        request_type: "diagnostic_request",
        title: "Demande de diagnostic",
      }],
      ["malformed", { created_at: "2026-08-22T13:00:00.000Z" }],
    ]));
    state.collections.set("service_requests", new Map([
      ["service-1", {
        attribution: null,
        contact: { company: "Cabinet", email: "cabinet@example.com", first_name: "Lina" },
        created_at: "2026-08-21T12:00:00.000Z",
        need: "Automatiser les relances",
        notification_status: delivery,
        request_type: "service_request",
        service: {
          billing_party: "Demaa",
          contracting_party: "Demaa",
          service_name: "Automatisation des processus et IA",
        },
        system_slug: "cabinet-comptable",
      }],
    ]));
    state.collections.set("solution_referrals", new Map([
      ["referral-1", {
        attribution: null,
        contact: { company: "Studio", email: "studio@example.com", first_name: "Ana" },
        created_at: "2026-08-20T12:00:00.000Z",
        need: "Trouver un spécialiste",
        notification_status: delivery,
        request_type: "solution_referral",
        solution: {
          billing_party: "Le professionnel",
          contracting_party: "Le professionnel",
          resource_name: "Expert-comptable",
          transparency: "Demaa qualifie le besoin.",
        },
        system_slug: "restaurant",
      }],
    ]));
  });

  it("normalizes and sorts all existing request collections without migrating them", async () => {
    const result = await listAdminRequests({ limit: 10 });
    expect(result.nextCursor).toBeNull();
    expect(result.requests.map((request) => `${request.source}:${request.id}`)).toEqual([
      "lead:lead-1",
      "service:service-1",
      "referral:referral-1",
    ]);
    expect(result.requests[0]).toMatchObject({
      contact: { email: "atelier@example.com", name: "Maya Martin" },
      sourceLabel: "Diagnostic",
      status: "new",
    });
  });

  it("filters, paginates and keeps its cursor opaque", async () => {
    const first = await listAdminRequests({ limit: 1 });
    expect(first.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/);
    const second = await listAdminRequests({ cursor: first.nextCursor, limit: 2 });
    expect(second.requests.map((request) => request.id)).toEqual(["service-1", "referral-1"]);
    const services = await listAdminRequests({ source: "service", status: "new" });
    expect(services.requests.map((request) => request.id)).toEqual(["service-1"]);
  });

  it("loads details and safely ignores malformed or invalid identifiers", async () => {
    await expect(getAdminRequest("lead", "lead-1")).resolves.toMatchObject({
      fields: [{ label: "Blocage", value: "Organisation" }],
      id: "lead-1",
    });
    await expect(getAdminRequest("lead", "malformed")).resolves.toBeNull();
    await expect(getAdminRequest("lead", "bad/id")).resolves.toBeNull();
  });

  it("writes only normalized Team workflow metadata", async () => {
    await expect(updateAdminRequestStatus({
      adminUid: "admin-uid",
      id: "service-1",
      source: "service",
      status: "responded",
    })).resolves.toBe(true);
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0]).toMatchObject({
      collection: "service_requests",
      id: "service-1",
      value: {
        admin_status: "responded",
        admin_updated_by_uid: "admin-uid",
      },
    });
    expect(state.updates[0].value.admin_updated_at).toEqual(expect.any(String));
  });
});
