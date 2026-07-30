# W04 — Remittance Pledges

**Module:** Finance
**Status:** 🟢 Final design — locked · **v2 (2026-07-28): built Final, Jo design, tagged v2.0 in the build.** Locked-doc rule: only version-tagged updates (v2, v3...) may modify this doc.
**Full history / rejected ideas:** [Widget_Specs/W04-Remittance-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W04-Remittance-Pledges.md)
**Data source & formulas:** [Step 1 - Dashboard Research/04 - Remittance Pledges.md](../Step 1 - Dashboard Research/04%20-%20Remittance%20Pledges.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-07-28 via build-final-widget (Final v2, Jo design: 250-assertion Node driver, 0 failures + final-check-rules.py 0 HIGH + browser-faithful CSS parse, 0 dropped rules). Previous: not yet audited.

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists; neither side wins by default.

## Purpose

> **[v2 — 2026-07-28]** The built Final is Jo Lopez's remittance widget carried into the Final Check tab (the additive `remF` block) with owner deltas layered on top. Its default is a strictly-tabular Table view (Version A's report columns in Jo's style, no in-cell mini bar), with a Pacing Bars view available on a toggle (Option B's flat fill + navy expected tick, day-based colours). The purpose statement below is unchanged and still holds. [BUILD]

Shows how well the organisation is keeping up with its remittance pledge commitments. For each activity type, users can see what was pledged, how much has been paid, what remains outstanding, and the percentage paid so far.

Every data shape named above (pledged, paid, outstanding, percentage paid, per activity type) matches the legacy widget's documented column set [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- **"Pledge vs. Received"** is a named, standard nonprofit fundraising metric, with an established fulfillment-rate formula (Received ÷ Pledged × 100; healthy range 85–95%) ([DonorSearch](https://www.donorsearch.net/resources/nonprofit-fundraising-metrics/)) — this is exactly the metric this widget already tracks as "% Paid," and is the direct justification for making **overall % Paid the KPI headline**. [RESEARCH]
- The standard visuals for this metric are progress bars, paired bars, or a pie/table — all three of which this widget's original options already were. [RESEARCH]

**Note:** no dedicated competitor product for denominational apportionment/remittance tracking specifically exists in the market researched — this is a niche church-finance concept, so the benchmark used here is the general nonprofit pledge-tracking pattern rather than a named direct competitor. This widget is already about as well-aligned with that general pattern as it can be.

