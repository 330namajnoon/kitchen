---
name: commit-push
description: Stage all changes, commit with a short one-line message, and push to the current branch's remote. Use when the user asks to "commit y push", "sube esto", "haz commit" or similar, without further instructions on how to do it.
---

Commit and push the current changes, following these rules exactly (established preferences from this project, do not deviate unless the user says otherwise in the same request):

1. Run `git status` and `git diff` (staged + unstaged) to see what changed. Run in parallel with `git branch --show-current`.
2. Stage everything relevant with `git add -A`, unless the user's request scopes it to specific files — then add only those.
3. Write **one single-line commit message**, imperative mood, describing what changed and why (not a bullet list, not a multi-paragraph body). Keep it short — a single sentence, no "detailed" breakdown.
4. **Never mention Claude, Anthropic, AI, or add a `Co-Authored-By` trailer.** The commit message must read as if written by the human developer alone.
5. Commit with that message: `git commit -m "message here"`.
6. Push to the same branch on `origin`: `git push origin <current-branch>`.
7. Report back tersely: the commit hash and confirmation it was pushed. No extra summary needed unless something failed.

If there's nothing staged/changed, say so instead of creating an empty commit. If the push is rejected (e.g. non-fast-forward), stop and report it — do not force-push without explicit confirmation.
