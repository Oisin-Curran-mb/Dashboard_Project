# Widget Design Concepts: Budget Compared to Actual

> **Document type:** Step 2/3 crossover — comparing the three proposed redesign directions for a single widget, across every display size.
> **Sources used:**
> - `Dashboard Research/01 - Budget Compared to Actual.md` (current-state Purpose doc)
> - `Dashboard Research/Design Improvement Options.md`, Section 1 (concept source — Options A/B/C)
> - `Mock work/Dashboard Widget Mockups.html` (current coded prototype for widget id 1 — reference only, not the final build)
> - `Mock work/Widget concepts/00 - Redesign Hard Rules.md` (global rules — this doc is updated to comply with them)
> **Investigated by:** Oisin / Claude

---

## 1. What This Widget Currently Does (baseline, from the Purpose doc)

Two charts side by side, full financial year (Jul–Jun): a period-by-period bar chart (Budget vs Actual) and a running YTD line chart. Data comes from `GLSummary` (actual) and `GLBudgetDetail` (original budget only — no mid-year revisions). The user's account view choice (Income / Expense / Custom Report grouping) is saved per user in `SSUserTenantPreferenceRepository`. Consolidated orgs roll up child accounts automatically. Existing controls: account-type filter, Refresh, Export to Excel, Collapse. It's still unconfirmed whether this widget responds to any dashboard-wide filters.

All three versions below keep this data foundation but reshape what's surfaced and how, per size.

---

## 2. The Five Display Sizes

| Size | Grid footprint (universal, all widgets) | Purpose | Status |
|---|---|---|---|
| **Small** | 1 × 1 | Dashboard tile, glance-only | Exists in current mockup |
| **Medium** | 2 × 2 | Dashboard tile, some detail | Exists in current mockup |
| **Large** | 4 × 4 | Dashboard tile, full detail incl. table toggle | Exists in current mockup |
| **KPI** | 1 × 0.5 (same width as Small, half the height) | Single-number tile for dashboards that want headline metrics only | **New — not yet built** |
| **Expanded (pop-up)** | Unchanged from today's build | Full-screen modal, largest surface, holds all filters inline, single source of truth for drill-down | Already exists and works well — **only the filters need to move inside it**, layout/size stays as-is |

The dashboard page body itself is a fixed 4 × 8 grid that only grows downward when it needs to, and stays as tight as possible otherwise — this is also universal, not specific to this widget.

Per the Hard Rules doc, this now comes with fixed chrome behaviour per size:

| Size | Filter available (3-dot menu) | Download Excel/CSV | Switch chart/view | Widget size option | Fullscreen |
|---|---|---|---|---|---|
| Small / Medium / Large | Full set: Account Type, Fiscal Year, Period View | Yes | Yes, where the size has more than one view | Yes | Yes |
| **KPI** | Time only (Fiscal Year — see open question in Hard Rules doc) | **No** | **No** | Yes | Yes — opens Expanded |
| Expanded | All filters live inside the modal | Yes | Yes | Yes | — (this *is* the fullscreen view) |

Three additional decisions from the governance pass (see `00 - Redesign Hard Rules.md`):

- **Period View gains a Weekly option, Large/Expanded only** — added specifically for this widget alongside Monthly/Quarterly (Small/Medium stay Monthly/Quarterly only, consistent with their period-capping behaviour).
- **Data Table sort is fixed chronological (Period ascending), not user-sortable** — the confirmed default for Finance/account-number tables generally, not a one-off for this widget.
- **Drill-through is confirmed coming, target TBD** — this widget will link out to the underlying GL data once a target page/URL exists (see Section 7).
- **Refresh is a standalone icon**, present at every size including KPI — not part of the 3-dot menu below.

Two notes that shape everything below:

