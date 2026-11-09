---
name: ship
description:
  Commit the current work and push it to main, which deploys the live app.
disable-model-invocation: true
---

# Ship to main

Every push to `main` deploys to Cloudflare, so nothing broken goes up.

1. `git status` and `git diff --stat`. Make sure no secret is staged (`.env`,
   keys, tokens). If one is, stop.
2. Run the `check` skill. Stop if anything fails.
3. `npm run build`. Stop if it fails.
4. Propose a commit message: a short imperative summary line, then a blank line,
   then what changed and why. Commit after the user agrees.
5. Ask before `git push origin main`.
6. Then remind the user what to check on the live app: `/api/health`, and
   whichever of `/tic-tac-toe`, `/nasa`, `/design`, `/` this change touched. If
   a new secret was added, it must also be added in Cloudflare (Worker →
   Settings → Variables & Secrets, type **Secret**).
