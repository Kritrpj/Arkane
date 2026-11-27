import { defineConfig } from "vitest/config";
// separate from vite.config.ts (that one points at dev/ for the harness)
export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
