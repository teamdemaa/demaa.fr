import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type ServiceIntroductionRequestBody = {
  company?: unknown;
  details?: unknown;
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  serviceName?: unknown;
  serviceSlug?: unknown;
  source?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, {
      keyPrefix: "service-introduction",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<ServiceIntroductionRequestBody>(request);
    if (response) return response;

    const name = normalizeText(body?.name, 120);
    const phone = normalizeText(body?.phone, 60);
    const email = normalizeText(body?.email, 160);
    const company = normalizeText(body?.company, 120);
    const details = normalizeText(body?.details, 1500, { multiline: true });
    const source = normalizeText(body?.source, 120);
    const serviceSlug = normalizeText(body?.serviceSlug, 120);
    const requestedServiceName = normalizeText(body?.serviceName, 160);
    const service = serviceSlug ? getDemaaServiceBySlug(serviceSlug) : null;
    const serviceName = service?.name ?? requestedServiceName;

    if (!name || !phone || !serviceName) {
      return NextResponse.json(
        { error: "Merci d'indiquer votre nom, votre téléphone et le service demandé." },
        { status: 400 }
      );
    }

    const payload = {
      text: "🤝 Nouvelle demande de mise en relation",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Service* : ${escapeSlackMrkdwn(serviceName)}\n` +
              `*Nom* : ${escapeSlackMrkdwn(name)}\n` +
              `*Téléphone / WhatsApp* : ${escapeSlackMrkdwn(phone)}\n` +
              `*Email* : ${escapeSlackMrkdwn(email) || "_non renseigné_"}\n` +
              `*Entreprise* : ${escapeSlackMrkdwn(company) || "_non renseigné_"}\n` +
              `*Besoin* : ${escapeSlackMrkdwn(details) || "_non renseigné_"}\n` +
              `*Source* : ${escapeSlackMrkdwn(source) || "Service modal"}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ ${new Date().toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
              })}`,
            },
          ],
        },
      ],
    };

    await sendSlackMessage(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Service introduction request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 }
    );
  }
}
