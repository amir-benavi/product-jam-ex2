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

## What changed and why

### Part 1 - tic-tac-toe

The tables and endpoints were built as designed. Some details the design didn't
spell out, and one decision:

- **The rules return errors instead of throwing them.** `replay()` in
  `shared/game/four.ts` answers `{ ok: true, board, result }` or
  `{ ok: false, error: { code, moveIndex, message } }`, where `code` is
  `out_of_range`, `cell_taken` or `game_over`. The route turns any of them into
  `400 invalid_game` with the message, so the message says which move was wrong.
- **An unfinished game is not a rule error.** For the rules, a legal game that
  hasn't ended is `{ ok: true, result: null }`, because the page needs exactly
  that to keep playing. Rejecting it is the route's job: `POST /api/games`
  answers `400 invalid_game` ("The game hasn't ended yet") when `result` is
  `null`.
- **Two checks on the moves.** Zod (`createGameSchema`) checks the shape: 1 to
  16 whole numbers from 0 to 15, otherwise `400 invalid_input`. The rules check
  the game. So a list of 3 moves passes Zod and is rejected by the rules, and
  the 7-to-16 `check` in the table is a last line of defence, not the check that
  answers the user.
- **No limit on how many games a user saves.** The security review pointed out
  that someone with `curl` can save the same legal game thousands of times. I
  chose not to limit it: it only fills that user's own list, and a limit would
  need a count query on every save. If it matters later, the fix is a per-user
  cap answering `409`.
- **`GET /api/games` answers the latest 50 games, not all of them.** The second
  security review pointed out that, without a limit, a user who saves thousands
  of games makes their own list slow to load and to draw. 50 is more than anyone
  scrolls through.
- **A finished game isn't lost when its save fails.** The design only said the
  page saves a game when it ends. While the save is running, or after it has
  failed, "New game" is disabled and the page offers a retry, which sends the
  same moves again. Otherwise one click on "New game" would throw away a game
  the server never got.

### Part 2 - space pictures

- **A different NASA endpoint.** The design was written for
  `api.nasa.gov/planetary/apod`. Since September it answers placeholder pictures
  for `count`, and often today's explanation whatever `date` you ask for, so on
  November 8 the course moved to `science.nasa.gov/wp-json/wp/v2/apod-basic`. It
  needs no key, answers pages of pictures newest first (`page`, `per_page`, at
  most 25 a page), and one date as `apod-basic/YYMMDD` (`404` if there is no
  picture). The image is in `hdurl`; `url` is NASA's article. The endpoints of
  our own API didn't change: the browser still only talks to our server.
- **Cleaning NASA's HTML.** `explanation` is HTML: it starts with
  `<strong>Explanation:</strong>`, has links, and recent ones end with
  "Tomorrow's picture: …". `cleanHtml()` in `server/lib/nasa.ts` turns it into
  plain text before it is shown or sent to Gemini.
- **The random page is from a constant.** With 20 a page there were 574 pages on
  2026-11-10, the last one part-full, so the server picks one of the first 573.
- **`hdurl` is sometimes NASA's logo.** For some days (most of 1995, some of
  1998, many video days) `apod-basic` answers the same placeholder,
  `.../misc/news-thumbnail.png`, as `hdurl`; in a sample of 185 pictures, 34 had
  it. The title and explanation of those days are real, so Gemini still explains
  them correctly. On an image day the real picture is in the article's HTML
  (`basic_html`), so `imageUrl()` in `server/lib/nasa.ts` takes the first image
  there that is on NASA's own server. A video day has none, only a YouTube
  player, so `image_url` is `null` and the card says so. This is why `image_url`
  being nullable, in the original design, turned out to matter.
- **A second Gemini model.** The design named no model. `explainInHebrew()` in
  `server/lib/gemini.ts` asks `gemini-3.6-flash` first and, only if it isn't
  answering, `gemini-3.5-flash-lite`. It doesn't try the second model when the
  first one answers something invalid: that answer is a `502 invalid_ai_answer`,
  not a reason to pay for a second one. The `model` column records which one
  wrote each row, which is why it was in the table from the start.
- **How long we wait.** The design said "doesn't answer in time" without a
  number: it is 10 seconds for NASA and 25 seconds for each Gemini model
  (thinking models are slow). A timeout answers `502`, like any other failure of
  NASA or Gemini, as designed.
- **"In the future" means after today in UTC.** The date check in
  `apodDateParamSchema` compares with today's date in UTC, which can be a day
  ahead of NASA's own clock. For that day NASA has no picture yet, so the answer
  is `404 no_picture`, not an error of ours.
- **What the security review changed.** A saved explanation is shown to everyone
  and never replaced, so Gemini's answer is now checked more strictly: the title
  and summary must be mostly Hebrew letters, with no HTML and no links, and each
  tag may appear only once. A second migration adds the title and summary length
  limits to the table too. The browser may only load images from
  `assets.science.nasa.gov`. NASA's text is sent to Gemini inside `<title>` and
  `<explanation>` tags, and cut at 8,000 characters.
- **Known limitation: "never pay twice" can fail under parallel requests.** The
  route checks for a saved explanation, then calls Gemini, then saves. Those
  steps aren't one atomic step, so if many requests for the same new date arrive
  at the same moment, each one finds nothing saved and each one calls Gemini.
  Only one answer is saved (`on conflict (date) do nothing`), and everyone gets
  that one, so users never see different answers; the others are paid for and
  thrown away. Also, an answer that fails the Zod check is not saved, so a date
  Gemini always answers badly costs a call every time someone tries it. I chose
  not to fix this now: it needs someone logged in sending requests on purpose,
  and the most it costs is a few extra free-tier calls per date. The fix would
  be a small `explanation_claims` table: a request first inserts a claim for the
  date, only the request whose insert worked calls Gemini, the others answer
  `409` ("being explained, try again in a moment"), and a failed call deletes
  its claim. With a per-user limit on explain requests, that would also cover
  the retry case.

### Parts 3 and 4 - design to code, home page

No change to this design: neither part has a table or an endpoint. `/design`
(the designer's Wizzin page) and `/` are pages in the browser only, and
`/design` stays outside the login so the designer can run it without a `.env`.
How its tablet and desktop layouts were decided is in
`.claude/assignment/design-questions.md`.
