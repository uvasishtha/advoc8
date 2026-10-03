import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.mjs";

export default defineConfig({
  ...viteConfig,
  test: {
    environment: "node",
    include: ["**/*.test.js"],
  },
});