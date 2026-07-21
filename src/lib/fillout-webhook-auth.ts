import { timingSafeEqual } from "node:crypto";

export function isValidFilloutWebhookAuthorization(
  authorization: string | null,
  secret: string,
) {
  const expected = `Bearer ${secret}`;
  const providedBuffer = Buffer.from(authorization ?? "");
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);
}
