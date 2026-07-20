import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Les briefs après achat ne sont plus acceptés depuis l’application.",
    },
    { status: 410 },
  );
}