## Data Contract
What the widget consumes, stated here rather than only linked out. All source tables and formulas below come from the Step 1 research doc, which was confirmed correct against the legacy `RMPledges : DataPanelControl` class (`/Remittance`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Activity (name) | `RM_Activity`, scoped by CompanyID (`RMActivityRepository` is the legacy repository class that queries this table, not a table itself) | n/a | [DOC — Step 1 research] |
| Seq. (row order) | Remittance activity records; rows are ordered by sequence number | n/a | [DOC — Step 1 research] |
| Annual (pledged) | `RM_PledgeDetail` (only rows where the parent `RM_Pledge.Active = true` count) | `SUM(RM_PledgeDetail.Pledge)` `GROUP BY ActivityID`, where the parent pledge is Active | [DOC — Step 1 research] |
| YTD Paid (received) | `RM_History` / `RM_HistoryDetail` / `RM_HistoryBatch`; a payment counts only if its batch is Posted, the journal isn't voided, and its check date is on or before the selected "Receipts Thru" date | `SUM(RM_HistoryDetail.Amount)` `GROUP BY ActivityID`, for history rows where `Batch.Posted = true AND VoidJournalID = null AND CheckDate <= ReceiptsThru` | [DOC — Step 1 research] |
| Percent of year completed | Not pulled from a database; calculated on the fly | `(DateReceiptsThru.DayOfYear − Jan1.DayOfYear + 1) / 365`; a **calendar year** calculation (Jan 1 based), not fiscal year | [DOC — Step 1 research] |
| YTD Expected | Derived, not stored | `Annual × PercentOfYear` | [DOC — Step 1 research] |
| Outstanding | Derived | `Annual − YTD Paid` | [DOC — Step 1 research] |
| % Paid | Derived | `YTD Paid / Annual` | [DOC — Step 1 research] |
| KPI headline (overall % Paid) | Derived | YTD Paid ÷ Annual, across all activity types | [DOC — this doc, Views section] |
| "Current Month" / "Last Month" window definition | n/a | Rolling 30-day window vs calendar month in progress: unresolved, see Sign-off Readiness | [TO CONFIRM — owner TBD] |
| % Paid / YTD Expected baseline under the Date Range filter | n/a | Full fiscal year vs re-baselined to the selected month's pro-rated share: unresolved, see Sign-off Readiness | [TO CONFIRM — owner TBD] |

- **Favourability / direction logic:** Outstanding amounts always shown in red/amber (see Fine-Tuning Notes) [DOC — this doc]. The research benchmark treats 85–95% fulfillment as the healthy range [RESEARCH]; whether the widget visually encodes that range is *Not yet specified*.
- **Rounding / currency / locale rules:** *Not yet specified*.
- **Freshness / "data as of" behaviour:** legacy uses a file-backed cache (`RMWidgetRecord`) that's invalidated when the company changes [DOC — Step 1 research]. New-design freshness signal: *Not yet specified*.

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no pledge data at all) | **[v2 — 2026-07-28]** "No remittance pledges yet" empty state: an icon (`volunteer_activism`), that one-line message, and the toolbar kept visible; the Glance card shows a compact "None set up" variant. Every total is computed from the pledge rows (never hardcoded), so an empty dataset renders this state rather than a zero or broken chart. [BUILD] |
| Partial (some activities missing data) | **[v2 — 2026-07-28]** A pledge with no amount set renders as a **neutral grey "No pledge"** row: it appears in the table with a null % Paid and no bar fill or expected tick, and is excluded from pacing (nothing to pace against). % Paid divides by the pledge total and is guarded to null when the total is 0, so a zero-pledge activity never divides by zero. [BUILD] |
| Loading | **[v2 — 2026-07-28]** An ~800ms skeleton (`rem-skel`), triggered ONLY by committing a new receipts-through date; sort, view toggles and the drill are instant client re-renders, never a load. [BUILD] |
| Error / API failure | *Not yet specified* |
| Stale data | **[v2 — 2026-07-28]** In the new design, committing a receipts-through date re-fetches and re-paces from that anchor (the only fetch). Legacy behaviour below still stands as the source note. Legacy: file-backed cache (`RMWidgetRecord`) invalidated when the company changes [DOC — Step 1 research]. |

## Interaction Spec

> **[v2 — 2026-07-28] This section is superseded by the built Final, Jo design.** The v2 interactions: [BUILD]
> - **Receipts-through chip:** opens a popover with exactly two presets (Today / End of last month) and a date input. Committing via **Refresh** is the ONLY fetch: it persists the date, shows the ~800ms skeleton, and re-paces AND re-bands every pledge. Typing in the date input keeps the popover open and restores focus to the input after each re-render (focus bookkeeping), matching Jo's custom-date rule; a preset commits immediately and closes the popover.
> - **View toggle:** a 2-way Table / Pacing bars segment (`remf-vtoggle`, `aria-pressed`), visible at Explore and Detail; toggling is an instant client re-render, never a fetch.
> - **Sortable headers:** Activity (name A–Z), % Paid (descending first), and a caption control for **most-days-behind-first** (`status-asc`: General Fund at −102 days, then Clergy at −47; no-pledge rows sort last). Default sort is conference sequence order. Sorting is instant, never a fetch.
> - **Drill:** tapping a row opens Jo's payment-history modal (`role="dialog"`), listing that pledge's receipts, a footer receipt count through the receipts-through date, and a catch-up note that references the **pledge's own end date** (not calendar year-end) for behind rows, "fully paid for its term" for paid-in-full, and "nothing to pace against" for no-pledge. Escape and backdrop click both close it.
> - **Hover:** the bar hover card names the activity, shows received vs "Expected by now", the day-based status label (e.g. "On track"), and an explicit day count ("N days ahead/behind schedule").

*(v1, superseded by the v2 block above — kept for history:)*

