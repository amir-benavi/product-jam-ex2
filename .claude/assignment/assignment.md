# 02 - Web Application

**Due November 11, 14:00**

The goal of the assignment is to get familiar with the web application starter
kit, which you will also use to build the final project in the course. This time
you write a real backend: a database you design, an API that doesn't trust the
browser, and a feature that uses an LLM.

The assignment has five parts:

0. **API Design first** - read how the kit's example works, then design your
   database and your API before you write code.
1. **Tic-tac-toe** - a React game, with results the server checks.
2. **Space pictures** - NASA's API, an LLM, and a database cache for its
   answers.
3. **Design to code** - build a mobile design with your designer partner, make
   it responsive together, and merge their first pull request.
4. **Homepage** - links to everything.

## Submission

Submit by adding a comment to the GitHub issue in the following link:
[EX2 Submission](https://github.com/product-jam-2027/course/issues/3)

In your comment, include:

- The URL of your GitHub repository
- The URL of your live app
- The URL of your designer's pull request
- The email and password of **two** test accounts on your live app. Create them
  only for this, and don't reuse a real password. We use them to test your app.

We grade your repository as it is at the deadline, so changes you push after the
deadline don't count. Don't delete your repository or make it private, or we
won't be able to see it.

Make sure you answered the questions in `answers.md` before you submit.

## Setup

1. Create your own copy of the
   [starter kit repository](https://github.com/product-jam-2027/starter-kit)
   (**Use this template → Create a new repository**), under your own username
   and set to **Public**. Clone it and open it in VS Code.
2. Copy [`ex2/answers.md`](ex2/answers.md) from this course repository into the
   root of your repository.
3. Read the starter kit's `README.md`. It explains how the code is organised,
   and what the server can and can't do.
4. Follow the starter kit's `docs/01-quickstart.md` and
   `docs/02-supabase-setup.md`, with **your own** Supabase project. The docs
   talk about a team: for this assignment, you are a team of one. Skip
   `docs/03-google-sign-in.md`, you don't need it. You are done when
   `http://localhost:3000/api/health` says `{ "ok": true, "database": "ok" }`
   and you can log in.
5. Read `docs/05-adding-a-feature.md`, and look at `/events`, `/demos` and
   `/components` in the running app. Every feature in this assignment follows
   `docs/05-adding-a-feature.md`, and `events` is the example to learn from.
6. Get a [NASA API key](https://api.nasa.gov/) (Part 2 now uses an endpoint that
   doesn't need it, see the update in Part 2) and a
   [Gemini API key](https://aistudio.google.com/apikey), and add them to your
   `.env` as `NASA_API_KEY` and `GEMINI_API_KEY`, **without** a `VITE_` prefix.
   Then add both to the `Bindings` type in `server/env.ts`, so your routes can
   read them as `c.env.NASA_API_KEY` and `c.env.GEMINI_API_KEY`. On Gemini's
   free tier, Google may use what you send to improve its models, so never send
   it personal data.

## Deploy

Put your app on the internet now, before you build anything. You need a live
link for Part 3, and from now on every push to `main` updates it by itself.

Follow `docs/04-deploy.md`. The Cloudflare settings are not the same as in ex1:
leave the build command empty, and set the deploy command to `npm run deploy`.
Besides `SUPABASE_SECRET_KEY`, also add `NASA_API_KEY` and `GEMINI_API_KEY` as
secrets.

Don't skip "Keep the database awake". A free Supabase project pauses after about
a week without visits, and we check your live app after the deadline.

When you are done, `/api/health` on your live app says
`{ "ok": true, "database": "ok" }` and you can log in.

The app on your computer and your live app use the same Supabase project. To add
a table, create a migration file:

```bash
npx supabase migration new games
```

This creates an empty `.sql` file in `supabase/migrations/`, with a timestamp at
the start of its name. Write your `create table` in it, then run
`npx supabase db push` to create the table in your Supabase project. Create
every table this way, not in Supabase's Table Editor, so your tables are in your
repository too.

Before you submit, check that `/tic-tac-toe`, `/nasa` and `/design` all work on
the live app, not only on your computer.

## Part 0 - API Design first

Before you build anything, you plan it: which data you keep, and how the browser
asks for it. In this part you first read how the kit's `events` example does
this, and then write the same kind of plan for parts 1 and 2.

### 1. Read how `events` works

Follow one request through the code: a logged-in user creates an event. Read
each file it passes through, in this order:

1. `client/pages/events/EventNewPage.tsx` - the page with the form
2. `client/features/events/EventForm.tsx` - `handleSubmit`, which runs when the
   user clicks **Create**, and calls the page's `onSubmit`
3. `client/features/events/hooks.ts` - `useCreateEvent`, which the page calls
4. `client/lib/api.ts` - `api()`, which sends the request to the server
5. `server/index.ts` - where the `/api/events` routes are registered
6. `server/routes/events.ts` - the `POST /` route
7. `shared/schemas/events.ts` - `createEventSchema`, what counts as a valid
   event
8. `server/lib/errors.ts` - `validate()` and `fail()`, how the server answers
   when something is wrong
9. `supabase/migrations/20260921120000_events.sql` - the table it saves to

Then read the other routes in `server/routes/events.ts`. They follow the same
pattern.

You don't need to know how logging in works, it is done for you. Every route
registered below the `app.use` line in `server/index.ts` only runs for a
logged-in user, and gets who that is with `c.get("user")`.

If you don't understand a line, ask an AI assistant to explain it, then check
its explanation against the code. The docs of the libraries these files use help
too: [Zod](https://zod.dev/basics) for the schemas,
[Hono](https://hono.dev/docs/api/routing) for the routes, and
[supabase-js](https://supabase.com/docs/reference/javascript/select) for the
database queries. Then answer question 1 in `answers.md`.

### 2. Review Database and API terms

- **Table** - holds one kind of thing, like events. Each **row** is one of them,
  and each **column** is one detail about it, like its title.
- **Type** - what kind of value a column holds: `text`, `integer`, `boolean`,
  `uuid` (a long random id), `timestamptz` (a date and time), or `jsonb` (any
  JSON, like a list).
- **Primary key** - the column that tells the rows apart. No two rows have the
  same one. Usually it is `id`.
- **Foreign key** - a column that points to a row in another table. `owner_id`
  in `events` points to a user in `auth.users`, the table where Supabase keeps
  your users.
- **Constraint** - a rule the database checks on every row, for example "can't
  be empty" (`not null`), "no two rows the same" (`unique`), or "between 1 and
  5" (`check`).
- **Endpoint** - one thing the server can do, named by its **method** (`GET`,
  `POST`, `PATCH`, `DELETE`) and its **path** (`/api/events/:id`, where `:id`
  stands for a real id).
- **Status code** - the number the server answers with, which tells the browser
  how it went, for example `201` (created) or `404` (not found).

### 3. Write your design

Read parts 1 and 2, then write `docs/design.md` in your repository:

- **The database.** Every table you will add: its columns and their types, the
  primary key, the foreign keys and the constraints.
- **The API.** Every endpoint the browser needs for parts 1 and 2: its method
  and path, what it receives, what it answers when it works, and the errors it
  can answer, with their status codes. For each one, also write which tables it
  reads or writes. Every endpoint that needs a login can also answer `401`, so
  you don't need to list that one.
- **One trade-off.** One decision where you could have gone either way, what you
  chose and why.

For example, this is part of the design of `events`:

> **Table `events`** - one row per event.
>
> | Column        | Type          | Rules                                 |
> | ------------- | ------------- | ------------------------------------- |
> | `id`          | `uuid`        | primary key                           |
> | `owner_id`    | `uuid`        | foreign key to `auth.users`, not null |
> | `title`       | `text`        | not null                              |
> | `description` | `text`        |                                       |
> | `starts_at`   | `timestamptz` | not null                              |
> | `image_path`  | `text`        |                                       |
> | `created_at`  | `timestamptz` | not null, set by the database         |
>
> **`POST /api/events`** - create an event.
>
> - Receives: `{ title, description, starts_at, image_path }`. Only `title` and
>   `starts_at` are required.
> - Answers: `201` with the new event.
> - Errors: `400` if the title or the date is missing or invalid, `500` if the
>   database fails.
> - Tables: writes `events`, with the logged-in user as `owner_id`.
>
> **`GET /api/events/:id`** - one event.
>
> - Receives: the event's `id`, in the path.
> - Answers: `200` with the event.
> - Errors: `400` if the id is not a valid id, `403` if the event belongs to
>   someone else, `404` if there is no such event, `500` if the database fails.
> - Tables: reads `events`.

**Commit and push `docs/design.md` before any code for parts 1 and 2.**

Plans change when you start building. When you are done, add a section at the
end called **What changed and why**. Don't rewrite the original design: we want
to see how your thinking changed.

## Part 1 - Tic-tac-toe

In this part you build a game in React, and then make the server check every
result you save. The main goals are to learn React, JSX, `useState` and
[CSS modules](https://vite.dev/guide/features#css-modules), and to learn the
most important rule of the backend: **the server never trusts the browser.**

### Your variant

Each of you builds a slightly different tic-tac-toe. Find your variant by the
first letter of your GitHub username.

In every variant, "in a row" means that many cells next to each other in a
straight line: across, down or diagonally. If no cell is left to play and nobody
made a row, the game is a draw.

| Username starts with  | Variant     | Rules                                                            |
| --------------------- | ----------- | ---------------------------------------------------------------- |
| `a` - `f`, or a digit | `four`      | 4×4 board. Four in a row wins.                                   |
| `g` - `m`             | `big-three` | 4×4 board. Three in a row wins.                                  |
| `n` - `s`             | `misere`    | 3×3 board. Whoever makes three in a row **loses**.               |
| `t` - `z`             | `no-center` | 3×3 board. Nobody can play the middle cell. Three in a row wins. |

Write your variant at the top of `answers.md`.

### 1. The game

Create a page at `/tic-tac-toe`, for logged-in users only. Two players play on
the same screen, X first. Show whose turn it is, the result when the game ends,
and a button that starts a new game. Style it with CSS modules.

[React's tutorial](https://react.dev/learn/tutorial-tic-tac-toe) is a good place
to start, but your variant has different rules, and the rules don't live in your
components (see below).

### 2. The rules, in one place

Write the rules of your variant as **pure functions** in `shared/game/`, with no
React and no database in them. You decide what a game's state and its errors
look like. Your page uses these functions to play, and your server uses the
**same** functions to check games.

### 3. Save the results

When a game ends, the page saves it. Below the board, list the games saved on
this account, newest first, with the result of each one and when it was played.

The page sends the server the **list of moves**, not the result. The server
replays them with your functions from `shared/game/`, and saves only a game that
could really have been played, from the first move to the end. The result it
saves is the result _it_ calculated.

Each game belongs to the user who saved it, and a user only ever sees their own
games.

## Part 2 - Space pictures

In this part you show pictures from NASA's
[Astronomy Picture of the Day](https://apod.nasa.gov/apod/astropix.html) (APOD)
API, and use an LLM to explain them in Hebrew, saving every explanation in your
database.

The API keys never reach the browser. The browser only talks to _your_ server,
and your server calls NASA and Gemini.

### 1. The pictures

The page shows random pictures from APOD, up to 20 at a time, from NASA's new
APOD endpoint (see the update below).

NASA is another server, and it can fail or not answer. When it does, your user
gets a clear answer from _your_ server, not NASA's error.

> **Update, November 8:** Since September, `api.nasa.gov/planetary/apod` doesn't
> work as documented. With `count` it answers placeholder pictures called "NASA
> Science" with NASA's logo. With `date` it often answers **today's**
> explanation, whatever date you asked for. Some requests fail with `500` or
> don't answer.
>
> Use NASA's new endpoint instead:
> `https://science.nasa.gov/wp-json/wp/v2/apod-basic`. It doesn't need an API
> key, and it answers a list of pictures, newest first.
>
> - It takes `page` and `per_page`. The `X-WP-Total` header of the answer says
>   how many pictures there are, about 11,400, from 1995 until today.
> - The image is in `hdurl`. `url` is a link to the article on NASA's site, not
>   to the image.
> - `explanation` is HTML: it has links, and it starts with
>   `<strong>Explanation:</strong>`. Clean it before you show it or send it to
>   Gemini.
> - To get the picture of one date, for "Explain it in Hebrew", add the date as
>   `YYMMDD` to the end of the URL. For example, `apod-basic/150314` answers the
>   picture of March 14, 2015, and `404` if there is no picture on that date.
>
> Write this change in **What changed and why** in `docs/design.md`.

### 2. Explain it in Hebrew

The user can ask for a picture to be explained in Hebrew. The browser sends only
the picture's date, and your server gets its title and explanation from NASA
itself. Your server asks Gemini to read them, and to write:

- a Hebrew title
- a summary of 2-3 sentences in Hebrew, simple enough for a 10 year old
- 1-5 tags from a list you choose (for example `galaxy`, `planet`, `nebula`,
  `earth`, `sun`)

How it works:

- Call the
  [Gemini REST API](https://ai.google.dev/gemini-api/docs/text-generation?lang=rest)
  with `fetch`, not an SDK, with a current Flash
  [model](https://ai.google.dev/gemini-api/docs/models). Use `gemini-3.6-flash`
  or `gemini-3.5-flash-lite`: `gemini-2.5-flash` answers `404` for new users.
- Use
  [structured output](https://ai.google.dev/gemini-api/docs/structured-output)
  to ask for JSON, and **still** check the answer with a Zod schema in
  `shared/`. LLMs don't always do what they're told. If the answer is invalid,
  tell the user.
- **Never pay twice for the same answer.** Save the result in the database, and
  return the saved result the next time anyone asks for the same picture.

### 3. The page

Create a page at `/nasa`, for logged-in users only.

- Show the pictures as cards, with the title, date, image and explanation.
- Each card has a button to explain it in Hebrew. Once a picture is explained,
  its card shows the Hebrew title, the summary and the tags.
- A user always knows what is happening: while it loads, when a request fails,
  and while Gemini is thinking.
- Style it with CSS modules, and use the kit's components where they fit.

## Part 3 - Design to code

In this part you work with a designer from class. The goal is to learn how a
designer and a developer work together: reading a design in
[Figma](https://www.figma.com/), talking through the decisions it doesn't cover,
and sharing one codebase.

### 1. Build the mobile design

Your designer partner gives you a design for a mobile screen. Build it on the
`/design` page, which is already in the kit, and check it on a real phone, on
your live app. The page doesn't need a login, so keep it that way: your designer
can't log in on their computer.

### 2. Make it responsive, together

The design only shows a phone, but your page must work at every width, up to a
wide desktop screen. How it should look there is a design decision, so don't
guess: decide it with your designer.

Look at the live link together on a phone, a tablet and a desktop, agree on what
changes as the screen gets wider, build it, and check it with them again.

You may change the existing design of the website as you need, as long as parts
1 and 2 still work.

### 3. Your designer's first pull request

Help your designer make one small change to your app themselves, with a
[pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests):
a colour, a size, or some text.

1. Add your designer to your repository: **Settings → Collaborators**.
2. Help them clone and run it on their computer. They don't need a `.env` file:
   without one only logging in doesn't work, and `/design` doesn't need it.
   Never send anyone your secret keys.
3. They make the change on a new branch, push it, and open a pull request with a
   short description.
4. You review it, comment if needed, and merge it. Check that the change appears
   on your live app.

## Part 4 - Homepage

Change the content of the home page, and add links to parts 1, 2 and 3.
