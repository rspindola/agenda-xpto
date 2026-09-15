export const establishmentKeys = {
  all: ['establishments'] as const,
  list: () => [...establishmentKeys.all, 'list'] as const,
  detail: (id: string | null | undefined) => [...establishmentKeys.all, 'detail', id] as const,
  professionals: (id: string | null | undefined) => [...establishmentKeys.all, 'professionals', id] as const,
  services: (id: string | null | undefined) => [...establishmentKeys.all, 'services', id] as const,
  hours: (id: string | null | undefined) => [...establishmentKeys.all, 'hours', id] as const,
}
