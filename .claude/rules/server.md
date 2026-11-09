---
paths:
  - "server/**"
---

# Server rules

**The server never trusts the browser.** Anyone can call the API with curl,
without the page. The browser says what the user _did_; the server checks it and
works out the result itself.

- **Runtime is Cloudflare Workers, not Node.** No `fs`, no native modules, about
  10ms of CPU per request, nothing kept in memory between requests. Call other
  services with `fetch`.
- **Routes** are Hono sub-apps in `server/routes/<name>.ts`, registered in
  `server/index.ts`. Routes that need a login go **below** the `app.use` line.
- **Validate every input** (body, params, query) with `validate(target, schema)`
  from `server/lib/errors.ts`, using a schema from `shared/schemas/`.
- **Answer errors only with `fail()`**, so the shape is always
  `{ error: { code, message } }`. Messages are safe to show users.
- **Who is asking comes from `c.get("user").id`**, never from the request body.
  Filter every query by it; the server's key bypasses RLS, so this filter _is_
  the security. Select an explicit column list, like `COLUMNS` in `events.ts`.
- **Secrets** come from `c.env.X`, declared in `Bindings` in `server/env.ts`.
  Never return or log them.
- **Calling NASA or Gemini:** set a timeout (`AbortSignal.timeout(...)`), check
  `response.ok`, validate the JSON you get back with Zod, and on failure answer
  your own error (`502` when the other server failed, `504` when it timed out).
  Never pass the other server's error body through to the browser.
- **Status codes:** `200` ok, `201` created, `204` no content, `400` invalid
  input, `401` not logged in, `403` not yours, `404` not found, `409` conflict,
  `502`/`504` another server failed, `500` our bug or the database failed.
- `console.error` the real error before answering `500`, as `events.ts` does.
