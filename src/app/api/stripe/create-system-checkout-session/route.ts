import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Les achats directs de kits ne sont plus disponibles. Demandez votre kit depuis la page métier.",
    },
    { status: 410 },
  );
}
