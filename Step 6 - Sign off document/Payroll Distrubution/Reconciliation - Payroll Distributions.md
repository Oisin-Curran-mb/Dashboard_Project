# Reconciliation — Payroll Distributions (W03)

> **What this file is.** Management's `Payroll+Distributions.doc` in this same folder is a fixed, external, never-edited sign-off document (see this folder's `00 - INDEX.md`). This file is the opposite — it's ours, it's editable, and its whole job is to say plainly where that document agrees, disagrees, or adds something new relative to the chain of decisions already built up in Steps 1–5. It sits next to the source doc rather than inside any one step, because most of its findings don't cleanly belong to a single step — several require changes in two or three steps at once.

**Source:** `Step 6 - Sign off document/Payroll Distrubution/Payroll+Distributions.doc` — Section 11 ("Review of the proposed redesign, Widget Mockups v3, W03") and Section 12 ("Gaps and prioritized improvements"), management's live audit dated 15 Jul 2026.
**Compiled:** 2026-07-21
**Status:** 🔴 Nothing below has been actioned yet in Steps 1–5 — this file records what needs to happen, it doesn't do it.

## How to use this

Each finding below is one row in the chain that management's review either confirms, contradicts, or adds to. For contradictions, the fix belongs in whichever step actually asserted the thing being contradicted — sometimes that's one step, sometimes two or three at once. Update the "Status" line the same pass any of the referenced steps actually gets changed because of a finding here — don't let this file say "not actioned" once it has been.

---

## Contradictions — the chain currently says something management's review says is wrong

### 1. The pay-type category list is invented (management flag F4)

**Management finding:** Confirmed live against real data (Beta1, company "Saint Michael Church"): categories are org-defined free text — their example values were "AA Aid" and "Administration Staff." There is no fixed pay-type list.

**What the chain currently says:** `Step 4 - Widget Final Design/W03 - Payroll Distributions.md`'s Purpose section states the widget is "broken down by pay-type category (Regular, Vacation, OverTime, Sick, Double Time, Personal, Holiday, Misc, Other)" — a specific, fixed nine-item list, presented as current, correct framing (Step 4 is supposed to always match reality). `Step 5 - API documents/Payroll Distributions/Payroll Distributions - API Spec.md`'s illustrative "single-department Category view" JSON example uses this same list (`Regular`, `Overtime`, `Vacation`), though that spec already flags the example as unconfirmed, not asserted as fact.

**Delta:** Step 4's Purpose section asserts something management's live audit directly disproves. This is the more serious of the two — a "locked, matches-reality" doc containing a disproven claim.

**Recommended action:** Rewrite Step 4's Purpose section to describe categories as org-defined distribution names, dropping the specific nine-item list (or keeping it only as a "may look like this" illustration, clearly labeled as such). Step 5's illustrative example can stay as an illustration but should say explicitly that the label set is arbitrary per org, not drawn from a real confirmed list.

**Status:** ⚪ Not yet actioned.

---

### 2. Comparison (current vs. prior period) is rejected for this widget (management flag F3)

**Management finding:** Explicitly rejected — trend and delta elements are out of scope for this widget. If ever revisited, the three-paycheck-month effect makes equal-basis alignment mandatory, which the current design doesn't account for.

**What the chain currently says:** `Step 4 - Widget Final Design/W03 - Payroll Distributions.md`: "current-vs-prior comparison is now shown via a ▲/▼ % change badge on every row, in every view (Bar, Pie, Table)." `Step 5 - API documents/Payroll Distributions/Payroll Distributions - API Spec.md` (rewritten 2026-07-21) builds its entire response shape around this — `total.prior`, `diffAmount`, `diffPct` on every row, in both the all-departments and single-department examples.

**Delta:** Direct contradiction, and the most consequential one here — this isn't a small wording fix, it removes a feature that's currently threaded through both the locked design doc and the just-rewritten API spec.

**Recommended action:** This needs an explicit decision, not a unilateral edit — either accept management's rejection (drop the comparison feature from Step 4's Views section and simplify Step 5's response shape back to current-period-only, no `prior`/`diffAmount`/`diffPct`), or deliberately push back with a reason if the project has one management hasn't seen. Don't silently keep building against a design element management has already said no to.

**Status:** ⚪ Not yet actioned — flagged as the top-priority open item in this file.

---

### 3. Drill-through should stay inside the widget, not link out (management flag F8)

**Management finding:** The Payroll History module's "Earnings Inquiry" exists but is per-employee, not per-distribution — a link out wouldn't actually show the thing being clicked on. SME feedback confirms clients specifically love report-style drill-in. Recommendation: keep the detail inside the widget's own focus overlay (their Section 10.6), not a link to another module.

**What the chain currently says:** `Step 3 - Mock_Work/Widget_Specs/W03-Payroll-Distributions.md` and `Step 4 - Widget Final Design/W03 - Payroll Distributions.md` both describe drill-through as "a link from the widget out to the full Payroll History module, filtered to the same date range," flagged as a new feature. `Step 5`'s API spec currently treats this as free — "a plain link built from `startDate`/`endDate` on the frontend, not a new API call."

