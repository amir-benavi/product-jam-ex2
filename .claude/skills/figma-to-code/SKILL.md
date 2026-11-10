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

First read Figma's own guidance with the Figma MCP tool `get_figma_skill`, uri
`skill://figma/figma-design-to-code/SKILL.md`, and follow it together with this
skill. Where they differ, this project's rules win (kit components, tokens, CSS
modules).

Then, with the Figma MCP tools, on the frame in `$ARGUMENTS`:

- `get_design_context` for structure, text, measurements and asset URLs. It also
  returns a screenshot, so call `get_screenshot` only if none came back. Pass
  `skillNames: "resource:figma-design-to-code"`.
- `get_variable_defs` for its colours, fonts and spacing.

If the link has no `node-id` (a whole file or page, not one frame), ask for a
"Copy link to selection" link to the frame.

**Every call counts against a monthly limit** (a Collab seat gets about 20).
Read the design once, keep what came back, and don't call these tools again to
re-check: compare against the screenshot you already have.

## 2. Map it to the kit before coding

Write down, and show the user, a short mapping:

- Figma colours / fonts → which existing token in `client/styles/tokens.css`, or
  a new token. Design-wide values go in `tokens.css`; values used only on this
  page go as custom properties at the top of `DesignPage.module.css`.
- Figma px → `rem` (1rem = 16px).
- Figma pieces → kit components (`client/components/`) or new markup.
- Text direction and language of the design (Hebrew → RTL).
- Images and icons to download from the asset URLs `get_design_context` gave
  into `client/public/design/`. Those URLs are temporary: download them right
  away, and leave no Figma URL in the code.

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
