import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { squadWatcherPlugin } from "./src/plugin/squadWatcher";

export default defineConfig({
  plugins: [react(), squadWatcherPlugin()],
  base: "/squad/",
  build: {
    outDir: "../public/squad",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
