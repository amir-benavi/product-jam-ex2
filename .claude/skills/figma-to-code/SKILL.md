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

Note the frame's width from what came back (for example 440px). That is the
**design width**: the width the build must match, whatever device it is.

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
- Which parts are **style guide, not page**: colour swatches labelled with their
  hex codes, type specimens, the designer's notes. Don't build them; use them as
  the source for tokens. If a part could be either, ask the user.
- Images and icons to export into `client/public/design/`.

## 3. Build it, mobile first

Semantic HTML, a CSS module, logical properties, `rem`, flexbox/grid. Match the
design at the **design width**, not at a fixed 375px. Don't fix anything to that
width: smaller phones must work too. Don't build tablet or desktop yet.

Check it in the browser at the design width against the Figma screenshot and
list the differences. Then check 375px and 360px: nothing overflows or scrolls
sideways.

Stop here and wait for the user to approve the mobile version.

## 4. Wider screens: you propose, the designer decides

The spec says the wider layouts are decided **with the designer**, so whatever
you build here is a draft for them to review.

When the user asks for the proposal:

- Keep the mobile layout exactly as it is. Add `min-width` media queries for
  ~768px and ~1280px.
- Decide the max content width, and what happens above ~1440px.
- In `.claude/assignment/design-questions.md` (create it if missing), for each
  section of the page write what you chose at 768 and at 1280, why, and one
  alternative you rejected. Under each, leave an empty `Designer's notes:` line
  for the user to fill in at the meeting.
- Check at 360px, the design width, 768, 1280 and 1600px.

When the user brings back the designer's notes, apply them, mark each one done
in `design-questions.md`, and check the same widths again. The mobile version
must still match the design.
