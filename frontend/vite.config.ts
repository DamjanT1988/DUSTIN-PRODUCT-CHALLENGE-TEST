import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",

    // ✅ Only run tests in src that end with .test.ts or .test.tsx
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],

    // ✅ Never scan node_modules, dist, etc.
    exclude: [
      "node_modules",
      "dist",
      ".git",
      ".idea",
      "cypress",
    ],

    // ✅ Do not watch files (reduces handles on Windows)
    watch: false,
  },
});
