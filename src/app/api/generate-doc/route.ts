import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
  }
}
