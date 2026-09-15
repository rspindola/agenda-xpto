export const professionalsKeys = {
  all: ['professionals'] as const,
  lists: (establishmentId: string) => [...professionalsKeys.all, establishmentId, 'list'] as const,
  detail: (establishmentId: string, id: string) => [...professionalsKeys.all, establishmentId, 'detail', id] as const,
}
