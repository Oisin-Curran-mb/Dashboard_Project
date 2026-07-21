# Skill: widget-final-check-audit

## Purpose

Checks a widget's `Step 4 - Widget Final Design/WNN - Name.md` doc against the real build (`Step 3 - Mock_Work/Dashboard Widget Mockups.html`'s Final Check tab) and against Step 1's research and the API comparison docs, so the doc can be trusted before it's called "Done." Doc text alone isn't reliable evidence — this skill checks the actual `WRENDER[N]`/`MOCK_DATA` code, not just the prose describing it.

## What it flags

- 🔴 Red — a real mismatch between the doc and the build.
- 🟡 Yellow — a smaller inconsistency or something worth a second look.
- 🆕 — something the new design needs that's genuinely unscoped anywhere yet (checked against the widget's own `Step 5 - API documents/<Widget> - API Spec.md` first, then the classic/modern comparison docs as a fallback).
- 📋 — something already scoped elsewhere but not yet built.

For every 🔴 finding, it drafts the actual fix and shows it as a side-by-side accept/reject widget (like reviewing a diff before merging) rather than ending with a question — only the hunks you check get applied, via the `Edit` tool, and nothing else in the file is touched.

## How to run it

Ask in plain language, e.g.:
- "Audit W03 - Payroll Distributions against the build."
- "Check if the Deposit Accounts Final Design doc still matches reality."
- "Run the final-check audit on W07."

## Files

- `SKILL.md` — the full instructions.
- `scripts/build_diff_review.py` — turns proposed fixes into the accept/reject widget.
