# Learnings

- `bun --version` in this environment returns `1.3.10`.
- This worktree did not have all workspace dependencies installed initially; `bun install` was required before `apps/web` could resolve `vite`, `vite/client`, and `@types/node`.
- `DOMAIN_DOC.html` is a `pdf2htmlEX` export, so the useful project content is embedded in positioned text nodes rather than a simple article-style HTML structure.
- Playwright is not preloaded with browser binaries here; `bunx playwright install chromium` was required before Chromium screenshots could run.
- System Chromium is available at `/usr/bin/chromium`; headless WebGL screenshots need SwiftShader flags such as `--enable-unsafe-swiftshader --use-gl=swiftshader`.
- Python Pillow is not installed in this environment; ImageMagick is available through `/usr/bin/magick` for screenshot pixel checks.
- `apps/docs` can build after `bun install`, but `bun run typecheck` prompts for missing `@astrojs/check` instead of running a full Astro check.
