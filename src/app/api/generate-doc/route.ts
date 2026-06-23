import Anthropic from "@anthropic-ai/sdk";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";

type DocumentMessage = {
  role: "user" | "assistant";
  content: string;
};

type GenerateDocRequestBody = {
  messages?: unknown;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper to check key but not crash on load
const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("ANTHROPIC_API_KEY is missing or invalid in .env.local");
  }
  return new Anthropic({ apiKey });
};

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) {
    return null;
  }

  const messages = value.map((message): DocumentMessage | null => {
    if (!message || typeof message !== "object") return null;

    const candidate = message as Record<string, unknown>;
    const role = candidate.role;
    const content = normalizeText(candidate.content, 2500, { multiline: true });

    if ((role !== "user" && role !== "assistant") || !content) {
      return null;
    }

    return { role, content };
  });

  if (messages.some((message) => !message)) {
    return null;
  }

  return messages as DocumentMessage[];
}

export async function POST(req: Request) {
  try {
    const limited = await enforceRateLimit(req, {
      keyPrefix: "generate-doc",
      limit: 4,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<GenerateDocRequestBody>(req, 32 * 1024);
    if (response) return response;

    const messages = normalizeMessages(body?.messages);

    if (!messages) {
      return jsonResponse({ error: "Invalid messages format" }, 400);
    }

    const anthropic = getAnthropic();

    const stream = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages,
      system: `Tu es un expert juridique français (avocat/juriste chevronné).
Ta mission est de générer des documents juridiques parfaits en suivant les meilleures pratiques.
Respecte TOUJOURS ce format de réponse :

1. Si le document est en cours de création :
---DOCUMENT---
[Contenu du document avec des [CHAMP] pour les infos manquantes]
---QUESTIONS---
[Liste numérotée des questions pour que l'utilisateur puisse compléter le document]

2. Si l'utilisateur a répondu aux questions et que le document est prêt :
---DOCUMENT_FINAL---
[Contenu du document complet et final]

Règles :
- Pas de blabla inutile au début.
- Le document doit être structuré (Articles, Titres).
- Reste professionnel et précis sur le plan juridique.`,
    });

    return new Response(stream.toReadableStream());
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API Error [generate-doc]:", errorMessage);

    // Distinguish between missing key and other errors
    const status = errorMessage.includes("ANTHROPIC_API_KEY") ? 401 : 500;
    const message = errorMessage.includes("ANTHROPIC_API_KEY")
      ? "Clé API Anthropic manquante"
      : "Generation failed";

    return jsonResponse({ error: message }, status);
  }
}
