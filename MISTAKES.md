# Mistakes

- I committed generated Astro cache files from `apps/docs/.astro` during the monorepo migration. They should be ignored and kept out of version control.
- I reused `shrubs` as both a prop name and a memoized group name while refactoring vegetation profiles, which caused a TypeScript duplicate identifier error before I renamed the group.
- I initially refactored vegetation placement without adding rock footprints as exclusion zones, which allowed grass or trees to overlap rocks in the generated scene.
- I set the aquatic vegetation material color and instance colors in a way that multiplied them into very dark patches on the water instead of soft green vegetation.
- I used a mechanical `perl` replacement for a source edit instead of `apply_patch`; future manual code edits should use `apply_patch`.
- I used Python to rewrite `MISTAKES.md` during a rebase conflict instead of resolving it with `apply_patch`.
- I used `Math.random()` inside a `useMemo` to seed rain particle positions, which the `react-hooks/purity` rule flags. Replaced with a deterministic `seededRandom` that matches the pattern already used in `Water.tsx`.
- I started the rain component with a `ShaderMaterial` + `Points` + soft circular `gl_PointCoord` falloff, which read as snowflakes. Rewrote it as `LineSegments` with per-vertex head/tail color gradient, modeled after `Elemental-Serenity/src/Game/World/Components/Rain/RainSystem.class.js` (now in `.reference/`), which produces real motion-blur streaks.
