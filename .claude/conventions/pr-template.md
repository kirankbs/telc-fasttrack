# PR Description Convention

Every PR in fastrack-deutsch must use this structure. No exceptions.

---

## Template

```
## Summary

- **#NNN**: <one-line description — what was added or changed>
- <cross-cutting additions: spec files, test counts>

## Quality Gates

| Gate | Result |
|------|--------|
| spec-tracker | <N spec files created/updated, or "n/a"> |
| exam-tester layer-a | <N/10 checks pass, or "n/a"> |
| exam-tester layer-b | <PASS, or "N failures fixed — what"> |
| pedagogy-director | <PASS, or "N BLOCKs fixed — what"> |
| compliance-guardian | <PASS — no critical findings, or findings list> |
| language-checker | <PASS, or "n/a"> |

## Test plan

- [ ] CI green (typecheck + tests)
- [ ] product-owner sign-off after merge
```

---

## Rules

**Summary section:**
- One bullet per issue number. Link to the issue so it's traceable.
- Add extra bullets for significant cross-cutting changes (specs, test count).
- Never write "various fixes" or vague summaries — be specific.

**Quality Gates table:**
- Include only gates that were run. Feature/bug PRs skip content gates; replace with relevant checks.
- If a gate found issues and they were fixed, say so briefly: "2 BLOCKs fixed (Speaking prompt wording, Listening question ambiguity)".
- Never write PASS for a gate you didn't actually run.

**Test plan section:**
- Always include the CI checkbox — it must be checked before merge.
- Always include product-owner sign-off — it happens after merge per CLAUDE.md gate.
- Add extra checkboxes for any manual verification steps specific to the PR.

---

## Title format

PR titles follow conventional commits with issue reference:

- Single issue: `feat(content): A1 mock exams 06-10 (#5)`
- Multiple issues: `feat(content): A1 vocabulary expansion + grammar (#6/#7)`
- No backlog item: `chore(infra): add GitHub CI workflow [no-ticket]`

Types: `feat`, `fix`, `test`, `chore`, `refactor`, `docs`
Scopes: `content`, `web`, `mobile`, `core`, `config`, `types`, `infra`, `e2e`

Use `[no-ticket]` for ad-hoc infrastructure fixes, dependency bumps, or any change that has no corresponding issue.

---

## PO sign-off precondition

PO sign-off must not begin until `gh pr checks <number>` shows all checks passing:

```bash
gh pr checks <number> | grep -v pass | grep -v "^$"
```

If this returns any output, CI is not green — do not start sign-off.

---

## gh pr create command

```bash
gh pr create \
  --title "<type>(<scope>): <summary> (#NNN)" \
  --body "$(cat <<'EOF'
## Summary

- **#NNN**: ...

## Quality Gates

| Gate | Result |
|------|--------|
| ... | ... |

## Test plan

- [ ] CI green (typecheck + tests)
- [ ] product-owner sign-off after merge
EOF
)"
```
