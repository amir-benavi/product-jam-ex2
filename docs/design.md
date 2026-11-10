# Design: tic-tac-toe and space pictures

The design for parts 1 and 2 of ex2. It follows the kit's `events` example:
every table has Row Level Security on with no policies, so only the server can
read it; a row that belongs to a user is always filtered by `c.get("user").id`,
never by an id the browser sends; and every error has the same shape,
`{ "error": { "code": "...", "message": "..." } }`, made by `fail()` in
`server/lib/errors.ts`.

My tic-tac-toe variant is **`four`**: a 4×4 board, four in a row (across, down
or diagonally) wins, a full board with no row is a draw, and X plays first.

## The database

**Table `games`** - one row per finished game of tic-tac-toe.

| Column       | Type          | Rules                                                                |
| ------------ | ------------- | -------------------------------------------------------------------- |
| `id`         | `uuid`        | primary key                                                          |
| `owner_id`   | `uuid`        | foreign key to `auth.users`, not null, deleted with the user         |
| `moves`      | `jsonb`       | not null, a list of 7 to 16 cell numbers (0-15), in the order played |
| `result`     | `text`        | not null, one of `x`, `o` or `draw`, calculated by the server        |
| `created_at` | `timestamptz` | not null, set by the database                                        |

- Cells are numbered 0 to 15, row by row: 0-3 is the top row, 12-15 the bottom.
  X plays the moves at even positions in the list, O the odd ones.
- 7 is the shortest possible game (X's fourth move can win), and 16 fills the
  board. The database checks the length; only the server can check that the
  moves are a real game.
- An index on `(owner_id, created_at desc)`, for "my games, newest first".

**Table `explanations`** - one row per picture explained in Hebrew. Shared by
everyone: the same picture is never sent to Gemini twice.

| Column       | Type          | Rules                                                 |
| ------------ | ------------- | ----------------------------------------------------- |
| `date`       | `date`        | primary key, the date of the APOD picture             |
| `title_he`   | `text`        | not null                                              |
| `summary_he` | `text`        | not null                                              |
| `tags`       | `text[]`      | not null, 1 to 5 tags, each one from the list of tags |
| `model`      | `text`        | not null, the Gemini model that wrote it              |
| `created_at` | `timestamptz` | not null, set by the database                         |

- The list of tags: `galaxy`, `nebula`, `star`, `planet`, `moon`, `sun`,
  `earth`, `comet`, `aurora`, `eclipse`, `spacecraft`, `other`. It is written
  once in `shared/`, and checked by both the Zod schema and a `check` in the
  table.
- There is no `owner_id`: an explanation is about a public NASA picture, not
  about a user. Nothing about the user is saved here or sent to Gemini.

## The API

All four endpoints need a login, so they are registered below the `app.use` line
in `server/index.ts`.

### Part 1 - tic-tac-toe

**`GET /api/games`** - the logged-in user's games, newest first.

- Receives: nothing.
- Answers: `200` with a list of `{ id, moves, result, created_at }`. An empty
  list if there are none.
- Errors: `500` if the database fails.
- Tables: reads `games`, only the rows where `owner_id` is the logged-in user.

**`POST /api/games`** - save a finished game.

- Receives: `{ moves }`, the list of cells played, in order. Never the result:
  the browser could lie about it.
- Answers: `201` with the saved game, with the result the server calculated.
- Errors: `400` (`invalid_input`) if `moves` is not a list of 1 to 16 whole
  numbers from 0 to 15; `400` (`invalid_game`) if the server replays the moves
  with the rules in `shared/game/` and they are not a real, finished game: a
  cell played twice, a move after someone already won, or a game that hasn't
  ended yet. The message says which move was wrong. `500` if the database fails.
- Tables: writes `games`, with the logged-in user as `owner_id`.

### Part 2 - space pictures

**`GET /api/apod`** - up to 20 random pictures.

- Receives: nothing.
- Answers: `200` with a list of
  `{ date, title, explanation, image_url, hebrew }`. `explanation` is plain
  text, cleaned of NASA's HTML. `image_url` is NASA's `hdurl`, or `null` if the
  picture has none (some days are videos). `hebrew` is the saved explanation
  `{ title, summary, tags }`, or `null` if nobody asked for one yet.
- Errors: `502` (`nasa_unavailable`) if NASA answers an error, doesn't answer in
  time, or answers something that isn't a list of pictures; `500` if the
  database fails.
- Tables: reads `explanations`, for the dates of these pictures, in one query.

**`POST /api/apod/:date/explain`** - explain one picture in Hebrew.

- Receives: the picture's date, as `YYYY-MM-DD`, in the path. Nothing else: the
  title and the explanation always come from NASA, never from the browser.
- Answers: `200` with `{ date, title, summary, tags }`. If the picture was
  explained before, by anyone, this is the saved answer and Gemini isn't called.
- Errors: `400` if the date is not a real date, is before the first APOD
  (1995-06-16), or is in the future; `404` (`no_picture`) if NASA has no picture
  on that date; `502` (`nasa_unavailable`) if NASA fails; `502`
  (`gemini_unavailable`) if Gemini fails or doesn't answer in time; `502`
  (`invalid_ai_answer`) if Gemini's answer doesn't pass the Zod schema in
  `shared/`; `500` if the database fails.
- Tables: reads `explanations`. If the date isn't there, it gets the picture
  from NASA (`apod-basic/YYMMDD`), asks Gemini, checks the answer, and writes
  `explanations`. If two people ask for the same new picture at the same time,
  the second save does nothing (`on conflict (date) do nothing`) and both get
  the saved row.

Why `502` for every failure of NASA or Gemini: the request from the browser was
fine, and our server is fine; another server it depends on failed. Passing on
NASA's own status would be wrong: a `401` from NASA means _our_ key is bad, not
that the user isn't logged in. The `code` tells the page what to say.

### Shared code

- `shared/game/` - the rules of `four` as pure functions, used by the page to
  play and by `POST /api/games` to replay.
- `shared/schemas/games.ts` - what `POST /api/games` receives, and a game.
- `shared/schemas/apod.ts` - a picture, the list of tags, and the schema for
  Gemini's answer, which also describes `hebrew` in the API.

## Trade-off: how random pictures are chosen

NASA's `apod-basic` has no "random" option: it only gives pages of pictures,
newest first, about 11,400 in all. There are two ways to get 20 random ones.

- **20 single pictures.** Pick 20 random positions, and fetch each one with
  `per_page=1`. Every picture is random on its own. But it is 20 requests to
  NASA for every page load (21 to learn the total first), so it is slower, NASA
  may limit us, and some of the 20 can fail while others work, so the server
  must decide whether to answer with part of the list or fail it all.
- **One random page.** Pick a random page, and fetch it with `per_page=20`. It
  is one request, so it is fast and either works or fails as a whole. But the 20
  pictures are from 20 days next to each other, in one random month and year.

I chose **one random page**. The page is about browsing pictures and asking for
explanations, and 20 neighbouring days from a random year still feel random to a
user, while every extra request to NASA is another way for the page to be slow
or fail. The number of pages is a constant in the code, from the total at the
time of writing: pictures are only ever added, so every page under it exists,
and we save the request for `X-WP-Total`.
