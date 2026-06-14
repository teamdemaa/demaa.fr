import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getGenerationCountByEmail, saveGeneration } from "@/lib/generations-db";

const MAX_GENERATIONS_PER_USER = 3;

type SaveGenerationRequestBody = {
  email?: unknown;
  prompt?: unknown;
  result?: unknown;
  sector?: unknown;
};

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "generations-read",
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const email = normalizeEmail(normalizeText(searchParams.get("email"), 160));

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
    const { data: body, response } =
      await readJsonBody<SaveGenerationRequestBody>(request, 64 * 1024);
    if (response) return response;

    const email = normalizeEmail(normalizeText(body?.email, 160));
    const prompt = normalizeText(body?.prompt, 2000, { multiline: true });
    const sector = normalizeText(body?.sector, 120);
    const result = body?.result;

    const limited = enforceRateLimit(
      request,
      {
        keyPrefix: "generations-write",
        limit: 5,
        windowMs: 10 * 60 * 1000,
      },
      email || undefined
    );
    if (limited) return limited;

    if (
      !isValidEmail(email) ||
      !prompt ||
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
      prompt,
      result,
      sector: sector || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Generation storage error:", error);
    return NextResponse.json({ error: "Could not save generation" }, { status: 500 });
  }
}
