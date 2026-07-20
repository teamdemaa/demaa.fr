import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Les demandes d’assistante ne sont plus proposées depuis l’application.",
    },
    { status: 410 },
  );
}
