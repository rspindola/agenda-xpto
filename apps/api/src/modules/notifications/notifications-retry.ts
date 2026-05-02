/** Parses comma-separated backoff delays (ms) for notification send retries. */
export function parseRetryDelaysMs(): number[] {
  const raw = process.env.NOTIFICATION_RETRY_DELAYS_MS ?? "60000,300000,900000";
  const parts = raw.split(",").map((s) => Number.parseInt(s.trim(), 10));
  const valid = parts.filter((n) => Number.isFinite(n) && n > 0);
  return valid.length > 0 ? valid : [60_000, 300_000, 900_000];
}
