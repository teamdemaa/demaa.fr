import { NextResponse } from "next/server";
import { saveNewsletterSubscriber } from "@/lib/generations-db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { firstName, sector, email, source } = await request.json();

    const normalizedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const normalizedSector = typeof sector === "string" ? sector.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedFirstName || !normalizedSector || !normalizedEmail) {
      return NextResponse.json(
        { error: "Merci de renseigner votre prénom, votre secteur et votre email." },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse email valide." },
        { status: 400 }
      );
    }

    await saveNewsletterSubscriber({
      firstName: normalizedFirstName,
      sector: normalizedSector,
      email: normalizedEmail,
      source: typeof source === "string" ? source : "newsletter_page",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de vous inscrire pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
