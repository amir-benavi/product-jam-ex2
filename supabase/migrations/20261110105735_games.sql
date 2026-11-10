-- One row per finished game of tic-tac-toe, variant "four" (4×4, four in a
-- row wins). Copied from the shape of 20260921120000_events.sql.
-- See docs/design.md, "Table games".

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),

  -- Who played it. Deleting the user deletes their games.
  owner_id uuid not null references auth.users (id) on delete cascade,

  -- The cells played, in order: numbers 0-15, row by row, X first.
  -- The database can only check that it is a list of the right length:
  -- 7 is the shortest game (X's fourth move can win), and 16 fills the
  -- board. Whether the moves are a real game is checked by the server, which
  -- replays them with shared/game/four.ts before it saves anything.
  moves jsonb not null
    check (
      jsonb_typeof(moves) = 'array'
      and jsonb_array_length(moves) between 7 and 16
    ),

  -- Calculated by the server from the moves, never sent by the browser.
  -- The same values as `Result` in shared/game/four.ts.
  result text not null check (result in ('x', 'o', 'draw')),

  created_at timestamptz not null default now()
);

-- "My games, newest first" is the only query on this table, so give Postgres
-- an index for exactly that.
create index if not exists games_owner_id_created_at_idx
  on public.games (owner_id, created_at desc);

-- RLS on, with no policies, like events: only our server (with the secret
-- key) can read or write this table. Who sees which games is decided in
-- server/routes/games.ts. See docs/02-supabase-setup.md.
alter table public.games enable row level security;
