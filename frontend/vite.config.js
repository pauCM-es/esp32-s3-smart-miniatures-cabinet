import { resolve } from "node:path";
import { defineConfig } from "vite";

const source = (path) => resolve(import.meta.dirname, "src", path);

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: resolve(import.meta.dirname, "../src/ha/www"),
    lib: {
      entry: {
        "smart-cabinet-panel": source("custom-panel/smart-cabinet-panel.ts"),
        "smart-cabinet-card": source("cards/smart-cabinet-card.js"),
        "smart-cabinet-miniatures-card": source("cards/smart-cabinet-miniatures-card.js"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
