import "server-only";

export class TransactionalEmailProviderError extends Error {
  readonly code: string;
  readonly providerStatus: number | null;

  constructor(code: string, providerStatus: number | null = null) {
    super(code);
    this.name = "TransactionalEmailProviderError";
    this.code = code;
    this.providerStatus = providerStatus;
  }
}

export async function sendTransactionalEmail(input: {
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    throw new TransactionalEmailProviderError("email_configuration_missing");
  }
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        html: input.html,
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
        to: input.to,
      }),
      cache: "no-store",
    });
  } catch {
    throw new TransactionalEmailProviderError("email_network_failed");
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new TransactionalEmailProviderError("email_provider_rejected", response.status);
  }
}
