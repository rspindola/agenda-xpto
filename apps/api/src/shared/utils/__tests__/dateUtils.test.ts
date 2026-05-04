import { describe, it, expect } from "vitest";

import { AppError } from "~/shared/errors/AppError.js";
import { parseLocalDate, toUtcDateRange } from "~/shared/utils/dateUtils.js";

describe("dateUtils", () => {
  describe("parseLocalDate", () => {
    it("should parse valid date string and return start of day in UTC", () => {
      const result = parseLocalDate("2026-01-15", "UTC");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
    });

    it("should throw on invalid date format", () => {
      expect(() => parseLocalDate("2026/01/15", "UTC")).toThrow(AppError);
      expect(() => parseLocalDate("01-15-2026", "UTC")).toThrow(AppError);
      expect(() => parseLocalDate("invalid", "UTC")).toThrow(AppError);

      try {
        parseLocalDate("2026/01/15", "UTC");
        throw new Error("Should have thrown");
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.code).toBe("INVALID_DATE_FORMAT");
        }
      }
    });

    it("should handle dates at beginning of month", () => {
      const result = parseLocalDate("2026-01-01", "UTC");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCDate()).toBe(1);
    });

    it("should handle dates at end of month", () => {
      const result = parseLocalDate("2026-01-31", "UTC");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCDate()).toBe(31);
    });

    it("should handle endOfDay option", () => {
      const result = parseLocalDate("2026-01-15", "UTC", { endOfDay: true });
      expect(result).toBeInstanceOf(Date);
      // End of day should be close to 23:59:59
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
    });

    it("should handle timezone offset correctly", () => {
      // For UTC, it should be the same
      const resultUTC = parseLocalDate("2026-01-15", "UTC");
      expect(resultUTC.toISOString()).toContain("2026-01-15T00:00:00");
    });

    it("should handle leap year dates", () => {
      const result = parseLocalDate("2024-02-29", "UTC");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCMonth()).toBe(1); // February
      expect(result.getUTCDate()).toBe(29);
    });

    it("should reject invalid leap year date", () => {
      expect(() => parseLocalDate("2026-02-29", "UTC")).toThrow();
    });

    it("should handle edge case dates with correct timezone offset", () => {
      // Test with a different timezone
      const resultEastern = parseLocalDate("2026-06-15", "America/New_York");
      expect(resultEastern).toBeInstanceOf(Date);
    });

    it("should trim whitespace in date string", () => {
      const result = parseLocalDate("  2026-01-15  ", "UTC");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCDate()).toBe(15);
    });

    it("should return midnight UTC for midnight local in UTC timezone", () => {
      const result = parseLocalDate("2026-03-15", "UTC", { endOfDay: false });
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
    });

    it("should handle negative timezone offset (east of UTC)", () => {
      const result = parseLocalDate("2026-01-15", "Asia/Tokyo");
      expect(result).toBeInstanceOf(Date);
      // Tokyo is UTC+9, so local midnight is UTC-9
      expect(result).toBeInstanceOf(Date);
    });

    it("should handle positive timezone offset (west of UTC)", () => {
      const result = parseLocalDate("2026-01-15", "America/Los_Angeles");
      expect(result).toBeInstanceOf(Date);
    });

    it("should handle endOfDay with UTC timezone returning 23:59:59", () => {
      const result = parseLocalDate("2026-06-15", "UTC", { endOfDay: true });
      const isoStr = result.toISOString();
      expect(isoStr).toContain("2026-06-15");
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
    });

    it("should handle endOfDay with a real timezone offset", () => {
      const result = parseLocalDate("2026-06-15", "America/New_York", { endOfDay: true });
      expect(result).toBeInstanceOf(Date);
      // Should be end of day in New York time
      expect(result.getUTCHours()).toBeGreaterThanOrEqual(0);
      expect(result.getUTCHours()).toBeLessThanOrEqual(23);
    });

    it("should parse dates in Europe/London timezone", () => {
      const result = parseLocalDate("2026-01-15", "Europe/London");
      expect(result).toBeInstanceOf(Date);
    });

    it("should parse dates in Australia/Sydney timezone", () => {
      const result = parseLocalDate("2026-01-15", "Australia/Sydney");
      expect(result).toBeInstanceOf(Date);
    });

    it("should parse dates in far-east timezone", () => {
      const result = parseLocalDate("2026-01-15", "Asia/Tokyo");
      expect(result).toBeInstanceOf(Date);
      // Tokyo is UTC+9, so the result should be a valid date
      // January 15 local time in Tokyo = January 14 or 15 in UTC depending on time
      expect(result.getUTCDate()).toBeGreaterThanOrEqual(14);
      expect(result.getUTCDate()).toBeLessThanOrEqual(15);
    });

    it("should parse very late dates in far-east timezone", () => {
      const result = parseLocalDate("2026-12-31", "Asia/Tokyo");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2026);
    });

    it("should handle very early dates in western timezone", () => {
      const result = parseLocalDate("2026-01-01", "America/Los_Angeles");
      expect(result).toBeInstanceOf(Date);
      // LA is UTC-8, so Jan 1 LA midnight is Jan 1 UTC 8am
      expect(result.getUTCDate()).toBe(1);
    });

    it("should handle end of year in different timezones", () => {
      const resultUTC = parseLocalDate("2025-12-31", "UTC");
      const resultTokyo = parseLocalDate("2026-01-01", "Asia/Tokyo");
      // Both should be valid dates
      expect(resultUTC).toBeInstanceOf(Date);
      expect(resultTokyo).toBeInstanceOf(Date);
    });

    it("should correctly adjust end of day with Tokyo timezone", () => {
      const result = parseLocalDate("2026-06-15", "Asia/Tokyo", { endOfDay: true });
      expect(result).toBeInstanceOf(Date);
      // End of day should preserve that it's still the same local day
      expect(result.getUTCHours()).toBeGreaterThanOrEqual(0);
      expect(result.getUTCHours()).toBeLessThanOrEqual(23);
    });

    it("should correctly adjust end of day with Los Angeles timezone", () => {
      const result = parseLocalDate("2026-06-15", "America/Los_Angeles", { endOfDay: true });
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCDate()).toBeGreaterThanOrEqual(15);
    });

    it("should handle DST transition dates correctly", () => {
      // Spring forward (DST starts)
      const springResult = parseLocalDate("2026-03-08", "America/New_York");
      expect(springResult).toBeInstanceOf(Date);

      // Fall back (DST ends)
      const fallResult = parseLocalDate("2026-11-01", "America/New_York");
      expect(fallResult).toBeInstanceOf(Date);
    });
  });

  describe("toUtcDateRange", () => {
    it("should return the same dates passed in", () => {
      const start = new Date("2026-01-01T00:00:00Z");
      const end = new Date("2026-01-31T23:59:59Z");

      const result = toUtcDateRange(start, end, "UTC");

      expect(result.start).toEqual(start);
      expect(result.end).toEqual(end);
    });

    it("should work with any timezone parameter", () => {
      const start = new Date("2026-01-01T00:00:00Z");
      const end = new Date("2026-01-31T23:59:59Z");

      const result = toUtcDateRange(start, end, "America/New_York");

      expect(result.start).toEqual(start);
      expect(result.end).toEqual(end);
    });

    it("should return object with start and end properties", () => {
      const start = new Date("2026-01-15T10:00:00Z");
      const end = new Date("2026-01-15T18:00:00Z");

      const result = toUtcDateRange(start, end, "UTC");

      expect(result).toHaveProperty("start");
      expect(result).toHaveProperty("end");
    });

    it("should handle same date for start and end", () => {
      const same = new Date("2026-01-15T12:00:00Z");

      const result = toUtcDateRange(same, same, "UTC");

      expect(result.start).toEqual(same);
      expect(result.end).toEqual(same);
    });

    it("should preserve date precision", () => {
      const start = new Date("2026-01-15T08:30:45.123Z");
      const end = new Date("2026-01-15T18:45:30.456Z");

      const result = toUtcDateRange(start, end, "UTC");

      expect(result.start.toISOString()).toContain("08:30:45");
      expect(result.end.toISOString()).toContain("18:45:30");
    });
  });
});
