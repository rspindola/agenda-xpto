const webBaseUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:3000'

export const webUrls = {
  onboardingBusiness: () => `${webBaseUrl}/onboarding/business`,
  verifyEmail: () => `${webBaseUrl}/verify-email`,
  resetPassword: () => `${webBaseUrl}/reset-password`,
}
