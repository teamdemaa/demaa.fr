import { NextResponse } from "next/server";
import { getGenerationCountByEmail, saveGeneration } from "@/lib/generations-db";

const MAX_GENERATIONS_PER_USER = 3;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const count = await getGenerationCountByEmail(email);

    return NextResponse.json({
      count,
      remaining: Math.max(0, MAX_GENERATIONS_PER_USER - count),
      limitReached: count >= MAX_GENERATIONS_PER_USER,
    });
  } catch (error: unknown) {
    console.error("Generation count error:", error);
    return NextResponse.json({ error: "Could not fetch generation count" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, prompt, result, sector } = await request.json();

    if (
      typeof email !== "string" ||
      !isValidEmail(email) ||
      typeof prompt !== "string" ||
      !prompt.trim() ||
      !result
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const generationCount = await getGenerationCountByEmail(email);

    if (generationCount >= MAX_GENERATIONS_PER_USER) {
      return NextResponse.json(
        {
          error: "La limite de 3 plans a été atteinte pour cette adresse email.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    await saveGeneration({
      email,
      prompt: prompt.trim(),
      result,
      sector: typeof sector === "string" ? sector : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Generation storage error:", error);
    return NextResponse.json({ error: "Could not save generation" }, { status: 500 });
  }
}
