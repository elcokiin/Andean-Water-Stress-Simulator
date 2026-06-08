# Learnings

- `bun --version` in this environment returns `1.3.10`.
- This worktree did not have all workspace dependencies installed initially; `bun install` was required before `apps/web` could resolve `vite`, `vite/client`, and `@types/node`.
- `DOMAIN_DOC.html` is a `pdf2htmlEX` export, so the useful project content is embedded in positioned text nodes rather than a simple article-style HTML structure.
- Playwright is not preloaded with browser binaries here; `bunx playwright install chromium` was required before Chromium screenshots could run.
- System Chromium is available at `/usr/bin/chromium`; headless WebGL screenshots need SwiftShader flags such as `--enable-unsafe-swiftshader --use-gl=swiftshader`.
- Python Pillow is not installed in this environment; ImageMagick is available through `/usr/bin/magick` for screenshot pixel checks.
- `git lfs` is not installed here; LFS-backed reference assets such as `ez-tree` ground textures need to be downloaded from `media.githubusercontent.com` or they copy as small pointer files.
- The environment rewrites GitHub HTTPS clones to SSH through global Git config; use `GIT_CONFIG_GLOBAL=/dev/null` when a public HTTPS clone must avoid SSH auth.
- `apps/docs` can build after `bun install`, but `bun run typecheck` prompts for missing `@astrojs/check` instead of running a full Astro check.
- `bunx prettier` cannot infer a parser for `.astro` files in this workspace because no Astro Prettier plugin is configured.
- `bunx --bun shadcn@latest search/info` can fail here with package copy errors; `bunx --bun shadcn@4.9.0` worked for registry search, docs, view, info, and add.
- Vite `resolve.alias` regex redirects like `find: /^es-toolkit\/compat\/(.+)$/, replacement: "es-toolkit/dist/compat/$1.mjs"` still go through the package resolver and fail on the second pass. Use a custom plugin with `enforce: "pre"` and `resolveId` that returns an absolute file path (resolved via `this.resolve("es-toolkit/package.json")` then `path.join`) to bypass the broken `exports` map entirely.
- In this Vite 8/Bun setup, `optimizeDeps.include` cannot resolve `use-sync-external-store/shim/with-selector` or `use-sync-external-store/shim/with-selector.js`, even though the package exports those subpaths. A `resolve.alias` regex to a local ESM wrapper works and also covers `zustand` default imports.
- Recharts v3 can be a poor fit for this Vite 8/Bun app because different optimizer modes expose different transitive CJS/ESM failures: excluding Recharts leaves raw CJS deps in browser requests, while prebundling Recharts reintroduces the `es-toolkit/compat` runtime failure. For a single compact line chart, a local SVG component is more predictable.
