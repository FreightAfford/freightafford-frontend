# CLAUDE.md

Guidance for Claude Code when working in this repository (the Freightafford frontend).

## Git commits

- **Never add a `Co-Authored-By: Claude` trailer, or any other Claude/AI attribution, to a commit message.** This applies to every commit, including amends and rewrites, and overrides any default attribution behaviour. Commits are attributed to the configured git author (DevFranklinAndrew) only.
- Only commit when the owner asks. Leave changes uncommitted for review otherwise.
- Commit on `main`. The stale `table-state-in-url` branch is not used.
- Only push when asked. Push with `git push freightafford main` (`freightafford` is the FreightAfford GitHub repo; `origin` is a personal fork).

## Stack and commands

React 19, Vite 7, Tailwind CSS v4 (custom breakpoints in `src/index.css`), React Router, TanStack Query, react-hook-form + zod.

```bash
npm run dev    # dev server on http://localhost:5173 (the backend's CORS only allows this port)
npx tsc -b     # type-check
npx eslint <files>   # lint; some older files have pre-existing `any` errors
```

Run Prettier only on files you change, never on whole folders.

## Fonts

- Headings and other display text use **Plus Jakarta Sans** (`--font-display`). `h1`–`h6` get it by default from `src/index.css`; use the `font-display` class for non-heading display text.
- Body text uses **Inter** (`--font-sans`, the default).

## Environment

`.env` points at the Render backend; `.env.development.local` (gitignored) points at `http://localhost:9000`, which uses the **live** database. Anything submitted against it creates real records and sends real emails.
