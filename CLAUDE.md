@AGENTS.md

# This repository: Product Jam ex2

My personal assignment 2 for Product Jam (Hebrew University, 2026/27), built on
the course starter kit. I'm the developer; a designer partner joins for Part 3.

- **Due: November 11, 2026, 14:00.** Graded on the repo as it is at the
  deadline.
- **Spec:** the full assignment is at the end of this file. It is the source of
  truth for _what_ to build; where this file and the spec disagree, the spec
  wins. Parts are done in order: 0 → 1 → 2 → 3 → 4.
- **Progress:** @.claude/assignment/PLAN.md

## The kit's docs are the source of truth for _how_

Use exactly the technologies and patterns the starter kit uses. Before doing any
of these, read the doc and follow it, not your own defaults:

- Running locally, `.env`: `docs/01-quickstart.md`
- Supabase, keys, migrations, login: `docs/02-supabase-setup.md`
- Deploying to Cloudflare: `docs/04-deploy.md`
- Any new feature: `docs/05-adding-a-feature.md`
- What the server can't do, and libraries to avoid: `README.md`

Skip `docs/03-google-sign-in.md` (not needed for ex2).

## Decisions already made

- Tic-tac-toe variant: **`four`** (GitHub user `amir-benavi` starts with `a`):
  4×4 board, four in a row wins (across, down or diagonal), full board with no
  row is a draw. X plays first.
- Pages: `/tic-tac-toe` and `/nasa` need login; `/design` must stay public
  (outside `<RequireAuth>`); `/` links to all three.
- Gemini: REST API through `fetch` (no SDK), model `gemini-3.6-flash` (fallback
  `gemini-3.5-flash-lite`), structured JSON output, and the answer is **still**
  checked with a Zod schema in `shared/`. Never send personal data to Gemini.
- NASA: use `https://science.nasa.gov/wp-json/wp/v2/apod-basic` (not
  `api.nasa.gov`). Image is in `hdurl`; `explanation` is HTML starting with
  `<strong>Explanation:</strong>` and must be cleaned; one date is
  `apod-basic/YYMMDD` (404 if none). Details in Part 2 of the spec.

## How we work

- **Design first.** `docs/design.md` is committed and pushed before any code for
  Parts 1 and 2. Later changes go in a **What changed and why** section at its
  end; never rewrite the original design.
- **Copy the `events` example.** Every feature follows
  `docs/05-adding-a-feature.md`: migration → `shared/schemas` → `server/routes`
  → `client/features/<name>/hooks.ts` → `client/pages/<name>/`.
- **I must be able to explain every line** (that is how the course grades AI
  use). Prefer the simplest code that works, match the kit's style and comments,
  and when you make a non-obvious choice, say why in one sentence.
- **No new libraries** without asking me first (see README "Before you add a
  library").
- **Don't touch `.env`.** I edit it myself. If a new key is needed, tell me the
  line to add and add it to `Bindings` in `server/env.ts`.
- **`npx supabase db push` changes the live database** (local and production
  share one Supabase project). Ask before running it.
- **Every push to `main` deploys.** Push only after the checks pass.

## Checking work

```bash
npm run typecheck && npm run lint && npm test
```

For UI work, also look at the page in the browser at phone (375px), tablet
(768px) and desktop (1280px) widths, and in its loading, error and empty states.
Run `npm run preview` before a push.

## The assignment spec

@.claude/assignment/assignment.md
