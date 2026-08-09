import { buildLevierProcessWorkbookRequests } from "./lib/levier-process-projection";

const plan = buildLevierProcessWorkbookRequests();
const mode = process.argv[2] ?? "--all";

if (mode === "--summary") {
  process.stdout.write(
    `${JSON.stringify({
      systems: plan.systems.length,
      routines: plan.routineCount,
      minRoutines: Math.min(...plan.systems.map((system) => system.routines.length)),
      maxRoutines: Math.max(...plan.systems.map((system) => system.routines.length)),
    })}\n`,
  );
} else if (mode === "--setup") {
  process.stdout.write(
    `${JSON.stringify({
      requests: plan.requests.filter((request) => {
        const update = request.updateCells as
          | { range?: { sheetId?: number } }
          | undefined;
        return update?.range?.sheetId !== 1_808_202_602;
      }),
    })}\n`,
  );
} else if (mode === "--registry-chunk") {
  const start = Number(process.argv[3]);
  const end = Number(process.argv[4]);
  const registryWrite = plan.requests.find((request) => {
    const update = request.updateCells as
      | { range?: { sheetId?: number }; rows?: unknown[] }
      | undefined;
    return update?.range?.sheetId === 1_808_202_602;
  })?.updateCells as { rows: unknown[] } | undefined;

  if (
    !registryWrite ||
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end <= start ||
    end > registryWrite.rows.length
  ) {
    throw new Error("Usage: --registry-chunk START END");
  }

  process.stdout.write(
    `${JSON.stringify({
      startRowIndex: start,
      endRowIndex: end,
      rows: registryWrite.rows.slice(start, end),
    })}\n`,
  );
} else if (mode === "--system") {
  const identifier = process.argv[3];
  const system = plan.systems.find(
    (candidate) =>
      candidate.slug === identifier || candidate.name === identifier,
  );

  if (!system) {
    throw new Error("Usage: --system SYSTEM_SLUG_OR_EXACT_NAME");
  }

  process.stdout.write(`${JSON.stringify(system)}\n`);
} else if (mode === "--systems") {
  process.stdout.write(
    `${JSON.stringify(plan.systems.map(({ slug, name, routines }) => ({
      slug,
      name,
      routineCount: routines.length,
    })))}\n`,
  );
} else {
  process.stdout.write(`${JSON.stringify(plan)}\n`);
}
