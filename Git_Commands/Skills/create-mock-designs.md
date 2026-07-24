# Skill: create-mock-designs

## Purpose

Generates 3 new design-option concepts for one dashboard widget and writes them directly into `Step 3 - Mock_Work/Dashboard Widget Mockups.html`, the live build — replacing that widget's existing 3 lettered "DESIGN OPTIONS" cards in place. Follows this project's own research pipeline rather than inventing ideas from a blank page: Step 1's legacy baseline, Step 2's Market Research and Ben Lane interview tagging, and Step 3's own Widget_Specs history.

## How it works

- **Picks the widget:** checks `PROJECT INDEX.md`'s "Step 3 Mock_Work" column for the target widget — proceeds straight through if ⚪ Not started, stops to ask first for anything else (✅ Complete, 🔵 In progress). Known limitation, knowingly accepted: that column is hand-synced from a spreadsheet, not audited against the real file, so it can be stale — this skill doesn't add its own cross-check against that.
- **Gathers inputs, weighted:** Step 1 legacy baseline (heaviest), Step 2 Market Research + Ben Lane interview tagging, then Step 3's own Widget_Specs history (lightest weight for *new* ideas — it's what's already been tried, not inspiration, though it's still read every time). Deliberately never reads `Step 4 - Widget Final Design/` (out of scope by design) or `Design Improvement Options.md` (marked superseded — see the banner at the top of that file).
- **Drafts 3 designs, one per subagent, in parallel:**
  - **Design 1 — Restyled Original:** legacy baseline restyled, small tweaks driven primarily by Ben Lane's interview feedback where it exists, otherwise purpose-driven tweaks instead.
  - **Design 2 — Competitor Match:** closest-fitting Market Research pattern, rebuilt in Pathway's own components (not the competitor's literal look). Ties break toward whichever option is closest to the current design.
  - **Design 3 — Maximum Freedom:** freest interpretation of the widget's purpose — no tie-break toward "current," so it doesn't quietly collapse into Design 1 or 2. Still bound by `General Widget Design Rules.md` and real Pathway components; freedom of concept, not freedom to break platform rules.
- **Writes sequentially, not concurrently:** all 3 drafts land in the live HTML one at a time after drafting, so the 3 parallel subagents can't clobber each other's edits to the same file.
- **Respects the shared-render-function trap:** each widget's `WRENDER[n]` function feeds both its Dashboard-tab card and its Final Check tab entry — editing one always affects the other, since there's no separate copy. This skill only edits the specific option-letter branch(es) being replaced, never touches the Final Check markup directly, and explicitly checks and reports whether the widget's Final Check section already shows a "Final design — locked" badge rather than proceeding as if it weren't there.
- **Data goes in the live block first:** new mock data is added to the HTML's own embedded `MOCK_DATA` block (the only real source), then `mock-data.master.js` is re-synced afterward as its readable mirror — never the other way around, since editing only the mirror does nothing to the live mockup.
- **Documents itself:** appends (never overwrites) a dated rationale entry to that widget's `Widget_Specs/WNN-Name.md`, naming exactly what drove each design — an interview point, a specific Market Research source, or "purpose-driven, no citation."

## Chaining (added 2026-07-23)

No longer a standalone last step — once its own 7 steps are done, it invokes `verify-mock-designs` on the same widget automatically. Verify Mock Designs owns everything after that, including calling `fix-mock-designs` up to 3 times if it finds anything. One request to Create Mock Designs can now result in a built, checked, and self-corrected widget without three separate asks — see `verify-mock-designs.md` for the loop's exact stop condition.

## Design rule additions (added 2026-07-23)

Four new rules in `Widget_Specs/General Widget Design Rules.md` (numbered Rules 8-11 there) now shape how the 3 designs get drafted and written, **for widgets this skill builds or rewrites from 2026-07-23 onward only — explicitly not retroactive to any widget built before that date, including W06**:

- **Rule 8 — per-option filter scoping.** A widget's 3 options no longer share one filter state; each option gets its own, so changing a filter on Option A doesn't silently change B or C. Implemented per-widget (keying that widget's filter reads/writes by `wid+opt`), not by changing the shared engine functions every other already-built widget still relies on.
- **Rule 9 — KPI/Medium/Large mandatory, Small optional.** Every option needs a real render at those three sizes. Small may be dropped, but only as a stated, flagged proposal in the Widget_Specs write-up and the self-check report — never a silent omission.
- **Rule 10 — go deeper on Design 2/3.** Before settling for a chart-type change alone, check whether the widget's data already has an unused field (a cost value beside a count, an extra category) that would let Option B or especially C actually break the topic down further, not just restyle the same single metric.
- **Rule 11 — speculative data is a document note, never a front-end element.** If Rule 10 leads to proposing something that isn't a confirmed real field, that caveat goes in the Widget_Specs entry as "proposed, needs confirmation" — never as a badge, disclaimer, or placeholder inside the live mockup. The mockup renders as if it were real; the resolution happens later, in the document, at the project owner's call.

## Reliability architecture (added 2026-07-23)

Create no longer edits the big HTML in one long agent turn — that's what kept getting its connection dropped mid-stream. The flow now is: the coordinator authors a shared **scaffold** (WRENDER preamble + KPI) once; three short sub-agents each write **one isolated fragment file** (`_build/W<N>/optA.js` / `optB.js` / `optC.js`, body-only, option-namespaced vars so they can't collide); then a deterministic script, **`Step 3 - Mock_Work/assemble-mock-widget.py`**, merges scaffold + fragments + a `meta.json` into `Dashboard Widget Mockups.html`, rebuilds `options[N]`, rewrites the three cards, wires the per-option filter branches, and re-syncs the mirror — all in one instant, scripted step with nothing to drop. `check-rules.py` + the Verify skill then own integration. The linter can't see data-contract mismatches (a render reading a field that isn't in the data) — Verify does, so the chained Verify pass is not optional.

## Known limits

- The self-check at the end (Step 7) plus the automatic hand-off to `verify-mock-designs` (see Chaining, above) cover build correctness and rule compliance for the widget just touched — this skill still doesn't retroactively re-check any other widget's rule compliance, including against the new Rules 8-11.
- The 3-way parallel draft depends on the invoking session having its own subagent tool available. Confirmed working when run directly; a nested test run without subagent access fell back to drafting all 3 sequentially in one pass instead — same output, just not parallel.
- Hardcoded to this project's own folder structure (`PROJECT INDEX.md`, the Step 1-4 folders, `Dashboard Widget Mockups.html`). It's a one-job skill for this project, not a general-purpose mockup generator — it only does anything useful in a session that has this same "For Dashboard" folder connected.

## Verified

Dry-run tested against a real widget, 2026-07-23 — W10, Loans With Balance Due. Real edits landed correctly: only widget 10's card section and `WRENDER[10]` branches changed (every other widget's section confirmed byte-identical), the Final Check tab's markup was untouched, the mirror file matched exactly, and the rationale was appended (not overwritten) to that widget's Widget_Specs doc. See that file's 2026-07-23 entry for the actual designs produced.

## How to run it

Ask in plain language, e.g.:
- "Run Create Mock Designs on W10, Loans With Balance Due."
- "Give me 3 design options for Bank Balances."
- "Redesign Purchasing Management."

## Files

- `SKILL.md` — the full instructions.
- `create-mock-designs.skill` — packaged, installable copy (click "Save skill" to install into your profile so it's available outside this project too — it'll only be useful in a session that also has this project's "For Dashboard" folder connected).
