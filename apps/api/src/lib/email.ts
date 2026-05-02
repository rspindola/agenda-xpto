import type { FastifyBaseLogger } from "fastify";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/** Resend client; methods no-op friendly when `RESEND_API_KEY` is unset in dev. */
export const resend = apiKey ? new Resend(apiKey) : null;

const DEFAULT_FROM = "Agenda XPTO <onboarding@resend.dev>";

export type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export type SendTransactionalEmailResult =
  | { ok: true; skipped: false; messageId: string }
  | { ok: true; skipped: true }
  | { ok: false; skipped: false; errorCode: string };

/**
 * Sends a plain-text transactional e-mail via Resend.
 * When `RESEND_API_KEY` is unset, skips sending and logs a single warn without recipient or body (no PII).
 */
export async function sendTransactionalEmail(
  logger: FastifyBaseLogger | undefined,
  input: SendTransactionalEmailInput,
): Promise<SendTransactionalEmailResult> {
  if (!apiKey || resend === null) {
    logger?.warn("Skipped transactional email send: no provider configured (RESEND_API_KEY unset).");
    return { ok: true, skipped: true };
  }

  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  if (error) {
    const withName = error as { name?: string };
    const errorCode = typeof withName.name === "string" ? withName.name : "UNKNOWN";
    return { ok: false, skipped: false, errorCode };
  }

  const messageId = typeof data.id === "string" ? data.id : "unknown";
  return { ok: true, skipped: false, messageId };
}
