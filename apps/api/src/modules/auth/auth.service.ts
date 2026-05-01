import { createTrialSubscriptionIfMissing } from "~/modules/auth/auth.repository.js";

export async function onUserCreated(userId: string): Promise<void> {
  await createTrialSubscriptionIfMissing(userId);
}
