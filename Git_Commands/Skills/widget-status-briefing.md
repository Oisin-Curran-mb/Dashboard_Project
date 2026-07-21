# Skill: widget-status-briefing

## Purpose

Gives a point-in-time status briefing for a single widget: purpose, current design concepts, exactly where it sits across the Step 1-6 pipeline (Purpose → Feedback → Mock_Work → Final Design → API documents → Sign Off), any feedback gathered from interviews, and backend data-readiness flags — pulling in Step 4/5/6 context whenever the widget has actually progressed that far. Pulls tracker status straight from `Dashboard Tracker.xlsx` rather than trusting any single doc's own "locked" language.

## What every reply includes

- A one-line step-chain visual right under the heading (✅ Complete · 🔵 In Progress · ⚪ Not Started · ➖ N/A) for an instant sense of where the widget is.
- One subheading per pipeline step that's actually been touched — Purpose & Data, Feedback, Concepts & Build, Final Design, API Documentation, Sign Off, Backend Data Readiness — so every claim is traceable to the exact step and document (or interview) it came from, instead of being blended into one paragraph. This is deliberately more structured/longer than a normal reply — the project owner asked for the full thought process shown, not a condensed summary.
- Feedback is attributed by name (e.g. "From the Ben Lane interview (13.07.2026)...") rather than left generic.
- Read-only — never edits `Dashboard Tracker.xlsx` or any project doc.

## How to run it

Ask in plain language, e.g.:
- "Give me status on W07."
- "Where are we on Bank Balances?"
- "Catch me up on Purchasing Management."

Not tied to this project specifically — the same shape (tracker lookup → step-chain → per-step sourced sections) applies to any project that tracks widgets/features through a staged pipeline in a spreadsheet.

## Files

- `SKILL.md` — the full instructions.
