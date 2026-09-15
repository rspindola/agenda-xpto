export const PLAN_ESTABLISHMENT_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  business: 10,
}

export function getEstablishmentLimit(planName?: string) {
  const normalized = (planName || 'starter').toLowerCase()
  const max = PLAN_ESTABLISHMENT_LIMITS[normalized] ?? 1
  return {
    max,
    isAtLimit: (count: number) => count >= max,
    isNearLimit: (count: number) => count === max - 1 && max > 1,
    isSingleOnly: max === 1,
  }
}
