# AGENTS.md

## Task Completion Requirements

- Run targeted tests with `vitest run ...` when working on a scoped area.
- NEVER run `bun test`.
- For code changes, run the narrowest useful verification before handing back.
- For broad or merge-ready changes, the full gates are `bun run format:check`, `bun run lint`, `bun run typecheck`, and `bun run test`.

## Attribution

Do not add any AI assistant, Claude, Anthropic, or Co-Authored-By
attribution/trailers to commits, commit messages, PRs, or generated files.

Pull request titles and descriptions are going to a public GitHub repo, so
avoid using specific names or internal info unless explicitly stated to.

## Collaboration Notes

The user uses speech to text occasionally, so if sentences are weird or words
are not right, infer the likely intent and ask only when needed.

Code is very cheap to write. Do not give time estimates; with agents, code is
practically instant to generate. Unless stated otherwise, time to implement is
not a blocker.

## Project context and decisions

For information about the project, its objectives, and domain-level guidance when
making design or product decisions, read and align with `DOMAIN_DOC.html` in the
repository root.

## Stack and tooling

This is a React application built with Vite. Run `package.json` scripts and
other project commands with Bun (for example `bun run <script>`, `bun install`,
`bunx <tool>`), not npm, pnpm, or yarn, unless a documented exception applies.

## Reference Repos

Repos in `.reference`, such as xyflow, are available for patterns or view exactly how works the package. If
given a Git URL for reference, clone it into `.reference` and inspect it there.
Make sure to pull the latest changes from the reference repo before using it.

See `notes/references.md` for reference repositories.

## Engineering Priorities

- Prefer correctness and predictable behavior over short-term convenience.
- Preserve runtime behavior when changing lint, typing, or test structure.
- Keep package boundaries clear; use public package exports instead of relative
  imports across package roots.
- Extract shared logic only when the shared behavior is real and local patterns
  support it. Avoid broad generic abstractions for one-off duplication.

## UI and Shortcuts

- When adding or changing a keyboard shortcut, also update the visible shortcut
  help: add the shortcut to the reference list and show it with
  `ShortcutBadge` or `ShortcutFlag` on the related control when there is a
  visible UI action for it.

## Other

Please make note of mistakes you make in MISTAKES.md. If you find you wish you had more context or tools, write that down in DESIRES.md. If you learn anything about your env write that down in LEARNINGS.md.
