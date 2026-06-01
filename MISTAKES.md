# Mistakes

- I committed generated Astro cache files from `apps/docs/.astro` during the monorepo migration. They should be ignored and kept out of version control.
- I reused `shrubs` as both a prop name and a memoized group name while refactoring vegetation profiles, which caused a TypeScript duplicate identifier error before I renamed the group.
- I initially refactored vegetation placement without adding rock footprints as exclusion zones, which allowed grass or trees to overlap rocks in the generated scene.
