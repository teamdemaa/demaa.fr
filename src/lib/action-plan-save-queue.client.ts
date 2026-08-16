export type ActionPlanSaveDrainResult =
  | { ok: true }
  | { ok: false; error: unknown };

export class ActionPlanSaveQueue<T> {
  private pending: T | null = null;
  private draining: Promise<ActionPlanSaveDrainResult> | null = null;

  enqueue(value: T) {
    this.pending = value;
  }

  hasPending() {
    return this.pending !== null;
  }

  drain(save: (value: T) => Promise<void>): Promise<ActionPlanSaveDrainResult> {
    if (this.draining) return this.draining;

    const run = (async (): Promise<ActionPlanSaveDrainResult> => {
      while (this.pending !== null) {
        const next = this.pending;
        this.pending = null;
        try {
          await save(next);
        } catch (error) {
          if (this.pending === null) this.pending = next;
          return { ok: false, error };
        }
      }
      return { ok: true };
    })();

    this.draining = run;
    void run.finally(() => {
      if (this.draining === run) this.draining = null;
    });
    return run;
  }
}
