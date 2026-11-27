import { defineConfig } from "vite";
// harness lives in dev/ but imports ../src and ../scripts, so allow the parent folder
export default defineConfig({
  root: "dev",
  server: { fs: { allow: [".."] } },
  build: { outDir: "../dev-dist", emptyOutDir: true },
});
