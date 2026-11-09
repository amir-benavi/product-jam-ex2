---
paths:
  - "shared/**"
---

# Shared rules

Code in `shared/` runs in both the browser and the Worker.

- **Plain TypeScript only:** no React, no DOM (`window`, `document`), no
  Cloudflare or Supabase APIs, no network calls.
- **Schemas** are Zod, one file per resource in `shared/schemas/`. Types come
  from `z.infer`, never written by hand. Error messages are written for people.
- Don't re-export schemas from `shared/index.ts` (it would put Zod in every
  page's bundle). Import them from their own file.
- **Game rules (`shared/game/`)** are pure functions: same input, same output,
  never mutate their arguments (return new arrays/objects). Invalid moves return
  a typed error value rather than throwing, so the server can turn them into a
  `400`.
- **Tests** go next to the code as `*.test.ts` (vitest). The game rules must be
  tested: every win direction, the draw, playing a taken cell, playing after the
  game ended, playing out of turn.
