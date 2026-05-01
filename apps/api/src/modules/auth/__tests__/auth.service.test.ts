import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTrialSubscriptionIfMissing } from "~/modules/auth/auth.repository.js";
import { onUserCreated } from "~/modules/auth/auth.service.js";

vi.mock("~/modules/auth/auth.repository.js", () => ({
  createTrialSubscriptionIfMissing: vi.fn(),
}));

describe("onUserCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to repository for trial subscription", async () => {
    vi.mocked(createTrialSubscriptionIfMissing).mockResolvedValue(undefined);

    await onUserCreated("user_test_123");

    expect(createTrialSubscriptionIfMissing).toHaveBeenCalledTimes(1);
    expect(createTrialSubscriptionIfMissing).toHaveBeenCalledWith("user_test_123");
  });
});