- **Hover:** *Not yet specified* for all three views.
- **Click:** the Activity Type filter highlights the selected activity type's bar across views [DOC — this doc, Fine-Tuning Notes]. Drill-through: a link out to the full Remittance module, filtered to the same activity type/date (see Drill-Through); the placement of that link (per row, header, or menu) is *Not yet specified*.
- **Keyboard / focus behaviour:** *Not yet specified*.
- **Filter persistence:** Date Range persists across a page refresh [DOC — this doc, Filters].
- **Legacy baseline for comparison:** the old widget has no drill-down or interactive elements; the table is view-only [DOC — Step 1 research].

## Filters

> **[v2 — 2026-07-28] This section is superseded by the built Final, Jo design.** The Final has exactly ONE filter control: a **receipts-through date chip** (presets Today / End of last month, plus a date input committed by Refresh). Committing a date is the ONLY fetch trigger: ~800ms skeleton, then a re-pace and re-band of every pledge. [BUILD]
>
> There is **NO month-preset Date Range dropdown** (Current Month / Last Month / Custom is gone) and **NO Activity Type dropdown**. Pacing is computed **per pledge term** against the chosen receipts-through date (`Expected = TotalPledge × daysElapsedSinceBeginDate / totalTermDays`), not against a month preset or a calendar year — so the "Current Month vs Last Month window" question and the "% Paid re-baselining" question that the v1 filter raised are both moot under this model (see Sign-off Readiness rows 1 and 2, now Resolved, and the Dev backend answer of 2026-07-28). The Fiscal Year filter stays removed, and with a single receipts-through filter used at every size, the old "KPI shows Fiscal Year only" contradiction no longer arises (Sign-off Readiness row 3).

*(v1, superseded by the v2 block above — kept for history:)*

| Filter | Values |
|--------|--------|
| Date Range | Current Month · Last Month · Custom (Beginning/Ending fields) |
| Activity Type | All Activity Types · dynamic list |

**Fiscal Year filter — removed.** Same finding as W02 and W10: no fiscal-year dimension exists anywhere in the old design's data for this widget — kept as a filter option in the earlier draft without real backing, now dropped.

**Two open items, unresolved — needed before build** (now also tracked in Sign-off Readiness):
1. Is "Current Month" a rolling 30-day window or the calendar month in progress? Same question for "Last Month."
2. Does "% Paid"/"YTD Expected" always compute against the full fiscal year, or does selecting "Current Month" re-baseline the expectation to that month's pro-rated share? This affects the math behind every percentage shown.

Date Range persists across a page refresh. KPI size shows Fiscal Year only.

**CONFLICT (recorded, not resolved):** the line directly above says "KPI size shows Fiscal Year only" [DOC — this doc], but this same doc says the Fiscal Year filter is removed, and its Size behaviour table's KPI row says "No filter (Fiscal Year removed)" [DOC — this doc, Views section]. The Step 3 spec's KPI rows for all three options also say "Fiscal Year filter only" [DOC — Step 3 spec], and this doc itself records that Fiscal Year was "kept as a filter option in the earlier draft without real backing, now dropped". Both statements are preserved here per the evidence rule; tracked in Sign-off Readiness.

## Data Table Sort
Fixed — Sequence number ascending. Not user-changeable.

**Trimmed-view rule:** Small shows 2-3 activity types and Medium shows 4-5 (see Size behaviour); which activity types are kept when trimming, and in what priority, is *Not yet specified*. The fixed Sequence-ascending sort is documented, but no source states that trimming follows it.

## Drill-Through
**New feature**, not present in the old design: a link out to the full Remittance module, filtered to the same activity type/date.

Verified target (page + URL pattern): *Not yet specified*. Legacy baseline: the Step 1 research doc confirms no drill-down exists today [DOC — Step 1 research].

## Refresh
Standalone icon, present at every size including KPI.

What refresh does in the new design (spinner, timestamp update, full re-fetch): *Not yet specified*. Legacy behaviour: reloads the data using the currently selected date [DOC — Step 1 research].

---

## Views (Switch View)

