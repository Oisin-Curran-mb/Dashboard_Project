# Skill: dashboard-tracker-keeper

## Purpose

Checks whether `PROJECT INDEX.md`, `Dashboard Tracker.xlsx`, and each Step folder's own `00 - INDEX.md` still agree with each other and with the real files in `Step 1 - Dashboard Research/` through `Step 5 - API documents/`. Nothing outside those is watched — no `Git_Commands/`, no `.git/`.

## What it reports, every run

- **Deviations** — two sources that should agree currently disagree (e.g. the tracker's Step 4 column vs. the Step 4 index's own Tracker status column), tagged positive (further along than recorded) or negative (behind what's recorded).
- **Staleness** — a file's content changed since the last run, but the status recorded about it didn't move — "being worked on and not reflected."
- **Unreferenced files** — something new in a Step folder that isn't mentioned in that folder's own index and doesn't match the standard per-widget file naming pattern.

Step 4 gets a real ground-truth check by re-running `widget-final-check-audit` per widget, rather than trusting either document blindly.

## Where it writes

- `Dashboard Update Log.md` at the project root — regenerated every run. Always-current "Open items" table at the top, growing dated run history below.
- Open items only leave that table once you explicitly close them, via an accept/reject-style checklist widget shown after each run — nothing clears itself.

## How to run it

Ask in plain language, e.g.:
- "Check the tracker."
- "Run a project health check."
- "What's changed since the last update?"

## Files

- `SKILL.md` — the full instructions.
- `scripts/scan_state.py` — hashes and reads current status across Step 1-5 and the two root files.
- `scripts/diff_state.py` — compares against the last run's snapshot.
- `scripts/manage_open_items.py` — the persistent open-items store.
- `scripts/build_open_items_review.py` — the close/keep-open checklist widget.
- `scripts/render_changelog.py` — regenerates `Dashboard Update Log.md`.
