# ex2 plan and progress

Due **Wed Nov 11, 14:00**; Wed morning is spare time for fixes. Tick boxes as
you go; Claude reads this file at the start of every session (it is imported by
`CLAUDE.md`), so keep it current.

**Critical path:** the designer. Part 3 needs their Figma link, a meeting to
decide the responsive layout, and their pull request merged before the deadline.
Message them first.

## Phase A: setup (you, by hand; Mon Nov 9)

Claude can't do these: they need your accounts and secret keys.

- [ ] Message the designer: get the Figma link, book a meeting for Tue
- [x] Copy `ex2/answers.md` from the course repo to the repo root
- [x] Supabase project → `cp .env.example .env` → fill it in
      (`docs/02-supabase-setup.md`)
- [x] `npx supabase login`, `link`, `db push`; turn off "Confirm email" (CLI v3:
      `db push --remote`, run in your own terminal, not `!`)
- [x] `localhost:3000/api/health` says `{ "ok": true, "database": "ok" }`, and
      you can sign up and log in
- [x] Gemini key in `.env` as `GEMINI_API_KEY` (and `NASA_API_KEY`), no `VITE_`
- [x] Rename `name` in `wrangler.jsonc`, commit, push (`product-jam-ex2`)
- [x] Cloudflare deploy (`docs/04-deploy.md`): build command empty, deploy
      command `npm run deploy`, **runtime** secrets (not under Build)
      `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`, `NASA_API_KEY`
- [x] Supabase Auth URL configuration with the live address
- [x] GitHub variable `DEPLOY_URL` (no trailing `/`) + run "Keep Supabase awake"
- [x] Live `/api/health` ok and login works
      (https://product-jam-ex2.benv-amir.workers.dev)

## Phase B: Part 0, design first (Mon Nov 9)

Session: new session, **plan mode**. "Read Part 0, 1 and 2 of the spec and help
me write `docs/design.md`."

- [x] Answer question 1 in `answers.md` (trace the `events` request yourself)
- [x] `docs/design.md`: tables, endpoints with errors and tables touched, one
      trade-off
- [x] Add both keys to `Bindings` in `server/env.ts`
- [x] **Commit and push `docs/design.md` before any Part 1/2 code**

## Phase C: Part 1, tic-tac-toe `four` (Mon Nov 9)

Session: new session. `/add-feature games`.

- [x] `shared/game/` pure rules + tests (all win lines, draw, invalid moves)
- [x] `/tic-tac-toe` page: board, turn, result, new game, CSS module
- [x] Migration `games`, `db push` (`--remote`; the first try missed it, so
      check the table is in Table Editor after every push)
- [x] `POST` sends moves, server replays and saves its own result
- [x] List of my games, newest first, with result and time
- [x] Checked at 375, 768 and 1280px
- [ ] `security-reviewer` agent → fix → `/ship`
- [ ] `answers.md` questions 2-4 (3 and 4 need screenshots, see below)

## Phase D: Part 2, space pictures (Mon Nov 9)

Session: new session. `/add-feature apod`.

- [ ] Server: random pictures (≤20) from `apod-basic`, clean HTML, own errors
      when NASA fails
- [ ] Server: explain by date → NASA → Gemini (structured output) → Zod check →
      save; return the saved one next time
- [ ] `/nasa` page: cards, explain button, loading/error/thinking states
- [ ] "What changed and why": the NASA endpoint change
- [ ] `security-reviewer` agent → fix → `/ship`

## Phase E: Part 3, design to code (Tue Nov 10)

Session: new session. `/figma-to-code <figma link>`.

- [ ] Mobile design on `/design`, checked on a real phone on the live app
- [ ] Meet the designer: phone, tablet, desktop; agree on wider layouts
      (`.claude/assignment/design-questions.md`)
- [ ] Build the responsive version, check it with them again
- [ ] Designer added as collaborator, clones, runs it, opens a PR
- [ ] Review, merge, see it live. Save the PR URL

## Phase F: Part 4 and submit (Tue Nov 10)

- [ ] Home page: new content + links to `/tic-tac-toe`, `/nasa`, `/design`
- [ ] `docs/design.md` **What changed and why** complete
- [ ] `answers.md` complete, variant (`four`) at the top
- [ ] Two fresh test accounts on the live app
- [ ] All pages work on the live app, not only locally
- [ ] Comment on the submission issue: repo URL, live URL, designer PR URL, two
      test accounts