> **[v2 — 2026-07-28] This section is superseded by the built Final, Jo design.** The Final has TWO views over the same receipts-through-filtered data, under a 2-way toggle: [BUILD]
> - **Table (default) — strictly tabular.** The project's Version A report content in Jo's style, with NO in-cell mini bar (the table is a report table only). Columns: **Activity** (name + a "$paid of $pledged" subtext) | **Pledge** | **Expected** | **Paid** | **Outstanding** | **% Paid** (colour-coded by the day-based scale). A cross-footing **Total** row, and the caption "Expected-to-date reflects each pledge's own term (start to end date)".
> - **Pacing Bars (toggle).** Option B's flat-bar style: a grey track, a solid left fill (width = paid/total), a thin **dark-navy expected tick** (left = expected/total; the tick encodes expectation, so it stays navy), a "$paid · $expected by now" caption, and a legend explaining the four day-bands + the tick. The fill is coloured by the day-based scale.
>
> **Day-based colour scale** (drives the bar fill, the % Paid cell, and the status chip): per pledge, `daysAhead = (paid/total) × termDays − elapsedDays`. `>= +30` dark green "30+ days ahead"; `−30..+30` green "On track"; `−60..−30` amber "About a month behind"; `< −60` red "60+ days behind"; paid-in-full dark green; no-pledge neutral grey. Colour is never the sole signal (chip text + values + hover day count).
>
> **Size behaviour (v2):** three sizes only, per General Widget Design Rules Rule 12. Small is removed for the Final.
>
> | Size | Behaviour |
> |---|---|
> | **Glance** | KPI card: money paid, pace badge, goal pill, and one flat fill + expected tick; legend hidden; compact "None set up" empty variant |
> | **Explore** | Header (money paid + pace badge + goal pill) + receipts-through chip + one view under the 2-way Table / Pacing bars toggle |
> | **Detail** | A **SINGLE full-width panel** with the Table / Pacing-bars toggle visible (matching Jo's single-column xwide) — NOT two synced panels. Table shows the full report columns + Total row; sort still applies |
>
> The KPI headline reflects the overall scope ("Remittance Pledges: behind pace") and the overall % Paid; no filter is dropped, since the sole filter is the receipts-through chip.

*(v1, superseded by the v2 block above — kept for history:)*

### View 1 — Progress Bars *(default)*
Horizontal bar per activity type — received portion filled, outstanding empty. The single most common visualisation for this exact metric.

### View 2 — Paired Bars
Side-by-side pledged vs. received bars per activity type — makes the gap itself more visible than the filled-bar version.

### View 3 — Summary Table
Pledged · Received · Outstanding · % per activity type, totals row. Fixed sort: Sequence ascending.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 2-3 activity types, no Switch View |
| **Medium (2×2)** | Active view, 4-5 activity types; Switch View available |
| **Large (4×4)** | Active view, all activity types, full values + %; Switch View available |
| **KPI (1×0.5)** | Headline: **overall % Paid** (YTD Paid ÷ Annual, across all activity types). No filter (Fiscal Year removed). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

Per-size overflow behaviour at real volumes, truncation rules, and which-N tie-breaks: *Not yet specified* (see Data Table Sort's trimmed-view rule).

**Build divergence note (recorded, not resolved):** this doc's three views are Progress Bars / Paired Bars / Summary Table [DOC — this doc]. The Step 3 spec's 2026-07-23 entries record that the live mockup's three design options were rebuilt as "Remittance Table" / "Pacing Bars" / "Pace Variance", and that the Final Check tab now shows the new Design-1 (table) output under its existing "Progress Bars" card titles, described there as "a label-vs-render mismatch in the locked tab" [DOC — Step 3 spec, 2026-07-23]. Neither version is deleted here; reconciliation is tracked in Sign-off Readiness.

## Accessibility

> **[v2 — 2026-07-28]** Filled by the built Final, Jo design: [BUILD]
> - **Values exist as text:** every table row and every pacing bar carries an sr-only text equivalent (activity, paid, expected, outstanding, day-based status, day count) in the DOM; values are never hover-only.
> - **Bars are `role="img"`** with a descriptive label; each bar also carries a plain-language status **chip** with its day-based text ("30+ days ahead", "On track", "About a month behind", "60+ days behind", "Paid in full", "No pledge").
> - **The receipts-through chip** carries the appropriate aria affordances and announces the current receipts-through date; the view toggle segments carry `aria-pressed`.
> - **The drill modal is `role="dialog"`**; Escape and backdrop click close it.
> - **Colour is never the sole signal:** the same day-based state is conveyed by the chip text, the dollar values, and the hover day count; the navy expected tick is distinct from the status colour so the two encodings never collide.

*(v1, superseded by the v2 block above — kept for history:)*

Stated for this widget, not globally assumed:
- Colour is never the only signal: the red/amber Outstanding convention gets a sign/label pairing, not colour alone. *Not yet reviewed against the build*.
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build*.
- Table semantics are real (`th`/scope), and interactive controls are reachable by keyboard. *Not yet reviewed against the build*.

## What Got Cut (and why)
- **[v2 — 2026-07-28] The month-preset Date Range dropdown (Current Month / Last Month / Custom) and the Activity Type dropdown, cut in the Final build.** Replaced by the single receipts-through date chip as the only filter/fetch. The month presets carried the unresolved window and re-baselining questions; the receipts-through + per-pledge-term model makes both moot (see Sign-off Readiness rows 1–2).
- **[v2 — 2026-07-28] The calendar-year pacing approximation, cut in the Final build.** The legacy "Percent of year completed" = (days since Jan 1)/365 and the (Annual/12) × month-number YTD Expected are both replaced by per-pledge-term math (`Expected = TotalPledge × daysElapsedSinceBeginDate / totalTermDays`), confirmed correct by the Dev backend answer (2026-07-28). A multi-year Capital Campaign is the built demonstrator.
- **[v2 — 2026-07-28] A synced two-panel Detail, cut in the Final build.** Detail is a single full-width panel with the Table / Pacing-bars toggle, matching Jo's single-column xwide layout, rather than a table-plus-chart two-panel split.
- **[v2 — 2026-07-28] Small size, cut in the Final build per General Widget Design Rules Rule 12.** The Final ships three sizes (Glance, Explore, Detail); the mock's A/B/C design options keep their old sizes.
- **"Activity type with lowest % Paid" and "Total Outstanding ($)" as KPI headlines** — both dropped in favour of a single **overall % Paid** figure, since that's the named industry benchmark metric (pledge fulfillment rate) rather than an internally invented one — ties the KPI directly to something externally comparable. [RESEARCH-backed rationale; decision owner not recorded]

## Sign-off Readiness
| # | Open item | Type (field / math / product decision) | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Is "Current Month" a rolling 30-day window or the calendar month in progress? Same question for "Last Month." **[v2 — 2026-07-28] RESOLVED — the question is moot.** The Final has no month presets; pacing is per pledge term against a chosen receipts-through date, so there is no "Current Month / Last Month" window to define. Confirmed by the Dev backend answer (2026-07-28): pledges carry their own `BeginDate`/`EndDate` and Expected is computed on that term. | Product decision | Owner (2026-07-28) | ~~Yes~~ Resolved |
| 2 | Does "% Paid"/"YTD Expected" always compute against the full fiscal year, or does selecting "Current Month" re-baseline the expectation to that month's pro-rated share? "This affects the math behind every percentage shown." **[v2 — 2026-07-28] RESOLVED.** % Paid and Expected compute per pledge term via `BeginDate`/`EndDate` (`Expected = TotalPledge × daysElapsedSinceBeginDate / totalTermDays`) — the dev-confirmed correct formula — not re-baselined month math. The legacy calendar-year approximation was one of the two bugs the Dev backend answer (2026-07-28) names. | Math | Dev + Owner (2026-07-28) | ~~Yes~~ Resolved |
| 3 | CONFLICT: "KPI size shows Fiscal Year only" (Filters section) vs "No filter (Fiscal Year removed)" (Size behaviour KPI row), with the Step 3 spec supporting the Fiscal Year wording from the earlier draft. See the Filters section for both claims. **[v2 — 2026-07-28] RESOLVED.** The Final has a single receipts-through filter used at every size and no Fiscal Year filter at all, so the contradiction no longer arises. (This same conflict is recorded in `Step 3 - Mock_Work/Final Check - Items Needing Your Review.md`; it is resolved there too by the receipts-through model — that file is updated separately, not by this doc.) | Doc reconciliation / product decision | Owner (2026-07-28) | ~~KPI size only~~ Resolved |
| 4 | W04-vs-W17 overlap unconfirmed: the earlier draft's "Campaign" filter was "a mix-up with a different widget (likely W17 Gifts Pledges)" [DOC — Step 3 spec]; the "likely" attribution has not been confirmed. | Product decision | TBD | No |
| 5 | Doc-vs-build divergence: the 2026-07-23 mockup rebuild (Remittance Table / Pacing Bars / Pace Variance) does not match this doc's three views, and the Step 3 record flags a Final Check label-vs-render mismatch [DOC — Step 3 spec]. See the Views section note. **[v2 — 2026-07-28] RESOLVED.** The Final defines the built view set (Table strictly-tabular + Pacing Bars toggle); the Views section is superseded to match, and the Final Check tab now renders the `remF` Final by default with "Final" + "Jo design" badges (no label-vs-render mismatch). The A/B/C options remain reachable from the design-option switch. | Reconciliation | Owner (2026-07-28) | ~~No~~ Resolved |
| 6 | Trimmed-view priority: which 2-3 (Small) / 4-5 (Medium) activity types are shown, and by what rule. **[v2 — 2026-07-28] RESOLVED — moot.** Small is cut per Rule 12 and the Final's sizes (Glance / Explore / Detail) show the full pledge set; there is no per-size row trimming to prioritise. | Product decision | Owner (2026-07-28) | ~~No~~ Resolved |

This doc had 6 open items; **[v2 — 2026-07-28]** rows 1, 2, 3, 5 and 6 are now Resolved (by the built Final's receipts-through + per-pledge-term design and the Dev backend answer of 2026-07-28). **1 open item remains: row 4** (the "likely" W04-vs-W17 overlap attribution, non-blocking). It is not fully sign-off-ready until that row is closed or explicitly accepted as a known risk.

## Fine-Tuning Notes
- Activity Type filter highlights the selected activity type's bar across views
- Outstanding amounts always shown in red/amber
- **[v2 — 2026-07-28] Built as the Final, Jo design:** Jo Lopez's remittance widget ported into the Final Check tab (the `remF` block) with the owner deltas recorded in this doc's v2 blocks — receipts-through as the only filter/fetch, the day-based colour scale, per-pledge-term pacing, the strictly-tabular Table view + Option-B Pacing Bars toggle, single-panel Detail, Glance/Explore/Detail per Rule 12. Tagged v2.0 with "Final" and "Jo design" title badges. Verification: 250-assertion per-widget Node DOM-shim driver (0 failures), browser-faithful CSS parse (0 dropped rules; day-band hexes ahead #1b7a3d / on-track #2e9e4f / behind #e0952b / far-behind #c0392b, navy tick #1b2d57), final-check-rules.py 0 HIGH (the 8 MED are F7 em-dash findings in the untouched A/B/C option code and comments only), and W01/W02/W03 Final regressions green with the Dashboard tab byte-identical. Mock totals: pledged $81,000, paid $36,400, expected $40,385, outstanding $45,100 across 6 pledges (overall Behind pace, 45% of pledged), including a multi-year Capital Campaign that paces ON TRACK on its own 2025-07-01..2028-06-30 term. Full detail: see the 2026-07-28 "Final COMPLETE, tagged v2.0, Jo design" entry in [Widget_Specs/W04-Remittance-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W04-Remittance-Pledges.md).
- **[v2 — 2026-07-28] Dev backend answer (resolves rows 1 and 2):** `dbo.RM_Pledge` has `BeginDate` and `EndDate` (both date NOT NULL, required; default term BeginDate to BeginDate + 1 year − 1 day, user-overridable e.g. a 3-year campaign), plus `Frequency` (payments/year: 2/4/6/12/24/26/52) and `Duration` (payment periods in the term). Two legacy calc bugs: (A) the header "Percent of year completed" was (days since Jan 1)/365, a calendar-year figure; (B) YTD Expected per row was (Annual/12) × month-number-of-DateReceiptsThru, a Jan–Dec assumption. Correct formula for both: `Expected = Total Pledge × daysElapsedSinceBeginDate / totalTermDays`. **Calculation-only change:** BeginDate/EndDate are already read from `dbo.RM_Pledge` (in the WHERE clause that filters active pledges on the selected date), so no schema and no query change is needed. Captured in full in the Step 5 spec: `Step 5 - API documents/Remittance Pledges/Remittance Pledges - API Spec.md`.
