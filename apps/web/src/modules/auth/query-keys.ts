export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

export const establishmentKeys = {
  all: ['establishments'] as const,
  list: () => [...establishmentKeys.all, 'list'] as const,
}
