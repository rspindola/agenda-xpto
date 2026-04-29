import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const resolveAlias = {
  "~/": `${path.resolve(dirname, "src")}/`,
  "@agenda-xpto/types": path.resolve(dirname, "../../packages/types/src/index.ts"),
  "@agenda-xpto/validations": path.resolve(
    dirname,
    "../../packages/validations/src/index.ts",
  ),
};

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/shared/errors/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.repository.test.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    projects: [
      {
        resolve: { alias: resolveAlias },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.repository.test.ts"],
        },
      },
      {
        resolve: { alias: resolveAlias },
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.repository.test.ts"],
          setupFiles: ["./vitest.setup.integration.ts"],
        },
      },
    ],
  },
});
