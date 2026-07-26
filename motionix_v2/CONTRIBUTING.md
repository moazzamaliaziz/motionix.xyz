# Contributing

Thanks for taking a look. Motionix is a small project and the bar for
contributions is intentionally low — we don't have a contribution process
document longer than this file.

## What we need

- **Bug reports.** Use the bug report template. Most useful when you
  include: which tool, which browser (Chrome/Safari/Firefox?), what
  happened, what you expected.
- **Small fixes.** Anything wrong in copy, layout, accessibility, or
  a tool's edge case. PRs welcome.
- **Tool ideas.** Open an issue using the feature request template. We
  especially want to hear which tools *aren't* here that you keep needing.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

You don't need any of the external services to contribute. The site runs
without env vars — tools work in pure local mode.

## Workflow

1. Fork the repo.
2. Branch off `main` (`git checkout -b fix/whatever`).
3. Run `npm run lint && npm run build` before pushing. CI does the same
   on PRs.
4. Open a PR. The CI check must pass before we can merge.

## Style

- TypeScript strict. No `any` unless you're wrapping a third-party
  package that itself is loosely typed.
- Snapshots are 4 / 4: 4 tabs indent in Yaml / JSON / Markdown, 2 spaces
  indent everywhere else.
- Comments reserved for non-obvious decisions. Mark intentional shortcuts
  with `// ponytail: <reason>`.

## Project conventions

- Tools live in `src/components/motionix/tool/tools/`. Add an entry to
  `src/lib/tools.ts` to register a new tool.
- Visual primitives live in `src/components/motionix/visuals/`. If you
  add a primitive, use it on the landing page or some tool within the
  same PR.
- Server-only helpers are imported with `import "server-only"` at the top.

## Want a big architectural change?

Open an issue first. We like small, surgical PRs. If you're proposing
something bigger — a new auth provider, a rewrite of the storage layer —
we'll want to talk it over before you spend hours on it.

## Code of conduct

Be patient. We're a small team and reply within a couple of days, not
within a couple of hours. Approach disagreements with curiosity, not
swords; assume good intent; cite sources. That's it.