**Delta:** Direct contradiction on mechanism (link-out vs. in-widget overlay), and it changes Step 5's cost assumption — an in-widget focus overlay showing real distribution-level detail would need its own data, which is not currently specced anywhere.

**Recommended action:** Update Step 3/4's Drill-Through section to describe an in-widget overlay instead of a link-out. Step 5 would then need a real new endpoint (or an expanded existing one) to feed that overlay — currently unspecced, since the old "just a link" framing assumed no new data was needed.

**Status:** ⚪ Not yet actioned.

---

### 4. "Top N" trimming needs amount-sort, not alphabetical (management flag F6)

**Management finding:** If a small size trims to the top 3 or top 5 rows, sorting those alphabetically is meaningless — it should default to amount-descending whenever a size is showing a trimmed subset.

**What the chain currently says:** `Step 3 - Mock_Work/Widget_Specs/W03-Payroll-Distributions.md`'s Data Table Sort section defaults to alphabetical (by Department or Category) with a user-toggle to Amount descending — no exception carved out for trimmed small/medium sizes, which per the same doc's Option A/B/C size tables show only "Top 3" / "Top 5" categories.

**Delta:** Not a contradiction of a stated rule so much as a gap the alphabetical-default rule doesn't account for — worth treating as a real fix, since a top-3 alphabetical list can easily hide the three largest categories.

**Recommended action:** Add an explicit carve-out to Step 3/4's sort rule: when a size shows a trimmed subset (Small/Medium), default sort is amount-descending regardless of the general alphabetical default; the user-toggle still applies once viewing the full list at Large/Expanded.

**Status:** ⚪ Not yet actioned.

---

## Confirms — the chain and management's review agree

### 5. Cut the recurring flag and per-department period scheduling (management flag F2)

**Management finding:** These belong to payroll processing, not a read widget, and should be cut from this redesign. Pay-group scoping is a real need but deferred pending a data-model investigation (see Open Questions below).

**What the chain currently says:** `Step 4 - Widget Final Design/W03 - Payroll Distributions.md`'s Filters section already calls "Make this recurring" and "Set Pay Period separately per department" mockup-only, not wired to real scheduling logic. `Step 5`'s API spec (rewritten 2026-07-21) independently cut both from the backend spec for that same reason, before this reconciliation pass found management's doc.

**Delta:** None — this is one case where the chain and management's independent review reached the same conclusion from different directions. Worth recording so it doesn't get re-litigated as if it were still open.

**Status:** ✅ Already aligned — no action needed.

---

## Net-new gaps — not contradictions, just missing from the chain so far

These don't require changing anything that currently exists in Steps 1–5, they're additions management's review surfaced that the chain never addressed at all:

- **Accessibility (flag F7, gap items 1–2 in Section 12):** amounts must be readable as text, not hover-only; the breakdown table needs proper header/label association (WCAG 1.3.1) — the current widget fails this on real data today, and nothing in Steps 3/4 currently specs a fix.
- **Widget states (flag F5):** entitlement, rights, empty, loading, and error states are absent from the current writeup entirely.
- **Currency/date formatting (Section 12):** figures should format to the organization's locale, not the client's or server's — verified live as a real bug (£ symbol shown on a US product), root cause needs confirming with engineering.
- **A "data as of" freshness signal (Section 12):** not currently in any step's spec.
- **Dates in Step 4 corrected:** management noted several W03 entries in the design doc were dated one day in the future (2026-07-16) at the time of their review — minor, but worth a pass to confirm nothing else has a similar slip.

None of these are marked with a per-item status here since they're additions, not corrections — track them wherever the project decides new Step 4 content gets added, not as an open/closed flag in this reconciliation file.

## Open questions carried over from management's review (Section 13)

- **Pay group** is deferred — before it can be designed, a data-model investigation needs to establish what a pay group actually is, how it relates to pay type and compensation type, and whether `PR_History`/`PR_HistoryCompensation` carries a pay-group key at all. Not a quick check, per their own note.
- **Does a Department dimension exist at all on or via `PR_History`/`PR_HistoryCompensation`?** Still open — this is the same question already flagged (unresolved) in `Widget_Specs/W03-Payroll-Distributions.md`, `Step 4`'s Filters section, and `Step 5`'s just-rewritten API spec. Management's review doesn't answer it either, but does supply a fallback for if it's never confirmed: default to today's grain (distribution/category rows), don't lock a design that assumes department exists.
- **Localization root cause** (org vs. server vs. browser culture) — shared with the Deposits On Hand audit, not yet investigated for either widget.

## Summary — what actually needs to change, and where

| # | Finding | Steps affected | Status |
|---|---|---|---|
| 1 | Pay-type list is invented, not real | Step 4 (Purpose), Step 5 (illustrative example wording) | ⚪ Not actioned |
| 2 | Comparison rejected entirely | Step 4 (Views), Step 5 (response shape) | ⚪ Not actioned — needs a decision first |
| 3 | Drill-through should be in-widget, not a link out | Step 3, Step 4 (Drill-Through), Step 5 (needs a real endpoint) | ⚪ Not actioned |
| 4 | Top-N trimming needs amount-sort | Step 3, Step 4 (Data Table Sort) | ⚪ Not actioned |
| 5 | Cut recurring/per-department scheduling | — | ✅ Already aligned |
