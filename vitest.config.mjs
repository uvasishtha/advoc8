import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.mjs";

export default defineConfig({
  ...viteConfig,
  test: {
    environment: "node",
    include: ["**/*.test.js"],
    // Agent Manager keeps worktrees inside the project, and each one carries a
    // full copy of the suite. Running them all would test stale code twice.
    exclude: ["node_modules/**", ".next/**", ".kilo/**"],
  },
});