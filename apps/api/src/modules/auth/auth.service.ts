import * as authRepository from "./auth.repository.js";

export async function onUserCreated(userId: string): Promise<void> {
  await authRepository.createTrialSubscriptionIfMissing(userId);
}
