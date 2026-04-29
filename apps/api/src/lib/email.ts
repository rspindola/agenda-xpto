import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/** Resend client; methods no-op friendly when `RESEND_API_KEY` is unset in dev. */
export const resend = apiKey ? new Resend(apiKey) : null;
