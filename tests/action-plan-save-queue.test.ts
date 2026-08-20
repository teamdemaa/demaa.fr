import { describe, expect, it, vi } from "vitest";
import { ActionPlanSaveQueue } from "@/lib/action-plan-save-queue.client";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("ActionPlanSaveQueue", () => {
  it("coalesces changes that have not started and saves only the latest value", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const save = vi.fn(async () => undefined);
    queue.enqueue("first");
    queue.enqueue("latest");

    await expect(queue.drain(save)).resolves.toEqual({ ok: true });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("latest");
  });

  it("drains a change queued while a slow save is in flight", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const firstSave = deferred<void>();
    const saved: string[] = [];
    queue.enqueue("first");
    const draining = queue.drain(async (value) => {
      saved.push(value);
      if (value === "first") await firstSave.promise;
    });

    queue.enqueue("second");
    firstSave.resolve();

    await expect(draining).resolves.toEqual({ ok: true });
    expect(saved).toEqual(["first", "second"]);
  });

  it("shares one drain promise across concurrent navigation attempts", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const pending = deferred<void>();
    queue.enqueue("change");
    const first = queue.drain(async () => pending.promise);
    const second = queue.drain(async () => undefined);

    expect(second).toBe(first);
    pending.resolve();
    await expect(first).resolves.toEqual({ ok: true });
  });

  it("reports pending or in-flight work for page-leave recovery", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const pending = deferred<void>();
    expect(queue.hasWork()).toBe(false);
    queue.enqueue("change");
    expect(queue.hasWork()).toBe(true);
    const draining = queue.drain(async () => pending.promise);
    expect(queue.hasPending()).toBe(false);
    expect(queue.hasWork()).toBe(true);
    pending.resolve();
    await draining;
    expect(queue.hasWork()).toBe(false);
  });

  it("retains the latest unsaved value after a failure and retries only on demand", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const failure = new Error("network failed");
    queue.enqueue("draft");

    await expect(queue.drain(async () => {
      throw failure;
    })).resolves.toEqual({ ok: false, error: failure });
    expect(queue.hasPending()).toBe(true);

    const save = vi.fn(async () => undefined);
    await expect(queue.drain(save)).resolves.toEqual({ ok: true });
    expect(save).toHaveBeenCalledWith("draft");
    expect(queue.hasPending()).toBe(false);
  });

  it("keeps a newer value when an older in-flight save fails", async () => {
    const queue = new ActionPlanSaveQueue<string>();
    const firstSave = deferred<void>();
    queue.enqueue("old");
    const draining = queue.drain(async () => firstSave.promise);
    queue.enqueue("new");
    firstSave.reject(new Error("offline"));

    await expect(draining).resolves.toMatchObject({ ok: false });
    const save = vi.fn(async () => undefined);
    await queue.drain(save);
    expect(save).toHaveBeenCalledWith("new");
  });
});
