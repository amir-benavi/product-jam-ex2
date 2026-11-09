---
name: add-feature
description:
  Build one resource end to end (table, schema, API, hooks, page) by copying the
  starter kit's events example. Use when implementing a Part of ex2 that stores
  data, such as tic-tac-toe games or the NASA explanation cache.
argument-hint: <feature name, e.g. games or apod>
---

# Add a feature: $ARGUMENTS

Follow `docs/05-adding-a-feature.md`. The `events` feature is the template for
every step; open its file before writing yours.

## Before writing code

1. Read the relevant Part in `.claude/assignment/assignment.md`.
2. Read the tables and endpoints for this feature in `docs/design.md`. If
   `docs/design.md` doesn't exist or isn't committed yet, stop and say so: the
   design comes first.
3. Show a short plan: the files you will create or change, in the order below.
   Wait for the user's OK.

## The five places, in this order

| #   | Where                             | Template                                       |
| --- | --------------------------------- | ---------------------------------------------- |
| 1   | `supabase/migrations/`            | `20260921120000_events.sql`                    |
| 2   | `shared/schemas/<name>.ts`        | `shared/schemas/events.ts` (+ a `.test.ts`)    |
| 3   | `server/routes/<name>.ts`         | `server/routes/events.ts`, registered in index |
| 4   | `client/features/<name>/hooks.ts` | `client/features/events/hooks.ts`              |
| 5   | `client/pages/<name>/`            | `client/pages/events/`, route in `App.tsx`     |

- Create the migration with `npx supabase migration new <name>`. Ask before
  `npx supabase db push`.
- Check each endpoint against `docs/design.md`: same path, method, body, status
  codes. If you have to differ, tell the user so they can record it under **What
  changed and why**.

## When done

1. Run the `check` skill.
2. Start `npm run dev` if it isn't running and look at the page in the browser:
   logged in, loading, error and empty states, phone and desktop widths.
3. Summarize for the user: what each new file does, which line enforces "the
   server never trusts the browser", and anything they should be ready to
   explain. Suggest a commit message; don't push.
