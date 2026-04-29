import type { FastifyBaseLogger } from "fastify";

import { resend } from "~/lib/email.js";

export type AuthEmailKind = "verification" | "password_reset";

const DEFAULT_FROM = "ZeroFila <onboarding@resend.dev>";

export async function sendAuthTransactionalEmail(options: {
  logger: FastifyBaseLogger;
  kind: AuthEmailKind;
  to: string;
  url: string;
}): Promise<void> {
  const { logger, kind, to, url } = options;
  const subject =
    kind === "verification" ? "Confirm your ZeroFila email" : "Reset your ZeroFila password";

  if (!process.env.RESEND_API_KEY || !resend) {
    logger.info(
      {
        kind,
        to,
        url,
        msg: "auth_email_dev_log",
      },
      "Auth email link (RESEND_API_KEY unset — full URL for manual testing)",
    );
    return;
  }

  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

  await resend.emails.send({
    from,
    to,
    subject,
    html: `<p><a href="${url}">${subject}</a></p>`,
  });
}
