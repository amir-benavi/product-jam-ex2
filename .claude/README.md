# How Claude Code is set up in this repo

What each file is for, and when Claude reads it. Everything here is committed,
so anyone who clones the repo (and the final-project team) gets the same setup.

| File                               | Loaded                                       | Holds                                         |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------- |
| `AGENTS.md`                        | every session, via `@AGENTS.md`              | the kit's facts (owned by the starter kit)    |
| `CLAUDE.md`                        | every session, automatically                 | this project's goals, decisions, ground rules |
| `.claude/assignment/PLAN.md`       | every session, via `@` import in `CLAUDE.md` | the checklist and where you are               |
| `.claude/assignment/assignment.md` | every session, via `@` import in `CLAUDE.md` | the full ex2 spec (copy of the course's 2.md) |
| `.claude/rules/*.md`               | only when Claude touches matching `paths:`   | conventions for `server/`, `client/`, ...     |
| `.claude/skills/*/SKILL.md`        | when you type `/name`, or Claude sees a fit  | repeatable workflows                          |
| `.claude/agents/*.md`              | when Claude delegates to that agent          | a reviewer with its own fresh context         |
| `.claude/settings.json`            | by Claude Code itself, not the model         | permissions and hooks (enforced, not advice)  |
| `.claude/settings.local.json`      | same, but git-ignored                        | your personal overrides                       |

## Why it is split this way

- **Always-loaded files cost context in every message**, so `CLAUDE.md` stays
  short: only what is true for every task. Big references (the kit docs) are
  pointed to and read when needed. The spec is the exception: every session here
  is an ex2 session, so it is imported (~4.5k tokens).
- **A markdown link is not an import.** `[AGENTS.md](AGENTS.md)` is just text;
  `@AGENTS.md` actually pulls the file in.
- **Rules are scoped by path**, so client advice doesn't crowd a migration task.
- **Skills are procedures, `CLAUDE.md` is facts.** "How to add a feature" is a
  skill; "my variant is `four`" is a fact.
- **Settings are enforced; markdown is advice.** "Don't read `.env`" in
  `CLAUDE.md` is a request. A `deny` rule in `settings.json` is a guarantee.
- **The subagent reviews with fresh eyes.** It didn't write the code, so it
  isn't anchored on the author's reasoning.

## Skills

- `/check`: typecheck, lint, tests.
- `/add-feature <name>`: the five places, copying `events`.
- `/figma-to-code <url>`: the `/design` page from the designer's Figma.
- `/ship`: check, build, commit, ask, push. Only you can start this one
  (`disable-model-invocation: true`), because a push deploys.

## Subagent

- `security-reviewer`: "the server never trusts the browser" review. Ask: "use
  the security-reviewer agent on my changes".
