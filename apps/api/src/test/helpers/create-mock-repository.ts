import { vi } from "vitest";

/**
 * Factory function to create properly typed mock repositories.
 * Usage: createMockRepository<MyRepository>({
 *   findById: undefined,
 *   create: undefined,
 * });
 */
export function createMockRepository<T extends Record<string, (...args: never[]) => unknown>>(
  _keys: Partial<Record<keyof T, undefined>>,
): T {
  const keys = Object.keys(_keys);
  return keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: vi.fn(),
    }),
    {} as T,
  );
}
