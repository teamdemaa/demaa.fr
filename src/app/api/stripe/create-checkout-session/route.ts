import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Les achats directs ne sont plus disponibles. Faites une demande depuis la fiche du service.",
    },
    { status: 410 },
  );
}
