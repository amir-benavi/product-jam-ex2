---
paths:
  - "client/**"
---

# Client rules

- **Pages** live in `client/pages/<section>/` with `export default`, and get a
  `lazy(...)` import and a `<Route>` in `client/App.tsx`, inside `<RequireAuth>`
  when they need a login. `/design` stays outside it.
- **Data** goes through hooks in `client/features/<name>/hooks.ts`, built on
  `api()` from `client/lib/api.ts` and TanStack Query. Components never call
  `fetch`. After a mutation, invalidate (or set) the affected query keys.
- **Every screen has four states:** loading, error, empty, and with data. The
  user always knows what is happening (e.g. "Gemini is thinking…").
- **Look in `client/components/` first** (gallery at `/components`) for Button,
  Card, Spinner, Toast, Dialog, etc. before building UI.
- **Styling:** a CSS module next to each component (`Foo.module.css`). Colours,
  spacing, radii and type come from `var(--…)` tokens in
  `client/styles/tokens.css`, never hard-coded values in components.
- **Units and layout:** `rem` for sizes and spacing (rarely `px`), flexbox or
  grid, mobile-first media queries with `min-width`.
- **Direction-agnostic CSS:** logical properties only (`margin-inline-start`,
  `padding-block`, `inset-inline-end`, `text-align: start`), never `left` /
  `right`, so the layout works in RTL and LTR.
- **Accessibility:** semantic elements, `<button>` for anything clickable (each
  game cell too, with an `aria-label`), labels on inputs, `alt` on images.
- **Config** is read only through `client/lib/config.ts`. Everything in
  `client/` is public: no secrets, no `VITE_` secret keys.
