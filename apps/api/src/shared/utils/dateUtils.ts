import { AppError } from "~/shared/errors/AppError.js";

/**
 * Parses a local date string (YYYY-MM-DD) in a given timezone.
 * Returns the start of that day in UTC.
 */
export function parseLocalDate(
  dateStr: string,
  timezone: string,
  options?: { endOfDay?: boolean },
): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) {
    throw new AppError(400, "INVALID_DATE_FORMAT", "Date must be in YYYY-MM-DD format.");
  }

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number.parseInt(yearStr, 10);

  // Create a date at midnight local time
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
  });

  // We want to find what UTC time corresponds to midnight (or end of day) in the given timezone
  // Iterate to find the right UTC time
  const targetLocal = `${year.toString()}-${monthStr}-${dayStr}`;
  const utcDate = new Date(`${targetLocal}T00:00:00Z`);

  // Adjust to find the correct UTC time that maps to local midnight
  for (let attempt = 0; attempt < 1000; attempt++) {
    const parts = formatter.formatToParts(utcDate);
    const yearPart = parts.find((p) => p.type === "year")?.value ?? "";
    const monthPart = parts.find((p) => p.type === "month")?.value ?? "";
    const dayPart = parts.find((p) => p.type === "day")?.value ?? "";
    const formattedLocal = `${yearPart.padStart(4, "0")}-${monthPart}-${dayPart}`;

    if (formattedLocal === targetLocal) {
      if (options?.endOfDay) {
        // Move to 23:59:59 of that day
        const endDay = new Date(utcDate);
        endDay.setUTCHours(23, 59, 59, 999);
        // Adjust back for timezone offset at end of day
        return adjustForEndOfDay(endDay, timezone, targetLocal);
      }
      return new Date(utcDate);
    }

    if (formattedLocal < targetLocal) {
      utcDate.setUTCHours(utcDate.getUTCHours() + 1);
    } else {
      utcDate.setUTCHours(utcDate.getUTCHours() - 1);
    }
  }

  throw new AppError(500, "TIMEZONE_ERROR", "Could not parse date in given timezone.");
}

function adjustForEndOfDay(utcDate: Date, timezone: string, targetLocal: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
  });

  const current = new Date(utcDate);
  for (let attempt = 0; attempt < 100; attempt++) {
    const parts = formatter.formatToParts(current);
    const yearPart = parts.find((p) => p.type === "year")?.value ?? "";
    const monthPart = parts.find((p) => p.type === "month")?.value ?? "";
    const dayPart = parts.find((p) => p.type === "day")?.value ?? "";
    const formattedLocal = `${yearPart.padStart(4, "0")}-${monthPart}-${dayPart}`;

    if (formattedLocal === targetLocal) {
      return current;
    }

    if (formattedLocal < targetLocal) {
      current.setUTCHours(current.getUTCHours() + 1);
    } else {
      current.setUTCHours(current.getUTCHours() - 1);
    }
  }

  return current;
}

/**
 * Converts local date range to UTC date range.
 * Used when user specifies date filters in establishment timezone.
 */
export function toUtcDateRange(
  localStart: Date,
  localEnd: Date,
  _timezone: string,
): { start: Date; end: Date } {
  return {
    start: localStart,
    end: localEnd,
  };
}
