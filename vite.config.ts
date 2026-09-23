import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Enables React fast-refresh and JSX/TSX transform support.
  plugins: [react()],
  resolve: {
    alias: {
      // Lets source files use "@/..." imports instead of relative paths.
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
