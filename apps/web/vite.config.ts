import { fileURLToPath } from "node:url";
import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// es-toolkit@1.47.0 has a broken ./compat/* exports map that only resolves to
// the CommonJS bundle. Recharts pulls CJS into the browser which explodes at
// runtime. Redirect the subpath imports to the ESM files shipped at
// dist/compat/{array,function,math,...}/*.mjs, wrapping the named export as
// a default export so that `import get from "es-toolkit/compat/get"` works.
function esToolkitCompatESM(): Plugin {
  let compatRoot: string | null = null;
  const subDirs = [
    "array",
    "function",
    "math",
    "object",
    "predicate",
    "string",
    "util",
  ];

  return {
    name: "es-toolkit-compat-esm",
    enforce: "pre",
    async resolveId(source, importer, options) {
      const match = /^es-toolkit\/compat\/(.+?)(?:\.js)?$/.exec(source);
      if (!match) return null;

      if (!compatRoot) {
        const resolved = await this.resolve(
          "es-toolkit/package.json",
          importer,
          options,
        );
        if (!resolved) return null;
        compatRoot = path.join(path.dirname(resolved.id), "dist", "compat");
      }

      return `\0es-toolkit-compat-${match[1]}`;
    },
    load(id) {
      const match = /^\0es-toolkit-compat-(.+)$/.exec(id);
      if (!match || !compatRoot) return null;
      const name = match[1];

      for (const dir of subDirs) {
        const mjsPath = path.join(compatRoot, dir, `${name}.mjs`);
        if (fs.existsSync(mjsPath)) {
          return `export { ${name} as default } from "${mjsPath.replace(/\\/g, "/")}";`;
        }
      }

      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [esToolkitCompatESM(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  optimizeDeps: {
    exclude: ["recharts"],
  },
});
