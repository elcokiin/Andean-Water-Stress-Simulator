# Mistakes

- I committed generated Astro cache files from `apps/docs/.astro` during the monorepo migration. They should be ignored and kept out of version control.
- I reused `shrubs` as both a prop name and a memoized group name while refactoring vegetation profiles, which caused a TypeScript duplicate identifier error before I renamed the group.
