---
name: figma-to-code
description:
  Build the designer's Figma screen on the /design page. Use when given a
  figma.com link or asked to implement, compare or update the Part 3 design.
argument-hint: <figma.com URL of the frame>
---

# Figma to code: /design

The design is a **mobile** screen. It goes in `client/pages/design/`
(`DesignPage.tsx` + `DesignPage.module.css`), which must stay public: no login,
and no `.env` needed, so the designer can run it.

## 1. Read the design

With the Figma MCP tools, on the frame in `$ARGUMENTS`:

- `get_screenshot` to see it,
- `get_design_context` for structure, text, and measurements,
- `get_variable_defs` for its colours, fonts and spacing.

If the link points at a whole page instead of one frame, ask which frame.

## 2. Map it to the kit before coding

Write down, and show the user, a short mapping:

- Figma colours / fonts → which existing token in `client/styles/tokens.css`, or
  a new token. Design-wide values go in `tokens.css`; values used only on this
  page go as custom properties at the top of `DesignPage.module.css`.
- Figma px → `rem` (1rem = 16px).
- Figma pieces → kit components (`client/components/`) or new markup.
- Text direction and language of the design (Hebrew → RTL).
- Images and icons to export into `client/public/design/`.

## 3. Build it, mobile first

Semantic HTML, a CSS module, logical properties, `rem`, flexbox/grid. Match the
design at 375px wide. Don't build desktop yet.

Check it in the browser at 375px against the Figma screenshot and list the
differences.

## 4. Wider screens are the designer's decision

**Don't guess** the tablet and desktop layout. Append the open questions to
`.claude/assignment/design-questions.md` (create it if missing): what happens to
each section at ~768px and ~1280px, max content width, what grows, what moves.
Implement wider layouts only after the user brings back the designer's answers,
as `min-width` media queries.
