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
      // Unit-test coverage for service layer and shared code. AGENTS.md targets 80% per module; the
      // aggregate floor matches the current suite; raise thresholds when adding service tests.
      include: ["src/modules/**/*.service.ts", "src/shared/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.repository.test.ts", "src/**/*.d.ts"],
      thresholds: {
        lines: 93,
        functions: 97,
        branches: 88,
        statements: 93,
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
