import Anthropic from "@anthropic-ai/sdk";

// Helper to check key but not crash on load
const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("ANTHROPIC_API_KEY is missing or invalid in .env.local");
  }
  return new Anthropic({ apiKey });
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
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
  } catch (error: any) {
    console.error("API Error [generate-doc]:", error.message || error);
    
    // Distinguish between missing key and other errors
    const status = error.message?.includes("ANTHROPIC_API_KEY") ? 401 : 500;
    const message = error.message?.includes("ANTHROPIC_API_KEY") 
      ? "Clé API Anthropic manquante" 
      : "Generation failed";

    return new Response(JSON.stringify({ error: message, details: error.message }), { 
      status,
      headers: { "Content-Type": "application/json" }
    });
  }
}
