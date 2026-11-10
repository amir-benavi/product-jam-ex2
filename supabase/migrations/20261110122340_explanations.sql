-- One row per APOD picture explained in Hebrew by Gemini. Shared by
-- everyone, so the same picture is never sent to Gemini twice. Copied from
-- the shape of 20260921120000_events.sql. See docs/design.md,
-- "Table explanations".

create table if not exists public.explanations (
  -- The date of the APOD picture. There is one picture per date, so the date
  -- is the key, and a second save of the same picture is a conflict.
  date date primary key,

  title_he text not null,
  summary_he text not null,

  -- 1 to 5 tags, each one from the list in shared/schemas/apod.ts
  -- (APOD_TAGS). The server checks this with Zod first; this is the last
  -- line of defence. `<@` means "every element is in".
  tags text[] not null
    check (
      cardinality(tags) between 1 and 5
      and tags <@ array[
        'galaxy', 'nebula', 'star', 'planet', 'moon', 'sun',
        'earth', 'comet', 'aurora', 'eclipse', 'spacecraft', 'other'
      ]
    ),

  -- Which Gemini model wrote it, in case we want to redo old answers later.
  model text not null,

  created_at timestamptz not null default now()
);

-- No owner_id: an explanation is about a public NASA picture, not about a
-- user. Nothing about the user is saved here.

-- RLS on, with no policies, like events: only our server (with the secret
-- key) can read or write this table. See docs/02-supabase-setup.md.
alter table public.explanations enable row level security;
