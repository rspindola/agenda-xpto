export const servicesKeys = {
  all: ['services'] as const,
  lists: (establishmentId: string) => [...servicesKeys.all, establishmentId, 'list'] as const,
  detail: (establishmentId: string, id: string) => [...servicesKeys.all, establishmentId, 'detail', id] as const,
}
