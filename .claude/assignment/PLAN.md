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
- [x] `security-reviewer` agent → fix → `/ship` (pushed `361571b`)
- [x] `answers.md` questions 2-4
- [ ] Screenshots for questions 3 and 4: `screenshots/q3-cheating.png`,
      `screenshots/q4-other-user.png` (take them on the live app, check the
      answers' text still matches)

## Phase D: Part 2, space pictures (Mon Nov 9)

Session: new session. `/add-feature apod`.

- [x] Server: random pictures (≤20) from `apod-basic`, clean HTML, own errors
      when NASA fails
- [x] Server: explain by date → NASA → Gemini (structured output) → Zod check →
      save; return the saved one next time
- [x] `/nasa` page: cards, explain button, loading/error/thinking states
- [x] "What changed and why": the NASA endpoint change
- [x] `security-reviewer` agent → fix → `/ship` (pushed `f27b28d`)

## Phase E: Part 3, design to code (Tue Nov 10)

Session: new session. `/figma-to-code <figma link>`.

- [x] Mobile design on `/design`, checked on a real phone on the live app
      (pushed `58b2d62`, with the designer's fonts)
- [x] Meet the designer: phone, tablet, desktop; agree on wider layouts
      (`.claude/assignment/design-questions.md`)
- [x] Build the responsive version, check it with them again (draft pushed
      `ec47149`, their notes applied in `64c2cd7`)
- [x] Designer added as collaborator, clones, runs it, opens a PR
- [x] Review, merge, see it live. Save the PR URL
      (https://github.com/amir-benavi/product-jam-ex2/pull/1, "Varified" →
      "Verified")

## Phase F: Part 4 and submit (Tue Nov 10)

- [x] Home page: new content + links to `/tic-tac-toe`, `/nasa`, `/design`
      (pushed `e9666cf`; "Design to code" card text updated after Part 3)
- [ ] `docs/design.md` **What changed and why** complete
- [ ] `answers.md` complete, variant (`four`) at the top
- [ ] Two fresh test accounts on the live app
- [ ] All pages work on the live app, not only locally
- [ ] Comment on the submission issue: repo URL, live URL, designer PR URL, two
      test accounts
