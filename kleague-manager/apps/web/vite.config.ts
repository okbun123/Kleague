import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

function getBasePath() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!process.env.GITHUB_ACTIONS || !repository) return "/";
  const repoName = repository.split("/")[1];
  if (!repoName || repoName.endsWith(".github.io")) return "/";
  return `/${repoName}/`;
}

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  resolve: {
    alias: {
      "@kleague-manager/engine": fileURLToPath(new URL("../../packages/engine/src/index.ts", import.meta.url))
    }
  }
});
