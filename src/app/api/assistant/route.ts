import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCachedAssistantPlan,
  saveAssistantPlanCache,
} from "@/lib/generations-db";

export const runtime = "nodejs";

const ASSISTANT_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";
const MIN_ACTIONS = 4;
const MAX_ACTIONS = 4;
const MAX_INPUT_CHARS = 1200;

const SYSTEM_PROMPT = `
You are the Demaa Automation Assistant.
Create a simple French automation plan for a freelancer, small business, or TPE.

Rules:
- Focus on what takes the most time.
- Use simple French.
- Avoid jargon and generic advice.
- Stay realistic for a small business with limited time and budget.
- Take the user's sector into account and follow the real workflow of that sector.
- Recommend sector tools when they are clearly better than generic tools.
- Keep the stack simple if generic tools are enough.
- The actions must work together as one small system, not as isolated ideas.
- Each action should help prepare the next one when possible.
- Prefer small-business tools that are easy to adopt.
- For forms, prefer Google Forms, Fillout, or Tally.
- For a tracking base, prefer Airtable or Notion.
- For automation, prefer Make.
- For shared follow-up, files, and email routines, prefer Google Workspace.
- For CRM or client follow-up when it makes sense, you can recommend Brevo.
- More broadly, recommend tools that are truly adapted to small businesses and freelancers.

Return:
- one short summary
- one clear goal
- exactly 4 actions in priority order

For each action:
- short title
- why it matters
- what to set up in plain language
- one tool
- one effort level: "facile", "moyen", or "plus tard"
- one simple time gain

The result must feel concrete, calm, and operational.
When possible, keep the tool choices coherent across the whole plan.
Return the answer in French by using the provided tool.
`;

interface ActionPlanItem {
  title: string;
  why: string;
  how: string;
  tool: string;
  effort: string;
  time_gain: string;
}

interface AssistantPlan {
  summary: string;
  goal: string;
  actions: ActionPlanItem[];
}

const ACTION_PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "Short, reassuring summary in simple French.",
    },
    goal: {
      type: "string",
      description: "Main goal of the action plan in one simple sentence.",
    },
    actions: {
      type: "array",
      description: "Priority-ordered list of exactly 4 simple automation actions for a small business.",
      minItems: MIN_ACTIONS,
      maxItems: MAX_ACTIONS,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "Short action title in simple French.",
          },
          why: {
            type: "string",
            description: "Why this action matters, in simple French.",
          },
          how: {
            type: "string",
            description: "What to set up concretely, in simple French.",
          },
          tool: {
            type: "string",
            description: "One simple and realistic tool for a TPE or small business.",
          },
          effort: {
            type: "string",
            description: 'Use only one of these values: "facile", "moyen", "plus tard".',
          },
          time_gain: {
            type: "string",
            description: "Estimated time saved in simple words.",
          },
        },
        required: ["title", "why", "how", "tool", "effort", "time_gain"],
      },
    },
  },
  required: ["summary", "goal", "actions"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeEffort(value: unknown) {
  const effort = getString(value, "moyen").toLowerCase();

  if (effort.includes("fac")) return "facile";
  if (effort.includes("plus")) return "plus tard";

  return "moyen";
}

function normalizeAction(action: unknown, index: number): ActionPlanItem {
  const rawAction = isRecord(action) ? action : {};

  return {
    title: getString(rawAction.title, `Action ${index + 1}`),
    why: getString(
      rawAction.why,
      "Cette action aide à gagner du temps et à rendre l'activité plus simple à gérer."
    ),
    how: getString(
      rawAction.how,
      "Mettre en place un système simple avec un outil facile à utiliser et une règle claire."
    ),
    tool: getString(rawAction.tool, "Google Sheets"),
    effort: normalizeEffort(rawAction.effort),
    time_gain: getString(rawAction.time_gain, "Quelques heures gagnées chaque semaine"),
  };
}

function normalizeAssistantPlan(payload: unknown): AssistantPlan {
  if (!isRecord(payload)) {
    throw new Error("Invalid assistant payload");
  }

  const rawActions = Array.isArray(payload.actions) ? payload.actions : [];
  const actions = rawActions.slice(0, MAX_ACTIONS).map(normalizeAction);

  while (actions.length < MIN_ACTIONS) {
    actions.push(
      normalizeAction(
        {
          title: `Action ${actions.length + 1}`,
          why: "Cette action consolide les bases de votre organisation.",
          how: "Créer une petite routine claire et automatisée pour éviter les oublis.",
          tool: "Google Sheets",
          effort: actions.length < 2 ? "facile" : "moyen",
          time_gain: "Un peu de temps gagné chaque semaine",
        },
        actions.length
      )
    );
  }

  return {
    summary: getString(
      payload.summary,
      "Voici un plan d'action simple pour automatiser l'essentiel et reprendre du temps sur votre semaine."
    ),
    goal: getString(
      payload.goal,
      "Mettre en place des bases simples pour automatiser les tâches répétitives."
    ),
    actions,
  };
}

function normalizeUserMessage(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, MAX_INPUT_CHARS);
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const normalizedMessage = normalizeUserMessage(message);

    if (!normalizedMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Anthropic API Key not configured. Please add ANTHROPIC_API_KEY to your environment.",
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const cachedPlan = await getCachedAssistantPlan(normalizedMessage);
    if (cachedPlan) {
      return NextResponse.json(normalizeAssistantPlan(cachedPlan));
    }

    const response = await anthropic.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 1100,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: normalizedMessage }],
      tools: [
        {
          name: "submit_action_plan",
          description:
            "Submit a simple French automation action plan for a small business with a summary, one goal, and a list of practical actions.",
          input_schema: ACTION_PLAN_SCHEMA as never,
        },
      ],
      tool_choice: {
        type: "tool",
        name: "submit_action_plan",
      },
    });

    const toolUseBlock = response.content.find(
      (block) => block.type === "tool_use" && block.name === "submit_action_plan"
    );

    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new Error("Could not parse assistant response");
    }

    const normalizedPlan = normalizeAssistantPlan(toolUseBlock.input);
    await saveAssistantPlanCache(normalizedMessage, normalizedPlan);

    return NextResponse.json(normalizedPlan);
  } catch (error: unknown) {
    console.error("AI Assistant Error:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return NextResponse.json(
        {
          error:
            "Le modèle Anthropic configuré est introuvable ou indisponible pour cette clé API. Utilisez un modèle actif comme claude-sonnet-4-6.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la génération du plan. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
