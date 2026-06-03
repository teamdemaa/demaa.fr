import "server-only";

type SlackPayload = {
  text: string;
  blocks?: unknown[];
};

export class SlackMessageError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "SlackMessageError";
  }
}

export async function sendSlackMessage(payload: SlackPayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new SlackMessageError("SLACK_WEBHOOK_URL is not configured.", 500);
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new SlackMessageError(
      `Slack error ${response.status}: ${body || "unknown error"}`,
      502
    );
  }
}
