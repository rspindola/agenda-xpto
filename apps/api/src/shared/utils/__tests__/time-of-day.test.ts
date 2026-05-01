import { describe, expect, it } from "vitest";

import { AppError } from "~/shared/errors/AppError.js";

import { formatUtcTimeAsHm, minutesSinceMidnightUtc, parseTimeHmToUtcDate } from "~/shared/utils/time-of-day.js";

describe("parseTimeHmToUtcDate", () => {
  it("should parse valid HH:mm to UTC Date on 1970-01-01", () => {
    const d = parseTimeHmToUtcDate("14:30");
    expect(d.toISOString()).toBe("1970-01-01T14:30:00.000Z");
  });

  it("should throw VALIDATION_ERROR when format is invalid", () => {
    expect(() => parseTimeHmToUtcDate("25:00")).toThrow(AppError);
    try {
      parseTimeHmToUtcDate("bad");
      expect.fail("expected throw");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.code).toBe("VALIDATION_ERROR");
      }
    }
  });
});

describe("formatUtcTimeAsHm", () => {
  it("should format UTC hours and minutes as HH:mm", () => {
    expect(formatUtcTimeAsHm(new Date(Date.UTC(1970, 0, 1, 9, 5, 0)))).toBe("09:05");
  });
});

describe("minutesSinceMidnightUtc", () => {
  it("should return minutes since midnight UTC", () => {
    expect(minutesSinceMidnightUtc(new Date(Date.UTC(1970, 0, 1, 2, 15, 0)))).toBe(135);
  });
});
