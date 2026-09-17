import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Enables React fast-refresh and JSX/TSX transform support.
  plugins: [react()],
  server: {
    proxy: {
      // Forwards /api requests during local dev to the Donezo-API backend,
      // avoiding CORS issues between the Vite dev server and the API.
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Lets source files use "@/..." imports instead of relative paths.
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
