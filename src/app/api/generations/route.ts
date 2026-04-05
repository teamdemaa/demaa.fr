import { NextResponse } from "next/server";
import { saveGeneration } from "@/lib/generations-db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
