---
name: check
description:
  Run the project's typecheck, lint and tests and report what fails. Use after
  any code change, before committing, and whenever asked whether the code works.
---

# Check the code

Run, from the repository root:

```bash
npm run typecheck && npm run lint && npm test
```

Then report in this shape:

- **Typecheck:** pass / the errors, each as `file:line` and one line of why.
- **Lint:** pass / the errors (mention if `npm run lint:fix` would fix them).
- **Tests:** pass / which tests failed and what they expected.

If something fails, fix it only when the user asked you to fix things in this
turn; otherwise list the fixes you'd make. Never silence a lint rule or a type
error (`// @ts-ignore`, `eslint-disable`, `as any`) to make a check pass.

A passing check does not prove a screen works. For UI changes, say which pages
still need to be looked at in the browser.