- **Filters today** live in the widget's own overflow menu, not inside the expanded view. The spec asks for filters to move (or be duplicated) *inside* the Expanded pop-up — Account Type, Fiscal Year, and Period View all belong there.
- **KPI → Expanded is a special case.** When a KPI-sized tile is expanded, the pop-up shouldn't suddenly show the full multi-period chart — it should stay focused on *that one metric* (its history/trend and its own Fiscal Year filter), just rendered at full size. When a Small/Medium/Large tile is expanded, the pop-up shows the full version experience (all periods, table toggle, all three filters).
- **No size scrolls except Expanded** (Rule 2). Where a size below shows a table, that table's rows scroll internally with a fixed header — the table itself never causes the card to scroll. Everywhere else, content is capped to fit the size (fewer periods shown at Small/Medium than Large), never scrolled.
- **View toggles grey out the active option** (Rule 4). Anywhere below that mentions a Bar Chart/Table, KPI+Bars/Bars Only, or Waterfall/Table toggle, the option currently showing is disabled and greyed; the other stays clickable.

---

## 3. Version A — Variance Bar

**Concept:** Keep the familiar two-bar-per-period comparison (Budget vs Actual), add a variance strip beneath it (green/red, per period) so the gap is explicit instead of something the user has to eyeball between two bar heights.

**Decided (this session):**

| Size | What's shown | Filters (3-dot) | Switch |
|---|---|---|---|
| **Small (1×1)** | Budget/Actual bar pairs for the first 4 periods only. No variance row, no legend. | All three: Account Type, Fiscal Year, Period View | None — bars only |
| **Medium (2×2)** | Bar pairs for 6 periods + a per-period variance % row underneath + legend. | All three | **Bar Chart / Data Table** — introduced at this size |
| **Large (4×4)** | All periods (up to 12) + variance row + legend, or the table (Period / Budget / Actual / Variance) with a bold YTD total row, fixed sort by Period ascending. Period View can also be set to Weekly at this size. | All three (Period View incl. Weekly) | Bar Chart / Data Table |
| **KPI (1×0.5)** | **YTD Actual and YTD Budget shown together** as two figures in one tile — to be tested for fit at this footprint; fall back to a single combined figure if it doesn't fit cleanly. | Fiscal Year only (default kept for this widget) | None. No downloads. |
| **Expanded** | Full-year bars + variance row/legend, table toggle (fixed sort by Period ascending), Weekly available in Period View, all three filters live inside the modal. | All three, inside modal | Bar Chart / Data Table |

