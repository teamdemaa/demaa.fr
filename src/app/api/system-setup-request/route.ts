import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Ce formulaire a été remplacé par la prise de rendez-vous Fillout pour la session stratégique.",
      redirectTo: "/annuaire-services/organisation?booking=1",
    },
    { status: 410 },
  );
}
