import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^use-sync-external-store\/(?:shim\/)?with-selector(?:\.js)?$/,
        replacement: path.resolve(
          __dirname,
          "./src/lib/vendor/use-sync-external-store-with-selector.ts",
        ),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./"),
      },
    ],
  },
});