**Suggested unique API shape:** per-period `{period, budget, actual, variance, variancePct}` computed server-side, plus a `ytd: {budget, actual, variance, variancePct}` block — so nothing is left to client-side subtraction (today's mockup computes `variance = actual − budget` in the browser).

**Pros (vs. B and C):**
- Most familiar chart type — least user re-education needed.
- Lowest build effort of the three; closest to what already exists today.
- Variance row answers "by how much" directly, without the bigger structural change B or C require.

**Cons (vs. B and C):**
- Weakest at the two extremes: Small currently drops the variance row entirely (the whole point of this version disappears at the size where a dashboard tile is most often seen), and a two-series bar chart doesn't compress naturally into a single KPI number — it has to be represented by a *different* visual (a number + sparkline) at that size, so the "version" isn't visually consistent across all five sizes the way B is.
- Doesn't answer "are we over or under, right now" as fast as B's headline cards — you still have to read a chart.
- No sense of accumulation/direction over the year (that's C's job).

---

## 4. Version B — KPI Cards + Bars

**Concept:** Lead with headline numbers (YTD Budget, YTD Actual, Variance, % Used), then support them with a horizontal bar per period underneath. Answers "over or under budget?" before the user reads any chart.

**Decided (this session):**

| Size | What's shown | Filters (3-dot) | Switch |
|---|---|---|---|
| **Small (1×1)** | **One KPI number only — Variance ($)**. Bars are dropped entirely at this size; it behaves like a mini KPI tile. | All three (kept consistent even though the number itself doesn't need them) | None |
| **Medium (2×2)** | **Try to fit all 4 KPI tiles** (YTD Budget, YTD Actual, Variance, % Used) above a short bar list — needs testing to see how much actually fits at 2×2; trim to fewer tiles if it's too tight. | All three | **KPI + Bars / Bars Only** — introduced at this size |
| **Large (4×4)** | All 4 KPI tiles + full list of horizontal bars, one per period. | All three | KPI + Bars / Bars Only |
| **KPI (1×0.5)** | Headline number: **Variance ($)** — e.g. "+$12k" — colour-coded green/red, with a trend sparkline across recent periods. | Fiscal Year only | None. No downloads. |
| **Expanded** | All 4 KPI tiles + full horizontal bar list (or table), all three filters inside the modal. | All three, inside modal | KPI + Bars / Bars Only |

**Suggested unique API shape:** a pre-aggregated `ytd: {budget, actual, variance, pctUsed}` block *plus* a short trend array (e.g. last 6 periods' variance or %Used) so the KPI sparkline doesn't require the client to fetch full period detail just to draw a trend line. Separately, a lightweight `periods: [{period, actual, budget, variance}]` for the bar list.

**Pros (vs. A and C):**
- Fastest "am I over or under" answer — no chart-reading required.
- Scales down to a single KPI most cleanly of the three; least redesign work needed to produce the KPI-size variant.
- This is the option the Design Improvement doc explicitly recommended pairing with A — it's the safest, highest-value pick for most audiences.

**Cons (vs. A and C):**
- Currently has the opposite problem from A: it's strong at Large/KPI, but Small and Medium show none of its headline cards in the existing build — those two sizes need work to feel like "the same widget."
- A long horizontal bar list (12 periods) at Large needs scrolling, which is a bit busier than A's compact bar-pair chart.
- Doesn't show accumulation/drift over the year the way C does — a KPI card can hide a widening gap if you only glance at the current number.

---

## 5. Version C — Waterfall Chart

**Concept:** Replace the period bar chart with a cumulative variance waterfall/bridge — each period's variance stacks onto the last, so the user sees whether the year's gap is growing, shrinking, or flat.

**Decided (this session):**

| Size | What's shown | Filters (3-dot) | Switch |
|---|---|---|---|
| **Small (1×1)** | Compact step chart: "Base" segment + 3 variance steps, colour-coded green/red. No full caption sentence — instead, minimal axis-context labelling (what the x-axis periods are, what the y-axis values represent) so the shape is legible without a paragraph of text. | All three | None |
| **Medium (2×2)** | Step chart with 5 variance steps + the "Cumulative variance waterfall" caption. | All three | **Waterfall / Data Table** — introduced at this size |
| **Large (4×4)** | Full-year waterfall (all periods), or the table (Period / Budget / Actual / **cumulative variance — fixed, no longer missing**), fixed sort by Period ascending. Period View can also be set to Weekly at this size. | All three (Period View incl. Weekly) | Waterfall / Data Table |
| **KPI (1×0.5)** | Headline number: **% Used** — deliberately different from Version B's Variance($), so the two KPI tiles never show the same framing of the same widget. Paired with a tiny inline step sparkline showing the shape of the year's drift. | Fiscal Year only | None. No downloads. |
| **Expanded** | Full 12-period waterfall, each step clickable/hoverable to reveal that period's exact budget/actual/variance, the fixed table with its cumulative variance column (fixed sort by Period ascending), Weekly available in Period View, all three filters inside the modal. | All three, inside modal | Waterfall / Data Table |

**Suggested unique API shape:** a running/cumulative series `{period, cumulativeBudget, cumulativeActual, cumulativeVariance, stepDelta}` so the modal doesn't need to recompute running totals client-side, plus a single `endingCumulativeVariance` value for the KPI tile.

**Pros (vs. A and B):**
- Only version that directly answers the widget's own open question — "is the gap growing or shrinking over the year" — without needing the second (YTD line) chart at all.
- Naturally trend-oriented, so it's the strongest fit for the KPI size's "show trends" requirement — the visual concept *is* a trend by construction.
- Best for board-level/finance-audience review of drift across a full year.

**Cons (vs. A and B):**
- Highest design and build cost of the three (flagged as such in the Design Improvement doc) — only worth it if the dashboard's audience regularly does variance analysis, not casual users.
- Least familiar chart type; needs a caption/legend to be understood, which the current build drops at Small — exactly where it's least legible.
- Table fallback in the current build doesn't even carry a variance column, so today it's the least "finished" of the three concepts.
- Weakest of the three for a fast, one-glance dashboard scan — it rewards a longer look, which works against the point of Small/KPI sizes.

---

## 6. Side-by-Side Summary

| | A — Variance Bar | B — KPI Cards + Bars | C — Waterfall |
|---|---|---|---|
| **Best size fit** | Large / Expanded | KPI / Large | Expanded / KPI (for trend) |
| **Weakest size fit** | Small (variance row drops) | Small & Medium (no KPI shown) | Small (loses caption/context) |
| **Fastest answer to "over or under?"** | Medium (2nd) | Fastest | Slowest |
| **Best at "is the gap growing/shrinking?"** | No | No | Yes — its whole purpose |
| **Build effort** | Low | Low–Medium | Highest |
| **Audience fit** | General | General | Finance / board-level |
| **Current build maturity** | Mostly complete | Gaps at Small/Medium | Gaps at Small + table view |

**Net read:** A and B are close variants of the same low-effort direction (and were the doc's original joint recommendation) — A leans on a chart the user already recognises, B leans on speed-to-answer. C is the only one that tells a *trend* story on its own, which matters directly for the new KPI-size requirement, but it costs the most to build and is the least legible at small sizes and quick glances.

---

## 7. Open Items to Resolve Before Design

**Resolved this session:**
- ~~Small/Medium KPI treatment for Version B~~ → Small shows one KPI number (Variance $), no bars; Medium tries to fit all 4 tiles (needs a fit test).
- ~~Version A's variance row at Small~~ → confirmed dropped at Small; bars only.
- ~~Version C's missing table variance column~~ → confirmed fixed now, not deferred.
- ~~KPI size time filter~~ → Fiscal Year by default across the dashboard; confirmed kept for this widget (no override needed) for all three versions.
- ~~Where option-rationale text goes~~ → dropped from the product entirely, lives only in design docs.
- ~~Each version's KPI headline metric~~ → A: YTD Actual + YTD Budget together (needs a fit test at 1×0.5); B: Variance ($); C: % Used.
- ~~Refresh control~~ → standalone icon, all sizes including KPI (Hard Rule 7), not a 3-dot menu item.
- ~~Data Table sort (Versions A and C)~~ → fixed chronological, Period ascending, not user-sortable.
- ~~Weekly period view~~ → added to Period View at Large/Expanded only, for both Version A and C's table/chart toggle.

**Still open:**
- Confirm each version's unique API contract with backend — none of these currently exist; all three versions in the mockup still read from one shared dataset (`MOCK_DATA.series[1]`) and compute derived values (variance, cumulative totals) in the browser.
- Version A's KPI tile showing two figures (YTD Actual + YTD Budget) at a 1×0.5 footprint needs an actual layout test — if it doesn't fit cleanly, fall back to a single combined figure (see Section 3).
- Version B's Medium size showing all 4 KPI tiles above a bar list also needs a fit test at 2×2 — trim to fewer tiles if it's too cramped (see Section 4).
- **Drill-through target** — confirmed this widget will get a link to the underlying GL data, but the destination page/URL doesn't exist yet. Needs a link from the user before it can be added to any version's spec (likely candidates: a period/bar/step click, or a single header-level link — to be decided once the target exists).
