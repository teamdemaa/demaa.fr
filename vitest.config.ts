import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "client-only": fileURLToPath(
        new URL("./scripts/client-only-stub.ts", import.meta.url),
      ),
      "server-only": fileURLToPath(
        new URL("./scripts/server-only-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    // The full catalog render tests share a large graph; run suites serially.
    maxWorkers: 1,
    include: ["tests/**/*.test.ts"],
  },
});
