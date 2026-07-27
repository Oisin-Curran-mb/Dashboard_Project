# W04 — Remittance Pledges

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W04-Remittance-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W04-Remittance-Pledges.md)
**Data source & formulas:** [Step 1 - Dashboard Research/04 - Remittance Pledges.md](../Step 1 - Dashboard Research/04%20-%20Remittance%20Pledges.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists; neither side wins by default.

## Purpose
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
| Empty (org has no pledge data at all) | *Not yet specified* |
| Partial (some activities missing data) | *Not yet specified*. Note: % Paid divides by Annual; behaviour when an activity's Annual is 0 is *Not yet specified*. |
| Loading | *Not yet specified* |
| Error / API failure | *Not yet specified* |
| Stale data | *Not yet specified* for the new design. Legacy behaviour: file-backed cache (`RMWidgetRecord`) invalidated when the company changes [DOC — Step 1 research]. |

## Interaction Spec
- **Hover:** *Not yet specified* for all three views.
- **Click:** the Activity Type filter highlights the selected activity type's bar across views [DOC — this doc, Fine-Tuning Notes]. Drill-through: a link out to the full Remittance module, filtered to the same activity type/date (see Drill-Through); the placement of that link (per row, header, or menu) is *Not yet specified*.
- **Keyboard / focus behaviour:** *Not yet specified*.
- **Filter persistence:** Date Range persists across a page refresh [DOC — this doc, Filters].
- **Legacy baseline for comparison:** the old widget has no drill-down or interactive elements; the table is view-only [DOC — Step 1 research].

## Filters
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
Stated for this widget, not globally assumed:
- Colour is never the only signal: the red/amber Outstanding convention gets a sign/label pairing, not colour alone. *Not yet reviewed against the build*.
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build*.
- Table semantics are real (`th`/scope), and interactive controls are reachable by keyboard. *Not yet reviewed against the build*.

## What Got Cut (and why)
- **"Activity type with lowest % Paid" and "Total Outstanding ($)" as KPI headlines** — both dropped in favour of a single **overall % Paid** figure, since that's the named industry benchmark metric (pledge fulfillment rate) rather than an internally invented one — ties the KPI directly to something externally comparable. [RESEARCH-backed rationale; decision owner not recorded]

## Sign-off Readiness
| # | Open item | Type (field / math / product decision) | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Is "Current Month" a rolling 30-day window or the calendar month in progress? Same question for "Last Month." | Product decision | TBD | Yes (doc: "needed before build") |
| 2 | Does "% Paid"/"YTD Expected" always compute against the full fiscal year, or does selecting "Current Month" re-baseline the expectation to that month's pro-rated share? "This affects the math behind every percentage shown." | Math | TBD | Yes (doc: "needed before build") |
| 3 | CONFLICT: "KPI size shows Fiscal Year only" (Filters section) vs "No filter (Fiscal Year removed)" (Size behaviour KPI row), with the Step 3 spec supporting the Fiscal Year wording from the earlier draft. See the Filters section for both claims. | Doc reconciliation / product decision | TBD | KPI size only |
| 4 | W04-vs-W17 overlap unconfirmed: the earlier draft's "Campaign" filter was "a mix-up with a different widget (likely W17 Gifts Pledges)" [DOC — Step 3 spec]; the "likely" attribution has not been confirmed. | Product decision | TBD | No |
| 5 | Doc-vs-build divergence: the 2026-07-23 mockup rebuild (Remittance Table / Pacing Bars / Pace Variance) does not match this doc's three views, and the Step 3 record flags a Final Check label-vs-render mismatch [DOC — Step 3 spec]. See the Views section note. | Reconciliation | TBD | No |
| 6 | Trimmed-view priority: which 2-3 (Small) / 4-5 (Medium) activity types are shown, and by what rule. | Product decision | TBD | No |

This doc has 6 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Activity Type filter highlights the selected activity type's bar across views
- Outstanding amounts always shown in red/amber
