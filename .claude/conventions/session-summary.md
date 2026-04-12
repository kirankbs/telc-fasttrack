# Session Summary Convention

Show this at the end of any significant work block — when a work item (or group of items) is fully shipped and closed. Not after every small task, but when something meaningful lands.

---

## Format

```
**#NNN — shipped and closed**

| | |
|---|---|
| PR | kirankbs/telc-fasttrack#{n} — merged |
| CI | typecheck ✓, jest ✓ |
| Content | {N} mocks added / {N} vocab words / {N} grammar topics |
| Specs | {N} spec files created |
| Sign-off | product-owner APPROVED |
| Issues | #NNN/#NNN → done |
```

---

## Rules

- **Only show rows that are relevant.** Feature/bug PRs won't have Content or Specs rows. Drop them.
- **Left column**: short label for the dimension (PR, CI, Content, Tests, Sign-off, Issues, etc.)
- **Right column**: one-line result — specific, not vague. "10 mocks across A1" not "content added".
- **CI row**: list each check explicitly with ✓ or ✗. If anything failed and was fixed, note it: "typecheck ✓ (1 fix), jest ✓".
- **Issues row**: always show the issue numbers transitioning to done.
- Show this **after** product-owner sign-off is confirmed, not before.

---

## When to use

| Situation | Show summary? |
|-----------|--------------|
| Work item(s) shipped, PR merged, CI green, sign-off done | Yes |
| PR open but not yet merged | No — too early |
| Bug fix with no PR (direct commit) | Yes, simplified |
| Mid-task checkpoint | No |
| Session paused / handed off | No — use handoff file instead |
