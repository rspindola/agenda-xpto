import { describe, expect, it } from "vitest";

import { AppError } from "~/shared/errors/AppError.js";

describe("AppError", () => {
  it("sets statusCode, code, and message", () => {
    const err = new AppError(404, "NOT_FOUND", "Resource not found");

    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Resource not found");
    expect(err.name).toBe("AppError");
  });

  it("accepts optional cause", () => {
    const cause = new Error("underlying");
    const err = new AppError(500, "INTERNAL", "Failed", { cause });

    expect(err.cause).toBe(cause);
  });
});
