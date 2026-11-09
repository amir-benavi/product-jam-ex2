---
paths:
  - "supabase/**"
---

# Database rules

- **Every table is a migration**, created with
  `npx supabase migration new <name>`, never in Supabase's Table Editor.
- **Never edit a migration that has already been pushed.** Write a new one.
- **Running `npx supabase db push` changes the live database.** Ask first.
- **RLS on, no policies**, on every table:
  `alter table public.<t> enable row level security;` Access control lives in
  `server/routes/`.
- A row that belongs to a user has
  `owner_id uuid not null references auth.users (id) on delete cascade`.
- Put the rules in the database too: `not null`, `check`, `unique`. It is the
  last place bad data can be stopped.
- Add an index for the columns you filter and sort by, like
  `events_owner_id_starts_at_idx`.
- `created_at timestamptz not null default now()`.
- Comment the "why" in the SQL, the way `20260921120000_events.sql` does.
- The tables must match the database section of `docs/design.md`. If they
  change, note it under **What changed and why**.
