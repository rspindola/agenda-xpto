import { beforeEach, describe, expect, it, vi } from "vitest";

import { onUserCreated } from "../auth.service.js";
import * as authRepository from "../auth.repository.js";

vi.mock("../auth.repository.js", () => ({
  createTrialSubscriptionIfMissing: vi.fn(),
}));

describe("onUserCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to repository for trial subscription", async () => {
    vi.mocked(authRepository.createTrialSubscriptionIfMissing).mockResolvedValue(undefined);

    await onUserCreated("user_test_123");

    expect(authRepository.createTrialSubscriptionIfMissing).toHaveBeenCalledTimes(1);
    expect(authRepository.createTrialSubscriptionIfMissing).toHaveBeenCalledWith("user_test_123");
  });
});
